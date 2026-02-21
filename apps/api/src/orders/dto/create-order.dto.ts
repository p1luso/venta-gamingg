import { IsNotEmpty, IsNumber, IsPositive, Min, Max, IsEnum } from 'class-validator';
import { PaymentMethod } from '@prisma/client';

export class CreateOrderDto {
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  @Min(10000, { message: 'Minimum order is 10k coins' })
  @Max(10000000, { message: 'Maximum order is 10M coins' })
  coin_amount: number;

  @IsEnum(PaymentMethod)
  @IsNotEmpty()
  paymentMethod: PaymentMethod;

  @IsNotEmpty()
  user_email: string;
}
