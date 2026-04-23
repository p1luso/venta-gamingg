import { Controller, Post, Body, UseGuards, Get, Param, Patch, Request } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { AdminUpdateOrderDto } from './dto/admin-update-order.dto';
import { UpdateSetupDto } from './dto/update-setup.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // ── Public ──────────────────────────────────────────────

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Request() req: { user: { userId: string } }, @Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(req.user.userId, createOrderDto);
  }

  @Patch(':id/credentials')
  updateCredentials(
    @Param('id') id: string,
    @Body() body: { email: string; password: string; backupCodes: string[] },
  ) {
    return this.ordersService.updateCredentials(id, body);
  }

  /**
   * PATCH /orders/:id/setup
   * Unified setup: saves EA credentials (COMFORT_TRADE) or auction data (PLAYER_AUCTION).
   */
  @Patch(':id/setup')
  saveSetupData(@Param('id') id: string, @Body() dto: UpdateSetupDto) {
    return this.ordersService.saveSetupData(id, dto);
  }

  // ── Admin — declared before /:id to avoid route shadowing ─────────────────

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

  /**
   * POST /orders/:id/simulate-complete
   * Demo: marks a PLAYER_AUCTION order as COMPLETED and credits cashback/XP.
   * In production this fires after the operator confirms the player was bought
   * on the Transfer Market. JWT required (admin only in real deploy).
   */
  @UseGuards(JwtAuthGuard)
  @Post(':id/simulate-complete')
  simulateAuctionComplete(@Param('id') id: string) {
    return this.ordersService.simulateAuctionComplete(id);
  }

  // ── User ──────────────────────────────────────────────

  /** GET /orders/my-orders — authenticated user's own orders. Must come before /:id. */
  @UseGuards(JwtAuthGuard)
  @Get('my-orders')
  myOrders(@Request() req: { user: { userId: string } }) {
    return this.ordersService.myOrders(req.user.userId);
  }

  /** GET /orders/:id — single order. JWT required. Must come LAST. */
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }
}
