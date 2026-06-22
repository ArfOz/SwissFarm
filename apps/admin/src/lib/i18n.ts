'use client';

import { createContext, useContext } from 'react';
import { ProductInfo } from '@swissfarm/types';

export type Locale = 'en' | 'de' | 'fr';

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

// ── Static UI translations (never change) ─────────────────────────────────
// Button labels, form labels, placeholders etc. are embedded for instant load.
// Product/type/day translations come from backend API (GET /api/i18n/:locale).

const UI_TRANSLATIONS: Record<Locale, Record<string, string>> = {
  en: {
    'type.milk': 'Milk Farm',
    'type.self_service': 'Self-Service',
    'type.pick_your_own': 'Pick Your Own',
    'type.kids': 'Kids Farm',
    'type.accommodation': 'Accommodation',
    'day.monday': 'Monday',
    'day.tuesday': 'Tuesday',
    'day.wednesday': 'Wednesday',
    'day.thursday': 'Thursday',
    'day.friday': 'Friday',
    'day.saturday': 'Saturday',
    'day.sunday': 'Sunday',
    'farms.allTypes': 'All Types',
    'farms.newFarm': 'New Farm',
    'farms.editFarm': 'Edit Farm',
    'farms.addFarm': 'Add Farm',
    'farms.noFarms': 'No farms found.',
    'farms.name': 'Name',
    'farms.type': 'Type',
    'farms.canton': 'Canton',
    'farms.address': 'Address',
    'farms.phone': 'Phone',
    'farms.products': 'Products',
    'farms.status': 'Status',
    'farms.active': 'Active',
    'farms.passive': 'Passive',
    'farms.edit': 'Edit',
    'farms.delete': 'Delete',
    'farms.save': 'Save',
    'farms.cancel': 'Cancel',
    'farms.saving': 'Saving...',
    'farms.confirmDelete': 'Are you sure you want to delete "{name}"?',
    'farms.form.name': 'Name *',
    'farms.form.type': 'Type *',
    'farms.form.canton': 'Canton *',
    'farms.form.address': 'Address *',
    'farms.form.latitude': 'Latitude (lat) *',
    'farms.form.longitude': 'Longitude (lng) *',
    'farms.form.products': 'Products (comma-separated)',
    'farms.form.website': 'Website',
    'farms.form.active': 'Active',
    'farms.form.openingHours': 'Opening Hours',
    'farms.form.day': 'Day',
    'farms.form.open': 'Open',
    'farms.form.close': 'Close',
    'farms.form.placeholder.name': 'Farm name',
    'farms.form.placeholder.address': 'Street no, Postal code City',
    'farms.form.placeholder.products': 'milk, cheese, butter',
    'farms.form.placeholder.website': 'https://example-farm.ch',
    'farms.form.selectCanton': 'Select canton',
    'farms.details': 'Farm Details',
    'farms.viewDetails': 'View Details →',
    'farms.backToList': '← Back to Farms',
    'farms.noProducts': 'No products',
    'common.error': 'An error occurred',
    'common.language': 'Language',
  },
  de: {
    'type.milk': 'Milchhof',
    'type.self_service': 'Selbstbedienung',
    'type.pick_your_own': 'Selbstpflücke',
    'type.kids': 'Kinderbauernhof',
    'type.accommodation': 'Unterkunft',
    'day.monday': 'Montag',
    'day.tuesday': 'Dienstag',
    'day.wednesday': 'Mittwoch',
    'day.thursday': 'Donnerstag',
    'day.friday': 'Freitag',
    'day.saturday': 'Samstag',
    'day.sunday': 'Sonntag',
    'farms.allTypes': 'Alle Typen',
    'farms.newFarm': 'Neuer Hof',
    'farms.editFarm': 'Hof bearbeiten',
    'farms.addFarm': 'Hof hinzufügen',
    'farms.noFarms': 'Keine Höfe gefunden.',
    'farms.name': 'Name',
    'farms.type': 'Typ',
    'farms.canton': 'Kanton',
    'farms.address': 'Adresse',
    'farms.phone': 'Telefon',
    'farms.products': 'Produkte',
    'farms.status': 'Status',
    'farms.active': 'Aktiv',
    'farms.passive': 'Inaktiv',
    'farms.edit': 'Bearbeiten',
    'farms.delete': 'Löschen',
    'farms.save': 'Speichern',
    'farms.cancel': 'Abbrechen',
    'farms.saving': 'Speichert...',
    'farms.confirmDelete': 'Sind Sie sicher, dass Sie "{name}" löschen möchten?',
    'farms.form.name': 'Name *',
    'farms.form.type': 'Typ *',
    'farms.form.canton': 'Kanton *',
    'farms.form.address': 'Adresse *',
    'farms.form.latitude': 'Breitengrad (lat) *',
    'farms.form.longitude': 'Längengrad (lng) *',
    'farms.form.products': 'Produkte (kommagetrennt)',
    'farms.form.website': 'Webseite',
    'farms.form.active': 'Aktiv',
    'farms.form.openingHours': 'Öffnungszeiten',
    'farms.form.day': 'Tag',
    'farms.form.open': 'Geöffnet',
    'farms.form.close': 'Geschlossen',
    'farms.form.placeholder.name': 'Hofname',
    'farms.form.placeholder.address': 'Strasse Nr, PLZ Ort',
    'farms.form.placeholder.products': 'Milch, Käse, Butter',
    'farms.form.placeholder.website': 'https://beispiel-hof.ch',
    'farms.form.selectCanton': 'Kanton wählen',
    'farms.details': 'Hofdetails',
    'farms.viewDetails': 'Details anzeigen →',
    'farms.backToList': '← Zurück zu Höfen',
    'farms.noProducts': 'Keine Produkte',
    'common.error': 'Ein Fehler ist aufgetreten',
    'common.language': 'Sprache',
  },
  fr: {
    'type.milk': 'Ferme laitière',
    'type.self_service': 'Libre-service',
    'type.pick_your_own': 'Auto-cueillette',
    'type.kids': 'Ferme pour enfants',
    'type.accommodation': 'Hébergement',
    'day.monday': 'Lundi',
    'day.tuesday': 'Mardi',
    'day.wednesday': 'Mercredi',
    'day.thursday': 'Jeudi',
    'day.friday': 'Vendredi',
    'day.saturday': 'Samedi',
    'day.sunday': 'Dimanche',
    'farms.allTypes': 'Tous les types',
    'farms.newFarm': 'Nouvelle ferme',
    'farms.editFarm': 'Modifier la ferme',
    'farms.addFarm': 'Ajouter une ferme',
    'farms.noFarms': 'Aucune ferme trouvée.',
    'farms.name': 'Nom',
    'farms.type': 'Type',
    'farms.canton': 'Canton',
    'farms.address': 'Adresse',
    'farms.phone': 'Téléphone',
    'farms.products': 'Produits',
    'farms.status': 'Statut',
    'farms.active': 'Actif',
    'farms.passive': 'Passif',
    'farms.edit': 'Modifier',
    'farms.delete': 'Supprimer',
    'farms.save': 'Enregistrer',
    'farms.cancel': 'Annuler',
    'farms.saving': 'Enregistrement...',
    'farms.confirmDelete': 'Êtes-vous sûr de vouloir supprimer "{name}" ?',
    'farms.form.name': 'Nom *',
    'farms.form.type': 'Type *',
    'farms.form.canton': 'Canton *',
    'farms.form.address': 'Adresse *',
    'farms.form.latitude': 'Latitude (lat) *',
    'farms.form.longitude': 'Longitude (lng) *',
    'farms.form.products': 'Produits (séparés par des virgules)',
    'farms.form.website': 'Site web',
    'farms.form.active': 'Actif',
    'farms.form.openingHours': "Heures d'ouverture",
    'farms.form.day': 'Jour',
    'farms.form.open': 'Ouvert',
    'farms.form.close': 'Fermé',
    'farms.form.placeholder.name': 'Nom de la ferme',
    'farms.form.placeholder.address': 'Rue no, Code postal Ville',
    'farms.form.placeholder.products': 'lait, fromage, beurre',
    'farms.form.placeholder.website': 'https://exemple-ferme.ch',
    'farms.form.selectCanton': 'Sélectionner le canton',
    'farms.details': 'Détails de la ferme',
    'farms.viewDetails': 'Voir les détails →',
    'farms.backToList': '← Retour aux fermes',
    'farms.noProducts': 'Aucun produit',
    'common.error': 'Une erreur est survenue',
    'common.language': 'Langue',
  },
};

