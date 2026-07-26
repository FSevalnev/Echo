"use client";

import Link from "next/link";
import { useAuth, isSupabaseConfigured } from "../auth/AuthContext";
import { useLanguage } from "../i18n/LanguageContext";

export default function AccountMenu() {
  const { t } = useLanguage();
  const { user, loading, signOut } = useAuth();

  // No Supabase project configured yet — hide account UI entirely
  // rather than showing a broken sign-in button.
  if (!isSupabaseConfigured) return null;

  if (loading) {
    return <div className="h-9 w-9 shrink-0 animate-pulse rounded-full bg-gray-100 dark:bg-gray-800" />;
  }

  if (!user) {
    return (
      <Link
        href="/login"
        className="whitespace-nowrap rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold transition hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
      >
        {t.auth.signInTitle}
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link
        href="/history"
        className="whitespace-nowrap text-sm font-medium text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white"
      >
        {t.auth.history}
      </Link>
      <button
        type="button"
        onClick={() => signOut()}
        title={user.email ?? undefined}
        className="whitespace-nowrap rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold transition hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
      >
        {t.auth.signOut}
      </button>
    </div>
  );
}
