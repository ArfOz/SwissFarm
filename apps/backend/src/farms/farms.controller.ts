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
import { CreateFarmDto } from './dto/create-farm.dto';
import { UpdateFarmDto } from './dto/update-farm.dto';
import { FarmsService, FarmWithDistance } from './farms.service';

@Controller('farms')
export class FarmsController {
  constructor(private readonly farmsService: FarmsService) {}

  // ── Static routes first (must precede :id) ────────────────────────────────

  /**
   * GET /farms/types
   * Returns the list of all supported farm types.
   * Used by mobile filter UIs.
   */
  @Get('types')
  getTypes(): FarmType[] {
    return this.farmsService.getTypes();
  }

  /**
   * GET /farms/products
   * Returns all available products from the database.
   * Optionally translated with ?locale=de|fr|en
   */
  @Get('products')
  getProducts(@Query('locale') locale?: string): Promise<{ id: string; name: string }[]> {
    return this.farmsService.findAllProducts((locale as Locale) ?? 'en');
  }

  /**
   * GET /farms/cantons
   * Returns distinct cantons that have at least one farm.
   */
  @Get('cantons')
  getCantons(): Promise<string[]> {
    return this.farmsService.getCantons();
  }

  /**
   * GET /farms/nearby?lat=46.95&lng=7.44&radius=25&locale=de
   * Returns farms within `radius` km (default 25) sorted by distance.
   * Response items include a `distance` field (km, 1 decimal).
   * Products are translated based on `locale` (default: en).
   */
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

  /**
   * GET /farms/search?q=zurich&locale=de
   * Full-text search across name, address and canton (case-insensitive).
   * Products are translated based on `locale` (default: en).
   */
  @Get('search')
  search(
    @Query('q') q: string,
    @Query('locale') locale?: string,
  ): Promise<Farm[]> {
    return this.farmsService.search(q ?? '', (locale as Locale) ?? 'en');
  }

  // ── CRUD ──────────────────────────────────────────────────────────────────

  /**
   * GET /farms?type=milk&locale=de
   * Products are translated based on `locale` (default: en).
   */
  @Get()
  findAll(
    @Query('type') type?: FarmType,
    @Query('locale') locale?: string,
  ): Promise<Farm[]> {
    return this.farmsService.findAll(type, (locale as Locale) ?? 'en');
  }

  /**
   * GET /farms/:id?locale=de
   * Products are translated based on `locale` (default: en).
   */
  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Query('locale') locale?: string,
  ): Promise<Farm> {
    return this.farmsService.findOne(id, (locale as Locale) ?? 'en');
  }

  /**
   * DELETE /farms/:farmId/products/:productId?locale=de
   * Remove a single product from a farm.
   */
  @Delete(':farmId/products/:productId')
  @HttpCode(200)
  removeProductFromFarm(
    @Param('farmId') farmId: string,
    @Param('productId') productId: string,
    @Query('locale') locale?: string,
  ): Promise<Farm> {
    return this.farmsService.removeProductFromFarm(farmId, productId, (locale as Locale) ?? 'en');
  }

  @Post()
  create(@Body() dto: CreateFarmDto): Promise<Farm> {
    return this.farmsService.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateFarmDto,
    @Query('locale') locale?: string,
  ): Promise<Farm> {
    return this.farmsService.update(id, dto, (locale as Locale) ?? 'en');
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string): Promise<void> {
    return this.farmsService.remove(id);
  }
}