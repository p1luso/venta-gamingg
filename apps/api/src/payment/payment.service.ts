import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus } from '@prisma/client';
import { EmailService } from '../notification/email.service';
import { Cron } from '@nestjs/schedule';
import * as crypto from 'crypto';
import * as fs from 'fs';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private email: EmailService,
  ) {}

  // ── File proof ───────────────────────────────────────────────────────────────

  async processTransferProof(orderId: string, filePath: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException(`Order ${orderId} not found`);

    await this.prisma.order.update({
      where: { id: orderId },
      data: { proof_image_url: filePath, status: OrderStatus.PENDING_APPROVAL },
    });

    this.logger.log(`[PaymentService] Proof uploaded for order ${orderId}`);
    return { message: 'Proof uploaded successfully, pending approval.' };
  }

  async approveOrder(orderId: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException(`Order ${orderId} not found`);

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.PAID },
    });

    const user = await this.prisma.user.findUnique({ where: { id: order.user_id } });
    if (user) this.email.sendOrderProcessingEmail(user.email, orderId).catch(() => {});
    return updated;
  }

  // ── MercadoPago Webhook ──────────────────────────────────────────────────────

  /**
   * Validates the Mercado Pago V2 signature.
   *
   * Header format:  x-signature: ts=1704720071,v1=<hmac-hex>
   * Signed content: id:<data.id>;request-id:<x-request-id>;ts:<ts>
   * Algorithm:      HMAC-SHA256 keyed with MP_WEBHOOK_SECRET
   */
  async handleMercadoPagoWebhook(body: any, xSignature: string, xRequestId: string): Promise<void> {
    const secret = this.config.get<string>('MP_WEBHOOK_SECRET');

    if (secret) {
      if (!xSignature) throw new ForbiddenException('Missing x-signature header');

      const parts: Record<string, string> = {};
      xSignature.split(',').forEach((p) => {
        const [k, v] = p.split('=');
        if (k && v) parts[k.trim()] = v.trim();
      });

      const ts = parts['ts'];
      const receivedHash = parts['v1'];
      const dataId: string = body?.data?.id ?? '';

      if (!ts || !receivedHash) throw new ForbiddenException('Malformed x-signature');

      const template = `id:${dataId};request-id:${xRequestId ?? ''};ts:${ts}`;
      const expectedHash = crypto.createHmac('sha256', secret).update(template).digest('hex');

      if (!crypto.timingSafeEqual(Buffer.from(receivedHash), Buffer.from(expectedHash))) {
        this.logger.warn('[MP Webhook] Invalid signature');
        throw new ForbiddenException('Invalid webhook signature');
      }
      this.logger.log('[MP Webhook] Signature validated ✓');
    } else {
      this.logger.warn('[MP Webhook] MP_WEBHOOK_SECRET not set — skipping signature validation');
    }

    const action: string = body?.action ?? '';
    const dataId: string = body?.data?.id ?? '';

    if (action === 'payment.created' || action === 'payment.updated') {
      await this._processMPPayment(dataId, body);
    }
  }

  private async _processMPPayment(mpPaymentId: string, body?: any): Promise<void> {
    // external_reference = orderId we passed when creating the MP preference
    const orderId: string = body?.external_reference ?? body?.data?.external_reference ?? mpPaymentId;

    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      this.logger.warn(`[MP Webhook] No order found for id ${orderId}`);
      return;
    }
    if (order.status === OrderStatus.PAID) return;

    await this.prisma.order.update({ where: { id: order.id }, data: { status: OrderStatus.PAID } });
    this.logger.log(`[MP Webhook] Order ${order.id} marked as PAID`);

    const user = await this.prisma.user.findUnique({ where: { id: order.user_id } });
    if (user) this.email.sendOrderProcessingEmail(user.email, order.id).catch(() => {});
  }

  // ── Stripe Webhook ───────────────────────────────────────────────────────────

  /**
   * Stripe requires the raw request body (Buffer) to validate the signature.
   * We receive it via req.rawBody (enabled in main.ts with { rawBody: true }).
   *
   * If STRIPE_WEBHOOK_SECRET is missing, we log a warning and skip validation —
   * the module initialises fine without it.
   */
  async handleStripeWebhook(rawBody: Buffer, sig: string): Promise<void> {
    const secret = this.config.get<string>('STRIPE_WEBHOOK_SECRET');

    if (!secret) {
      this.logger.warn('[Stripe Webhook] STRIPE_WEBHOOK_SECRET missing — skipping validation');
      return;
    }

    let event: any;
    try {
      // Dynamic import keeps the module bootable even if Stripe SDK is unconfigured
      const Stripe = (await import('stripe')).default;
      const stripe = new Stripe(this.config.get<string>('STRIPE_KEY') || '');
      event = stripe.webhooks.constructEvent(rawBody, sig, secret);
    } catch (err) {
      this.logger.error(`[Stripe Webhook] Signature verification failed: ${err.message}`);
      throw new ForbiddenException('Invalid Stripe webhook signature');
    }

    if (event.type === 'payment_intent.succeeded') {
      const pi = event.data.object;
      await this._processStripePayment(pi.metadata?.orderId);
    }
  }

  private async _processStripePayment(orderId?: string): Promise<void> {
    if (!orderId) {
      this.logger.warn('[Stripe Webhook] No orderId in payment_intent metadata');
      return;
    }

    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order || order.status === OrderStatus.PAID) return;

    await this.prisma.order.update({ where: { id: order.id }, data: { status: OrderStatus.PAID } });
    this.logger.log(`[Stripe Webhook] Order ${order.id} marked as PAID`);

    const user = await this.prisma.user.findUnique({ where: { id: order.user_id } });
    if (user) this.email.sendOrderProcessingEmail(user.email, order.id).catch(() => {});
  }

  // ── Cleanup cron ─────────────────────────────────────────────────────────────

  @Cron('0 0 */15 * *')
  async cleanupProofImages() {
    const orders = await this.prisma.order.findMany({
      where: { status: OrderStatus.PAID, proof_image_url: { not: null } },
    });

    for (const o of orders) {
      if (o.proof_image_url && fs.existsSync(o.proof_image_url)) {
        try {
          fs.unlinkSync(o.proof_image_url);
          await this.prisma.order.update({ where: { id: o.id }, data: { proof_image_url: null } });
        } catch (err) {
          this.logger.error(`Failed to delete proof for ${o.id}: ${err.message}`);
        }
      }
    }
  }
}
