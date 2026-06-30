'use client';

import { createContext, useContext } from 'react';
import { Locale, DynamicTranslations } from '@swissfarm/types';
import { ProductInfo } from '@swissfarm/types';

export type { Locale, DynamicTranslations };

export const SUPPORTED_LOCALES: Locale[] = ['en', 'de', 'fr'];

export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  de: 'Deutsch',
  fr: 'Français',
};

export interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  tp: (productName: string) => string;
  tps: (products: ProductInfo[]) => string[];
}

export const I18nContext = createContext<I18nContextValue>({
  locale: 'en',
  setLocale: () => {},
  t: (key: string) => key,
  tp: (p: string) => p,
  tps: (p: ProductInfo[]) => p.map((pp) => pp.name),
});

export function useI18n() {
  return useContext(I18nContext);
}

/**
 * Translate a key using dynamic translations from backend API.
 * Falls back to returning the key itself if not found.
 */
export function translate(
  locale: Locale,
  key: string,
  dynamic: DynamicTranslations | null,
  params?: Record<string, string | number>,
): string {
  if (!dynamic) return key;

  let value: string | undefined;

  // Try ui translations first (includes farm forms, products, payments, etc.)
  if (dynamic.ui[key]) {
    value = dynamic.ui[key];
  }

  // Try farmTypes
  if (!value && key.startsWith('type.')) {
    const typeKey = key.slice(5);
    value = dynamic.farmTypes[typeKey];
  }

  // Try days
  if (!value && key.startsWith('day.')) {
    const dayKey = key.slice(4);
    value = dynamic.days[dayKey];
  }

  // Try products with prefix
  if (!value && key.startsWith('product.')) {
    value = dynamic.ui[key];
  }

  // Try payment methods with prefix
  if (!value && key.startsWith('payment.')) {
    value = dynamic.ui[key];
  }

  if (value && params) {
    for (const [k, v] of Object.entries(params)) {
      value = value.replace(`{${k}}`, String(v));
    }
  }

  return value ?? key;
}

function applyParams(value: string, params?: Record<string, string | number>): string {
  if (!params) return value;
  for (const [k, v] of Object.entries(params)) {
    value = value.replace(`{${k}}`, String(v));
  }
  return value;
}

/** Translate a product name (e.g. "milk" → "Milch") using dynamic translations */
export function translateProduct(
  locale: Locale,
  productName: string,
  dynamic: DynamicTranslations | null,
): string {
  if (!dynamic) return productName;
  return dynamic.ui[`product.${productName.toLowerCase()}`] || productName;
}

/** Translate an array of product names */
export function translateProducts(
  locale: Locale,
  products: string[],
  dynamic: DynamicTranslations | null,
): string[] {
  return products.map((p) => translateProduct(locale, p, dynamic));
}