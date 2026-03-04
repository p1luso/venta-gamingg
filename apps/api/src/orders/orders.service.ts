import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus, TransferStatus } from '@prisma/client';
import { EncryptionService } from '../common/services/encryption.service';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);
  // Mock exchange rate: $0.50 USD per 10k coins
  // In production this should come from a config or DB
  private readonly PRICE_PER_10K_COINS = 0.50;

  constructor(
    private prisma: PrismaService,
    private encryptionService: EncryptionService
  ) { }

  async create(createOrderDto: CreateOrderDto) {
    const { coin_amount, paymentMethod, user_email } = createOrderDto;

    // Find or create user
    let user = await this.prisma.user.findUnique({ where: { email: user_email } });
    if (!user) {
      user = await this.prisma.user.create({
        data: { email: user_email },
      });
    }
    const userId = user.id;

    // Zero-Trust: Calculate price on backend
    const price_paid = this.calculatePrice(coin_amount);

    this.logger.log(`[OrdersService] Creating order for user ${userId}. Amount: ${coin_amount}, Price: ${price_paid}`);

    const order = await this.prisma.order.create({
      data: {
        user_id: userId,
        amount_coins: coin_amount,
        price_paid: price_paid,
        status: OrderStatus.PENDING_PAYMENT,
        paymentMethod: paymentMethod,
        transfer_status: TransferStatus.WAITING_CREDS,
      },
    });

    // Simulando Notificación WA al dueño
    const receiptUrl = 'receipt' in createOrderDto ? createOrderDto['receipt'] : 'N/A';
    this.logger.log(`[WA_ALERT] Nueva Orden #${order.id} - Comprobante: ${receiptUrl}`);

    return {
      message: 'Order created successfully',
      order: {
        id: order.id,
        amount_coins: order.amount_coins,
        price_paid: order.price_paid,
        status: order.status,
      }
    };
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

    return this.prisma.order.update({
      where: { id },
      data: {
        ea_email: encryptedEmail,
        ea_password: encryptedPassword,
        ea_backup_codes: encryptedBackupCodes,
        transfer_status: TransferStatus.QUEUED,
      },
    });
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
    // 10000 coins = $0.50
    // amount coins = ?
    // ? = (amount / 10000) * 0.50
    return (amount / 10000) * this.PRICE_PER_10K_COINS;
  }
}
