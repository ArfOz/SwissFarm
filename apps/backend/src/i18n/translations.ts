import { Locale, SUPPORTED_LOCALES, LOCALE_LABELS, DynamicTranslations } from '@helvetfarm/types';

export { Locale, SUPPORTED_LOCALES, LOCALE_LABELS };

// ── Payment Methods ──────────────────────────────────────────────────────────

export const paymentMethodTranslations: Record<string, Record<Locale, string>> = {
  Cash:         { en: 'Cash',               de: 'Bar',                 fr: 'Espèces' },
  Invoice:      { en: 'Invoice',            de: 'Rechnung',            fr: 'Facture' },
  TWINT:        { en: 'TWINT',              de: 'TWINT',               fr: 'TWINT' },
  Vouchers:     { en: 'Vouchers',           de: 'Gutscheine',          fr: 'Bons' },
  'Credit card': { en: 'Credit Card',       de: 'Kreditkarte',         fr: 'Carte de crédit' },
  'Debit card':  { en: 'Debit Card',        de: 'Debitkarte',          fr: 'Carte de débit' },
};

// ── Farm Types ────────────────────────────────────────────────────────────────

export const farmTypeTranslations: Record<string, Record<Locale, string>> = {
  milk: {
    en: 'Milk Farm',
    de: 'Milchhof',
    fr: 'Ferme laitière',
  },
  self_service: {
    en: 'Self-Service',
    de: 'Selbstbedienung',
    fr: 'Libre-service',
  },
  pick_your_own: {
    en: 'Pick Your Own',
    de: 'Selbstpflücke',
    fr: 'Auto-cueillette',
  },
  kids: {
    en: 'Kids Farm',
    de: 'Kinderbauernhof',
    fr: 'Ferme pour enfants',
  },
  accommodation: {
    en: 'Accommodation',
    de: 'Unterkunft',
    fr: 'Hébergement',
  },
};

// ── Days ──────────────────────────────────────────────────────────────────────

export const dayTranslations: Record<string, Record<Locale, string>> = {
  monday:    { en: 'Monday',    de: 'Montag',     fr: 'Lundi' },
  tuesday:   { en: 'Tuesday',   de: 'Dienstag',   fr: 'Mardi' },
  wednesday: { en: 'Wednesday', de: 'Mittwoch',   fr: 'Mercredi' },
  thursday:  { en: 'Thursday',  de: 'Donnerstag', fr: 'Jeudi' },
  friday:    { en: 'Friday',    de: 'Freitag',    fr: 'Vendredi' },
  saturday:  { en: 'Saturday',  de: 'Samstag',    fr: 'Samedi' },
  sunday:    { en: 'Sunday',    de: 'Sonntag',    fr: 'Dimanche' },
};

// ── UI Labels (shared between admin & mobile) ────────────────────────────────

