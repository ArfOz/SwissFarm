import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

async function main() {
  console.log('Seeding database...');

    // Clean up in reverse dependency order
  await prisma.farmOpeningHour.deleteMany();
  await prisma.openingHour.deleteMany();
  await prisma.farmProduct.deleteMany();
  await prisma.farm.deleteMany();
  await prisma.product.deleteMany();

    // Seed data: each farm has an optional schedule mapping (day -> {open, close})
  // null means closed that day
  const farmData: {
    name: string;
    type: 'milk' | 'self_service' | 'pick_your_own' | 'kids';
    products: string[];
    lat: number;
    lng: number;
    address: string;
    canton: string;
    website?: string;
    schedule: Record<string, { open: string | null; close: string | null }>;
  }[] = [
    {
      name: 'Hofmatt Bio Bauernhof',
      type: 'milk',
      products: ['milk', 'cheese', 'butter', 'yogurt'],
      lat: 47.3769,
      lng: 8.5417,
      address: 'Hofmattstrasse 12, 8001 Zürich',
      canton: 'ZH',
      website: 'https://hofmatt.ch',
      schedule: {
        monday:    { open: '07:00', close: '18:00' },
        tuesday:   { open: '07:00', close: '18:00' },
        wednesday: { open: '07:00', close: '18:00' },
        thursday:  { open: '07:00', close: '18:00' },
        friday:    { open: '07:00', close: '18:00' },
        saturday:  { open: '07:00', close: '16:00' },
        sunday:    { open: null, close: null },
      },
    },
    {
      name: 'Berghof Selbstbedienung',
      type: 'self_service',
      products: ['eggs', 'vegetables', 'honey', 'jam'],
      lat: 47.0502,
      lng: 8.3093,
      address: 'Bergstrasse 45, 6003 Luzern',
      canton: 'LU',
      schedule: {
        monday:    { open: '00:00', close: '24:00' },
        tuesday:   { open: '00:00', close: '24:00' },
        wednesday: { open: '00:00', close: '24:00' },
        thursday:  { open: '00:00', close: '24:00' },
        friday:    { open: '00:00', close: '24:00' },
        saturday:  { open: '00:00', close: '24:00' },
        sunday:    { open: '00:00', close: '24:00' },
      },
    },
    {
      name: 'Obstgarten Müller',
      type: 'pick_your_own',
      products: ['apples', 'cherries', 'strawberries', 'pears'],
      lat: 47.5596,
      lng: 7.5886,
      address: 'Obstweg 8, 4001 Basel',
      canton: 'BS',
      website: 'https://obstgarten-mueller.ch',
      schedule: {
        monday:    { open: null, close: null },
        tuesday:   { open: null, close: null },
        wednesday: { open: null, close: null },
        thursday:  { open: null, close: null },
        friday:    { open: null, close: null },
        saturday:  { open: null, close: null },
        sunday:    { open: null, close: null },
      },
    },
    {
      name: 'Kinderbauernhof Sonnenschein',
      type: 'kids',
      products: ['educational tours', 'petting zoo', 'seasonal activities'],
      lat: 46.948,
      lng: 7.4474,
      address: 'Sonnenhang 3, 3001 Bern',
      canton: 'BE',
      website: 'https://kinderbauernhof-sonnenschein.ch',
      schedule: {
        monday:    { open: null, close: null },
        tuesday:   { open: '10:00', close: '17:00' },
        wednesday: { open: '10:00', close: '17:00' },
        thursday:  { open: '10:00', close: '17:00' },
        friday:    { open: '10:00', close: '17:00' },
        saturday:  { open: '10:00', close: '17:00' },
        sunday:    { open: '10:00', close: '17:00' },
      },
    },
    {
      name: 'Alpage Gruyères',
      type: 'milk',
      products: ['gruyère cheese', 'milk', 'cream', 'butter'],
      lat: 46.5858,
      lng: 7.0793,
      address: "Route de l'Alpage 1, 1663 Gruyères",
      canton: 'FR',
      website: 'https://alpage-gruyeres.ch',
      schedule: {
        monday:    { open: null, close: null },
        tuesday:   { open: null, close: null },
        wednesday: { open: null, close: null },
        thursday:  { open: null, close: null },
        friday:    { open: null, close: null },
        saturday:  { open: null, close: null },
        sunday:    { open: null, close: null },
      },
    },
  ];

  for (const f of farmData) {
    const farm = await prisma.farm.create({
      data: {
        name: f.name,
        type: f.type,
        lat: f.lat,
        lng: f.lng,
        address: f.address,
        canton: f.canton,
        website: f.website || null,
        products: {
          create: f.products.map((name) => ({
            product: {
              connectOrCreate: {
                where: { name },
                create: { name },
              },
            },
          })),
        },
      },
    });

    // Create opening hour entries for each day
    for (const [day, hrs] of Object.entries(f.schedule)) {
      const oh = await prisma.openingHour.create({
        data: { day: day as never, open: hrs.open, close: hrs.close },
      });
      await prisma.farmOpeningHour.create({
        data: { farmId: farm.id, openingHourId: oh.id },
      });
    }
  }

  const count = await prisma.farm.count();
  console.log(`✅ Seeded ${count} farms.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
