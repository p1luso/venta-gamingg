import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus, TransferStatus } from '@prisma/client';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);
  // Mock exchange rate: $0.50 USD per 10k coins
  // In production this should come from a config or DB
  private readonly PRICE_PER_10K_COINS = 0.50;

  constructor(private prisma: PrismaService) {}

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

  private calculatePrice(amount: number): number {
    // 10000 coins = $0.50
    // amount coins = ?
    // ? = (amount / 10000) * 0.50
    return (amount / 10000) * this.PRICE_PER_10K_COINS;
  }
}
