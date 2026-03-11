import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TransferStatus } from '@prisma/client';

export interface TransferStatusResponse {
  orderId: string;
  transfer_status: TransferStatus;
  progress: number;         // 0–100
  coins_transferred: number;
  total_coins: number;
  message: string;
  estimated_minutes_remaining: number | null;
}

const TOTAL_ESTIMATED_MINUTES = 30;

@Injectable()
export class TransferService {
  private readonly logger = new Logger(TransferService.name);

  constructor(private readonly prisma: PrismaService) {}

  async status(orderId: string): Promise<TransferStatusResponse> {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });

    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }

    const total = order.amount_coins;

    switch (order.transfer_status) {
      case TransferStatus.WAITING_CREDS:
        return this.build(orderId, total, TransferStatus.WAITING_CREDS, 0, 0, 'Esperando credenciales de EA', null);

      case TransferStatus.QUEUED:
        return this.build(orderId, total, TransferStatus.QUEUED, 5, 0, 'En cola — el proceso iniciará pronto', 15);

      case TransferStatus.IN_PROGRESS: {
        const startedAt = order.updated_at ?? order.created_at;
        const elapsedMinutes = (Date.now() - startedAt.getTime()) / 60_000;

        // 10 % base + up to 85 % over TOTAL_ESTIMATED_MINUTES, capped at 95 until COMPLETED
        const progress = Math.min(Math.round(10 + (elapsedMinutes / TOTAL_ESTIMATED_MINUTES) * 85), 95);
        const coinsTransferred = Math.round((progress / 100) * total);
        const eta = Math.max(Math.round(TOTAL_ESTIMATED_MINUTES - elapsedMinutes), 0);

        this.logger.debug(
          `[Transfer mock] Order ${orderId}: ${progress}% (${elapsedMinutes.toFixed(1)} min elapsed)`,
        );

        return this.build(orderId, total, TransferStatus.IN_PROGRESS, progress, coinsTransferred, 'Transferencia en progreso', eta);
      }

      case TransferStatus.COMPLETED:
        return this.build(orderId, total, TransferStatus.COMPLETED, 100, total, '¡Transferencia completada exitosamente!', 0);

      case TransferStatus.ERROR:
        return this.build(orderId, total, TransferStatus.ERROR, 0, 0, 'Error en la transferencia — contacta soporte', null);

      default:
        return this.build(orderId, total, order.transfer_status, 0, 0, 'Estado desconocido', null);
    }
  }

  private build(
    orderId: string,
    totalCoins: number,
    status: TransferStatus,
    progress: number,
    coinsTransferred: number,
    message: string,
    eta: number | null,
  ): TransferStatusResponse {
    return {
      orderId,
      transfer_status: status,
      progress,
      coins_transferred: coinsTransferred,
      total_coins: totalCoins,
      message,
      estimated_minutes_remaining: eta,
    };
  }
}
