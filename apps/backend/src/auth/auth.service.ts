import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async createAdmin(apiKey: string, email: string, password: string) {
    const staticKey = process.env.ADMIN_API_KEY || 'swissfarm-admin-key-dev';

    if (apiKey !== staticKey) {
      throw new UnauthorizedException('Invalid API key');
    }

    const existing = await this.prisma.admin.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('Admin with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await this.prisma.admin.create({
      data: {
        email,
        password: hashedPassword,
        role: 'admin',
      },
    });

    return { id: admin.id, email: admin.email, role: admin.role };
  }

  async login(email: string, password: string) {
    const admin = await this.prisma.admin.findUnique({ where: { email } });
    if (!admin) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await bcrypt.compare(password, admin.password);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { id: admin.id, role: admin.role };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      admin: {
        id: admin.id,
        email: admin.email,
        role: admin.role,
      },
    };
  }
}