import { IsEmail, IsEnum, IsNotEmpty, IsNumber, IsPositive } from 'class-validator';
import { PaymentMethod } from '@prisma/client';

export class CreateOrderDto {
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  coin_amount: number;

  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  price_paid: number;

  @IsEmail()
  @IsNotEmpty()
  user_email: string;

  @IsEnum(PaymentMethod)
  @IsNotEmpty()
  paymentMethod: PaymentMethod;
}
