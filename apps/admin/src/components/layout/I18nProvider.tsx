'use client';

import { useState, useCallback, useEffect, ReactNode } from 'react';
import { ProductInfo } from '@helvetfarm/types';
import { I18nContext, Locale, DynamicTranslations, translate, translateProduct, translateProducts } from '@/lib/i18n';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3300/api';

export default function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');
  const [mounted, setMounted] = useState(false);
  const [dynamic, setDynamic] = useState<DynamicTranslations | null>(null);

  const fetchDynamic = useCallback(async (loc: Locale) => {
    try {
      const res = await fetch(`${API_URL}/i18n/${loc}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setDynamic(data);
      }
    } catch {
      // Keep null on error — UI will fall back to raw keys
    }
  }, []);

  // Initialize locale from localStorage on client mount and fetch translations
  useEffect(() => {
    const stored = localStorage.getItem('locale') as Locale | null;
    const initial = (stored && ['en', 'de', 'fr'].includes(stored)) ? stored : 'en';
    setLocaleState(initial);
    setMounted(true);
    fetchDynamic(initial);
  }, [fetchDynamic]);

  const setLocale = useCallback(
    (newLocale: Locale) => {
      setLocaleState(newLocale);
      localStorage.setItem('locale', newLocale);
      fetchDynamic(newLocale);
    },
    [fetchDynamic],
  );

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => {
      return translate(locale, key, dynamic, params);
    },
    [locale, dynamic],
  );

  const tp = useCallback(
    (productName: string) => {
      return translateProduct(locale, productName, dynamic);
    },
    [locale, dynamic],
  );

  const tps = useCallback(
    (products: ProductInfo[]) => {
      return translateProducts(locale, products.map((p) => p.name), dynamic);
    },
    [locale, dynamic],
  );

  // Wait until mounted to avoid hydration mismatch (localStorage vs server)
  if (!mounted) {
    return (
      <I18nContext.Provider value={{ locale: 'en', setLocale: () => {}, t: (key: string) => key, tp: (p: string) => p, tps: (p: ProductInfo[]) => p.map((pp) => pp.name) }}>
        {children}
      </I18nContext.Provider>
    );
  }

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, tp, tps }}>
      {children}
    </I18nContext.Provider>
  );
}