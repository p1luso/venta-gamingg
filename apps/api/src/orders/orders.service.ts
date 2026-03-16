import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus, Platform, TransferStatus } from '@prisma/client';
import { EncryptionService } from '../common/services/encryption.service';
import { TransferService } from '../transfer/transfer.service';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);
  private readonly PRICE_PER_10K_COINS = 0.50;

  constructor(
    private prisma: PrismaService,
    private encryptionService: EncryptionService,
    private transferService: TransferService,
  ) {}

  async create(createOrderDto: CreateOrderDto) {
    const { coin_amount, paymentMethod, user_email, platform } = createOrderDto;

    let user = await this.prisma.user.findUnique({ where: { email: user_email } });
    if (!user) {
      user = await this.prisma.user.create({
        data: { email: user_email },
      });
    }
    const userId = user.id;

    const price_paid = this.calculatePrice(coin_amount);

    this.logger.log(`[OrdersService] Creating order for user ${userId}. Amount: ${coin_amount}, Price: ${price_paid}`);

    try {
      const order = await this.prisma.order.create({
        data: {
          user_id: userId,
          amount_coins: coin_amount,
          price_paid: price_paid,
          status: OrderStatus.PENDING_PAYMENT,
          paymentMethod: paymentMethod,
          platform: platform ?? Platform.PS,
          transfer_status: TransferStatus.WAITING_CREDS,
        },
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
        }
      };
    } catch (error) {
      this.logger.error(`Error creating order: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

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

    // Trigger FUT Transfer API immediately
    try {
      await this.transferService.startFutTransfer(id);
      this.logger.log(`[OrdersService] FUT Transfer started for order ${id}`);
    } catch (error) {
      this.logger.error(`[OrdersService] Failed to start FUT Transfer for order ${id}: ${error.message}`);
    }

    return order;
  }

  async findAllAdmin() {
    const orders = await this.prisma.order.findMany({
      where: {
        status: { in: [OrderStatus.PAID, OrderStatus.PENDING_APPROVAL] },
      },
      orderBy: { created_at: 'desc' },
    });

    return orders.map(order => {
      let decodedEmail = order.ea_email;
      let decodedPassword = order.ea_password;
      let decodedBackupCodes = [];

      try {
        if (order.ea_email) decodedEmail = this.encryptionService.decrypt(order.ea_email);
        if (order.ea_password) decodedPassword = this.encryptionService.decrypt(order.ea_password);
        if (order.ea_backup_codes) {
          const decryptedList = this.encryptionService.decrypt(order.ea_backup_codes);
          decodedBackupCodes = JSON.parse(decryptedList);
        }
      } catch (e) {
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

  private calculatePrice(amount: number): number {
    return (amount / 10000) * this.PRICE_PER_10K_COINS;
  }
}
