import { Injectable, NotFoundException } from '@nestjs/common';
import { Farm, FarmType, FARM_TYPES } from '@swissfarm/types';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFarmDto } from './dto/create-farm.dto';
import { UpdateFarmDto } from './dto/update-farm.dto';

export interface FarmWithDistance extends Farm {
  distance: number; // km
}

/** Haversine distance in km between two lat/lng points */
function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

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

  /** GET /farms/nearby — farms within `radius` km of the given coordinates */
  async findNearby(lat: number, lng: number, radius = 25): Promise<FarmWithDistance[]> {
    const rows = await this.prisma.farm.findMany({ orderBy: { createdAt: 'asc' } });
    return rows
      .map((row) => ({
        ...toFarm(row),
        distance: Math.round(haversineKm(lat, lng, row.lat, row.lng) * 10) / 10,
      }))
      .filter((f) => f.distance <= radius)
      .sort((a, b) => a.distance - b.distance);
  }

  /** GET /farms/search — full-text search on name and address */
  async search(query: string): Promise<Farm[]> {
    const q = query.trim().toLowerCase();
    if (!q) return this.findAll();
    const rows = await this.prisma.farm.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { address: { contains: q, mode: 'insensitive' } },
          { canton: { contains: q, mode: 'insensitive' } },
        ],
      },
      orderBy: { name: 'asc' },
    });
    return rows.map(toFarm);
  }

  /** GET /farms/types — list all available farm types */
  getTypes(): FarmType[] {
    return FARM_TYPES;
  }

  /** GET /farms/cantons — list distinct cantons present in the DB */
  async getCantons(): Promise<string[]> {
    const rows = await this.prisma.farm.findMany({
      select: { canton: true },
      distinct: ['canton'],
      orderBy: { canton: 'asc' },
    });
    return rows.map((r) => r.canton);
  }
}

