"use client";

import { useLanguage } from "../i18n/LanguageContext";

export default function HowItWorks() {
  const { t } = useLanguage();
  const steps = t.howItWorks.steps;

  return (
    <section id="how-it-works" className="py-32 bg-gray-50 scroll-mt-24 dark:bg-gray-900">

      <div className="max-w-7xl mx-auto px-6">

        <div className="text-center">

          <p className="text-blue-600 font-semibold uppercase tracking-widest dark:text-blue-400">
            {t.howItWorks.eyebrow}
          </p>

          <h2 className="mt-4 text-5xl font-bold">
            {t.howItWorks.title}
          </h2>

          <p className="mt-6 text-gray-500 text-lg max-w-2xl mx-auto dark:text-gray-400">
            {t.howItWorks.subtitle}
          </p>

        </div>

        <div className="grid md:grid-cols-4 gap-8 mt-20">

          {steps.map((step, index) => (
            <div
              key={index}
              className="rounded-3xl bg-white p-8 shadow-sm border border-gray-100 hover:-translate-y-2 hover:shadow-xl transition dark:bg-gray-950 dark:border-gray-800"
            >
              <div className="text-5xl">
                {step.emoji}
              </div>

              <h3 className="mt-6 text-2xl font-bold">
                {step.title}
              </h3>

              <p className="mt-4 text-gray-500 dark:text-gray-400">
                {step.text}
              </p>
            </div>
          ))}

        </div>

      </div>

    </section>
  );
}
