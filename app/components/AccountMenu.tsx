"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAuth, isSupabaseConfigured } from "../auth/AuthContext";
import { useLanguage } from "../i18n/LanguageContext";

export default function AccountMenu() {
  const { t } = useLanguage();
  const { user, loading, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close the dropdown on any click outside it, so it behaves like a
  // normal menu instead of staying open until the user hits a link.
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // No Supabase project configured yet — hide account UI entirely
  // rather than showing a broken sign-in button.
  if (!isSupabaseConfigured) return null;

  if (loading) {
    return <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-gray-100 dark:bg-gray-800" />;
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

  const displayName = (user.user_metadata?.full_name as string | undefined) || user.email || "?";
  const avatarUrl = user.user_metadata?.avatar_url as string | undefined;
  const initial = displayName.trim().charAt(0).toUpperCase() || "?";

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={t.auth.profile}
        aria-expanded={open}
        title={user.email ?? undefined}
        className="grid h-10 w-10 place-items-center overflow-hidden rounded-full bg-black text-sm font-semibold text-white transition hover:scale-105 dark:bg-white dark:text-black"
      >
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          initial
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-56 rounded-2xl border border-gray-200 bg-white p-2 shadow-xl dark:border-gray-800 dark:bg-gray-900">
          <p className="truncate px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
            {displayName}
          </p>

          <Link
            href="/profile"
            onClick={() => setOpen(false)}
            className="block rounded-xl px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            {t.auth.profile}
          </Link>

          <Link
            href="/history"
            onClick={() => setOpen(false)}
            className="block rounded-xl px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            {t.auth.history}
          </Link>

          <button
            type="button"
            onClick={() => {
              setOpen(false);
              signOut();
            }}
            className="block w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
          >
            {t.auth.signOut}
          </button>
        </div>
      )}
    </div>
  );
}
