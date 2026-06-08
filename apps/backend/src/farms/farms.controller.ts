import {
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
import { FarmsService } from './farms.service';

@Controller('farms')
export class FarmsController {
  constructor(private readonly farmsService: FarmsService) {}

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
