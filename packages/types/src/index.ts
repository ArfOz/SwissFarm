export interface FarmLocation {
  lat: number;
  lng: number;
}

export interface Farm {
  id: string;
  name: string;
  type: 'milk' | 'self-service' | 'pick-your-own' | 'kids';
  products: string[];
  location: FarmLocation;
  address: string;
  canton: string;
  website?: string;
  openingHours?: string;
}

export type FarmType = Farm['type'];

export const FARM_TYPES: FarmType[] = ['milk', 'self-service', 'pick-your-own', 'kids'];
