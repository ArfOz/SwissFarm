import { defineConfig } from 'prisma/config';
import { config } from 'dotenv';

// Load .env from the directory where prisma.config.ts is located
config({ path: 'apps/backend/.env' });

export default defineConfig({
  schema: 'apps/backend/prisma/schema.prisma',
  migrations: {
    path: 'apps/backend/prisma/migrations',
  },
  datasource: {
    url: process.env.DATABASE_URL!,
  },
});
