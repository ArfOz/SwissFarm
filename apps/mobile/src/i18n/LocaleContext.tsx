import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { Locale, getCurrentLocale, fetchTranslations, preloadAllTranslations } from './translations';

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => Promise<void>;
  loading: boolean;
}

const LocaleContext = createContext<LocaleContextType>({
  locale: 'en',
  setLocale: async () => {},
  loading: false,
});

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getCurrentLocale());
  const [loading, setLoading] = useState(false);

  // On mount: fetch current locale and preload all others into cache
  useEffect(() => {
    async function init() {
      const current = getCurrentLocale();
      await fetchTranslations(current);
      // Preload remaining locales in background
      preloadAllTranslations();
    }
    init();
  }, []);

  const setLocale = useCallback(async (newLocale: Locale) => {
    setLoading(true);
    try {
      await fetchTranslations(newLocale);
      setLocaleState(newLocale);
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <LocaleContext.Provider value={{ locale, setLocale, loading }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}
