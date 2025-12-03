// i18n/config.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Dil dosyalarını import et
import de from './locales/de.json';
import en from './locales/en.json';
import es from './locales/es.json';
import tr from './locales/tr.json';
import ru from './locales/ru.json';
import ar from './locales/ar.json';

const resources = {
  de: { translation: de },
  en: { translation: en },
  es: { translation: es },
  tr: { translation: tr },
  ru: { translation: ru },
  ar: { translation: ar },
};

i18n
  .use(LanguageDetector) // Tarayıcı dilini otomatik algıla
  .use(initReactI18next) // React için i18n'i başlat
  .init({
    resources,
    lng: 'de', // Varsayılan dil: Almanca (tarayıcı dilinden bağımsız)
    fallbackLng: 'de', // Fallback dil: Almanca
    debug: false, // Production'da false - hata ayıklama için true yapabilirsiniz
    interpolation: {
      escapeValue: false, // React zaten XSS koruması sağlıyor
    },
    detection: {
      order: ['localStorage', 'querystring', 'htmlTag'], // Önce localStorage, sonra URL query, sonra HTML tag
      caches: ['localStorage'], // Dil tercihini localStorage'da sakla
      lookupLocalStorage: 'i18nextLng', // LocalStorage key
      // navigator'ı kaldırdık - tarayıcı dilini otomatik algılamasın
    },
    react: {
      useSuspense: false, // Suspense kullanma
    },
  });

export default i18n;

