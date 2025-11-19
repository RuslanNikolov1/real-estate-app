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

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'bg',
    defaultNS: 'translation',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;

















