import { Module } from '@nestjs/common';
import { FarmsController } from './farms.controller';
import { FarmsAdminController } from './farms-admin.controller';
import { FarmsMobileController } from './farms-mobile.controller';
import { FarmsService } from './farms.service';

@Module({
  controllers: [FarmsController, FarmsAdminController, FarmsMobileController],
  providers: [FarmsService],
})
export class FarmsModule {}
