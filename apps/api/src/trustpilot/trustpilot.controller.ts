import { Controller, Get } from '@nestjs/common';
import { Logger } from '@nestjs/common';

interface TrustpilotReview {
    name: string;
    country: string;
    text: string;
    rating: number;
}

interface TrustpilotData {
    score: string;
    totalReviews: number;
    reviews: TrustpilotReview[];
}

@Controller('trustpilot')
export class TrustpilotController {
    private readonly logger = new Logger(TrustpilotController.name);
    private cachedData: TrustpilotData | null = null;
    private cacheTimestamp = 0;
    private readonly CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hora

    @Get()
    async getReviews(): Promise<TrustpilotData> {
        const now = Date.now();
        if (this.cachedData && (now - this.cacheTimestamp) < this.CACHE_DURATION_MS) {
            return this.cachedData;
        }

        try {
            const response = await fetch('https://es.trustpilot.com/review/ventagamingg.com');
            const html = await response.text();

            // Extract TrustScore
            const scoreMatch = html.match(/TrustScore["\s]*[:\s]*([0-9.]+)/i)
                || html.match(/"ratingValue"[:\s]*"?([0-9.]+)"?/);
            const score = scoreMatch ? scoreMatch[1] : '4.6';

            // Extract total reviews
            const countMatch = html.match(/"reviewCount"[:\s]*"?(\d+)"?/)
                || html.match(/(\d+)\s*(?:opiniones|reviews|en total)/i);
            const totalReviews = countMatch ? parseInt(countMatch[1]) : 46;

            // Extract reviews from JSON-LD structured data
            const reviews: TrustpilotReview[] = [];

            // Try to extract from structured data
            const jsonLdMatches = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g);
            if (jsonLdMatches) {
                for (const match of jsonLdMatches) {
                    try {
                        const jsonStr = match.replace(/<script type="application\/ld\+json">/, '').replace(/<\/script>/, '');
                        const data = JSON.parse(jsonStr);
                        if (data['@graph']) {
                            for (const item of data['@graph']) {
                                if (item['@type'] === 'Review' && reviews.length < 6) {
                                    reviews.push({
                                        name: item.author?.name || 'Usuario',
                                        country: this.extractCountry(item.author?.name, html),
                                        text: item.reviewBody || item.headline || '',
                                        rating: item.reviewRating?.ratingValue || 5,
                                    });
                                }
                            }
                        }
                        if (data['@type'] === 'Review' && reviews.length < 6) {
                            reviews.push({
                                name: data.author?.name || 'Usuario',
                                country: '',
                                text: data.reviewBody || data.headline || '',
                                rating: data.reviewRating?.ratingValue || 5,
                            });
                        }
                    } catch {
                        // skip invalid JSON
                    }
                }
            }

            // Fallback: parse review cards from HTML
            if (reviews.length === 0) {
                const reviewBlocks = html.match(/data-review-id="[^"]*"[\s\S]*?(?=data-review-id|$)/g);
                if (reviewBlocks) {
                    for (const block of reviewBlocks.slice(0, 6)) {
                        const nameMatch = block.match(/data-consumer-name="([^"]*)"/);
                        const textMatch = block.match(/data-service-review-text-typography[^>]*>([^<]*)/);
                        const ratingMatch = block.match(/rating-(\d)/);
                        if (nameMatch) {
                            reviews.push({
                                name: nameMatch[1],
                                country: 'AR',
                                text: textMatch ? textMatch[1].trim() : '',
                                rating: ratingMatch ? parseInt(ratingMatch[1]) : 5,
                            });
                        }
                    }
                }
            }

            // Final fallback with hardcoded reviews if scraping fails
            if (reviews.length === 0) {
                reviews.push(
                    { name: 'Santiago Russo', country: 'AR', text: 'Excelente atención, compre monedas y con su método automatizado me llegó 1 millón de monedas en 20/25mins. Volvería a comprar', rating: 5 },
                    { name: 'Gaspi Canton', country: 'AR', text: 'Unos genios, contestan siempre al toque y el servicio es super rapido, confiable al 100% !!!!', rating: 5 },
                    { name: 'Leonardo Fasciglione', country: 'AR', text: 'La mejor página sin dudas, las monedas al mejor precio del mercado y seguro. Lo recomiendo.', rating: 5 },
                    { name: 'Dario Ruiz', country: 'AR', text: 'Primera vez que compro y fue una muy buena la experiencia. Rápidos, atentos.', rating: 5 },
                    { name: 'Alejandro Cruz', country: 'CO', text: 'Muy buen servicio y confiable.', rating: 5 },
                    { name: 'Lautaro Z', country: 'AR', text: 'Te atienden super rápido sin importar el horario. Unos genios totalmente recomendado.', rating: 5 },
                );
            }

            this.cachedData = { score, totalReviews, reviews };
            this.cacheTimestamp = now;
            this.logger.log(`[TP] Fetched ${reviews.length} reviews, score: ${score}, total: ${totalReviews}`);

            return this.cachedData;
        } catch (error) {
            this.logger.error(`[TP] Error fetching reviews: ${error}`);
            // Return cached data if available, otherwise fallback
            if (this.cachedData) return this.cachedData;
            return {
                score: '4.6',
                totalReviews: 46,
                reviews: [
                    { name: 'Santiago Russo', country: 'AR', text: 'Excelente atención, compre monedas y con su método automatizado me llegó 1 millón de monedas en 20/25mins.', rating: 5 },
                    { name: 'Gaspi Canton', country: 'AR', text: 'Unos genios, contestan siempre al toque y el servicio es super rapido, confiable al 100%!', rating: 5 },
                    { name: 'Leonardo Fasciglione', country: 'AR', text: 'La mejor página sin dudas, las monedas al mejor precio del mercado y seguro.', rating: 5 },
                ],
            };
        }
    }

    private extractCountry(name: string, html: string): string {
        if (!name) return 'AR';
        // Try to find country code near the author name in the HTML
        const nameRegex = new RegExp(name + '[\\s\\S]{0,200}?(AR|CO|UY|BR|MX|CL|ES|US)', 'i');
        const match = html.match(nameRegex);
        return match ? match[1].toUpperCase() : 'AR';
    }
}
