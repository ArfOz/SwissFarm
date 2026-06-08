import { Injectable, NotFoundException } from '@nestjs/common';
import { Farm, FarmType } from '@swissfarm/types';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFarmDto } from './dto/create-farm.dto';
import { UpdateFarmDto } from './dto/update-farm.dto';

// Map Prisma DB enum values → shared FarmType
function toFarm(row: {
  id: string;
  name: string;
  type: string;
  products: string[];
  lat: number;
  lng: number;
  address: string;
  canton: string;
  website: string | null;
  openingHours: string | null;
}): Farm {
  return {
    id: row.id,
    name: row.name,
    type: row.type as FarmType,
    products: row.products,
    location: { lat: row.lat, lng: row.lng },
    address: row.address,
    canton: row.canton,
    website: row.website ?? undefined,
    openingHours: row.openingHours ?? undefined,
  };
}

@Injectable()
export class FarmsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(type?: FarmType): Promise<Farm[]> {
    const rows = await this.prisma.farm.findMany({
      where: type ? { type: type as never } : undefined,
      orderBy: { createdAt: 'asc' },
    });
    return rows.map(toFarm);
  }

  async findOne(id: string): Promise<Farm> {
    const row = await this.prisma.farm.findUnique({ where: { id } });
    if (!row) throw new NotFoundException(`Farm with id "${id}" not found`);
    return toFarm(row);
  }

  async create(dto: CreateFarmDto): Promise<Farm> {
    const row = await this.prisma.farm.create({
      data: {
        name: dto.name,
        type: dto.type as never,
        products: dto.products,
        lat: dto.location.lat,
        lng: dto.location.lng,
        address: dto.address,
        canton: dto.canton,
        website: dto.website || null,
        openingHours: dto.openingHours || null,
      },
    });
    return toFarm(row);
  }

  async update(id: string, dto: UpdateFarmDto): Promise<Farm> {
    await this.findOne(id);
    const row = await this.prisma.farm.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.type !== undefined && { type: dto.type as never }),
        ...(dto.products !== undefined && { products: dto.products }),
        ...(dto.location !== undefined && {
          lat: dto.location.lat,
          lng: dto.location.lng,
        }),
        ...(dto.address !== undefined && { address: dto.address }),
        ...(dto.canton !== undefined && { canton: dto.canton }),
        ...(dto.website !== undefined && { website: dto.website || null }),
        ...(dto.openingHours !== undefined && { openingHours: dto.openingHours || null }),
      },
    });
    return toFarm(row);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.prisma.farm.delete({ where: { id } });
  }
}

