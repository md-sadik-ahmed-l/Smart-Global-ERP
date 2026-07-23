"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { LanguageCode, getLanguage } from "./languages";
import { translations, TranslationKey } from "./translations";

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

  useEffect(() => {
    const saved = localStorage.getItem("erp-lang") as LanguageCode;
    if (saved && translations[saved]) {
      setLangState(saved);
    }
  }, []);

  useEffect(() => {
    const language = getLanguage(lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = language.dir;
    localStorage.setItem("erp-lang", lang);
  }, [lang]);

  const setLang = (newLang: LanguageCode) => {
    setLangState(newLang);
  };

  const t = (key: TranslationKey): string => {
    const dict = translations[lang] || translations.en;
    return dict[key] || translations.en[key] || key;
  };

  const language = getLanguage(lang);

  return (
    <I18nContext.Provider value={{ lang, setLang, t, dir: language.dir }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
