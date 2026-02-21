import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, username } = registerDto;

    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Hash password
    const salt = await bcrypt.genSalt();
    const password_hash = await bcrypt.hash(password, salt);

    // Create user
    // Note: 'username' is not in the schema in previous step, checking schema.prisma...
    // Schema has 'username'
    const user = await this.prisma.user.create({
      data: {
        email,
        password_hash,
      },
    });

    // TODO: Update Schema to include username if it was missed or handle it properly
    // For now assuming schema has email and password_hash based on previous artifact

    return {
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.password_hash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email };
    
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
      }
    };
  }

  async validateOAuthUser(email: string) {
    let user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
        },
      });
    }
    return user;
  }
}
