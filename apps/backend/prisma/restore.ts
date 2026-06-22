import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load .env file
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

  const backupPath = path.resolve(process.cwd(), '..', '..', 'backups', 'swissfarm_20260622_0020.json');
  const data = JSON.parse(fs.readFileSync(backupPath, 'utf-8'));

  // Restore admins
  for (const admin of data.admins) {
    await prisma.admin.upsert({
      where: { email: admin.email },
      update: {},
      create: {
        id: admin.id,
        email: admin.email,
        password: admin.password,
        role: admin.role,
        createdAt: new Date(admin.createdAt),
        updatedAt: new Date(admin.updatedAt),
      },
    });
  }
  console.log(`✅ Restored ${data.admins.length} admins`);

  // Restore products
  for (const product of data.products) {
    await prisma.product.upsert({
      where: { id: product.id },
      update: {},
      create: product,
    });
  }
  console.log(`✅ Restored ${data.products.length} products`);

  // Restore opening hours
  for (const oh of data.openingHours) {
    await prisma.openingHour.upsert({
      where: { id: oh.id },
      update: {},
      create: oh,
    });
  }
  console.log(`✅ Restored ${data.openingHours.length} opening hours`);

  // Restore activities
  for (const activity of data.activities) {
    await prisma.activity.upsert({
      where: { id: activity.id },
      update: {},
      create: activity,
    });
  }
  console.log(`✅ Restored ${data.activities.length} activities`);

  // Restore farms
  for (const farm of data.farms) {
    await prisma.farm.create({
      data: {
        id: farm.id,
        name: farm.name,
        lat: farm.lat,
        lng: farm.lng,
        address: farm.address,
        canton: farm.canton,
        phone: farm.phone,
        website: farm.website,
        isActive: farm.isActive,
        createdAt: new Date(farm.createdAt),
        updatedAt: new Date(farm.updatedAt),
      },
    });
  }
  console.log(`✅ Restored ${data.farms.length} farms`);

  // Restore relations
  for (const farm of data.farms) {
    for (const type of farm.types) {
      await prisma.farmType.create({ data: { farmId: farm.id, type: type.type } }).catch(() => {});
    }
    for (const fp of farm.products) {
      await prisma.farmProduct.create({ data: { farmId: farm.id, productId: fp.productId } }).catch(() => {});
    }
    for (const oh of farm.openingHours) {
      await prisma.farmOpeningHour.create({ data: { farmId: farm.id, openingHourId: oh.openingHourId } }).catch(() => {});
    }
    for (const pm of farm.paymentMethods) {
      const paymentMethod = await prisma.paymentMethod.findUnique({ where: { name: pm.paymentMethod } }).catch(() => null);
      if (paymentMethod) {
        await prisma.farmPaymentMethod.create({ data: { farmId: farm.id, paymentMethodId: paymentMethod.id } }).catch(() => {});
      }
    }
    if (farm.activities) {
      for (const fa of farm.activities) {
        await prisma.farmActivity.create({ data: { farmId: farm.id, activityId: fa.activityId } }).catch(() => {});
      }
    }
  }
  console.log(`✅ Restored all relations`);

  console.log('\n🎉 Database fully restored from backup!');
  await prisma.$disconnect();
}

main()
  .catch((e) => {
    console.error('Restore failed:', e);
    process.exit(1);
  });