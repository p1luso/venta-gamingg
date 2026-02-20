import {
  Controller,
  Post,
  Param,
  UploadedFile,
  UseInterceptors,
  Patch,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PaymentService } from './payment.service';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('transfer/:orderId/proof')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/proofs',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
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
}
