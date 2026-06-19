import { UpdateFarmInput } from '@swissfarm/types';

export class UpdateFarmDto implements UpdateFarmInput {
  name?: string;
  type?: UpdateFarmInput['type'];
  products?: string[];
  location?: { lat: number; lng: number };
  address?: string;
  canton?: string;
  phone?: string;
  website?: string;
  isActive?: boolean;
  openingHours?: UpdateFarmInput['openingHours'];
}
