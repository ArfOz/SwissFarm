import { CreateFarmInput, FarmType, OpeningHourEntry, PaymentMethod, UpdateFarmInput } from '@swissfarm/types';

export { CreateAdminDto, LoginDto } from './auth';

export class CreateFarmDto implements CreateFarmInput {
  name!: string;
  types!: FarmType[];
  products!: string[];
  location!: { lat: number; lng: number };
  address!: string;
  canton!: string;
  phone?: string;
  website?: string;
  isActive!: boolean;
  paymentMethods!: PaymentMethod[];
  openingHours?: OpeningHourEntry[];
}

export class UpdateFarmDto implements UpdateFarmInput {
  name?: string;
  types?: FarmType[];
  products?: string[];
  location?: { lat: number; lng: number };
  address?: string;
  canton?: string;
  phone?: string;
  website?: string;
  isActive?: boolean;
  paymentMethods?: PaymentMethod[];
  openingHours?: OpeningHourEntry[];
}
