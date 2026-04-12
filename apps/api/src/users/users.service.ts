import { Injectable, NotFoundException, UnauthorizedException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LoyaltyService } from '../loyalty/loyalty.service';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private loyaltyService: LoyaltyService,
  ) {}

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        tier: true,
        wallet_balance: true,
        xp_points: true,
        created_at: true,
        orders: {
          orderBy: { created_at: 'desc' },
          take: 5,
          select: {
            id: true,
            amount_coins: true,
            price_paid: true,
            status: true,
            platform: true,
            transfer_status: true,
            cashback_earned: true,
            created_at: true,
          },
        },
      },
    });

    if (!user) throw new NotFoundException('User not found');

    const tierProgress = this.loyaltyService.getTierProgress(user.xp_points);

    return {
      ...user,
      wallet_balance: user.wallet_balance.toString(),
      tierProgress,
      orders: user.orders.map((o) => ({
        ...o,
        price_paid: o.price_paid.toString(),
        cashback_earned: o.cashback_earned.toString(),
      })),
    };
  }

  async updateUser(userId: string, updateUserDto: UpdateUserDto) {
    const { username, password, currentPassword } = updateUserDto;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) throw new NotFoundException('User not found');

    const updateData: any = {};

    if (username !== undefined) {
      updateData.username = username;
    }

    if (password !== undefined) {
      // If setting a password for the first time or updating it
      if (user.password_hash && !currentPassword) {
        throw new UnauthorizedException('Please provide your current password to update it.');
      }

      if (user.password_hash && currentPassword) {
        const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
        if (!isMatch) {
          throw new UnauthorizedException('Current password does not match.');
        }
      }

      const salt = await bcrypt.genSalt();
      updateData.password_hash = await bcrypt.hash(password, salt);
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return { message: 'Profile updated successfully' };
  }
}
