import { Farm } from '@swissfarm/types';

export class UpdateFarmDto implements Partial<Omit<Farm, 'id'>> {
  name?: string;
  type?: Farm['type'];
  products?: string[];
  location?: { lat: number; lng: number };
  address?: string;
  canton?: string;
  website?: string;
  openingHours?: string;
}
