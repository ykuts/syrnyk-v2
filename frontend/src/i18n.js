import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

// Initialize i18next
i18n
  // Load translations from /public/locales
  .use(Backend)
  // Detect user language
  .use(LanguageDetector)
  // Pass i18n instance to react-i18next
  .use(initReactI18next)
  .init({
    // Debug mode in development
    debug: process.env.NODE_ENV === 'development',
    
    // Default language
    fallbackLng: 'uk',
    
    // Supported languages
    supportedLngs: ['uk', 'en', 'fr'],
    
    // Default namespace
    defaultNS: 'common',
    
    // Key format options
    keySeparator: '.',
    
    // Backend configuration for loading translations
    backend: {
      // Path to load resources from
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    
    // Interpolation options
    interpolation: {
      // React already safes from XSS
      escapeValue: false,
    },

    // Fallback rules - if a key isn't found in the current language
    fallbackLng: {
      'fr-FR': ['fr'],
      'en-US': ['en'],
      'uk-UA': ['uk'],
      default: ['uk']
    },

    // Language detection options
    detection: {
      // Order and from where user language should be detected
      order: ['localStorage', 'navigator'],
      
      // Cache language in localStorage
      caches: ['localStorage'],
      
      // Only detect from navigator once
      lookupFromNavigatorOnce: true,
    },
  });

export default i18n;