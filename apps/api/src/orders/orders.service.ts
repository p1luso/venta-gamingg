import { Injectable, Logger } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  create(createOrderDto: CreateOrderDto) {
    this.logger.log(`[OrdersService] Creando orden para el usuario: ${createOrderDto.user_email}`);
    // Logic to save order to DB would go here
    return { message: 'Order processing initiated', ...createOrderDto };
  }
}
