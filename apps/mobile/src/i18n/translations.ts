import apiClient from '../api/client';

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

let cachedDynamic: DynamicTranslations | null = null;
let currentLocale: Locale = 'en';

export async function fetchTranslations(locale: Locale): Promise<DynamicTranslations> {
  try {
    const res = await apiClient.get<DynamicTranslations>(`/i18n/${locale}`);
    cachedDynamic = res.data;
    currentLocale = locale;
    return res.data;
  } catch {
    // Return empty on failure
    return { farmTypes: {}, days: {}, ui: {} };
  }
}

export function getCachedTranslations(): DynamicTranslations | null {
  return cachedDynamic;
}

export function getCurrentLocale(): Locale {
  return currentLocale;
}

export function t(key: string, params?: Record<string, string | number>): string {
  if (!cachedDynamic) return key;

  // Try dynamic UI translations (includes payment.*, product.*, etc.)
  if (cachedDynamic.ui[key]) {
    let value = cachedDynamic.ui[key];
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        value = value.replace(`{${k}}`, String(v));
      }
    }
    return value;
  }

  // Try farmTypes
  if (key.startsWith('type.')) {
    const typeKey = key.slice(5);
    if (cachedDynamic.farmTypes[typeKey]) {
      return cachedDynamic.farmTypes[typeKey];
    }
  }

  // Try days
  if (key.startsWith('day.')) {
    const dayKey = key.slice(4);
    if (cachedDynamic.days[dayKey]) {
      return cachedDynamic.days[dayKey];
    }
  }

  return key;
}

export function translatePaymentMethod(name: string): string {
  const translation = t(`payment.${name}`);
  // If translation returns the same key (not found), return the original name
  return translation === `payment.${name}` ? name : translation;
}