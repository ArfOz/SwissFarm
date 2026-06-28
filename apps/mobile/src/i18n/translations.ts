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

const FALLBACK_EN: Record<string, string> = {
  'settings.title': 'Settings',
  'settings.subtitle': 'Customize your app experience',
  'settings.language': 'Language',
  'settings.languageDescription': 'Choose your preferred language',
  'settings.about': 'About',
  'settings.version': 'Version',
  'settings.appName': 'App Name',
  'settings.tapForDetails': 'Tap for details',
  'suggest.title': 'Suggest',
  'suggest.button': '💡 Suggest',
  'suggest.author': 'Your name',
  'suggest.email': 'Email (optional)',
  'suggest.message': 'Your suggestion *',
  'suggest.gallery': '🖼 Gallery',
  'suggest.camera': '📷 Take Photo',
  'suggest.remove': 'Remove',
  'suggest.submit': 'Send',
  'suggest.success': 'Thank you! Your suggestion has been sent.',
  'suggest.error': 'Could not send. Please try again.',
  'suggest.required': 'Please write a suggestion.',
  'suggest.permission': 'Camera permission required',
  'type.kids': 'Kids Farm',
  'type.accommodation': 'Accommodation',
  'type.self_service': 'Self-Service',
  'type.pick_your_own': 'Pick Your Own',
  'type.milk': 'Milk Farm',
  'day.monday': 'Monday',
  'day.tuesday': 'Tuesday',
  'day.wednesday': 'Wednesday',
  'day.thursday': 'Thursday',
  'day.friday': 'Friday',
  'day.saturday': 'Saturday',
  'day.sunday': 'Sunday',
  'farms.form.close': 'Closed',
  'farms.noProducts': 'No products',
};

const FALLBACK_DE: Record<string, string> = {
  'settings.title': 'Einstellungen',
  'settings.subtitle': 'Passe deine App-Erfahrung an',
  'settings.language': 'Sprache',
  'settings.languageDescription': 'Wähle deine bevorzugte Sprache',
  'settings.about': 'Über',
  'settings.version': 'Version',
  'settings.appName': 'App-Name',
  'settings.tapForDetails': 'Tippen für Details',
  'suggest.title': 'Vorschlagen',
  'suggest.button': '💡 Vorschlagen',
  'suggest.author': 'Dein Name',
  'suggest.email': 'E-Mail (optional)',
  'suggest.message': 'Dein Vorschlag *',
  'suggest.gallery': '🖼 Galerie',
  'suggest.camera': '📷 Foto machen',
  'suggest.remove': 'Entfernen',
  'suggest.submit': 'Senden',
  'suggest.success': 'Danke! Dein Vorschlag wurde gesendet.',
  'suggest.error': 'Konnte nicht senden. Bitte versuche es erneut.',
  'suggest.required': 'Bitte schreibe einen Vorschlag.',
  'suggest.permission': 'Kamera-Berechtigung erforderlich',
  'type.kids': 'Kinder',
  'type.accommodation': 'Unterkunft',
  'type.self_service': 'Selbstbedienung',
  'type.pick_your_own': 'Selbstpflücken',
  'type.milk': 'Milchhof',
  'day.monday': 'Montag',
  'day.tuesday': 'Dienstag',
  'day.wednesday': 'Mittwoch',
  'day.thursday': 'Donnerstag',
  'day.friday': 'Freitag',
  'day.saturday': 'Samstag',
  'day.sunday': 'Sonntag',
  'farms.form.close': 'Geschlossen',
  'farms.noProducts': 'Keine Produkte',
};

const FALLBACK_FR: Record<string, string> = {
  'settings.title': 'Paramètres',
  'settings.subtitle': 'Personnalisez votre expérience',
  'settings.language': 'Langue',
  'settings.languageDescription': 'Choisissez votre langue préférée',
  'settings.about': 'À propos',
  'settings.version': 'Version',
  'settings.appName': "Nom de l'application",
  'settings.tapForDetails': 'Appuyez pour plus de détails',
  'suggest.title': 'Suggérer',
  'suggest.button': '💡 Suggérer',
  'suggest.author': 'Votre nom',
  'suggest.email': 'Email (optionnel)',
  'suggest.message': 'Votre suggestion *',
  'suggest.gallery': '🖼 Galerie',
  'suggest.camera': '📷 Prendre une photo',
  'suggest.remove': 'Supprimer',
  'suggest.submit': 'Envoyer',
  'suggest.success': 'Merci ! Votre suggestion a été envoyée.',
  'suggest.error': 'Impossible denvoyer. Veuillez réessayer.',
  'suggest.required': 'Veuillez écrire une suggestion.',
  'suggest.permission': 'Autorisation de la caméra requise',
  'type.kids': 'Enfants',
  'type.accommodation': 'Hébergement',
  'type.self_service': 'Libre-service',
  'type.pick_your_own': 'Auto-cueillette',
  'type.milk': 'Ferme laitière',
  'day.monday': 'Lundi',
  'day.tuesday': 'Mardi',
  'day.wednesday': 'Mercredi',
  'day.thursday': 'Jeudi',
  'day.friday': 'Vendredi',
  'day.saturday': 'Samedi',
  'day.sunday': 'Dimanche',
  'farms.form.close': 'Fermé',
  'farms.noProducts': 'Aucun produit',
};

const FALLBACKS: Record<Locale, Record<string, string>> = {
  en: FALLBACK_EN,
  de: FALLBACK_DE,
  fr: FALLBACK_FR,
};

export function t(key: string, params?: Record<string, string | number>): string {
  // Use locale-specific fallback
  const fallbackMap = FALLBACKS[currentLocale] ?? FALLBACK_EN;

  // If API translations haven't loaded yet, use the built-in fallback
  if (!cachedDynamic) {
    return fallbackMap[key] ?? key;
  }

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

  // Fallback to built-in locale-specific strings if API doesn't have this key
  return fallbackMap[key] ?? key;
}

export function translatePaymentMethod(name: string): string {
  const translation = t(`payment.${name}`);
  // If translation returns the same key (not found), return the original name
  return translation === `payment.${name}` ? name : translation;
}