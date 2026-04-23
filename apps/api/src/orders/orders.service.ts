import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { AdminUpdateOrderDto } from './dto/admin-update-order.dto';
import { UpdateSetupDto } from './dto/update-setup.dto';
import { PrismaService } from '../prisma/prisma.service';
import { LoyaltyService } from '../loyalty/loyalty.service';
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
    private loyaltyService: LoyaltyService,
  ) {}

  // ── Public / checkout ───────────────────────────────────────────

  async create(userId: string, createOrderDto: CreateOrderDto) {
    const { coin_amount, paymentMethod, platform, wallet_used, transferMethod } =
      createOrderDto;
 
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const price_paid = this.calculatePrice(coin_amount);
    const walletDeduction = wallet_used ?? 0;
    this.logger.log(
      `Creating order for ${user.id}. Amount: ${coin_amount}, Price: ${price_paid}, WalletUsed: ${walletDeduction}`,
    );

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
            transferMethod: transferMethod ?? TransferMethod.COMFORT_TRADE,
          },
        });
      });

      return {
        message: 'Order created successfully',
        order: {
          id: order.id,
          amount_coins: order.amount_coins,
          price_paid: order.price_paid,
          status: order.status,
          platform: order.platform,
          transferMethod: order.transferMethod,
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

  async updateCredentials(
    id: string,
    data: { email: string; password: string; backupCodes: string[] },
  ) {
    const encryptedEmail = this.encryptionService.encrypt(data.email);
    const encryptedPassword = this.encryptionService.encrypt(data.password);
    const encryptedBackupCodes = this.encryptionService.encrypt(
      JSON.stringify(data.backupCodes),
    );

    await this.prisma.order.update({
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
      this.logger.error(
        `Failed to auto-start FUT transfer for order ${id}: ${error.message}`,
      );
      // Don't rethrow — credentials are saved, operator can retry manually
    }

    return { message: 'Credentials saved. Transfer queued.' };
  }

  /**
   * Unified setup endpoint: saves EA credentials (COMFORT_TRADE) or auction
   * data (PLAYER_AUCTION). Called from the order setup page.
   */
  async saveSetupData(id: string, dto: UpdateSetupDto) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException(`Order ${id} not found`);

    // ── PLAYER_AUCTION path: save auction data, no bot trigger ─────────
    if (dto.transferMethod === TransferMethod.PLAYER_AUCTION) {
      if (
        !dto.auctionPlayerName ||
        dto.auctionPlayerRating == null ||
        dto.auctionStartPrice == null ||
        dto.auctionBuyNowPrice == null
      ) {
        throw new BadRequestException(
          'auctionPlayerName, auctionPlayerRating, auctionStartPrice and auctionBuyNowPrice are required for PLAYER_AUCTION',
        );
      }

      await this.prisma.order.update({
        where: { id },
        data: {
          transferMethod: TransferMethod.PLAYER_AUCTION,
          transfer_status: TransferStatus.QUEUED, // visible to admin as pending
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

    // ── COMFORT_TRADE path: encrypt credentials and trigger bot ──────
    if (!dto.email || !dto.password || !dto.backupCodes?.length) {
      throw new BadRequestException(
        'email, password and backupCodes are required for COMFORT_TRADE',
      );
    }

    return this.updateCredentials(id, {
      email: dto.email,
      password: dto.password,
      backupCodes: dto.backupCodes,
    });
  }

  // ── Admin ──────────────────────────────────────────────

  /** Returns ALL orders with basic user info, newest first. */
  async findAll() {
    return this.prisma.order.findMany({
      orderBy: { created_at: 'desc' },
      include: { user: { select: USER_ADMIN_SELECT } },
    });
  }

  /**
   * Manual admin override: update payment status and/or transfer status.
   */
  async adminUpdate(id: string, dto: AdminUpdateOrderDto) {
    if (!dto.status && !dto.transfer_status) {
      throw new BadRequestException(
        'Provide at least one field to update (status or transfer_status)',
      );
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

  /**
   * Demo simulation: marks a PLAYER_AUCTION order as completed and
   * credits XP + cashback to the buyer instantly.
   * In production this would be triggered after the team confirms
   * the player was purchased on the Transfer Market.
   */
  async simulateAuctionComplete(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { user: { select: USER_ADMIN_SELECT } },
    });
    if (!order) throw new NotFoundException(`Order ${orderId} not found`);

    if (order.transferMethod !== TransferMethod.PLAYER_AUCTION) {
      throw new BadRequestException(
        'simulateAuctionComplete is only valid for PLAYER_AUCTION orders',
      );
    }

    if (order.transfer_status === TransferStatus.COMPLETED) {
      throw new BadRequestException('Order is already completed');
    }

    // Mark order as paid + completed
    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.PAID,
        transfer_status: TransferStatus.COMPLETED,
        coins_transferred: order.amount_coins,
      },
      include: { user: { select: USER_ADMIN_SELECT } },
    });

    this.logger.log(
      `[ADMIN SIMULATE] Order ${orderId} → PLAYER_AUCTION COMPLETED by admin`,
    );

    // Fire loyalty (XP + cashback) — non-blocking so we still return fast
    this.loyaltyService
      .processOrderCompletion(orderId)
      .catch((err) =>
        this.logger.error(`[ADMIN SIMULATE] Loyalty failed for ${orderId}: ${err.message}`),
      );

    return {
      message: 'Auction order completed. XP and cashback are being credited.',
      order: updated,
    };
  }

  /** Legacy endpoint: returns PAID/PENDING_APPROVAL orders with decrypted credentials. */
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
        if (order.ea_password)
          decodedPassword = this.encryptionService.decrypt(order.ea_password);
        if (order.ea_backup_codes) {
          decodedBackupCodes = JSON.parse(
            this.encryptionService.decrypt(order.ea_backup_codes),
          );
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

  // ── User ──────────────────────────────────────────────

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
        transferMethod: true,
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
