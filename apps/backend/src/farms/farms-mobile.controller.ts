import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Query,
  HttpCode,
  Post,
  Body,
  Logger,
} from '@nestjs/common';
import { Farm, FarmType, FarmWithDistance } from '@swissfarm/types';
import { Locale } from '../i18n/translations';
import { Public } from '../libs/decorators/public.decorator';
import { FarmsService, MapMarkerLight, BBoxQuery } from './farms.service';

@Controller('mobile/farms')
export class FarmsMobileController {
  private readonly logger = new Logger(FarmsMobileController.name);

  constructor(private readonly farmsService: FarmsService) {}

  /** Lightweight list — only map markers (id, name, lat, lng, canton, types) */
  @Public()
  @Get('map')
  findAllForMap(
    @Query('categoryIds') categoryIds?: string,
  ): Promise<MapMarkerLight[]> {
    const parsed = categoryIds ? categoryIds.split(',').map((c) => c.trim()).filter(Boolean) : undefined;
    return this.farmsService.findAllForMap(parsed);
  }

  /**
   * BBOX query — returns only farms inside the given bounding box.
   * Static routes MUST come before :id to avoid route collision.
   */
  @Public()
  @Get('bbox')
  findByBBox(
    @Query('southWestLat') southWestLat: string,
    @Query('southWestLng') southWestLng: string,
    @Query('northEastLat') northEastLat: string,
    @Query('northEastLng') northEastLng: string,
    @Query('categoryIds') categoryIds?: string,
    @Query('productIds') productIds?: string,
  ): Promise<MapMarkerLight[]> {
    const swLat = parseFloat(southWestLat);
    const swLng = parseFloat(southWestLng);
    const neLat = parseFloat(northEastLat);
    const neLng = parseFloat(northEastLng);

    if (isNaN(swLat) || isNaN(swLng) || isNaN(neLat) || isNaN(neLng)) {
      throw new BadRequestException(
        'southWestLat, southWestLng, northEastLat, northEastLng query params are required and must be numbers',
      );
    }

    const bbox: BBoxQuery = {
      southWestLat: swLat,
      southWestLng: swLng,
      northEastLat: neLat,
      northEastLng: neLng,
    };

    this.logger.log(`BBOX query: ${JSON.stringify(bbox)}`);
    const parsedCategories = categoryIds ? categoryIds.split(',').map((c) => c.trim()).filter(Boolean) : undefined;
    const parsedProducts = productIds ? productIds.split(',').map((p) => p.trim()).filter(Boolean) : undefined;
    return this.farmsService.findByBBox(bbox, parsedCategories, parsedProducts);
  }

  @Public()
  @Get('search')
  search(
    @Query('q') q: string,
    @Query('locale') locale?: string,
  ): Promise<Farm[]> {
    return this.farmsService.search(q ?? '', (locale as Locale) ?? 'en');
  }

  /** All farms (full details) */
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

  /** Nearby farms (with distance calculation) */
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

  /** Get products by category */
  @Public()
  @Get('products/by-category/:categoryId')
  getProductsByCategory(@Param('categoryId') categoryId: string): Promise<{ id: string; name: string }[]> {
    return this.farmsService.findProductsByCategory(categoryId);
  }

  /** Filter (for mobile) */
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

  /** Single farm details — MUST BE LAST because :id catches everything */
  @Public()
  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Query('locale') locale?: string,
  ): Promise<Farm> {
    return this.farmsService.findOne(id, (locale as Locale) ?? 'en');
  }
}