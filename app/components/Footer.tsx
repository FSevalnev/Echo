"use client";

import Image from "next/image";
import { useLanguage } from "../i18n/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();

  return (
    // Always dark, regardless of the site's light/dark toggle — both
    // logos are designed on a dark canvas, so a fixed-dark footer keeps
    // them readable without needing separate light-mode logo files.
    <footer className="mt-auto bg-black text-gray-300">
      <div className="max-w-7xl mx-auto px-8 py-12 flex flex-col gap-10">

        <div className="flex flex-col md:flex-row items-center justify-between gap-6">

          <div className="flex items-center gap-3">
            <div className="relative h-12 w-12 shrink-0">
              <Image src="/brand/echo-logo.png" alt="Echo" fill className="object-contain" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              Echo
            </span>
          </div>

          <nav className="flex flex-wrap justify-center gap-8 text-sm font-medium">
            <a href="#top" className="hover:text-white transition">
              {t.nav.home}
            </a>

            <a href="#how-it-works" className="hover:text-white transition">
              {t.nav.howItWorks}
            </a>

            <a href="#features" className="hover:text-white transition">
              {t.nav.features}
            </a>

            <a href="#try" className="hover:text-white transition">
              {t.nav.tryEcho}
            </a>
          </nav>

        </div>

        <p className="max-w-sm text-sm text-gray-400">
          {t.footer.tagline}
        </p>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-t border-gray-800 pt-6 text-sm text-gray-500">

          <p>
            © {new Date().getFullYear()} Echo. {t.footer.rightsReserved}
          </p>

          <div className="flex items-center gap-2">
            <span>Built by</span>
            <div className="relative h-6 w-6 shrink-0">
              <Image src="/brand/brainexe-logo.png" alt="Brain.exe" fill className="object-contain" />
            </div>
            <span className="font-semibold text-gray-300">Brain.exe</span>
          </div>

        </div>

      </div>
    </footer>
  );
}
