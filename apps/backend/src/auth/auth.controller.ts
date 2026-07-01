import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { Public } from '../libs/decorators/public.decorator';
import { AuthService } from './auth.service';
import { CreateAdminDto, LoginDto } from '@helvetfarm/dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('create-admin')
  @HttpCode(HttpStatus.CREATED)
  async createAdmin(@Body() dto: CreateAdminDto) {
    return this.authService.createAdmin(dto.apiKey, dto.email, dto.password);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }
}
