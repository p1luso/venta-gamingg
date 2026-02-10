import { IsEmail, IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class CreateOrderDto {
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  coin_amount: number;

  @IsEmail()
  @IsNotEmpty()
  user_email: string;
}
