'use client';

import { useI18n } from '@/lib/i18n';
import { SUPPORTED_LOCALES, LOCALE_LABELS, Locale } from '@/lib/i18n';

export default function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();

  return (
    <div className="flex items-center gap-1">
      {SUPPORTED_LOCALES.map((loc) => (
        <button
          key={loc}
          onClick={() => setLocale(loc as Locale)}
          className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
            locale === loc
              ? 'bg-green-700 text-white'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          {LOCALE_LABELS[loc as Locale]}
        </button>
      ))}
    </div>
  );
}