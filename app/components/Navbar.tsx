"use client";

import Image from "next/image";
import ThemeToggle from "./ThemeToggle";
import LanguageSwitcher from "./LanguageSwitcher";
import AccountMenu from "./AccountMenu";
import { useLanguage } from "../i18n/LanguageContext";

export default function Navbar() {
  const { t } = useLanguage();

  return (
    <header className="fixed top-0 left-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 z-50 dark:bg-black/60 dark:border-gray-800">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-8 h-20">

        <a href="#top" aria-label="Echo — home">
          <span className="relative inline-block h-12 w-12">
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

        <div className="flex items-center gap-3">

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

      </div>
    </header>
  );
}
