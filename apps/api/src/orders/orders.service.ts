import { Injectable, Logger } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(private prisma: PrismaService) {}

  async create(createOrderDto: CreateOrderDto) {
    this.logger.log(
      `[OrdersService] Creando orden para el usuario: ${createOrderDto.user_email}`,
    );

    // 1. Find or create user
    let user = await this.prisma.user.findUnique({
      where: { email: createOrderDto.user_email },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: createOrderDto.user_email,
        },
      });
    }

    // 2. Create Order
    const order = await this.prisma.order.create({
      data: {
        user_id: user.id,
        amount_coins: createOrderDto.coin_amount,
        price_paid: createOrderDto.price_paid,
        paymentMethod: createOrderDto.paymentMethod,
      },
    });

    return order;
  }

  async findOne(id: string) {
    return this.prisma.order.findUnique({
      where: { id },
      include: { user: true },
    });
  }
}
