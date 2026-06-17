export interface FarmLocation {
  lat: number;
  lng: number;
}

export interface OpeningHourEntry {
  day: string;
  open: string | null;
  close: string | null;
}

export interface ProductInfo {
  id: string;
  name: string;
}

export interface Farm {
  id: string;
  name: string;
  type: 'milk' | 'self_service' | 'pick_your_own' | 'kids';
  products: ProductInfo[];
  location: FarmLocation;
  address: string;
  canton: string;
  website?: string;
  isActive: boolean;
  openingHours?: OpeningHourEntry[];
}

export type FarmType = Farm['type'];

// DTOs for creating and updating farms — shared between backend and admin
export type CreateFarmInput = Omit<Farm, 'id' | 'products'> & {
  products: string[];
};

export type UpdateFarmInput = Partial<CreateFarmInput>;

export const FARM_TYPES: FarmType[] = ['milk', 'self_service', 'pick_your_own', 'kids'];

export const TYPE_LABELS: Record<string, string> = {
  milk: 'Milk Farm',
  self_service: 'Self-Service',
  pick_your_own: 'Pick Your Own',
  kids: 'Kids Farm',
};

export const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;

export const DAY_LABELS: Record<string, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};

export const DEFAULT_OPENING_HOURS: OpeningHourEntry[] = DAYS.map((day) => ({
  day,
  open: '08:00',
  close: '18:00',
}));

export const CANTONS = [
  'AG', 'AI', 'AR', 'BE', 'BL', 'BS', 'FR', 'GE', 'GL', 'GR',
  'JU', 'LU', 'NE', 'NW', 'OW', 'SG', 'SH', 'SO', 'SZ', 'TG',
  'TI', 'UR', 'VD', 'VS', 'ZG', 'ZH',
] as const;

export type Canton = (typeof CANTONS)[number];

export const CANTON_LABELS: Record<string, string> = {
  AG: 'Aargau',
  AI: 'Appenzell Innerrhoden',
  AR: 'Appenzell Ausserrhoden',
  BE: 'Bern',
  BL: 'Basel-Landschaft',
  BS: 'Basel-Stadt',
  FR: 'Freiburg',
  GE: 'Genf',
  GL: 'Glarus',
  GR: 'Graubünden',
  JU: 'Jura',
  LU: 'Luzern',
  NE: 'Neuenburg',
  NW: 'Nidwalden',
  OW: 'Obwalden',
  SG: 'St. Gallen',
  SH: 'Schaffhausen',
  SO: 'Solothurn',
  SZ: 'Schwyz',
  TG: 'Thurgau',
  TI: 'Tessin',
  UR: 'Uri',
  VD: 'Waadt',
  VS: 'Wallis',
  ZG: 'Zug',
  ZH: 'Zürich',
};