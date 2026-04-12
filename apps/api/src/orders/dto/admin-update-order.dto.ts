import { IsEnum, IsOptional } from 'class-validator';
import { OrderStatus, TransferStatus } from '@prisma/client';

export class AdminUpdateOrderDto {
  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus;

  @IsEnum(TransferStatus)
  @IsOptional()
  transfer_status?: TransferStatus;
}
