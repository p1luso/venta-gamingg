import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentStatus } from '@prisma/client';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as fs from 'fs';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(private prisma: PrismaService) {}

  async processTransferProof(orderId: string, filePath: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    await this.prisma.order.update({
      where: { id: orderId },
      data: {
        proof_image_url: filePath,
        payment_status: PaymentStatus.PENDING_APPROVAL,
      },
    });

    // Simulated WhatsApp Notification
    this.logger.log(`[WHATSAPP NOTIFICATION]
      New transfer proof received!
      Order ID: ${orderId}
      Amount: ${order.amount_coins} coins
      User: ${order.user_id}
      Proof Image: ${filePath}
    `);

    return { message: 'Proof uploaded successfully, pending approval.' };
  }

  async approveOrder(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    return await this.prisma.order.update({
      where: { id: orderId },
      data: {
        payment_status: PaymentStatus.PAID,
      },
    });
  }

  @Cron('0 0 */15 * *')
  async cleanupProofImages() {
    this.logger.log('Starting cleanup of old proof images...');
    
    const finishedOrders = await this.prisma.order.findMany({
      where: {
        payment_status: PaymentStatus.PAID,
        proof_image_url: { not: null },
      },
    });

    for (const order of finishedOrders) {
      if (order.proof_image_url && fs.existsSync(order.proof_image_url)) {
        try {
          fs.unlinkSync(order.proof_image_url);
          await this.prisma.order.update({
            where: { id: order.id },
            data: { proof_image_url: null },
          });
          this.logger.log(`Deleted proof image for order ${order.id}`);
        } catch (error) {
          this.logger.error(`Failed to delete file ${order.proof_image_url}: ${error.message}`);
        }
      }
    }
  }
}
