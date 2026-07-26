"use client";

import Image from "next/image";
import { useLanguage } from "../i18n/LanguageContext";

export default function Hero() {
  const { t } = useLanguage();

  return (
    <section id="top" className="relative flex min-h-screen items-center justify-center px-6 pt-24 scroll-mt-24">

      {/* Background — light-mode and dark-mode artwork, swapped via the
          `dark:` variant. Files live in public/brand/ (see README note). */}
      <div className="absolute inset-0 -z-10 overflow-hidden bg-white dark:bg-black">
        <Image
          src="/brand/hero-bg-light.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover dark:hidden"
        />
        <Image
          src="/brand/hero-bg-dark.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="hidden object-cover dark:block"
        />
      </div>

      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">

        {/* LEFT */}

        <div className="animate-fade-in-up">

          <div className="inline-flex items-center rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
            {t.hero.badge}
          </div>

          <h1 className="mt-8 text-5xl md:text-7xl font-extrabold leading-tight tracking-tight">

            {t.hero.titleLine1}

            <span className="text-blue-600 dark:text-blue-400">
              {t.hero.titleHighlight}
            </span>

          </h1>

          <p className="mt-8 text-xl leading-8 text-gray-600 max-w-xl dark:text-gray-400">
            {t.hero.subtitle}
          </p>

          <div className="mt-12 flex flex-wrap gap-5">

            <a
              href="#try"
              className="rounded-full bg-black px-8 py-4 text-lg font-semibold text-white transition duration-300 ease-out hover:scale-105 hover:shadow-xl active:scale-100 dark:bg-white dark:text-black"
            >
              {t.hero.ctaStart}
            </a>

            <a
              href="#how-it-works"
              className="rounded-full border border-gray-300 px-8 py-4 text-lg font-semibold transition duration-300 ease-out hover:scale-105 hover:bg-gray-100 active:scale-100 dark:border-gray-700 dark:hover:bg-gray-800"
            >
              {t.hero.ctaDemo}
            </a>

          </div>

        </div>

        {/* RIGHT */}

        <div
          className="animate-fade-in-up rounded-3xl border border-gray-200/80 bg-white p-6 shadow-[0_8px_40px_-12px_rgba(15,23,42,0.18)] ring-1 ring-black/5 transition-shadow duration-500 hover:shadow-[0_20px_60px_-15px_rgba(37,99,235,0.35)] sm:p-8 dark:border-gray-800 dark:bg-gray-900 dark:ring-white/5"
          style={{ animationDelay: "150ms" }}
        >

          <div className="flex items-center gap-2">
            <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-emerald-500" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t.hero.cardLabel}
            </p>
          </div>

          <h3 className="mt-2 text-2xl font-bold sm:text-3xl">
            {t.hero.cardTitle}
          </h3>

          <p className="mt-6 bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-5xl font-bold text-transparent sm:text-6xl dark:from-blue-400 dark:to-indigo-400">
            92%
          </p>

          <div className="mt-6 h-3 rounded-full bg-gray-200 overflow-hidden dark:bg-gray-800">

            <div className="animate-grow-bar h-full w-[92%] rounded-full bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-blue-500 dark:to-indigo-400"></div>

          </div>

          <div className="mt-8 space-y-3">

            <div className="flex items-start gap-3 rounded-xl bg-green-50 p-4 dark:bg-green-500/10">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-emerald-500 text-xs font-bold text-white">
                ✓
              </span>
              <span className="text-sm leading-snug text-gray-700 dark:text-gray-200">
                {t.hero.strength1}
              </span>
            </div>

            <div className="flex items-start gap-3 rounded-xl bg-green-50 p-4 dark:bg-green-500/10">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-emerald-500 text-xs font-bold text-white">
                ✓
              </span>
              <span className="text-sm leading-snug text-gray-700 dark:text-gray-200">
                {t.hero.strength2}
              </span>
            </div>

            <div className="flex items-start gap-3 rounded-xl bg-yellow-50 p-4 dark:bg-yellow-500/10">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-yellow-500 text-xs font-bold text-white">
                !
              </span>
              <span className="text-sm leading-snug text-gray-700 dark:text-gray-200">
                {t.hero.gap1}
              </span>
            </div>

          </div>

        </div>

      </div>

    </section>
  );
}
