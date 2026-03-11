import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TransferStatus } from '@prisma/client';

export interface TransferStatusResponse {
  orderId: string;
  transfer_status: TransferStatus;
  progress: number;         // 0-100
  coins_transferred: number;
  total_coins: number;
  message: string;
  estimated_minutes_remaining: number | null;
}

@Injectable()
export class TransferService {
  private readonly logger = new Logger(TransferService.name);

  constructor(private readonly prisma: PrismaService) {}

  async status(orderId: string): Promise<TransferStatusResponse> {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });

    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }

    const totalCoins = order.amount_coins;

    switch (order.transfer_status) {
      case TransferStatus.WAITING_CREDS: {
        return {
          orderId,
          transfer_status: TransferStatus.WAITING_CREDS,
          progress: 0,
          coins_transferred: 0,
          total_coins: totalCoins,
          message: 'Esperando credenciales de EA',
          estimated_minutes_remaining: null,
        };
      }

      case TransferStatus.QUEUED: {
        return {
          orderId,
          transfer_status: TransferStatus.QUEUED,
          progress: 5,
          coins_transferred: 0,
          total_coins: totalCoins,
          message: 'En cola — el proceso iniciará pronto',
          estimated_minutes_remaining: 15,
        };
      }

      case TransferStatus.IN_PROGRESS: {
        // Simulate elapsed-time-based progress (15-60 min window)
        const startedAt = order.updated_at ?? order.created_at;
        const elapsedMs = Date.now() - startedAt.getTime();
        const elapsedMinutes = elapsedMs / 60_000;
        const TOTAL_ESTIMATED_MINUTES = 30;

        // Progress: 10% base + up to 85% over 30 min, capped at 95 until COMPLETED
        const timeProgress = Math.min((elapsedMinutes / TOTAL_ESTIMATED_MINUTES) * 85, 85);
        const progress = Math.round(10 + timeProgress);
        const coinsTransferred = Math.round((progress / 100) * totalCoins);
        const minutesRemaining = Math.max(
          Math.round(TOTAL_ESTIMATED_MINUTES - elapsedMinutes),
          1,
        );

        this.logger.debug(`[Transfer mock] Order ${orderId}: ${progress}% (${elapsedMinutes.toFixed(1)} min elapsed)`);

        return {
          orderId,
          transfer_status: TransferStatus.IN_PROGRESS,
          progress,
          coins_transferred: coinsTransferred,
          total_coins: totalCoins,
          message: 'Transferencia en progreso',
          estimated_minutes_remaining: minutesRemaining,
        };
      }

      case TransferStatus.COMPLETED: {
        return {
          orderId,
          transfer_status: TransferStatus.COMPLETED,
          progress: 100,
          coins_transferred: totalCoins,
          total_coins: totalCoins,
          message: '¡Transferencia completada exitosamente!',
          estimated_minutes_remaining: 0,
        };
      }

      case TransferStatus.ERROR: {
        return {
          orderId,
          transfer_status: TransferStatus.ERROR,
          progress: 0,
          coins_transferred: 0,
          total_coins: totalCoins,
          message: 'Error en la transferencia — contacta soporte',
          estimated_minutes_remaining: null,
        };
      }

      default: {
        return {
          orderId,
          transfer_status: order.transfer_status,
          progress: 0,
          coins_transferred: 0,
          total_coins: totalCoins,
          message: 'Estado desconocido',
          estimated_minutes_remaining: null,
        };
      }
    }
  }
}
