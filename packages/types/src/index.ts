// ── i18n / Locale types (shared between backend, admin, mobile) ────────────

export type Locale = 'en' | 'de' | 'fr';

export const SUPPORTED_LOCALES: Locale[] = ['en', 'de', 'fr'];

export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  de: 'Deutsch',
  fr: 'Français',
};

export interface DynamicTranslations {
  farmTypes: Record<string, string>;
  days: Record<string, string>;
  ui: Record<string, string>;
}

// ── Product & Farm Types ───────────────────────────────────────────────────

/** ProductCategory is now a model (table), these are the default names */
export const CATEGORY_NAMES = ['all', 'milk', 'fruit', 'vegetable', 'honey', 'egg', 'meat', 'other'] as const;

export type ProductCategoryName = (typeof CATEGORY_NAMES)[number];

export const CATEGORY_LABELS: Record<string, string> = {
  milk: '🥛 Milk',
  fruit: '🍎 Fruit',
  vegetable: '🥬 Vegetable',
  honey: '🍯 Honey',
  egg: '🥚 Egg',
  meat: '🥩 Meat',
  other: '❓ Other',
  all: '🏠 All',
};

export const CATEGORY_ORDER = ['milk', 'fruit', 'vegetable', 'honey', 'egg', 'meat', 'other'];

export const CATEGORY_IDS: Record<string, string> = {
  milk: 'cat_milk',
  fruit: 'cat_fruit',
  vegetable: 'cat_vegetable',
  honey: 'cat_honey',
  egg: 'cat_egg',
  meat: 'cat_meat',
  other: 'cat_other',
};

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
  category?: string;
  categoryId?: string;
}

export type PaymentMethod = string;

export interface Farm {
  id: string;
  name: string;
  types: FarmType[];
  products: ProductInfo[];
  location: FarmLocation;
  address: string;
  canton: string;
  phone?: string;
  website?: string;
  isActive: boolean;
  paymentMethods: PaymentMethod[];
  openingHours?: OpeningHourEntry[];
}

export type FarmType = 'milk' | 'self_service' | 'pick_your_own' | 'kids' | 'accommodation';

// DTOs for creating and updating farms — shared between backend and admin
export type CreateFarmInput = Omit<Farm, 'id' | 'products'> & {
  products: string[];
};

export type UpdateFarmInput = Partial<CreateFarmInput>;

export const PAYMENT_METHODS: string[] = ['Cash', 'Invoice', 'TWINT', 'Vouchers', 'Credit card', 'Debit card'];

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  'Cash': 'Cash',
  'Invoice': 'Invoice',
  'TWINT': 'TWINT',
  'Vouchers': 'Vouchers',
  'Credit card': 'Credit Card',
  'Debit card': 'Debit Card',
};

export const FARM_TYPES: FarmType[] = ['milk', 'self_service', 'pick_your_own', 'kids', 'accommodation'];

export const TYPE_LABELS: Record<string, string> = {
  milk: 'Milk Farm',
  self_service: 'Self-Service',
  pick_your_own: 'Pick Your Own',
  kids: 'Kids Farm',
  accommodation: 'Accommodation',
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

export interface FarmWithDistance extends Farm {
  /** Straight-line distance in km from the query coordinates */
  distance: number;
}

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