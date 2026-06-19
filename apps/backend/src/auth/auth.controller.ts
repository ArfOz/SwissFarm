import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { Public } from '../libs/decorators/public.decorator';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('create-admin')
  @HttpCode(HttpStatus.CREATED)
  async createAdmin(@Body() body: { apiKey: string; email: string; password: string }) {
    return this.authService.createAdmin(body.apiKey, body.email, body.password);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }
}
