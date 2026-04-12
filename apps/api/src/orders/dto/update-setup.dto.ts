import {
  IsEmail, IsString, IsNotEmpty, IsArray, IsEnum,
  IsOptional, IsNumber, IsInt, Min, Max,
} from 'class-validator';
import { TransferMethod } from '@prisma/client';

export class UpdateSetupDto {
  @IsEnum(TransferMethod)
  @IsNotEmpty()
  transferMethod: TransferMethod;

  // ── COMFORT_TRADE fields ──────────────────────────────────────────────────
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  password?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  backupCodes?: string[];

  // ── PLAYER_AUCTION fields ─────────────────────────────────────────────────
  @IsString()
  @IsOptional()
  auctionPlayerName?: string;

  @IsInt()
  @Min(1)
  @Max(99)
  @IsOptional()
  auctionPlayerRating?: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  auctionStartPrice?: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  auctionBuyNowPrice?: number;
}
