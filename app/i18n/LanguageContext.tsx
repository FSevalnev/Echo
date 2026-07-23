"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { translations, Lang, Dictionary } from "./translations";

type LanguageContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: Dictionary;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function isLang(value: string | null): value is Lang {
  return value === "en" || value === "ru" || value === "tg";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Server always renders "en"; the real preference (saved choice or
  // browser language) is applied client-side right after mount. This
  // avoids a hydration mismatch at the cost of a brief flash of English
  // on first load, same trade-off as the dark mode toggle.
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const stored = localStorage.getItem("lang");

    if (isLang(stored)) {
      setLangState(stored);
      document.documentElement.lang = stored;
      return;
    }

    const browserLang = navigator.language.slice(0, 2).toLowerCase();
    if (browserLang === "ru") {
      setLangState("ru");
      document.documentElement.lang = "ru";
    } else if (browserLang === "tg") {
      setLangState("tg");
      document.documentElement.lang = "tg";
    }
  }, []);

  function setLang(next: Lang) {
    setLangState(next);
    localStorage.setItem("lang", next);
    document.documentElement.lang = next;
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: translations[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return ctx;
}
