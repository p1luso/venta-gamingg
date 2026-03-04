import { Controller, Post, Body, UseGuards, Get, Param, Patch } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Patch(':id/credentials')
  updateCredentials(
    @Param('id') id: string,
    @Body() body: { email: string; password: string; backupCodes: string[] },
  ) {
    return this.ordersService.updateCredentials(id, body);
  }

  @Get('admin/all')
  findAllAdmin() {
    return this.ordersService.findAllAdmin();
  }
}
