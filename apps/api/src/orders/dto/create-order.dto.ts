import { IsNotEmpty, IsNumber, IsPositive, Min, Max, IsEnum, IsOptional } from 'class-validator';
import { PaymentMethod, Platform, TransferMethod } from '@prisma/client';

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

  @IsOptional()
  user_email?: string;

  @IsEnum(Platform)
  @IsOptional()
  platform?: Platform;

  @IsEnum(TransferMethod)
  @IsOptional()
  transferMethod?: TransferMethod;

  @IsNumber()
  @IsOptional()
  @Min(0)
  wallet_used?: number;
}
