import { IsEmail, IsNotEmpty, IsString, MinLength, IsEnum } from 'class-validator';

export enum Platform {
  PSN = 'PSN',
  XBOX = 'Xbox',
  PC = 'PC',
}

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;

  @IsEnum(Platform)
  platform: Platform;
}
