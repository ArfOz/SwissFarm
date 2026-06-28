import { Injectable, NotFoundException } from '@nestjs/common';
import { Farm, FarmType, FARM_TYPES, OpeningHourEntry, PaymentMethod } from '@swissfarm/types';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFarmDto, UpdateFarmDto } from '@swissfarm/dto';
import { productTranslations, Locale } from '../i18n/translations';
import { Prisma } from '@prisma/client';

export interface FarmWithDistance extends Farm {
  distance: number;
}

export interface MapMarkerLight {
  id: string;
  name: string;
  location: { lat: number; lng: number };
  canton: string;
  types: string[];
}

/** Lightweight marker returned by the /farms/map endpoint (with bbox filter) */
export interface MapFarmMarker {
  id: string;
  name: string;
  lat: number;
  lng: number;
  canton: string;
  types: string[];
}

export interface BBoxQuery {
  southWestLat: number;
  southWestLng: number;
  northEastLat: number;
  northEastLng: number;
}

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

function translateProductName(name: string, locale: Locale): string {
  const key = name.toLowerCase();
  const translations = productTranslations[key];
  if (translations && translations[locale]) {
    return translations[locale];
  }
  return name;
}

function toFarm(row: any, locale: Locale = 'en'): Farm {
  const openingHours: OpeningHourEntry[] = (row.openingHours ?? []).map((oh: any) => ({
    day: oh.openingHour.day,
    open: oh.openingHour.open,
    close: oh.openingHour.close,
  }));

  return {
    id: row.id,
    name: row.name,
    types: (row.types?.map((t: any) => t.type) as FarmType[]) ?? [],
    products: (row.products ?? []).map((fp: any) => ({
      id: fp.product.id,
      name: translateProductName(fp.product.name, locale),
    })),
    location: { lat: row.lat, lng: row.lng },
    address: row.address,
    canton: row.canton,
    phone: row.phone ?? undefined,
    website: row.website ?? undefined,
    isActive: row.isActive,
    paymentMethods:
      (row.paymentMethods?.map((pm: any) => pm.paymentMethod.name) as PaymentMethod[]) ?? [],
    openingHours,
  };
}

const INCLUDE = {
  types: true,
  paymentMethods: { include: { paymentMethod: true } },
  openingHours: { include: { openingHour: true } },
  products: { select: { product: { select: { id: true, name: true } } } },
} as const;

const MAP_SELECT = {
  id: true,
  name: true,
  lat: true,
  lng: true,
  canton: true,
  types: { select: { type: true } },
} as const;

async function upsertOpeningHour(
  prisma: PrismaService,
  farmId: string,
  entry: { day: string; open: string | null; close: string | null },
) {
  let oh = await prisma.openingHour.findFirst({
    where: { day: entry.day as never, open: entry.open, close: entry.close },
  });

  if (!oh) {
    oh = await prisma.openingHour.create({
      data: { day: entry.day as never, open: entry.open, close: entry.close },
    });
  }

  await prisma.farmOpeningHour.upsert({
    where: { farmId_openingHourId: { farmId, openingHourId: oh.id } },
    update: {},
    create: { farmId, openingHourId: oh.id },
  });
}

function mapToMarkerLight(row: {
  id: string;
  name: string;
  lat: number;
  lng: number;
  canton: string;
  types: { type: string }[];
}): MapMarkerLight {
  return {
    id: row.id,
    name: row.name,
    location: { lat: row.lat, lng: row.lng },
    canton: row.canton,
    types: row.types.map((t) => t.type) as FarmType[],
  };
}

@Injectable()
export class FarmsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllForMap(): Promise<MapMarkerLight[]> {
    const rows = await this.prisma.farm.findMany({
      where: { isActive: true },
      select: MAP_SELECT,
      orderBy: { name: 'asc' },
    });
    return rows.map(mapToMarkerLight);
  }

