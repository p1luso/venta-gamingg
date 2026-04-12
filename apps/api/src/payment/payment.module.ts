import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { MercadoPagoService } from './mercadopago.service';
import { PaymentController } from './payment.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [PrismaModule, ConfigModule, NotificationModule],
  controllers: [PaymentController],
  providers: [PaymentService, MercadoPagoService],
  exports: [MercadoPagoService],
})
export class PaymentModule {}
