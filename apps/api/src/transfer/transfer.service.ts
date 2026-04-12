import {
  Injectable,
  Logger,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { EncryptionService } from '../common/services/encryption.service';
import { TransferStatus } from '@prisma/client';
import { LoyaltyService } from '../loyalty/loyalty.service';
import { firstValueFrom } from 'rxjs';
import * as crypto from 'crypto';

export interface TransferStatusResponse {
  orderId: string;
  transfer_status: TransferStatus;
  progress: number;
  coins_transferred: number;
  total_coins: number;
  message: string;
  fut_account_check: string | null;
  fut_economy_state: string | null;
}

interface FutTransferOrderResponse {
  orderID: string;
}

interface FutTransferStatusResponse {
  status: string;
  accountCheck: string;
  economyState: string;
  amountOrdered: number;
  amount: number;
  coinsUsed: number;
  coinsCustomerAccount: number;
  wasAborted: number;
  externalOrderID?: string;
}

@Injectable()
export class TransferService {
  private readonly logger = new Logger(TransferService.name);
  private readonly apiUser: string;
  private readonly apiKeyMd5: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly encryptionService: EncryptionService,
    private readonly loyaltyService: LoyaltyService,
  ) {
    this.apiUser = this.configService.get<string>('FUT_TRANSFER_API_USER', '');
    const rawKey = this.configService.get<string>('FUT_TRANSFER_API_KEY', '');
    this.apiKeyMd5 = rawKey
      ? crypto.createHash('md5').update(rawKey).digest('hex')
      : '';
  }

  // ──────────────────────────────────────────────
  // 1. Start FUT Transfer
  // ──────────────────────────────────────────────
  async startFutTransfer(orderId: string): Promise<{ futTransferId: string }> {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException(`Order ${orderId} not found`);

    if (!order.ea_email || !order.ea_password || !order.ea_backup_codes) {
      throw new InternalServerErrorException(
        `Order ${orderId} is missing encrypted EA credentials`,
      );
    }

    // Decrypt credentials
    const email = this.encryptionService.decrypt(order.ea_email);
    const password = this.encryptionService.decrypt(order.ea_password);
    const backupCodes: string[] = JSON.parse(
      this.encryptionService.decrypt(order.ea_backup_codes),
    );

    // Build payload for FUT Transfer API
    const payload: Record<string, unknown> = {
      customerName: orderId,
      user: email,
      pass: password,
      ba: backupCodes[0] || '',
      platform: order.platform, // PS, XB, PC from our DB
      amount: Math.ceil(order.amount_coins / 1000), // API expects amount in K
      externalOrderID: orderId,
      persona: '-1',
      updateCustomer: '1',
      apiUser: this.apiUser,
      apiKey: this.apiKeyMd5,
    };

    // Send ba2, ba3 if available
    if (backupCodes[1]) payload.ba2 = backupCodes[1];
    if (backupCodes[2]) payload.ba3 = backupCodes[2];

    this.logger.log(
      `[FUT Transfer] Submitting order for ${orderId} — ${payload.amount}K coins on ${payload.platform}`,
    );

    try {
      const { data } = await firstValueFrom(
        this.httpService.post<FutTransferOrderResponse>('/orderAPI', payload),
      );

      const futTransferId = data.orderID;

      await this.prisma.order.update({
        where: { id: orderId },
        data: {
          fut_transfer_id: futTransferId,
          transfer_status: TransferStatus.QUEUED,
        },
      });

      this.logger.log(
        `[FUT Transfer] Order ${orderId} submitted → fut_transfer_id: ${futTransferId}`,
      );
      return { futTransferId };
    } catch (error) {
      const errMsg = error.response?.data ?? error.message;
      this.logger.error(
        `[FUT Transfer] Failed to submit order ${orderId}: ${JSON.stringify(errMsg)}`,
      );

      await this.prisma.order.update({
        where: { id: orderId },
        data: {
          transfer_status: TransferStatus.ERROR,
          fut_economy_state:
            typeof errMsg === 'string' ? errMsg : JSON.stringify(errMsg),
        },
      });

      throw new InternalServerErrorException(
        `FUT Transfer API rejected the order: ${JSON.stringify(errMsg)}`,
      );
    }
  }

  // ──────────────────────────────────────────────
  // 2. Polling Cron — every minute
  // ──────────────────────────────────────────────
  @Cron(CronExpression.EVERY_MINUTE)
  async pollActiveTransfers(): Promise<void> {
    const activeOrders = await this.prisma.order.findMany({
      where: {
        transfer_status: {
          in: [TransferStatus.QUEUED, TransferStatus.IN_PROGRESS],
        },
        fut_transfer_id: { not: null },
      },
      select: { id: true, fut_transfer_id: true, amount_coins: true },
    });

    if (activeOrders.length === 0) return;

    // Batch in groups of 20 (API limit)
    const batches = this.chunk(activeOrders, 20);

    for (const batch of batches) {
      const orderIDs = batch.map((o) => o.fut_transfer_id as string);

      try {
        const { data } = await firstValueFrom(
          this.httpService.post<Record<string, FutTransferStatusResponse>>(
            '/orderStatusBulkAPI',
            {
              orderIDs,
              apiUser: this.apiUser,
              apiKey: this.apiKeyMd5,
            },
          ),
        );

        for (const order of batch) {
          const futId = order.fut_transfer_id as string;
          const remote = data[futId];
          if (!remote) continue;

          const newStatus = this.mapFutStatus(remote);
          const coinsTransferred = (remote.amount ?? 0) * 1000; // API returns in K

          await this.prisma.order.update({
            where: { id: order.id },
            data: {
              transfer_status: newStatus,
              coins_transferred: coinsTransferred,
              fut_account_check: remote.accountCheck ?? null,
              fut_economy_state: remote.economyState ?? null,
            },
          });

          this.logger.debug(
            `[Polling] Order ${order.id}: status=${remote.status}, accountCheck=${remote.accountCheck}, economy=${remote.economyState}, delivered=${remote.amount}K/${remote.amountOrdered}K`,
          );
        }
      } catch (error) {
        this.logger.error(
          `[Polling] Bulk status query failed: ${error.message}`,
        );
      }
    }
  }

  // ──────────────────────────────────────────────
  // 3. Status endpoint — real data from DB
  // ──────────────────────────────────────────────
  async status(orderId: string): Promise<TransferStatusResponse> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!order) throw new NotFoundException(`Order ${orderId} not found`);

    const total = order.amount_coins;
    const transferred = order.coins_transferred;
    const progress =
      order.transfer_status === TransferStatus.COMPLETED
        ? 100
        : order.transfer_status === TransferStatus.WAITING_CREDS
          ? 0
          : total > 0
            ? Math.min(Math.round((transferred / total) * 100), 99)
            : 0;

    return {
      orderId,
      transfer_status: order.transfer_status,
      progress,
      coins_transferred: transferred,
      total_coins: total,
      message: this.statusMessage(
        order.transfer_status,
        order.fut_economy_state,
      ),
      fut_account_check: order.fut_account_check,
      fut_economy_state: order.fut_economy_state,
    };
  }

  // ──────────────────────────────────────────────
  // Private helpers
  // ──────────────────────────────────────────────
  private mapFutStatus(remote: FutTransferStatusResponse): TransferStatus {
    if (remote.status === 'finished') return TransferStatus.COMPLETED;

    if (
      remote.status === 'partlyDelivered' ||
      remote.status === 'waitingForAssignment'
    ) {
      return TransferStatus.IN_PROGRESS;
    }

    if (remote.status === 'ready' || remote.status === 'entered') {
      return TransferStatus.QUEUED;
    }

    if (remote.status === 'interrupted') {
      const errorStates = [
        'wrongBA',
        'wrongUserPass',
        'wrongConsole',
        'noClub',
        'noTM',
        'LoginFailedDeviceBan',
        'FailedReceiverDeviceBan',
        'FailWebAppCustomerLocked',
        'FailedWrongCredentialsTo',
        'FailedWrongBACodeTo',
      ];
      const hasError =
        errorStates.includes(remote.accountCheck) ||
        errorStates.includes(remote.economyState);

      return hasError ? TransferStatus.ERROR : TransferStatus.IN_PROGRESS;
    }

    return TransferStatus.QUEUED;
  }

  private statusMessage(
    status: TransferStatus,
    economyState: string | null,
  ): string {
    switch (status) {
      case TransferStatus.WAITING_CREDS:
        return 'Esperando credenciales de EA';
      case TransferStatus.QUEUED:
        return 'En cola — el proceso iniciará pronto';
      case TransferStatus.IN_PROGRESS:
        return this.economyMessage(economyState);
      case TransferStatus.COMPLETED:
        return '¡Transferencia completada exitosamente!';
      case TransferStatus.ERROR:
        return this.errorMessage(economyState);
      default:
        return 'Estado desconocido';
    }
  }

  private economyMessage(state: string | null): string {
    switch (state) {
      case 'started':
      case 'entered':
        return 'Preparando transferencia...';
      case 'transfersInProgress':
        return 'Transfiriendo monedas...';
      case 'transferCycleComplete':
        return 'Ciclo de transferencia completado, verificando...';
      case 'customerHasPlayer':
      case 'customerListedPlayer':
        return 'Procesando jugadores en el mercado...';
      default:
        return 'Transferencia en progreso';
    }
  }

  private errorMessage(state: string | null): string {
    switch (state) {
      case 'wrongBA':
      case 'FailedWrongBACodeTo':
        return 'Error: Código de respaldo incorrecto. Verificá tus backup codes.';
      case 'wrongUserPass':
      case 'FailedWrongCredentialsTo':
        return 'Error: Email o contraseña de EA incorrectos.';
      case 'noClub':
        return 'Error: La cuenta no tiene un club creado.';
      case 'noTM':
        return 'Error: La cuenta no tiene acceso al mercado de transferencias.';
      case 'LoginFailedDeviceBan':
      case 'FailedReceiverDeviceBan':
        return 'Error: La cuenta tiene un ban de dispositivo.';
      case 'FailWebAppCustomerLocked':
        return 'Error: La cuenta está bloqueada en la Web App.';
      case 'tlFull':
        return 'Error: Lista de transferencias llena. Liberá espacio.';
      case 'captcha':
        return 'Error: Se requiere resolver un captcha. Reintentá.';
      case 'wrongConsole':
        return 'Error: Plataforma incorrecta.';
      default:
        return 'Error en la transferencia — contactá soporte.';
    }
  }

  private chunk<T>(arr: T[], size: number): T[][] {
    const result: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
      result.push(arr.slice(i, i + size));
    }
    return result;
  }
}
