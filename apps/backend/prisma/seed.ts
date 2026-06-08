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

  await prisma.farm.deleteMany();

  await prisma.farm.createMany({
    data: [
      {
        name: 'Hofmatt Bio Bauernhof',
        type: 'milk',
        products: ['milk', 'cheese', 'butter', 'yogurt'],
        lat: 47.3769,
        lng: 8.5417,
        address: 'Hofmattstrasse 12, 8001 Zürich',
        canton: 'ZH',
        website: 'https://hofmatt.ch',
        openingHours: 'Mon–Fri 07:00–18:00, Sat 07:00–16:00',
      },
      {
        name: 'Berghof Selbstbedienung',
        type: 'self_service',
        products: ['eggs', 'vegetables', 'honey', 'jam'],
        lat: 47.0502,
        lng: 8.3093,
        address: 'Bergstrasse 45, 6003 Luzern',
        canton: 'LU',
        openingHours: '24/7 self-service',
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
        openingHours: 'Jul–Oct: Daily 09:00–17:00',
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
        openingHours: 'Tue–Sun 10:00–17:00',
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
        openingHours: 'May–Oct: Daily 09:00–17:00',
      },
    ],
  });

  const count = await prisma.farm.count();
  console.log(`✅ Seeded ${count} farms.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
