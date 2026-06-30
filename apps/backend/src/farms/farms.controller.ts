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
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Farm, FarmType } from '@swissfarm/types';
import { Locale } from '@swissfarm/types';
import { Public } from '../libs/decorators/public.decorator';
import { AdminOnly } from '../libs/decorators/admin-only.decorator';
import { CreateFarmDto, UpdateFarmDto, CreateProductDto, UpdateProductDto } from '@swissfarm/dto';
import { MapQueryDto } from './dto';
import { FarmsService, FarmWithDistance, MapFarmMarker } from './farms.service';

@Controller('farms')
export class FarmsController {
  constructor(private readonly farmsService: FarmsService) {}

  // ── PUBLIC Static routes (must precede :id) ──────────────────────────────

  @Public()
  @Get('map')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  findAllForMap(@Query() query: MapQueryDto): Promise<MapFarmMarker[]> {
    return this.farmsService.findForMap(
      parseFloat(query.minLat),
      parseFloat(query.maxLat),
      parseFloat(query.minLng),
      parseFloat(query.maxLng),
    );
  }

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
  @Get('bbox')
  findByBoundingBox(
    @Query('minLat') minLat: string,
    @Query('maxLat') maxLat: string,
    @Query('minLng') minLng: string,
    @Query('maxLng') maxLng: string,
    @Query('locale') locale?: string,
  ) {
    return this.farmsService.findByBoundingBox(
      parseFloat(minLat),
      parseFloat(maxLat),
      parseFloat(minLng),
      parseFloat(maxLng),
      (locale as Locale) ?? 'en',
    );
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
    @Query('types') types?: string,
    @Query('locale') locale?: string,
  ): Promise<Farm[]> {
    const parsedTypes = types
      ? (types.split(',').map((t) => t.trim()) as FarmType[])
      : undefined;
    return this.farmsService.findAll(parsedTypes, (locale as Locale) ?? 'en');
  }

  @Public()
  @HttpCode(200)
  @Post('filter')
  filter(
    @Body()
    filterDto: {
      types?: FarmType[];
      brokenLocation?: boolean;
      productIds?: string[];
      productNames?: string[];
      categoryIds?: string[];
    },
    @Query('locale') locale?: string,
  ): Promise<Farm[]> {
    return this.farmsService.findAll(filterDto.types, (locale as Locale) ?? 'en', {
      brokenLocation: filterDto.brokenLocation,
      productIds: filterDto.productIds,
      productNames: filterDto.productNames,
      categoryIds: filterDto.categoryIds,
    });
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
