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

        <div>

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
              className="rounded-full bg-black px-8 py-4 text-lg font-semibold text-white transition hover:scale-105 dark:bg-white dark:text-black"
            >
              {t.hero.ctaStart}
            </a>

            <a
              href="#how-it-works"
              className="rounded-full border border-gray-300 px-8 py-4 text-lg font-semibold transition hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
            >
              {t.hero.ctaDemo}
            </a>

          </div>

        </div>

        {/* RIGHT */}

        <div className="rounded-3xl border border-gray-200 bg-white shadow-2xl p-8 dark:border-gray-800 dark:bg-gray-900">

          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t.hero.cardLabel}
          </p>

          <h3 className="mt-2 text-3xl font-bold">
            {t.hero.cardTitle}
          </h3>

          <p className="mt-6 text-6xl font-bold text-blue-600 dark:text-blue-400">
            92%
          </p>

          <div className="mt-6 h-3 rounded-full bg-gray-200 overflow-hidden dark:bg-gray-800">

            <div className="h-full w-[92%] rounded-full bg-blue-600 dark:bg-blue-500"></div>

          </div>

          <div className="mt-8 space-y-4">

            <div className="rounded-xl bg-green-50 p-4 dark:bg-green-500/10">
              ✅ {t.hero.strength1}
            </div>

            <div className="rounded-xl bg-green-50 p-4 dark:bg-green-500/10">
              ✅ {t.hero.strength2}
            </div>

            <div className="rounded-xl bg-yellow-50 p-4 dark:bg-yellow-500/10">
              ⚠ {t.hero.gap1}
            </div>

          </div>

        </div>

      </div>

    </section>
  );
}
