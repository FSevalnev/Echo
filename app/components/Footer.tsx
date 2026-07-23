"use client";

import { useLanguage } from "../i18n/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="mt-auto border-t border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-8 py-12 flex flex-col md:flex-row items-center justify-between gap-6">

        <div>
          <h2 className="text-xl font-bold tracking-tight">
            Echo
          </h2>
          <p className="mt-2 text-sm text-gray-500 max-w-sm dark:text-gray-400">
            {t.footer.tagline}
          </p>
        </div>

        <nav className="flex gap-8 text-sm text-gray-600 font-medium dark:text-gray-400">
          <a href="#top" className="hover:text-black transition dark:hover:text-white">
            {t.nav.home}
          </a>

          <a href="#how-it-works" className="hover:text-black transition dark:hover:text-white">
            {t.nav.howItWorks}
          </a>

          <a href="#features" className="hover:text-black transition dark:hover:text-white">
            {t.nav.features}
          </a>

          <a href="#try" className="hover:text-black transition dark:hover:text-white">
            {t.nav.tryEcho}
          </a>
        </nav>

        <p className="text-sm text-gray-400 dark:text-gray-600">
          © {new Date().getFullYear()} Echo. {t.footer.rightsReserved}
        </p>

      </div>
    </footer>
  );
}