export const productTranslations: Record<string, Record<Locale, string>> = {
  milk:                { en: 'Milk',                de: 'Milch',                fr: 'Lait' },
  cheese:              { en: 'Cheese',              de: 'Käse',                 fr: 'Fromage' },
  butter:              { en: 'Butter',              de: 'Butter',               fr: 'Beurre' },
  yogurt:              { en: 'Yogurt',              de: 'Joghurt',              fr: 'Yaourt' },
  eggs:                { en: 'Eggs',                de: 'Eier',                 fr: 'Œufs' },
  meat:                { en: 'Meat',                de: 'Fleisch',              fr: 'Viande' },
  fruit:               { en: 'Fruit',               de: 'Obst',                 fr: 'Fruits' },
  vegetables:          { en: 'Vegetables',          de: 'Gemüse',               fr: 'Légumes' },
  honey:               { en: 'Honey',               de: 'Honig',                fr: 'Miel' },
  jam:                 { en: 'Jam',                 de: 'Marmelade',            fr: 'Confiture' },
  juice:               { en: 'Juice',               de: 'Saft',                 fr: 'Jus' },
  wine:                { en: 'Wine',                de: 'Wein',                 fr: 'Vin' },
  cider:               { en: 'Cider',               de: 'Apfelwein',            fr: 'Cidre' },
  bread:               { en: 'Bread',               de: 'Brot',                 fr: 'Pain' },
  herbs:               { en: 'Herbs',               de: 'Kräuter',              fr: 'Herbes' },
  flowers:             { en: 'Flowers',             de: 'Blumen',               fr: 'Fleurs' },
  potatoes:            { en: 'Potatoes',            de: 'Kartoffeln',           fr: 'Pommes de terre' },
  pumpkin:             { en: 'Pumpkin',             de: 'Kürbis',               fr: 'Citrouille' },
  apples:              { en: 'Apples',              de: 'Äpfel',                fr: 'Pommes' },
  berries:             { en: 'Berries',             de: 'Beeren',               fr: 'Baies' },
  cherries:            { en: 'Cherries',            de: 'Kirschen',             fr: 'Cerises' },
  strawberries:        { en: 'Strawberries',        de: 'Erdbeeren',            fr: 'Fraises' },
  pears:               { en: 'Pears',               de: 'Birnen',               fr: 'Poires' },
  cream:               { en: 'Cream',               de: 'Rahm',                 fr: 'Crème' },
  'gruyère cheese':    { en: 'Gruyère Cheese',      de: 'Gruyère-Käse',         fr: 'Gruyère' },
  'educational tours': { en: 'Educational Tours',   de: 'Lehrreiche Touren',    fr: 'Visites éducatives' },
  'petting zoo':       { en: 'Petting Zoo',         de: 'Streichelzoo',         fr: 'Parc animalier' },
  'seasonal activities': { en: 'Seasonal Activities', de: 'Saisonale Aktivitäten', fr: 'Activités saisonnières' },
};

