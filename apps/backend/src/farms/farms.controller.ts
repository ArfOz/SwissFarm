import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Farm, FarmType } from '@swissfarm/types';
import { Locale } from '../i18n/translations';
import { Public } from '../auth/public.decorator';
import { AdminOnly } from '../auth/admin-only.decorator';
import { CreateFarmDto } from './dto/create-farm.dto';
import { UpdateFarmDto } from './dto/update-farm.dto';
import { FarmsService, FarmWithDistance } from './farms.service';

@Controller('farms')
export class FarmsController {
  constructor(private readonly farmsService: FarmsService) {}

  // ── PUBLIC Static routes (must precede :id) ──────────────────────────────

  @Public()
  @Get('types')
  getTypes(): FarmType[] {
    return this.farmsService.getTypes();
  }

  @Public()
  @Get('products')
  getProducts(@Query('locale') locale?: string): Promise<{ id: string; name: string }[]> {
    return this.farmsService.findAllProducts((locale as Locale) ?? 'en');
  }

  @Public()
  @Get('cantons')
  getCantons(): Promise<string[]> {
    return this.farmsService.getCantons();
  }

  @Public()
  @Get('nearby')
  findNearby(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('radius') radius?: string,
    @Query('locale') locale?: string,
  ): Promise<FarmWithDistance[]> {
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    if (isNaN(latNum) || isNaN(lngNum)) {
      throw new BadRequestException('lat and lng query params are required and must be numbers');
    }
    const radiusNum = radius ? parseFloat(radius) : 25;
    return this.farmsService.findNearby(latNum, lngNum, radiusNum, (locale as Locale) ?? 'en');
  }

  @Public()
  @Get('search')
  search(
    @Query('q') q: string,
    @Query('locale') locale?: string,
  ): Promise<Farm[]> {
    return this.farmsService.search(q ?? '', (locale as Locale) ?? 'en');
  }

  // ── PUBLIC CRUD (read-only for mobile) ────────────────────────────────────

  @Public()
  @Get()
  findAll(
    @Query('type') type?: FarmType,
    @Query('locale') locale?: string,
  ): Promise<Farm[]> {
    return this.farmsService.findAll(type, (locale as Locale) ?? 'en');
  }

  @Public()
  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Query('locale') locale?: string,
  ): Promise<Farm> {
    return this.farmsService.findOne(id, (locale as Locale) ?? 'en');
  }

  // ── ADMIN-ONLY endpoints ──────────────────────────────────────────────────

  @AdminOnly()
  @Post()
  create(@Body() dto: CreateFarmDto): Promise<Farm> {
    return this.farmsService.create(dto);
  }

  @AdminOnly()
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateFarmDto,
    @Query('locale') locale?: string,
  ): Promise<Farm> {
    return this.farmsService.update(id, dto, (locale as Locale) ?? 'en');
  }

  @AdminOnly()
  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string): Promise<void> {
    return this.farmsService.remove(id);
  }

  @AdminOnly()
  @Delete(':farmId/products/:productId')
  @HttpCode(200)
  removeProductFromFarm(
    @Param('farmId') farmId: string,
    @Param('productId') productId: string,
    @Query('locale') locale?: string,
  ): Promise<Farm> {
    return this.farmsService.removeProductFromFarm(farmId, productId, (locale as Locale) ?? 'en');
  }
}