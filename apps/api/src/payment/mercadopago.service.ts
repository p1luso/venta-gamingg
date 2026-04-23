import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MercadoPagoConfig, Preference } from 'mercadopago';

@Injectable()
export class MercadoPagoService {
    private readonly logger = new Logger(MercadoPagoService.name);
    private client: MercadoPagoConfig;
    private preference: Preference;

    // Cache del tipo de cambio (10 min)
    private cachedRate: number | null = null;
    private cacheTimestamp = 0;
    private readonly CACHE_DURATION_MS = 10 * 60 * 1000;

    constructor(private configService: ConfigService) {
        const accessToken = this.configService.get<string>('MP_ACCESS_TOKEN');
        this.logger.log(`[MP] Initializing with token: ${accessToken ? accessToken.substring(0, 15) + '...' : 'MISSING'}`);
        this.client = new MercadoPagoConfig({ accessToken: accessToken || '' });
        this.preference = new Preference(this.client);
    }

    private async getUsdToArsRate(): Promise<number> {
        const now = Date.now();
        if (this.cachedRate && (now - this.cacheTimestamp) < this.CACHE_DURATION_MS) {
            return this.cachedRate;
        }
        try {
            const response = await fetch('https://dolarapi.com/v1/dolares/blue');
            const data = await response.json();
            const rate = data.venta;
            this.cachedRate = rate;
            this.cacheTimestamp = now;
            this.logger.log(`[MP] Dólar blue actualizado: $${rate} ARS`);
            return rate;
        } catch {
            this.logger.warn('[MP] Error obteniendo cotización, usando fallback del .env');
            return Number(this.configService.get<string>('USD_TO_ARS_RATE') || '1200');
        }
    }

    async createPreference(data: {
        orderId: string;
        title: string;
        quantity: number;
        unitPrice: number;
        buyerEmail: string;
    }) {
        const usdToArs = await this.getUsdToArsRate();
        const priceInArs = Math.round(Number(data.unitPrice) * usdToArs);

        this.logger.log(
            `[MP] Creating preference: orderId=${data.orderId}, priceUSD=${data.unitPrice}, ` +
            `dólarBlue=$${usdToArs}, priceARS=$${priceInArs}`,
        );

        // ── URL construction ───────────────────────────────────────────────────
        // API_BASE_URL points to this NestJS instance (e.g. http://localhost:3001/api/v1)
        // FRONTEND_URL points to the Next.js app      (e.g. http://localhost:3000)
        // MP redirects the user's browser to back_urls, so they must be publicly reachable.
        const apiBase = (
            this.configService.get<string>('API_BASE_URL') ||
            this.configService.get<string>('NEXT_PUBLIC_API_URL') ||
            'http://localhost:3001/api/v1'
        );
        // orderId is embedded in the path so we always know which order to update,
        // even when MP Sandbox redirects without query params.
        const callbackUrl = `${apiBase}/payments/mercadopago/callback/${data.orderId}`;

        const validEmail = data.buyerEmail.includes('@')
            ? data.buyerEmail
            : 'test_user_venta@testmail.com';

        const preferenceBody: any = {
            items: [{
                id: data.orderId,
                title: data.title,
                quantity: data.quantity,
                currency_id: 'ARS',
                unit_price: priceInArs,
            }],
            payer: { email: validEmail },
            external_reference: data.orderId,
            back_urls: {
                success: callbackUrl,
                failure: callbackUrl,
                pending: callbackUrl,
            },
            // auto_return: 'approved' makes MP redirect automatically after a successful payment
            // instead of showing a manual "Volver al sitio" button.
            // auto_return: 'approved' is NOT supported with localhost back_urls.
            // Remove this line in production if back_urls point to a real domain.
            binary_mode: true,
        };

        this.logger.log(`[MP] Preference body: ${JSON.stringify(preferenceBody)}`);

        try {
            const result = await this.preference.create({ body: preferenceBody });
            this.logger.log(`[MP] Preference created for Order #${data.orderId}: ${result.id}`);
            return {
                preferenceId: result.id,
                initPoint: result.init_point,
                sandboxInitPoint: result.sandbox_init_point,
            };
        } catch (error: any) {
            this.logger.error(
                `[MP] Error creating preference: ${JSON.stringify(error?.cause || error?.message || error)}`,
            );
            throw error;
        }
    }
}
