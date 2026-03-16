import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { TransferService } from './transfer.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('transfer')
export class TransferController {
  constructor(private readonly transferService: TransferService) {}

  @UseGuards(JwtAuthGuard)
  @Get('status/:orderId')
  status(@Param('orderId') orderId: string) {
    return this.transferService.status(orderId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('start/:orderId')
  start(@Param('orderId') orderId: string) {
    return this.transferService.startFutTransfer(orderId);
  }
}
