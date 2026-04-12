import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { AdminUpdateOrderDto } from './dto/admin-update-order.dto';
import { UpdateSetupDto } from './dto/update-setup.dto';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus, Platform, TransferStatus, TransferMethod } from '@prisma/client';
import { EncryptionService } from '../common/services/encryption.service';
import { TransferService } from '../transfer/transfer.service';

// Fields exposed on the user object in admin responses — never includes password_hash
const USER_ADMIN_SELECT = {
  id: true,
  email: true,
  username: true,
  role: true,
  tier: true,
} as const;

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);
  private readonly PRICE_PER_10K_COINS = 0.50;

  constructor(
    private prisma: PrismaService,
    private encryptionService: EncryptionService,
    private transferService: TransferService,
  ) {}

  // ── Public / checkout ───────────────────────────────────────────────────────

  async create(createOrderDto: CreateOrderDto) {
    const { coin_amount, paymentMethod, user_email, platform, wallet_used, transferMethod } = createOrderDto;

    let user = await this.prisma.user.findUnique({ where: { email: user_email } });
    if (!user) {
      user = await this.prisma.user.create({ data: { email: user_email } });
    }

    const price_paid = this.calculatePrice(coin_amount);
    const walletDeduction = wallet_used ?? 0;
    this.logger.log(`Creating order for ${user.id}. Amount: ${coin_amount}, Price: ${price_paid}, WalletUsed: ${walletDeduction}`);

    try {
      const order = await this.prisma.$transaction(async (tx) => {
        if (walletDeduction > 0) {
          await tx.user.update({
            where: { id: user.id },
            data: { wallet_balance: { decrement: walletDeduction } },
          });
        }

        return tx.order.create({
          data: {
            user_id: user.id,
            amount_coins: coin_amount,
            price_paid,
            status: OrderStatus.PENDING_PAYMENT,
            paymentMethod,
            platform: platform ?? Platform.PS,
            transfer_status: TransferStatus.WAITING_CREDS,
            wallet_used: walletDeduction,
          },
        });
      });

      const receiptUrl = 'receipt' in createOrderDto ? createOrderDto['receipt'] : 'N/A';
      this.logger.log(`[WA_ALERT] Nueva Orden #${order.id} - Comprobante: ${receiptUrl}`);

      return {
        message: 'Order created successfully',
        order: {
          id: order.id,
          amount_coins: order.amount_coins,
          price_paid: order.price_paid,
          status: order.status,
          platform: order.platform,
        },
      };
    } catch (error) {
      this.logger.error(`Error creating order: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException(`Order with ID ${id} not found`);
    return order;
  }

  async updateCredentials(id: string, data: { email: string; password: string; backupCodes: string[] }) {
    const encryptedEmail = this.encryptionService.encrypt(data.email);
    const encryptedPassword = this.encryptionService.encrypt(data.password);
    const encryptedBackupCodes = this.encryptionService.encrypt(JSON.stringify(data.backupCodes));

    const order = await this.prisma.order.update({
      where: { id },
      data: {
        ea_email: encryptedEmail,
        ea_password: encryptedPassword,
        ea_backup_codes: encryptedBackupCodes,
        transfer_status: TransferStatus.QUEUED,
      },
    });

    try {
      await this.transferService.startFutTransfer(id);
      this.logger.log(`FUT Transfer started for order ${id}`);
    } catch (error) {
      this.logger.error(`Failed to start FUT Transfer for order ${id}: ${error.message}`);
    }

    return order;
  }


  /**
   * Unified setup endpoint — handles both COMFORT_TRADE (EA credentials)
   * and PLAYER_AUCTION (player info). Only COMFORT_TRADE triggers the bot.
   */
  async saveSetupData(id: string, dto: UpdateSetupDto) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException(`Order ${id} not found`);

    if (dto.transferMethod === TransferMethod.PLAYER_AUCTION) {
      // Save auction data and flag for manual admin processing — no bot trigger
      await this.prisma.order.update({
        where: { id },
        data: {
          transferMethod: TransferMethod.PLAYER_AUCTION,
          transfer_status: TransferStatus.QUEUED, // admin sees it as pending
          auctionPlayerName: dto.auctionPlayerName,
          auctionPlayerRating: dto.auctionPlayerRating,
          auctionStartPrice: dto.auctionStartPrice,
          auctionBuyNowPrice: dto.auctionBuyNowPrice,
        },
      });

      this.logger.log(
        `[Setup] Order ${id} → PLAYER_AUCTION: ${dto.auctionPlayerName} (${dto.auctionPlayerRating}★) ` +
        `start=$${dto.auctionStartPrice} buynow=$${dto.auctionBuyNowPrice}`,
      );

      return { message: 'Auction data saved. Awaiting manual processing.' };
    }

    // COMFORT_TRADE — encrypt credentials and trigger bot
    if (!dto.email || !dto.password || !dto.backupCodes?.length) {
      throw new Error('email, password and backupCodes are required for COMFORT_TRADE');
    }

    return this.updateCredentials(id, {
      email: dto.email,
      password: dto.password,
      backupCodes: dto.backupCodes,
    });
  }

  // ── Admin ───────────────────────────────────────────────────────────────────

  /** Returns ALL orders with basic user info, newest first. No credentials in payload. */
  async findAll() {
    return this.prisma.order.findMany({
      orderBy: { created_at: 'desc' },
      include: { user: { select: USER_ADMIN_SELECT } },
    });
  }

  /**
   * Manual admin override: update payment status and/or transfer status.
   * Typical use-cases:
   *   - Approve a bank transfer   → { status: PAID }
   *   - Retry a failed transfer   → { transfer_status: QUEUED }
   */
  async adminUpdate(id: string, dto: AdminUpdateOrderDto) {
    if (!dto.status && !dto.transfer_status) {
      throw new BadRequestException('Provide at least one field to update (status or transfer_status)');
    }

    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException(`Order ${id} not found`);

    const updated = await this.prisma.order.update({
      where: { id },
      data: {
        ...(dto.status && { status: dto.status }),
        ...(dto.transfer_status && { transfer_status: dto.transfer_status }),
      },
      include: { user: { select: USER_ADMIN_SELECT } },
    });

    this.logger.log(
      `[ADMIN] Order ${id} updated — status: ${dto.status ?? '—'}, transfer_status: ${dto.transfer_status ?? '—'}`,
    );

    return updated;
  }

  /** Legacy endpoint: returns PAID/PENDING_APPROVAL orders with decrypted credentials for operators. */
  async findAllAdmin() {
    const orders = await this.prisma.order.findMany({
      where: { status: { in: [OrderStatus.PAID, OrderStatus.PENDING_APPROVAL] } },
      orderBy: { created_at: 'desc' },
    });

    return orders.map((order) => {
      let decodedEmail = order.ea_email;
      let decodedPassword = order.ea_password;
      let decodedBackupCodes: string[] = [];

      try {
        if (order.ea_email) decodedEmail = this.encryptionService.decrypt(order.ea_email);
        if (order.ea_password) decodedPassword = this.encryptionService.decrypt(order.ea_password);
        if (order.ea_backup_codes) {
          decodedBackupCodes = JSON.parse(this.encryptionService.decrypt(order.ea_backup_codes));
        }
      } catch {
        this.logger.error(`Failed to decrypt credentials for order ${order.id}`);
      }

      return {
        ...order,
        ea_email_decrypted: decodedEmail,
        ea_password_decrypted: decodedPassword,
        ea_backup_codes_decrypted: decodedBackupCodes,
      };
    });
  }

  // ── User ────────────────────────────────────────────────────────────────────

  /** Returns authenticated user's own orders, newest first. */
  async myOrders(userId: string) {
    return this.prisma.order.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        amount_coins: true,
        price_paid: true,
        status: true,
        platform: true,
        transfer_status: true,
        cashback_earned: true,
        wallet_used: true,
        created_at: true,
      },
    });
  }

  private calculatePrice(amount: number): number {
    return (amount / 10000) * this.PRICE_PER_10K_COINS;
  }
}
