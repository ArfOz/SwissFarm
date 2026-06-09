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
   * GET /farms/cantons
   * Returns distinct cantons that have at least one farm.
   */
  @Get('cantons')
  getCantons(): Promise<string[]> {
    return this.farmsService.getCantons();
  }

  /**
   * GET /farms/nearby?lat=46.95&lng=7.44&radius=25
   * Returns farms within `radius` km (default 25) sorted by distance.
   * Response items include a `distance` field (km, 1 decimal).
   */
  @Get('nearby')
  findNearby(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('radius') radius?: string,
  ): Promise<FarmWithDistance[]> {
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    if (isNaN(latNum) || isNaN(lngNum)) {
      throw new BadRequestException('lat and lng query params are required and must be numbers');
    }
    const radiusNum = radius ? parseFloat(radius) : 25;
    return this.farmsService.findNearby(latNum, lngNum, radiusNum);
  }

  /**
   * GET /farms/search?q=zurich
   * Full-text search across name, address and canton (case-insensitive).
   */
  @Get('search')
  search(@Query('q') q: string): Promise<Farm[]> {
    return this.farmsService.search(q ?? '');
  }

  // ── CRUD ──────────────────────────────────────────────────────────────────

  @Get()
  findAll(@Query('type') type?: FarmType): Promise<Farm[]> {
    return this.farmsService.findAll(type);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Farm> {
    return this.farmsService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateFarmDto): Promise<Farm> {
    return this.farmsService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateFarmDto): Promise<Farm> {
    return this.farmsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string): Promise<void> {
    return this.farmsService.remove(id);
  }
}