async findByBBox(bbox: BBoxQuery): Promise<MapMarkerLight[]> {
  let { southWestLat, southWestLng, northEastLat, northEastLng } = bbox;

  // 🔥 Minimum BBOX genişliği (zoom-in sonrası boş gelmeyi engeller)
  const MIN_SPAN = 0.02; // ~2 km

  const latSpan = northEastLat - southWestLat;
  const lngSpan = northEastLng - southWestLng;

  if (latSpan < MIN_SPAN) {
    const pad = (MIN_SPAN - latSpan) / 2;
    southWestLat -= pad;
    northEastLat += pad;
  }

  if (lngSpan < MIN_SPAN) {
    const pad = (MIN_SPAN - lngSpan) / 2;
    southWestLng -= pad;
    northEastLng += pad;
  }

  const rows = await this.prisma.farm.findMany({
    where: {
      isActive: true,
      lat: { gte: southWestLat, lte: northEastLat },
      lng: { gte: southWestLng, lte: northEastLng },
      NOT: { lat: 0, lng: 0 },
    },
    select: MAP_SELECT,
    orderBy: { name: 'asc' },
  });

  return rows.map(mapToMarkerLight);
}


  async findForMap(minLat: number, maxLat: number, minLng: number, maxLng: number): Promise<MapFarmMarker[]> {
    const rows = await this.prisma.farm.findMany({
      where: {
        isActive: true,
        lat: { gte: minLat, lte: maxLat },
        lng: { gte: minLng, lte: maxLng },
        NOT: { lat: 0, lng: 0 },
      },
      select: {
        id: true,
        name: true,
        lat: true,
        lng: true,
        canton: true,
        types: { select: { type: true } },
      },
      take: 500,
      orderBy: { name: 'asc' },
    });
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      lat: row.lat,
      lng: row.lng,
      canton: row.canton,
      types: row.types.map((t) => t.type),
    }));
  }

  async findByBoundingBox(
    minLat: number,
    maxLat: number,
    minLng: number,
    maxLng: number,
    locale: Locale = 'en',
  ): Promise<Farm[]> {
    const rows = await this.prisma.farm.findMany({
      where: {
        isActive: true,
        lat: { gte: minLat, lte: maxLat },
        lng: { gte: minLng, lte: maxLng },
        NOT: { lat: 0, lng: 0 },
      },
      include: INCLUDE,
      orderBy: { name: 'asc' },
    });
    return rows.map((row) => toFarm(row, locale));
  }

  async findAll(
    types?: FarmType[],
    locale: Locale = 'en',
    filters?: {
      brokenLocation?: boolean;
      productIds?: string[];
      productNames?: string[];
    },
  ): Promise<Farm[]> {
    const where: Prisma.FarmWhereInput = {};

    if (types && types.length > 0) {
      where.types = { some: { type: { in: types } } };
    }
    if (filters?.brokenLocation) {
      where.lat = 0;
      where.lng = 0;
    }
    if (filters?.productIds && filters.productIds.length > 0) {
      where.products = { some: { productId: { in: filters.productIds } } };
    }
    if (filters?.productNames && filters.productNames.length > 0) {
      where.products = { some: { product: { name: { in: filters.productNames } } } };
    }

    const rows = await this.prisma.farm.findMany({
      where,
      orderBy: { createdAt: 'asc' },
      include: INCLUDE,
    });
    return rows.map((row) => toFarm(row, locale));
  }

  async findOne(id: string, locale: Locale = 'en'): Promise<Farm> {
    const row = await this.prisma.farm.findUnique({
      where: { id },
      include: INCLUDE,
    });
    if (!row) throw new NotFoundException(`Farm with id "${id}" not found`);
    return toFarm(row, locale);
  }

  async create(dto: CreateFarmDto): Promise<Farm> {
    const row = await this.prisma.farm.create({
      data: {
        name: dto.name,
        lat: dto.location.lat,
        lng: dto.location.lng,
        address: dto.address,
        canton: dto.canton,
        phone: dto.phone || null,
        website: dto.website || null,
        types: { create: (dto.types ?? []).map((type) => ({ type })) },
        paymentMethods: {
          create: (dto.paymentMethods ?? []).map((name) => ({
            paymentMethod: { connect: { name } },
          })),
        },
        products: {
          create: dto.products.map((name) => ({
            product: { connectOrCreate: { where: { name }, create: { name } } },
          })),
        },
      },
      include: INCLUDE,
    });

    if (dto.openingHours && dto.openingHours.length > 0) {
      for (const entry of dto.openingHours) {
        await upsertOpeningHour(this.prisma, row.id, entry);
      }
    }
    return this.findOne(row.id);
  }

  async update(id: string, dto: UpdateFarmDto, locale: Locale = 'en'): Promise<Farm> {
    await this.findOne(id);

    let productUpdate = {};
    if (dto.products !== undefined) {
      await this.prisma.farmProduct.deleteMany({ where: { farmId: id } });
      productUpdate = {
        create: dto.products.map((name) => ({
          product: { connectOrCreate: { where: { name }, create: { name } } },
        })),
      };
    }

    if (dto.types !== undefined) {
      await this.prisma.farmType.deleteMany({ where: { farmId: id } });
      await this.prisma.farmType.createMany({
        data: dto.types.map((type) => ({ farmId: id, type })),
      });
    }

    if (dto.openingHours !== undefined) {
      await this.prisma.farmOpeningHour.deleteMany({ where: { farmId: id } });
      for (const entry of dto.openingHours) {
        await upsertOpeningHour(this.prisma, id, entry);
      }
    }

    if (dto.paymentMethods !== undefined) {
      await this.prisma.farmPaymentMethod.deleteMany({ where: { farmId: id } });
      for (const name of dto.paymentMethods) {
        const pm = await this.prisma.paymentMethod.findUnique({ where: { name } });
        if (pm) {
          await this.prisma.farmPaymentMethod.create({
            data: { farmId: id, paymentMethodId: pm.id },
          });
        }
      }
    }

    const row = await this.prisma.farm.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.location !== undefined && { lat: dto.location.lat, lng: dto.location.lng }),
        ...(dto.address !== undefined && { address: dto.address }),
        ...(dto.canton !== undefined && { canton: dto.canton }),
        ...(dto.phone !== undefined && { phone: dto.phone || null }),
        ...(dto.website !== undefined && { website: dto.website || null }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        ...(Object.keys(productUpdate).length > 0 && { products: productUpdate }),
      },
      include: INCLUDE,
    });
    return toFarm(row, locale);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.prisma.farm.delete({ where: { id } });
  }

  async findNearby(lat: number, lng: number, radius = 25, locale: Locale = 'en'): Promise<FarmWithDistance[]> {
    const rows = await this.prisma.farm.findMany({
      orderBy: { createdAt: 'asc' },
      include: INCLUDE,
    });
    return rows
      .map((row) => ({
        ...toFarm(row, locale),
        distance: Math.round(haversineKm(lat, lng, row.lat, row.lng) * 10) / 10,
      }))
      .filter((f) => f.distance <= radius)
      .sort((a, b) => a.distance - b.distance);
  }

  async search(query: string, locale: Locale = 'en'): Promise<Farm[]> {
    const q = query.trim().toLowerCase();
    if (!q) return this.findAll(undefined, locale);
    const rows = await this.prisma.farm.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { address: { contains: q, mode: 'insensitive' } },
          { canton: { contains: q, mode: 'insensitive' } },
        ],
      },
      orderBy: { name: 'asc' },
      include: INCLUDE,
    });
    return rows.map((row) => toFarm(row, locale));
  }

  getTypes(): FarmType[] {
    return FARM_TYPES;
  }

  async getCantons(): Promise<string[]> {
    const rows = await this.prisma.farm.findMany({
      select: { canton: true },
      distinct: ['canton'],
      orderBy: { canton: 'asc' },
    });
    return rows.map((r) => r.canton);
  }

  async removeProductFromFarm(farmId: string, productId: string, locale: Locale = 'en'): Promise<Farm> {
    await this.findOne(farmId);
    await this.prisma.farmProduct.delete({
      where: { farmId_productId: { farmId, productId } },
    });
    return this.findOne(farmId, locale);
  }

  async findAllProducts(locale: Locale = 'en'): Promise<{ id: string; name: string }[]> {
    const products = await this.prisma.product.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });
    return products.map((p) => ({
      id: p.id,
      name: translateProductName(p.name, locale),
    }));
  }
}