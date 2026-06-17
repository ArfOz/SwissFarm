import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { FarmsModule } from './farms/farms.module';
import { ImportModule } from './import/import.module';
import { I18nModule } from './i18n/i18n.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [PrismaModule, FarmsModule, ImportModule, I18nModule, AuthModule],
})
export class AppModule {}
