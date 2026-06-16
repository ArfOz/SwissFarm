'use client';

import { useState, useCallback, useEffect, ReactNode } from 'react';
import { I18nContext, Locale, DynamicTranslations, translate, translateProduct, translateProducts } from '@/lib/i18n';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3330';

function getInitialLocale(): Locale {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('locale') as Locale | null;
    if (stored && ['en', 'de', 'fr'].includes(stored)) return stored;
  }
  return 'en';
}

export default function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale);
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

  const setLocale = useCallback(
    (newLocale: Locale) => {
      setLocaleState(newLocale);
      localStorage.setItem('locale', newLocale);
      fetchDynamic(newLocale);
    },
    [fetchDynamic],
  );

  useEffect(() => {
    fetchDynamic(locale);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
    (products: string[]) => {
      return translateProducts(locale, products, dynamic);
    },
    [locale, dynamic],
  );

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, tp, tps }}>
      {children}
    </I18nContext.Provider>
  );
}