import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

const PAYMENT_METHODS = [
  'Cash',
  'Invoice',
  'TWINT',
  'Vouchers',
  'Credit card',
  'Debit card',
];

async function main() {
  // Create default admin
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.admin.upsert({
    where: { email: 'admin@swissfarm.ch' },
    update: {},
    create: {
      email: 'admin@swissfarm.ch',
      password: hashedPassword,
      role: 'admin',
    },
  });

  console.log('✅ Default admin created:', admin.email, '/ admin123');

  // Seed payment methods
  for (const name of PAYMENT_METHODS) {
    await prisma.paymentMethod.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log(`✅ Seeded ${PAYMENT_METHODS.length} payment methods: ${PAYMENT_METHODS.join(', ')}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });