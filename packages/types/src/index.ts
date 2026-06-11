export interface FarmLocation {
  lat: number;
  lng: number;
}

export interface OpeningHourEntry {
  day: string;
  open: string | null;
  close: string | null;
}

export interface Farm {
  id: string;
  name: string;
  type: 'milk' | 'self_service' | 'pick_your_own' | 'kids';
  products: string[];
  location: FarmLocation;
  address: string;
  canton: string;
  website?: string;
  openingHours?: OpeningHourEntry[];
}

export type FarmType = Farm['type'];

export const FARM_TYPES: FarmType[] = ['milk', 'self_service', 'pick_your_own', 'kids'];
