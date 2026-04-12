import {
  Controller,
  Post,
  Param,
  UploadedFile,
  UseInterceptors,
  Patch,
  Body,
  Headers,
  Req,
  RawBodyRequest,
  HttpCode,
  ForbiddenException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PaymentService } from './payment.service';
import { MercadoPagoService } from './mercadopago.service';
import { SkipThrottle } from '@nestjs/throttler';
import { diskStorage } from 'multer';
import { extname } from 'path';


@Controller('payments')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly mpService: MercadoPagoService,
  ) {}

  // ── File upload ─────────────────────────────────────────────────────────────

  @Post('transfer/:orderId/proof')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/proofs',
        filename: (req, file, cb) => {
          const rand = Array(32).fill(null).map(() => Math.round(Math.random() * 16).toString(16)).join('');
          cb(null, `${rand}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async uploadProof(
    @Param('orderId') orderId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.paymentService.processTransferProof(orderId, file.path);
  }

  @Patch('approve/:orderId')
  async approveOrder(@Param('orderId') orderId: string) {
    return this.paymentService.approveOrder(orderId);
  }

  // ── Preference creation ─────────────────────────────────────────────────────

  @Post('mercadopago')
  async createMPPreference(
    @Body() body: { orderId: string; title: string; quantity: number; unitPrice: number; buyerEmail: string },
  ) {
    return this.mpService.createPreference(body);
  }

  // ── Webhooks (skip global rate-limit — MP/Stripe call these server-to-server)

  /**
   * POST /payments/webhook/mercadopago
   *
   * Validates the Mercado Pago V2 HMAC-SHA256 signature before processing.
   * Required env: MP_WEBHOOK_SECRET
   */
  @SkipThrottle()
  @Post('webhook/mercadopago')
  @HttpCode(200)
  async mercadoPagoWebhook(
    @Headers('x-signature') xSignature: string,
    @Headers('x-request-id') xRequestId: string,
    @Body() body: any,
  ) {
    await this.paymentService.handleMercadoPagoWebhook(body, xSignature, xRequestId);
    return { received: true };
  }

  /**
   * POST /payments/webhook/stripe
   *
   * NestJS exposes req.rawBody because we bootstrapped with { rawBody: true }.
   * stripe.webhooks.constructEvent() MUST receive the raw bytes — parsing it
   * as JSON first would break the signature.
   *
   * Required env: STRIPE_WEBHOOK_SECRET (optional — app still starts without it)
   */
  @SkipThrottle()
  @Post('webhook/stripe')
  @HttpCode(200)
  async stripeWebhook(
    @Headers('stripe-signature') sig: string,
    @Req() req: any,
  ) {
    if (!req.rawBody) return { received: true };
    await this.paymentService.handleStripeWebhook(req.rawBody, sig);
    return { received: true };
  }
}
