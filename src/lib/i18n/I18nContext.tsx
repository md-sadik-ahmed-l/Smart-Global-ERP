"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { LanguageCode, getLanguage } from "./languages";
import { translations, type TranslationKey } from "./translations";

interface I18nContextType {
  lang: LanguageCode;
  setLang: (lang: LanguageCode) => void;
  t: (key: TranslationKey) => string;
  dir: "ltr" | "rtl";
}

const I18nContext = createContext<I18nContextType>({
  lang: "en",
  setLang: () => {},
  t: (key) => key,
  dir: "ltr",
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<LanguageCode>("en");

  // Load saved language from localStorage
  useEffect(() => {
    const saved = (typeof window !== "undefined" && localStorage.getItem("erp-lang")) as LanguageCode;
    if (saved && translations[saved]) {
      setLangState(saved);
    }
  }, []);

  // Update document direction + lang attribute
  useEffect(() => {
    const langInfo = getLanguage(lang);
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
      document.documentElement.dir = langInfo.dir;
    }
  }, [lang]);

  const setLang = (newLang: LanguageCode) => {
    setLangState(newLang);
    if (typeof window !== "undefined") {
      localStorage.setItem("erp-lang", newLang);
    }
  };

  const t = (key: TranslationKey): string => {
    const translation = translations[lang]?.[key];
    if (translation) return translation;
    // Fallback to English
    return translations.en?.[key] || key;
  };

  const langInfo = getLanguage(lang);

  return (
    <I18nContext.Provider value={{ lang, setLang, t, dir: langInfo.dir }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
