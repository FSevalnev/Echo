"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "../../lib/supabase/client";
import { useLanguage } from "../i18n/LanguageContext";
import { isSupabaseConfigured } from "../auth/AuthContext";

type FormMode = "signIn" | "signUp";

export default function LoginPage() {
  const { t } = useLanguage();
  const router = useRouter();

  const [formMode, setFormMode] = useState<FormMode>("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "checkEmail">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setStatus("loading");

    const supabase = createClient();

    if (formMode === "signIn") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
        setStatus("idle");
        return;
      }
      router.push("/");
      router.refresh();
    } else {
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) {
        setError(error.message);
        setStatus("idle");
        return;
      }
      // If email confirmation is on, there's no session yet — tell the
      // user to check their inbox instead of silently doing nothing.
      if (!data.session) {
        setStatus("checkEmail");
      } else {
        router.push("/");
        router.refresh();
      }
    }
  }

  async function handleGoogle() {
    setError(null);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  if (!isSupabaseConfigured) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <p className="max-w-sm text-center text-gray-500 dark:text-gray-400">
          {t.auth.notConfigured}
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-24">
      <div className="w-full max-w-sm rounded-3xl border border-gray-200 bg-white p-8 shadow-2xl dark:border-gray-800 dark:bg-gray-900">
        <Link href="/" className="text-sm text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white">
          ← {t.auth.backHome}
        </Link>

        <h1 className="mt-6 text-2xl font-bold">
          {formMode === "signIn" ? t.auth.signInTitle : t.auth.signUpTitle}
        </h1>

        {status === "checkEmail" ? (
          <p className="mt-6 text-gray-600 dark:text-gray-300">{t.auth.checkEmail}</p>
        ) : (
          <>
            <button
              type="button"
              onClick={handleGoogle}
              className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl border border-gray-300 px-4 py-3 font-semibold transition hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.62Z" />
                <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.98v2.33A9 9 0 0 0 9 18Z" />
                <path fill="#FBBC05" d="M3.95 10.7A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.17.28-1.7V4.97H.98A9 9 0 0 0 0 9c0 1.45.35 2.83.98 4.03l2.97-2.33Z" />
                <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .98 4.97l2.97 2.33C4.66 5.17 6.65 3.58 9 3.58Z" />
              </svg>
              {t.auth.continueWithGoogle}
            </button>

            <div className="my-6 flex items-center gap-3 text-xs text-gray-400 dark:text-gray-600">
              <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
              {t.auth.orDivider}
              <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {t.auth.emailLabel}
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-950"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {t.auth.passwordLabel}
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-950"
                />
              </div>

              {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full rounded-full bg-black px-8 py-3 font-semibold text-white transition hover:scale-[1.02] disabled:opacity-50 dark:bg-white dark:text-black"
              >
                {status === "loading"
                  ? t.auth.submitting
                  : formMode === "signIn"
                  ? t.auth.signInSubmit
                  : t.auth.signUpSubmit}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
              {formMode === "signIn" ? t.auth.noAccount : t.auth.haveAccount}{" "}
              <button
                type="button"
                onClick={() => {
                  setFormMode(formMode === "signIn" ? "signUp" : "signIn");
                  setError(null);
                }}
                className="font-semibold text-blue-600 hover:underline dark:text-blue-400"
              >
                {formMode === "signIn" ? t.auth.signUpTitle : t.auth.signInTitle}
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
