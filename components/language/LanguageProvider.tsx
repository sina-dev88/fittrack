"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  translations,
  type Language,
  type TranslationKey,
} from "@/lib/i18n/translations";

const LANGUAGE_STORAGE_KEY = "fittrack-language";

type LanguageContextValue = {
  language: Language;
  isRTL: boolean;
  ready: boolean;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey) => string;
};

const LanguageContext =
  createContext<LanguageContextValue | null>(null);

export default function LanguageProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [language, setLanguageState] = useState<Language>("en");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const savedLanguage = window.localStorage.getItem(
        LANGUAGE_STORAGE_KEY,
      );

      if (savedLanguage === "fa" || savedLanguage === "en") {
        setLanguageState(savedLanguage);
      }
    } catch {
      // The app remains usable if browser storage is unavailable.
    }

    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;

    const root = document.documentElement;
    root.lang = language;
    root.dir = language === "fa" ? "rtl" : "ltr";

    try {
      window.localStorage.setItem(
        LANGUAGE_STORAGE_KEY,
        language,
      );
    } catch {
      // Language still works for the current session.
    }
  }, [language, ready]);

  const setLanguage = useCallback((nextLanguage: Language) => {
    setLanguageState(nextLanguage);
  }, []);

  const t = useCallback(
    (key: TranslationKey) => translations[language][key],
    [language],
  );

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      isRTL: language === "fa",
      ready,
      setLanguage,
      t,
    }),
    [language, ready, setLanguage, t],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error(
      "useLanguage must be used inside LanguageProvider.",
    );
  }

  return context;
}