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
import { AdminOnly } from '../libs/decorators/admin-only.decorator';
import { CreateFarmDto, UpdateFarmDto } from '@swissfarm/dto';
import { FarmsService } from './farms.service';

@Controller('admin/farms')
export class FarmsAdminController {
  constructor(private readonly farmsService: FarmsService) {}

  @AdminOnly()
  @Get('types')
  getTypes(): FarmType[] {
    return this.farmsService.getTypes();
  }

  @AdminOnly()
  @Get('products')
  getProducts(@Query('locale') locale?: string): Promise<{ id: string; name: string }[]> {
    return this.farmsService.findAllProducts((locale as Locale) ?? 'en');
  }

  @AdminOnly()
  @Get('cantons')
  getCantons(): Promise<string[]> {
    return this.farmsService.getCantons();
  }

  @AdminOnly()
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

  @AdminOnly()
  @HttpCode(200)
  @Post('filter')
  filter(
    @Body()
    filterDto: {
      types?: FarmType[];
      brokenLocation?: boolean;
      productIds?: string[];
      productNames?: string[];
    },
    @Query('locale') locale?: string,
  ): Promise<Farm[]> {
    return this.farmsService.findAll(filterDto.types, (locale as Locale) ?? 'en', {
      brokenLocation: filterDto.brokenLocation,
      productIds: filterDto.productIds,
      productNames: filterDto.productNames,
    });
  }

  @AdminOnly()
  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Query('locale') locale?: string,
  ): Promise<Farm> {
    return this.farmsService.findOne(id, (locale as Locale) ?? 'en');
  }

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