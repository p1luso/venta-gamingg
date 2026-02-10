import { Injectable, OnModuleInit, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService implements OnModuleInit {
  private readonly algorithm = 'aes-256-cbc';
  private key: Buffer;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const keyString = this.configService.get<string>('ENCRYPTION_KEY');
    
    if (!keyString) {
      throw new InternalServerErrorException('ENCRYPTION_KEY is not defined in environment variables');
    }

    // Strict validation: Key must be exactly 32 bytes
    if (keyString.length !== 32) {
      throw new InternalServerErrorException(`ENCRYPTION_KEY must be exactly 32 bytes long. Received ${keyString.length} bytes.`);
    }

    this.key = Buffer.from(keyString);
  }

  encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
  }

  decrypt(text: string): string {
    const [ivHex, encryptedHex] = text.split(':');
    if (!ivHex || !encryptedHex) {
      throw new Error('Invalid encrypted text format');
    }
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}
