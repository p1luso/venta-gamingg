import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private resend: Resend | null = null;
  private from: string;

  constructor(private config: ConfigService) {
    const apiKey = this.config.get<string>('RESEND_API_KEY');
    this.from = this.config.get<string>('EMAIL_FROM') || 'VentaGaming <noreply@ventagaming.com>';

    if (apiKey) {
      this.resend = new Resend(apiKey);
      this.logger.log('[Email] Resend initialized');
    } else {
      this.logger.warn('[Email] RESEND_API_KEY not set — emails will be logged only');
    }
  }

  /** Sent when payment is confirmed (status → PAID) */
  async sendOrderProcessingEmail(to: string, orderId: string): Promise<void> {
    const subject = `✅ Pago confirmado — Orden #${orderId.slice(0, 8)}`;
    const html = `
      <div style="font-family:sans-serif;max-width:500px;margin:0 auto;background:#0a0a0a;color:#fff;padding:32px;border-radius:12px">
        <h2 style="color:#00FF88;margin-bottom:8px">¡Pago recibido!</h2>
        <p style="color:#aaa">Tu pago fue confirmado. Ya estamos procesando tu pedido de monedas.</p>
        <div style="background:#111;border:1px solid #222;border-radius:8px;padding:16px;margin:24px 0">
          <p style="margin:0;font-size:12px;color:#666">ID de Orden</p>
          <p style="margin:4px 0 0;font-family:monospace;color:#fff">${orderId}</p>
        </div>
        <p style="color:#aaa;font-size:13px">Te avisaremos cuando las monedas sean transferidas. Suele tardar entre 5 y 30 minutos.</p>
        <p style="color:#555;font-size:12px;margin-top:32px">VentaGaming · El servicio más rápido del mercado</p>
      </div>`;

    await this._send(to, subject, html);
  }

  /** Sent when coins are fully transferred (transfer_status → COMPLETED) */
  async sendOrderCompletedEmail(
    to: string,
    orderId: string,
    coins: number,
    cashback: number,
  ): Promise<void> {
    const subject = `🎮 ¡Monedas transferidas! — Orden #${orderId.slice(0, 8)}`;
    const cashbackLine = cashback > 0
      ? `<p style="color:#00FF88;font-weight:bold">🎁 Recibiste <strong>$${cashback.toFixed(2)} USD</strong> de cashback en tu wallet.</p>`
      : '';
    const html = `
      <div style="font-family:sans-serif;max-width:500px;margin:0 auto;background:#0a0a0a;color:#fff;padding:32px;border-radius:12px">
        <h2 style="color:#00FF88;margin-bottom:8px">¡Monedas transferidas!</h2>
        <p style="color:#aaa">Las <strong style="color:#fff">${coins.toLocaleString()} monedas</strong> ya están en tu cuenta de FC.</p>
        ${cashbackLine}
        <div style="background:#111;border:1px solid #222;border-radius:8px;padding:16px;margin:24px 0">
          <p style="margin:0;font-size:12px;color:#666">ID de Orden</p>
          <p style="margin:4px 0 0;font-family:monospace;color:#fff">${orderId}</p>
        </div>
        <p style="color:#555;font-size:12px;margin-top:32px">VentaGaming · Gracias por tu compra 🏆</p>
      </div>`;

    await this._send(to, subject, html);
  }

  private async _send(to: string, subject: string, html: string): Promise<void> {
    if (!this.resend) {
      this.logger.log(`[Email] MOCK → to: ${to} | subject: ${subject}`);
      return;
    }
    try {
      await this.resend.emails.send({ from: this.from, to, subject, html });
      this.logger.log(`[Email] Sent "${subject}" to ${to}`);
    } catch (err) {
      this.logger.error(`[Email] Failed to send to ${to}: ${err.message}`);
    }
  }
}
