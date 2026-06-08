import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { FarmsModule } from './farms/farms.module';

@Module({
  imports: [PrismaModule, FarmsModule],
})
export class AppModule {}