export const uiTranslations: Record<string, Record<Locale, string>> = {
  // Tab navigation
  'tab.map':       { en: 'Map',           de: 'Karte',          fr: 'Carte' },
  'tab.list':      { en: 'List',          de: 'Liste',          fr: 'Liste' },
  'tab.contact':   { en: 'Contact',       de: 'Kontakt',        fr: 'Contact' },
  'tab.settings':  { en: 'Settings',      de: 'Einstellungen',  fr: 'Paramètres' },

  // Farm type filter
  'farms.allTypes':    { en: 'All Types',        de: 'Alle Typen',          fr: 'Tous les types' },
  'farms.newFarm':     { en: 'New Farm',         de: 'Neuer Hof',           fr: 'Nouvelle ferme' },
  'farms.editFarm':    { en: 'Edit Farm',        de: 'Hof bearbeiten',      fr: 'Modifier la ferme' },
  'farms.addFarm':     { en: 'Add Farm',         de: 'Hof hinzufügen',      fr: 'Ajouter une ferme' },
  'farms.noFarms':     { en: 'No farms found.',  de: 'Keine Höfe gefunden.', fr: 'Aucune ferme trouvée.' },

  // Table headers
  'farms.name':        { en: 'Name',             de: 'Name',                fr: 'Nom' },
  'farms.type':        { en: 'Type',             de: 'Typ',                 fr: 'Type' },
  'farms.canton':      { en: 'Canton',           de: 'Kanton',              fr: 'Canton' },
  'farms.address':     { en: 'Address',          de: 'Adresse',             fr: 'Adresse' },
  'farms.products':    { en: 'Products',         de: 'Produkte',            fr: 'Produits' },
  'farms.status':      { en: 'Status',           de: 'Status',              fr: 'Statut' },

  // Status badges
  'farms.active':      { en: 'Active',           de: 'Aktiv',               fr: 'Actif' },
  'farms.passive':     { en: 'Passive',          de: 'Inaktiv',             fr: 'Passif' },

  // Buttons
  'farms.edit':        { en: 'Edit',             de: 'Bearbeiten',          fr: 'Modifier' },
  'farms.delete':      { en: 'Delete',           de: 'Löschen',             fr: 'Supprimer' },
  'farms.save':        { en: 'Save',             de: 'Speichern',           fr: 'Enregistrer' },
  'farms.cancel':      { en: 'Cancel',           de: 'Abbrechen',           fr: 'Annuler' },
  'farms.saving':      { en: 'Saving...',        de: 'Speichert...',        fr: 'Enregistrement...' },

  // Form labels
  'farms.form.name':              { en: 'Name *',              de: 'Name *',                fr: 'Nom *' },
  'farms.form.type':              { en: 'Type *',              de: 'Typ *',                 fr: 'Type *' },
  'farms.form.canton':            { en: 'Canton *',            de: 'Kanton *',              fr: 'Canton *' },
  'farms.form.address':           { en: 'Address *',           de: 'Adresse *',             fr: 'Adresse *' },
  'farms.form.latitude':          { en: 'Latitude (lat) *',    de: 'Breitengrad (lat) *',   fr: 'Latitude (lat) *' },
  'farms.form.longitude':         { en: 'Longitude (lng) *',   de: 'Längengrad (lng) *',    fr: 'Longitude (lng) *' },
  'farms.form.products':          { en: 'Products (comma-separated)', de: 'Produkte (kommagetrennt)', fr: 'Produits (séparés par des virgules)' },
  'farms.form.website':           { en: 'Website',             de: 'Webseite',              fr: 'Site web' },
  'farms.form.active':            { en: 'Active',              de: 'Aktiv',                 fr: 'Actif' },
  'farms.form.openingHours':      { en: 'Opening Hours',       de: 'Öffnungszeiten',        fr: 'Heures d\'ouverture' },
  'farms.form.day':               { en: 'Day',                 de: 'Tag',                   fr: 'Jour' },
  'farms.form.open':              { en: 'Open',                de: 'Geöffnet',              fr: 'Ouvert' },
  'farms.form.close':             { en: 'Close',               de: 'Geschlossen',           fr: 'Fermé' },
  'farms.form.placeholder.name':  { en: 'Farm name',           de: 'Hofname',               fr: 'Nom de la ferme' },
  'farms.form.placeholder.address': { en: 'Street no, Postal code City', de: 'Strasse Nr, PLZ Ort', fr: 'Rue no, Code postal Ville' },
  'farms.form.placeholder.products': { en: 'milk, cheese, butter',       de: 'Milch, Käse, Butter', fr: 'lait, fromage, beurre' },
  'farms.form.placeholder.website': { en: 'https://example-farm.ch',      de: 'https://beispiel-hof.ch', fr: 'https://exemple-ferme.ch' },
  'farms.form.selectCanton':      { en: 'Select canton',       de: 'Kanton wählen',         fr: 'Sélectionner le canton' },

  // Detail page
  'farms.details':      { en: 'Farm Details',     de: 'Hofdetails',          fr: 'Détails de la ferme' },
  'farms.viewDetails':  { en: 'View Details →',   de: 'Details anzeigen →',  fr: 'Voir les détails →' },
  'farms.backToList':   { en: '← Back to Farms',  de: '← Zurück zu Höfen',  fr: '← Retour aux fermes' },
  'farms.noProducts':   { en: 'No products',      de: 'Keine Produkte',      fr: 'Aucun produit' },

  // Confirmations
  'farms.confirmDelete': { en: 'Are you sure you want to delete "{name}"?', de: 'Sind Sie sicher, dass Sie "{name}" löschen möchten?', fr: 'Êtes-vous sûr de vouloir supprimer "{name}" ?' },

  // Settings (used by mobile)
  'settings.title':    { en: 'Settings',           de: 'Einstellungen',      fr: 'Paramètres' },
  'settings.subtitle': { en: 'Customize your app experience', de: 'Passe deine App-Erfahrung an', fr: 'Personnalisez votre expérience' },
  'settings.language': { en: 'Language',            de: 'Sprache',             fr: 'Langue' },
  'settings.languageDescription': { en: 'Choose your preferred language', de: 'Wähle deine bevorzugte Sprache', fr: 'Choisissez votre langue préférée' },
  'settings.about':    { en: 'About',               de: 'Über',                fr: 'À propos' },
  'settings.version':  { en: 'Version',             de: 'Version',             fr: 'Version' },
  'settings.appName':  { en: 'App Name',            de: 'App-Name',            fr: "Nom de l'application" },
  'settings.tapForDetails': { en: 'Tap for details', de: 'Tippen für Details', fr: 'Appuyez pour plus de détails' },

  // Suggestions (used by mobile)
  'suggest.title':     { en: 'Suggest',             de: 'Vorschlagen',        fr: 'Suggérer' },
  'suggest.button':    { en: '💡 Suggest',         de: '💡 Vorschlagen',    fr: '💡 Suggérer' },
  'suggest.author':    { en: 'Your name',           de: 'Dein Name',           fr: 'Votre nom' },
  'suggest.email':     { en: 'Email (optional)',    de: 'E-Mail (optional)',   fr: 'Email (optionnel)' },
  'suggest.message':   { en: 'Your suggestion *',   de: 'Dein Vorschlag *',    fr: 'Votre suggestion *' },
  'suggest.gallery':   { en: '🖼 Gallery',         de: '🖼 Galerie',         fr: '🖼 Galerie' },
  'suggest.camera':    { en: '📷 Take Photo',      de: '📷 Foto machen',     fr: '📷 Prendre une photo' },
  'suggest.remove':    { en: 'Remove',              de: 'Entfernen',           fr: 'Supprimer' },
  'suggest.submit':    { en: 'Send',                de: 'Senden',              fr: 'Envoyer' },
  'suggest.success':   { en: 'Thank you! Your suggestion has been sent.', de: 'Danke! Dein Vorschlag wurde gesendet.', fr: 'Merci ! Votre suggestion a été envoyée.' },
  'suggest.error':     { en: 'Could not send. Please try again.', de: 'Konnte nicht senden. Bitte versuche es erneut.', fr: "Impossible d'envoyer. Veuillez réessayer." },
  'suggest.required':  { en: 'Please write a suggestion.', de: 'Bitte schreibe einen Vorschlag.', fr: 'Veuillez écrire une suggestion.' },
  'suggest.permission': { en: 'Camera permission required', de: 'Kamera-Berechtigung erforderlich', fr: 'Autorisation de la caméra requise' },

  // Errors
  'common.error':      { en: 'An error occurred',  de: 'Ein Fehler ist aufgetreten', fr: 'Une erreur est survenue' },

  // Language switcher
  'common.language':   { en: 'Language',           de: 'Sprache',             fr: 'Langue' },
};

// ── Helper function ──────────────────────────────────────────────────────────

export function getTranslations(locale: Locale) {
  const farmTypes: Record<string, string> = {};
  const days: Record<string, string> = {};
  const ui: Record<string, string> = {};

  for (const [key, value] of Object.entries(farmTypeTranslations)) {
    farmTypes[key] = value[locale];
  }
  for (const [key, value] of Object.entries(dayTranslations)) {
    days[key] = value[locale];
  }
  for (const [key, value] of Object.entries(uiTranslations)) {
    ui[key] = value[locale];
  }
  for (const [key, value] of Object.entries(productTranslations)) {
    ui[`product.${key}`] = value[locale];
  }
  for (const [key, value] of Object.entries(paymentMethodTranslations)) {
    ui[`payment.${key}`] = value[locale];
  }

  return { farmTypes, days, ui };
}