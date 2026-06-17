import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async login(apiKey: string) {
    const staticKey = process.env.ADMIN_API_KEY || 'swissfarm-admin-key-dev';

    if (apiKey !== staticKey) {
      throw new UnauthorizedException('Invalid API key');
    }

    const payload = { id: 'static-admin', role: 'admin' };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      admin: {
        id: 'static-admin',
        email: 'admin@swissfarm.ch',
        role: 'admin',
      },
    };
  }
}
