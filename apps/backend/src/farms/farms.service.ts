import { Injectable, NotFoundException } from '@nestjs/common';
import { Farm, FarmType, FARM_TYPES, OpeningHourEntry, PaymentMethod } from '@swissfarm/types';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFarmDto, UpdateFarmDto } from '@swissfarm/dto';
import { productTranslations, Locale } from '../i18n/translations';
import { PaymentMethod as PrismaPaymentMethod } from '@prisma/client';
import { Prisma } from '@prisma/client';

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

/** Translate a single product name based on locale */
function translateProductName(name: string, locale: Locale): string {
  const key = name.toLowerCase();
  const translations = productTranslations[key];
  if (translations && translations[locale]) {
    return translations[locale];
  }
  return name; // fallback to original name
}

// Type for Prisma row with included relations
type FarmRow = {
  id: string;
  name: string;
  types: { type: string }[];
  lat: number;
  lng: number;
  address: string;
  canton: string;
  phone?: string | null;
  website: string | null;
  isActive: boolean;
  paymentMethods: { paymentMethod: PrismaPaymentMethod }[];
  openingHours: { openingHour: { id: string; day: string; open: string | null; close: string | null } }[];
  products: { product: { id: string; name: string } }[];
};

// Map Prisma DB row → shared Farm type
function toFarm(row: any, locale: Locale = 'en'): Farm {
  const openingHours: OpeningHourEntry[] = row.openingHours.map((oh: any) => ({
    day: oh.openingHour.day,
    open: oh.openingHour.open,
    close: oh.openingHour.close,
  }));

  return {
    id: row.id,
    name: row.name,
    types: (row.types?.map((t: any) => t.type) as FarmType[]) ?? [],
    products: row.products.map((fp: any) => ({
      id: fp.product.id,
      name: translateProductName(fp.product.name, locale),
    })),
    location: { lat: row.lat, lng: row.lng },
    address: row.address,
    canton: row.canton,
    phone: row.phone ?? undefined,
    website: row.website ?? undefined,
    isActive: row.isActive,
    paymentMethods: (row.paymentMethods?.map((pm: any) => pm.paymentMethod) as PaymentMethod[]) ?? [],
    openingHours,
  };
}

/** Build the Prisma include needed for all queries */
const INCLUDE = {
  types: true,
  paymentMethods: true,
  openingHours: { include: { openingHour: true } },
  products: { select: { product: { select: { id: true, name: true } } } },
} as const;

/**
 * Find or create an OpeningHour record, then connect it to the farm.
 */
async function upsertOpeningHour(
  prisma: PrismaService,
  farmId: string,
  entry: { day: string; open: string | null; close: string | null },
) {
  // Look for an existing OpeningHour with the same values
  let oh = await prisma.openingHour.findFirst({
    where: {
      day: entry.day as never,
      open: entry.open,
      close: entry.close,
    },
  });

  if (!oh) {
    oh = await prisma.openingHour.create({
      data: {
        day: entry.day as never,
        open: entry.open,
        close: entry.close,
      },
    });
  }

  await prisma.farmOpeningHour.upsert({
    where: {
      farmId_openingHourId: { farmId, openingHourId: oh.id },
    },
    update: {},
    create: { farmId, openingHourId: oh.id },
  });
}

@Injectable()
export class FarmsService {
  constructor(private readonly prisma: PrismaService) {}

        async findAll(types?: FarmType[], locale: Locale = 'en'): Promise<Farm[]> {
    const where: Prisma.FarmWhereInput = {};
    if (types && types.length > 0) {
      where.types = {
        some: {
          type: { in: types },
        },
      };
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
        types: {
          create: (dto.types ?? []).map((type) => ({
            type,
          })),
        },
        paymentMethods: {
          create: (dto.paymentMethods ?? []).map((method) => ({
            paymentMethod: method as PrismaPaymentMethod,
          })),
        },
        products: {
          create: dto.products.map((name) => ({
            product: {
              connectOrCreate: {
                where: { name },
                create: { name },
              },
            },
          })),
        },
      },
      include: INCLUDE,
    });

    // Upsert opening hours separately
    if (dto.openingHours && dto.openingHours.length > 0) {
      for (const entry of dto.openingHours) {
        await upsertOpeningHour(this.prisma, row.id, entry);
      }
    }

    // Re-fetch to include openingHours
    return this.findOne(row.id);
  }

    async update(id: string, dto: UpdateFarmDto, locale: Locale = 'en'): Promise<Farm> {
    await this.findOne(id);

    // If products are being updated, replace the entire set
    let productUpdate = {};
    if (dto.products !== undefined) {
      await this.prisma.farmProduct.deleteMany({ where: { farmId: id } });
      productUpdate = {
        create: dto.products.map((name) => ({
          product: {
            connectOrCreate: {
              where: { name },
              create: { name },
            },
          },
        })),
      };
    }

    // If types are being updated, replace the entire set
    if (dto.types !== undefined) {
      await this.prisma.farmType.deleteMany({ where: { farmId: id } });
      await this.prisma.farmType.createMany({
        data: dto.types.map((type) => ({
          farmId: id,
          type,
        })),
      });
    }

    // If openingHours are being updated, replace the entire set
    if (dto.openingHours !== undefined) {
      await this.prisma.farmOpeningHour.deleteMany({ where: { farmId: id } });
      for (const entry of dto.openingHours) {
        await upsertOpeningHour(this.prisma, id, entry);
      }
    }

    // If paymentMethods are being updated, replace the entire set
    if (dto.paymentMethods !== undefined) {
      await this.prisma.farmPaymentMethod.deleteMany({ where: { farmId: id } });
      await this.prisma.farmPaymentMethod.createMany({
        data: dto.paymentMethods.map((method) => ({
          farmId: id,
          paymentMethod: method as PrismaPaymentMethod,
        })),
      });
    }

    const row = await this.prisma.farm.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.location !== undefined && {
          lat: dto.location.lat,
          lng: dto.location.lng,
        }),
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

        /** GET /farms/nearby — farms within `radius` km of the given coordinates */
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

        /** GET /farms/search — full-text search on name and address */
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

  /** DELETE /farms/:farmId/products/:productId — remove a product from a farm */
  async removeProductFromFarm(farmId: string, productId: string, locale: Locale = 'en'): Promise<Farm> {
    // Verify farm exists
    await this.findOne(farmId);

    // Delete the junction record
    await this.prisma.farmProduct.delete({
      where: {
        farmId_productId: { farmId, productId },
      },
    });

    return this.findOne(farmId, locale);
  }

  /** GET /products — list all available products */
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