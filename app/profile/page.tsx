"use client";

import { useEffect, useState, FormEvent } from "react";
import Link from "next/link";
import { useAuth, isSupabaseConfigured } from "../auth/AuthContext";
import { createClient } from "../../lib/supabase/client";
import { useLanguage } from "../i18n/LanguageContext";

type SaveStatus = "idle" | "saving" | "saved" | "error";

export default function ProfilePage() {
  const { t } = useLanguage();
  const { user, loading: authLoading, signOut } = useAuth();

  const [displayName, setDisplayName] = useState("");
  const [nameStatus, setNameStatus] = useState<SaveStatus>("idle");
  const [nameError, setNameError] = useState<string | null>(null);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passStatus, setPassStatus] = useState<SaveStatus>("idle");
  const [passError, setPassError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setDisplayName((user.user_metadata?.full_name as string | undefined) ?? "");
    }
  }, [user]);

  async function handleSaveName(e: FormEvent) {
    e.preventDefault();
    setNameStatus("saving");
    setNameError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      data: { full_name: displayName.trim() },
    });

    if (error) {
      setNameError(error.message);
      setNameStatus("error");
      return;
    }
    setNameStatus("saved");
  }

  async function handleSavePassword(e: FormEvent) {
    e.preventDefault();
    setPassError(null);

    if (newPassword.length < 6) {
      setPassError(t.auth.passwordTooShort);
      setPassStatus("error");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassError(t.auth.passwordMismatch);
      setPassStatus("error");
      return;
    }

    setPassStatus("saving");
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      setPassError(error.message);
      setPassStatus("error");
      return;
    }
    setNewPassword("");
    setConfirmPassword("");
    setPassStatus("saved");
  }

  if (!isSupabaseConfigured) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <p className="max-w-sm text-center text-gray-500 dark:text-gray-400">{t.auth.notConfigured}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-24">
      <div className="mx-auto max-w-xl">
        <Link href="/" className="text-sm text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white">
          {t.history.backHome}
        </Link>

        <h1 className="mt-6 text-4xl font-bold">{t.auth.profile}</h1>

        {!authLoading && !user && (
          <div className="mt-10 rounded-3xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-gray-900">
            <p className="text-gray-600 dark:text-gray-300">{t.history.signInPrompt}</p>
            <Link
              href="/login"
              className="mt-4 inline-block rounded-full bg-black px-6 py-3 font-semibold text-white transition hover:scale-105 dark:bg-white dark:text-black"
            >
              {t.auth.signInTitle}
            </Link>
          </div>
        )}

        {user && (
          <div className="mt-10 space-y-6">

            <div className="rounded-3xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
              <p className="text-sm text-gray-500 dark:text-gray-400">{t.auth.emailLabel}</p>
              <p className="mt-1 font-medium">{user.email}</p>
            </div>

            <form
              onSubmit={handleSaveName}
              className="rounded-3xl border border-gray-200 bg-white p-6 space-y-4 dark:border-gray-800 dark:bg-gray-900"
            >
              <h2 className="font-semibold">{t.auth.displayNameLabel}</h2>
              <input
                type="text"
                value={displayName}
                onChange={(e) => {
                  setDisplayName(e.target.value);
                  setNameStatus("idle");
                }}
                placeholder={t.auth.displayNamePlaceholder}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-950"
              />
              {nameError && <p className="text-sm text-red-600 dark:text-red-400">{nameError}</p>}
              {nameStatus === "saved" && (
                <p className="text-sm text-green-600 dark:text-green-400">{t.auth.saved}</p>
              )}
              <button
                type="submit"
                disabled={nameStatus === "saving"}
                className="rounded-full bg-black px-6 py-2.5 text-sm font-semibold text-white transition hover:scale-105 disabled:opacity-50 dark:bg-white dark:text-black"
              >
                {nameStatus === "saving" ? t.auth.submitting : t.auth.saveChanges}
              </button>
            </form>

            <form
              onSubmit={handleSavePassword}
              className="rounded-3xl border border-gray-200 bg-white p-6 space-y-4 dark:border-gray-800 dark:bg-gray-900"
            >
              <h2 className="font-semibold">{t.auth.newPasswordLabel}</h2>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setPassStatus("idle");
                }}
                placeholder={t.auth.newPasswordLabel}
                minLength={6}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-950"
              />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setPassStatus("idle");
                }}
                placeholder={t.auth.confirmPasswordLabel}
                minLength={6}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-950"
              />
              {passError && <p className="text-sm text-red-600 dark:text-red-400">{passError}</p>}
              {passStatus === "saved" && (
                <p className="text-sm text-green-600 dark:text-green-400">{t.auth.saved}</p>
              )}
              <button
                type="submit"
                disabled={passStatus === "saving" || !newPassword}
                className="rounded-full bg-black px-6 py-2.5 text-sm font-semibold text-white transition hover:scale-105 disabled:opacity-50 dark:bg-white dark:text-black"
              >
                {passStatus === "saving" ? t.auth.submitting : t.auth.saveChanges}
              </button>
            </form>

            <button
              type="button"
              onClick={() => signOut()}
              className="text-sm font-medium text-red-500 hover:underline"
            >
              {t.auth.signOut}
            </button>

          </div>
        )}
      </div>
    </div>
  );
}
