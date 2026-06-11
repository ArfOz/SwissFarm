import { Farm, OpeningHourEntry } from '@swissfarm/types';

export class CreateFarmDto implements Omit<Farm, 'id'> {
  name: string;
  type: Farm['type'];
  products: string[];
  location: { lat: number; lng: number };
  address: string;
  canton: string;
  website?: string;
  openingHours?: OpeningHourEntry[];
}
