"use client";

import { useEffect, useState, FormEvent, ChangeEvent } from "react";
import Link from "next/link";
import { useAuth, isSupabaseConfigured } from "../auth/AuthContext";
import { createClient } from "../../lib/supabase/client";
import { useLanguage } from "../i18n/LanguageContext";

type SaveStatus = "idle" | "saving" | "saved" | "error";

const AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_AVATAR_BYTES = 5 * 1024 * 1024; // 5MB

export default function ProfilePage() {
  const { t } = useLanguage();
  const { user, loading: authLoading, signOut } = useAuth();

  const [displayName, setDisplayName] = useState("");
  const [nameStatus, setNameStatus] = useState<SaveStatus>("idle");
  const [nameError, setNameError] = useState<string | null>(null);

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarStatus, setAvatarStatus] = useState<SaveStatus>("idle");
  const [avatarError, setAvatarError] = useState<string | null>(null);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passStatus, setPassStatus] = useState<SaveStatus>("idle");
  const [passError, setPassError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setDisplayName((user.user_metadata?.full_name as string | undefined) ?? "");
      setAvatarUrl((user.user_metadata?.avatar_url as string | undefined) ?? null);
    }
  }, [user]);

  async function handleAvatarChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !user) return;

    setAvatarError(null);

    if (!AVATAR_TYPES.includes(file.type)) {
      setAvatarError(t.auth.avatarTypeError);
      setAvatarStatus("error");
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setAvatarError(t.auth.avatarSizeError);
      setAvatarStatus("error");
      return;
    }

    setAvatarStatus("saving");
    const supabase = createClient();
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${user.id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true, cacheControl: "3600" });

    if (uploadError) {
      setAvatarError(uploadError.message);
      setAvatarStatus("error");
      return;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    // Cache-bust so the browser (and other people viewing the avatar)
    // fetch the new image instead of a stale cached one at the same URL.
    const publicUrl = `${data.publicUrl}?t=${Date.now()}`;

    const { error: updateError } = await supabase.auth.updateUser({
      data: { avatar_url: publicUrl },
    });

    if (updateError) {
      setAvatarError(updateError.message);
      setAvatarStatus("error");
      return;
    }

    setAvatarUrl(publicUrl);
    setAvatarStatus("saved");
  }

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
              <p className="text-sm text-gray-500 dark:text-gray-400">{t.auth.avatarLabel}</p>
              <div className="mt-3 flex items-center gap-4">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="grid h-full w-full place-items-center text-2xl font-semibold text-gray-500 dark:text-gray-400">
                      {(displayName || user.email || "?").trim().charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="avatar-upload"
                    className="inline-block cursor-pointer rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold transition hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
                  >
                    {avatarStatus === "saving" ? t.auth.submitting : t.auth.avatarChoose}
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                  {avatarError && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">{avatarError}</p>
                  )}
                  {avatarStatus === "saved" && (
                    <p className="mt-2 text-sm text-green-600 dark:text-green-400">{t.auth.saved}</p>
                  )}
                </div>
              </div>
            </div>

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
