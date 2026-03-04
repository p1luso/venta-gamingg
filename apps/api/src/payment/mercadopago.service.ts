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
    private readonly CACHE_DURATION_MS = 10 * 60 * 1000; // 10 minutos

    constructor(private configService: ConfigService) {
        const accessToken = this.configService.get<string>('MP_ACCESS_TOKEN');
        this.logger.log(`[MP] Initializing with token: ${accessToken ? accessToken.substring(0, 15) + '...' : 'MISSING'}`);
        this.client = new MercadoPagoConfig({ accessToken: accessToken || '' });
        this.preference = new Preference(this.client);
    }

    /**
     * Obtiene el tipo de cambio USD → ARS (dólar blue venta) en tiempo real.
     * Usa cache de 10 minutos. Si la API falla, usa el fallback del .env.
     */
    private async getUsdToArsRate(): Promise<number> {
        const now = Date.now();
        if (this.cachedRate && (now - this.cacheTimestamp) < this.CACHE_DURATION_MS) {
            return this.cachedRate;
        }

        try {
            const response = await fetch('https://dolarapi.com/v1/dolares/blue');
            const data = await response.json();
            const rate = data.venta; // Precio de venta del dólar blue
            this.cachedRate = rate;
            this.cacheTimestamp = now;
            this.logger.log(`[MP] Dólar blue actualizado: $${rate} ARS`);
            return rate;
        } catch (error) {
            this.logger.warn(`[MP] Error obteniendo cotización, usando fallback del .env`);
            const fallback = Number(this.configService.get<string>('USD_TO_ARS_RATE') || '1200');
            return fallback;
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

        this.logger.log(`[MP] Creating preference: orderId=${data.orderId}, priceUSD=${data.unitPrice}, dolarBlue=$${usdToArs}, priceARS=$${priceInArs}, email=${data.buyerEmail}`);

        try {
            const result = await this.preference.create({
                body: {
                    items: [
                        {
                            id: data.orderId,
                            title: data.title,
                            quantity: data.quantity,
                            unit_price: priceInArs,
                        },
                    ],
                    payer: {
                        email: data.buyerEmail,
                    },
                    external_reference: data.orderId,
                    back_urls: {
                        success: `${this.configService.get<string>('FRONTEND_URL')}/order/${data.orderId}/setup`,
                        failure: `${this.configService.get<string>('FRONTEND_URL')}/checkout?status=failure`,
                        pending: `${this.configService.get<string>('FRONTEND_URL')}/checkout?status=pending`,
                    },
                    auto_return: 'approved',
                },
            });

            this.logger.log(`[MP] Preference created for Order #${data.orderId}: ${result.id}`);

            return {
                preferenceId: result.id,
                initPoint: result.init_point,
                sandboxInitPoint: result.sandbox_init_point,
            };
        } catch (error: any) {
            this.logger.error(`[MP] Error creating preference: ${JSON.stringify(error?.cause || error?.message || error)}`);
            throw error;
        }
    }
}
