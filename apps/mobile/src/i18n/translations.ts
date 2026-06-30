import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../api/client';
import { Locale, DynamicTranslations } from '@swissfarm/types';

export type { Locale, DynamicTranslations };

export const SUPPORTED_LOCALES: Locale[] = ['en', 'de', 'fr'];

export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  de: 'Deutsch',
  fr: 'Français',
};

const CACHE_KEY_PREFIX = 'translations_';
let cachedDynamic: DynamicTranslations | null = null;
let currentLocale: Locale = 'en';

/**
 * Fetch translations from backend API. Falls back to AsyncStorage cache on failure.
 */
export async function fetchTranslations(locale: Locale): Promise<DynamicTranslations> {
  try {
    const res = await apiClient.get<DynamicTranslations>(`/i18n/${locale}`);
    cachedDynamic = res.data;
    currentLocale = locale;
    // Save to cache for offline use
    await AsyncStorage.setItem(`${CACHE_KEY_PREFIX}${locale}`, JSON.stringify(res.data));
    return res.data;
  } catch {
    // Try loading from cache
    try {
      const cached = await AsyncStorage.getItem(`${CACHE_KEY_PREFIX}${locale}`);
      if (cached) {
        const parsed = JSON.parse(cached) as DynamicTranslations;
        cachedDynamic = parsed;
        currentLocale = locale;
        return parsed;
      }
    } catch {
      // ignore cache errors
    }
    // Return empty as last resort
    return { farmTypes: {}, days: {}, ui: {} };
  }
}

/**
 * Preload all supported locales into AsyncStorage cache on app startup.
 */
export async function preloadAllTranslations(): Promise<void> {
  for (const locale of SUPPORTED_LOCALES) {
    try {
      const cached = await AsyncStorage.getItem(`${CACHE_KEY_PREFIX}${locale}`);
      if (cached) continue; // Already cached
      const res = await apiClient.get<DynamicTranslations>(`/i18n/${locale}`);
      await AsyncStorage.setItem(`${CACHE_KEY_PREFIX}${locale}`, JSON.stringify(res.data));
    } catch {
      // Skip if offline — will try again later
    }
  }
}

export function getCachedTranslations(): DynamicTranslations | null {
  return cachedDynamic;
}

export function getCurrentLocale(): Locale {
  return currentLocale;
}

/**
 * Translate a key using cached dynamic translations.
 * Falls back to returning the key itself if not found.
 */
export function t(key: string, params?: Record<string, string | number>): string {
  if (!cachedDynamic) return key;

  let value: string | undefined;

  // Try ui translations (includes farm forms, products, payments, etc.)
  if (cachedDynamic.ui[key]) {
    value = cachedDynamic.ui[key];
  }

  // Try farmTypes
  if (!value && key.startsWith('type.')) {
    const typeKey = key.slice(5);
    value = cachedDynamic.farmTypes[typeKey];
  }

  // Try days
  if (!value && key.startsWith('day.')) {
    const dayKey = key.slice(4);
    value = cachedDynamic.days[dayKey];
  }

  if (value && params) {
    for (const [k, v] of Object.entries(params)) {
      value = value.replace(`{${k}}`, String(v));
    }
  }

  return value ?? key;
}

/**
 * Translate a payment method name using cached translations.
 */
export function translatePaymentMethod(name: string): string {
  const translation = t(`payment.${name}`);
  return translation === `payment.${name}` ? name : translation;
}