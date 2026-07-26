"use client";

import { useState } from "react";
import Image from "next/image";
import ThemeToggle from "./ThemeToggle";
import LanguageSwitcher from "./LanguageSwitcher";
import AccountMenu from "./AccountMenu";
import { useLanguage } from "../i18n/LanguageContext";

export default function Navbar() {
  const { t } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);

  // On phones there isn't room for nav links + language switcher + theme
  // toggle + account menu + CTA all in one row (they used to silently
  // overflow past the edge of the screen). Below `md`, everything except
  // the logo and a hamburger button collapses into a dropdown panel
  // instead of fighting for space in the header row.
  return (
    <header className="fixed top-0 left-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 z-50 dark:bg-black/60 dark:border-gray-800">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-8 h-20">

        <a href="#top" aria-label="Echo — home" onClick={() => setMobileOpen(false)}>
          <span className="relative inline-block h-14 w-14">
            {/* Wordmark is baked into the logo art, so no separate text
                label is needed here — just swap for theme contrast. */}
            <Image
              src="/brand/echo-logo-light.png"
              alt="Echo"
              fill
              className="object-contain dark:hidden"
            />
            <Image
              src="/brand/echo-logo.png"
              alt="Echo"
              fill
              className="hidden object-contain dark:block"
            />
          </span>
        </a>

        <nav className="hidden md:flex gap-10 text-gray-600 font-medium dark:text-gray-400">
          <a href="#top" className="hover:text-black transition dark:hover:text-white">
            {t.nav.home}
          </a>

          <a href="#how-it-works" className="hover:text-black transition dark:hover:text-white">
            {t.nav.howItWorks}
          </a>

          <a href="#features" className="hover:text-black transition dark:hover:text-white">
            {t.nav.features}
          </a>
        </nav>

        {/* Desktop right-side cluster — unchanged, just hidden on mobile */}
        <div className="hidden md:flex items-center gap-3">

          <LanguageSwitcher />

          <ThemeToggle />

          <AccountMenu />

          <a
            href="#try"
            className="bg-black text-white rounded-full px-6 py-3 hover:scale-105 transition dark:bg-white dark:text-black whitespace-nowrap"
          >
            {t.nav.tryEcho}
          </a>

        </div>

        {/* Mobile hamburger — everything else lives in the dropdown below */}
        <button
          type="button"
          onClick={() => setMobileOpen((open) => !open)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          className="grid h-10 w-10 place-items-center rounded-full border border-gray-300 text-xl md:hidden dark:border-gray-700"
        >
          {mobileOpen ? "✕" : "☰"}
        </button>

      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 dark:border-gray-800 dark:bg-black">

          <nav className="flex flex-col gap-4 text-gray-600 font-medium dark:text-gray-400">
            <a href="#top" onClick={() => setMobileOpen(false)} className="hover:text-black transition dark:hover:text-white">
              {t.nav.home}
            </a>
            <a href="#how-it-works" onClick={() => setMobileOpen(false)} className="hover:text-black transition dark:hover:text-white">
              {t.nav.howItWorks}
            </a>
            <a href="#features" onClick={() => setMobileOpen(false)} className="hover:text-black transition dark:hover:text-white">
              {t.nav.features}
            </a>
          </nav>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <LanguageSwitcher />
            <ThemeToggle />
            <AccountMenu />
          </div>

          <a
            href="#try"
            onClick={() => setMobileOpen(false)}
            className="mt-5 block w-full rounded-full bg-black px-6 py-3 text-center text-white transition dark:bg-white dark:text-black"
          >
            {t.nav.tryEcho}
          </a>

        </div>
      )}
    </header>
  );
}
