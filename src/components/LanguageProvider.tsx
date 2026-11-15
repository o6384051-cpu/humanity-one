"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type AppLanguage = "ar" | "en";

type LanguageContextValue = {
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => void;
  toggleLanguage: () => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);
const LANGUAGE_KEY = "humanity-one-language-v1";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<AppLanguage>("ar");

  useEffect(() => {
    const saved = window.localStorage.getItem(LANGUAGE_KEY);
    if (saved === "ar" || saved === "en") setLanguage(saved);
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    window.localStorage.setItem(LANGUAGE_KEY, language);
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      toggleLanguage: () => setLanguage((current) => current === "ar" ? "en" : "ar"),
    }),
    [language],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used inside LanguageProvider");
  return context;
}

export function LanguageSwitcher() {
  const { language, toggleLanguage } = useLanguage();
  return (
    <button
      type="button"
      onClick={toggleLanguage}
      aria-label={language === "ar" ? "Switch language to English" : "تغيير اللغة إلى العربية"}
      title={language === "ar" ? "English" : "العربية"}
      className="ho-language-switcher"
    >
      <span aria-hidden="true">文</span>
      {language === "ar" ? "English" : "العربية"}
    </button>
  );
}
