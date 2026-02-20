<<<<<<< HEAD
import { IsNotEmpty, IsNumber, IsPositive, Min, Max } from 'class-validator';
=======
import { IsEmail, IsEnum, IsNotEmpty, IsNumber, IsPositive } from 'class-validator';
import { PaymentMethod } from '@prisma/client';
>>>>>>> 4926076eb1aee4db97092974a7a3015efdada044

export class CreateOrderDto {
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  @Min(10000, { message: 'Minimum order is 10k coins' })
  @Max(10000000, { message: 'Maximum order is 10M coins' })
  coin_amount: number;
}
