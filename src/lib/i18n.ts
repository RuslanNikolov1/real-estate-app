import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import bgTranslations from '../locales/bg/common.json';
import enTranslations from '../locales/en/common.json';
import ruTranslations from '../locales/ru/common.json';
import deTranslations from '../locales/de/common.json';

const resources = {
  bg: {
    translation: bgTranslations,
  },
  en: {
    translation: enTranslations,
  },
  ru: {
    translation: ruTranslations,
  },
  de: {
    translation: deTranslations,
  },
};

// #region agent log
const initIsServer = typeof window === 'undefined';
// #endregion

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'bg',
    defaultNS: 'translation',
    interpolation: {
      escapeValue: true, // Enable HTML escaping to prevent XSS attacks
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

// #region agent log
const initLanguage = i18n.language || i18n.resolvedLanguage || 'unknown';
const initResolvedLanguage = i18n.resolvedLanguage || 'unknown';
const hasNavigator = typeof navigator !== 'undefined';
const navigatorLang = hasNavigator ? (navigator.language || 'none') : 'N/A';
const hasLocalStorage = typeof window !== 'undefined' && typeof localStorage !== 'undefined';
const localStorageLang = hasLocalStorage ? (localStorage.getItem('i18nextLng') || 'none') : 'N/A';
if (typeof globalThis !== 'undefined' && typeof globalThis.fetch !== 'undefined') {
  globalThis.fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'i18n.ts:39',message:'i18n.init complete',data:{initLanguage,initResolvedLanguage,initIsServer,fallbackLng:'bg',navigatorLang,localStorageLang},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'A,C,E'})}).catch(()=>{});
}
// #endregion

export default i18n;




















