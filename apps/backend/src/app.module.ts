import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { FarmsModule } from './farms/farms.module';
import { ImportModule } from './import/import.module';

@Module({
  imports: [PrismaModule, FarmsModule, ImportModule],
})
export class AppModule {}
