import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "../locales/en.json";
import fr from "../locales/fr.json";
import ar from "../locales/ar.json";

const resources = {
  en: { translation: en },
  fr: { translation: fr },
  ar: { translation: ar }
};

const saved = typeof window !== "undefined" ? localStorage.getItem("appLang") : null;
const initialLng = saved || "en";

i18n.use(initReactI18next).init({
  resources,
  lng: initialLng,
  fallbackLng: "en",
  supportedLngs: ["en", "fr", "ar"],
  interpolation: {
    escapeValue: false
  }
});

// Ensure document direction is correct on load
if (typeof document !== "undefined") {
  const dir = i18n.language === "ar" ? "rtl" : "ltr";
  document.documentElement.dir = dir;
  document.documentElement.lang = i18n.language;
}

export default i18n;
