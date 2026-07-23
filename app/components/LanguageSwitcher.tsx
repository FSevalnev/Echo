"use client";

import { useLanguage } from "../i18n/LanguageContext";
import { Lang } from "../i18n/translations";

const LANGS: Lang[] = ["en", "ru", "tg"];

// Display-only labels — the underlying Lang value ("tg", used as the
// dictionary key and the localStorage value) is unchanged, only what's
// shown on the button is different, since "TJ" is the more familiar
// abbreviation for Tajik than the ISO code "tg".
const DISPLAY_LABELS: Record<Lang, string> = {
  en: "EN",
  ru: "RU",
  tg: "TJ",
};

export default function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();

  return (
    <div className="flex items-center gap-1 rounded-full border border-gray-300 p-1 text-xs font-semibold dark:border-gray-700">
      {LANGS.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          aria-label={`Switch language to ${l}`}
          aria-pressed={lang === l}
          className={`rounded-full px-3 py-1 transition ${
            lang === l
              ? "bg-black text-white dark:bg-white dark:text-black"
              : "text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white"
          }`}
        >
          {DISPLAY_LABELS[l]}
        </button>
      ))}
    </div>
  );
}
