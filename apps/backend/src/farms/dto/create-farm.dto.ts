import { CreateFarmInput } from '@swissfarm/types';

export class CreateFarmDto implements CreateFarmInput {
  name!: string;
  type!: CreateFarmInput['type'];
  products!: string[];
  location!: { lat: number; lng: number };
  address!: string;
  canton!: string;
  phone?: string;
  website?: string;
  isActive!: boolean;
  paymentMethods!: CreateFarmInput['paymentMethods'];
  openingHours?: CreateFarmInput['openingHours'];
}
