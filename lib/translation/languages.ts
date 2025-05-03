// lib/translation/languages.ts
// Centralized configuration for all supported translation languages

// List of all supported languages with their codes and metadata
export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', primary: true },
  { code: 'es', name: 'Spanish', primary: true },
  { code: 'fr', name: 'French', primary: true },
  { code: 'de', name: 'German', primary: true },
  { code: 'it', name: 'Italian', primary: true },
  { code: 'zh', name: 'Chinese', primary: true },
  { code: 'ja', name: 'Japanese', primary: true },
  { code: 'ru', name: 'Russian', primary: true },
  { code: 'ar', name: 'Arabic', primary: true },
  { code: 'fa', name: 'Farsi', primary: true },
  { code: 'eme', name: 'Early Modern English', primary: false },
  { code: 'emoji', name: 'Emoji/ASCII', primary: false },
  { code: 'llmese', name: 'LLMese', primary: false },
];

// Language metadata with information about writing systems and script directions
export const LANGUAGE_METADATA = {
  // RTL languages
  ar: { direction: 'rtl', script: 'Arabic' },
  fa: { direction: 'rtl', script: 'Arabic' },
  
  // Common Latin-script languages
  en: { direction: 'ltr', script: 'Latin' },
  es: { direction: 'ltr', script: 'Latin' },
  fr: { direction: 'ltr', script: 'Latin' },
  de: { direction: 'ltr', script: 'Latin' },
  it: { direction: 'ltr', script: 'Latin' },
  
  // Asian languages
  zh: { direction: 'ltr', script: 'Han' },
  ja: { direction: 'ltr', script: 'Japanese' },
  
  // Cyrillic
  ru: { direction: 'ltr', script: 'Cyrillic' },
  
  // Special modes
  eme: { direction: 'ltr', script: 'Latin' },
  emoji: { direction: 'ltr', script: 'Special' },
  llmese: { direction: 'ltr', script: 'Special' },
};

// Helper functions
export function getLanguageByCode(code: string) {
  return SUPPORTED_LANGUAGES.find(lang => lang.code === code);
}

export function isRTL(code: string): boolean {
  return LANGUAGE_METADATA[code as keyof typeof LANGUAGE_METADATA]?.direction === 'rtl';
}

export function getPrimaryLanguages() {
  return SUPPORTED_LANGUAGES.filter(lang => lang.primary);
}

export function getSecondaryLanguages() {
  return SUPPORTED_LANGUAGES.filter(lang => !lang.primary);
}