// ── Dynamic translations from backend API ─────────────────────────────────
// These include: farmTypes, days, products
// Fetched once from GET /api/i18n/:locale and cached

export interface DynamicTranslations {
  farmTypes: Record<string, string>;
  days: Record<string, string>;
  ui: Record<string, string>; // unused in frontend, but available for mobile
}

export function translate(
  locale: Locale,
  key: string,
  dynamic: DynamicTranslations | null,
  params?: Record<string, string | number>,
): string {
  // 1. Try dynamic translations first (farmTypes, days, products, payment from backend)
  if (dynamic) {
    const dynamicKey =
      key.startsWith('type.') || key.startsWith('day.') || key.startsWith('product.') || key.startsWith('payment.')
        ? key.split(/\.(.+)/)[1] // everything after the first dot
        : null;

    if (dynamicKey) {
      // Try farmTypes
      if (key.startsWith('type.') && dynamic.farmTypes[dynamicKey]) {
        let value = dynamic.farmTypes[dynamicKey];
        return applyParams(value, params);
      }
      // Try days
      if (key.startsWith('day.') && dynamic.days[dynamicKey]) {
        let value = dynamic.days[dynamicKey];
        return applyParams(value, params);
      }
      // Try products
      if (key.startsWith('product.') && dynamic.ui[key]) {
        const value = dynamic.ui[key];
        if (value) return applyParams(value, params);
      }
      // Try payment methods
      if (key.startsWith('payment.') && dynamic.ui[key]) {
        const value = dynamic.ui[key];
        if (value) return applyParams(value, params);
      }
    }
  }

  // 2. Fallback to static UI translations (works offline too)
  const uiDict = UI_TRANSLATIONS[locale];
  let value = uiDict[key];
  if (value) return applyParams(value, params);

  // 3. If nothing found, return the key itself
  return key;
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
  // Product translation keys are in the 'ui' map with key "product.{name}"
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