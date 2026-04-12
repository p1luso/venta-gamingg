import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserTier } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

interface TierConfig {
  tier: UserTier;
  minXp: number;
  maxXp: number | null;
  cashbackPct: number;
}

const TIER_CONFIG: TierConfig[] = [
  { tier: UserTier.BRONZE,   minXp: 0,    maxXp: 499,  cashbackPct: 0.03 },
  { tier: UserTier.SILVER,   minXp: 500,  maxXp: 1999, cashbackPct: 0.05 },
  { tier: UserTier.GOLD,     minXp: 2000, maxXp: 4999, cashbackPct: 0.07 },
  { tier: UserTier.PLATINUM, minXp: 5000, maxXp: null,  cashbackPct: 0.10 },
];

const XP_PER_USD = 10;

@Injectable()
export class LoyaltyService {
  private readonly logger = new Logger(LoyaltyService.name);

  constructor(private prisma: PrismaService) {}

  getTierForXp(xp: number): TierConfig {
    for (let i = TIER_CONFIG.length - 1; i >= 0; i--) {
      if (xp >= TIER_CONFIG[i].minXp) return TIER_CONFIG[i];
    }
    return TIER_CONFIG[0];
  }

  getTierProgress(xp: number): {
    tier: UserTier;
    cashbackPct: number;
    currentXp: number;
    tierMinXp: number;
    tierMaxXp: number | null;
    progressPct: number;
    nextTier: UserTier | null;
    xpToNextTier: number | null;
  } {
    const current = this.getTierForXp(xp);
    const nextConfig = TIER_CONFIG.find((t) => t.minXp > current.minXp) ?? null;

    let progressPct = 100;
    let xpToNextTier: number | null = null;

    if (nextConfig) {
      const rangeSize = nextConfig.minXp - current.minXp;
      const earned = xp - current.minXp;
      progressPct = Math.min(100, Math.round((earned / rangeSize) * 100));
      xpToNextTier = nextConfig.minXp - xp;
    }

    return {
      tier: current.tier,
      cashbackPct: current.cashbackPct,
      currentXp: xp,
      tierMinXp: current.minXp,
      tierMaxXp: current.maxXp,
      progressPct,
      nextTier: nextConfig?.tier ?? null,
      xpToNextTier,
    };
  }

  /**
   * Called when an order's transfer reaches COMPLETED status.
   * In a single transaction:
   *   1. Adds XP to the user (1 USD = 10 XP)
   *   2. Recalculates tier
   *   3. Computes cashback and credits wallet_balance
   *   4. Updates cashback_earned on the order
   */
  async processOrderCompletion(orderId: string): Promise<void> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true },
    });

    if (!order) {
      this.logger.warn(`processOrderCompletion: order ${orderId} not found`);
      return;
    }

    const pricePaid = Number(order.price_paid);
    const xpEarned = Math.round(pricePaid * XP_PER_USD);
    const newXp = order.user.xp_points + xpEarned;
    const newTierConfig = this.getTierForXp(newXp);
    const cashback = parseFloat((pricePaid * newTierConfig.cashbackPct).toFixed(2));

    this.logger.log(
      `[LOYALTY] Order ${orderId}: +${xpEarned} XP, tier=${newTierConfig.tier}, cashback=$${cashback}`,
    );

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: order.user_id },
        data: {
          xp_points: newXp,
          tier: newTierConfig.tier,
          wallet_balance: { increment: new Decimal(cashback) },
        },
      }),
      this.prisma.order.update({
        where: { id: orderId },
        data: { cashback_earned: new Decimal(cashback) },
      }),
    ]);
  }
}
