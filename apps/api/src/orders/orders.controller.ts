import { Controller, Post, Body, UseGuards, Get, Param, Patch, Request } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { AdminUpdateOrderDto } from './dto/admin-update-order.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // ── Public ──────────────────────────────────────────────────────────────────

  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @Patch(':id/credentials')
  updateCredentials(
    @Param('id') id: string,
    @Body() body: { email: string; password: string; backupCodes: string[] },
  ) {
    return this.ordersService.updateCredentials(id, body);
  }

  // ── Admin — declared before /:id to avoid route shadowing ──────────────────

  /** GET /orders — all orders with user info, newest first. JWT required. */
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.ordersService.findAll();
  }

  /** GET /orders/admin/all — legacy: PAID orders + decrypted credentials. */
  @Get('admin/all')
  findAllAdmin() {
    return this.ordersService.findAllAdmin();
  }

  /**
   * PATCH /orders/:id/admin-update
   * Manual override: approve payment or retry a failed transfer. JWT required.
   */
  @UseGuards(JwtAuthGuard)
  @Patch(':id/admin-update')
  adminUpdate(@Param('id') id: string, @Body() dto: AdminUpdateOrderDto) {
    return this.ordersService.adminUpdate(id, dto);
  }

  // ── User ────────────────────────────────────────────────────────────────────

  /** GET /orders/my-orders — authenticated user's own orders. Must come before /:id. */
  @UseGuards(JwtAuthGuard)
  @Get('my-orders')
  myOrders(@Request() req: { user: { userId: string } }) {
    return this.ordersService.myOrders(req.user.userId);
  }

  /** GET /orders/:id — single order. JWT required. Must come LAST among @Get routes. */
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }
}
