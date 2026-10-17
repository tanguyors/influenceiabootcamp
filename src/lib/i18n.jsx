import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { TRANSLATIONS } from "@/lib/translations";

const STORAGE_KEY = "influenceia.lang";

export const LANGUAGES = [
  { id: "fr", label: "FR" },
  { id: "en", label: "EN" },
];

export const LOCALES = { fr: "fr-FR", en: "en-US" };

const LanguageContext = createContext(null);

// Langue mémorisée, sinon celle du navigateur (anglais → EN, sinon FR).
function detectLang() {
  const stored = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
  if (stored === "fr" || stored === "en") return stored;
  const browser = typeof navigator !== "undefined" ? (navigator.language || "").toLowerCase() : "";
  return browser.startsWith("en") ? "en" : "fr";
}

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(detectLang);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const value = useMemo(() => {
    const dictionary = TRANSLATIONS[lang] || TRANSLATIONS.fr;
    const t = (key, vars) => {
      const raw = dictionary[key] ?? TRANSLATIONS.fr[key] ?? key;
      if (!vars) return raw;
      return Object.keys(vars).reduce((acc, name) => acc.replaceAll(`{${name}}`, vars[name]), raw);
    };
    return { lang, setLang, locale: LOCALES[lang] || LOCALES.fr, t };
  }, [lang]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useI18n() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useI18n doit être utilisé dans LanguageProvider");
  return context;
}