"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth, isSupabaseConfigured } from "../auth/AuthContext";
import { createClient } from "../../lib/supabase/client";
import { useLanguage } from "../i18n/LanguageContext";

type AttemptRow = {
  id: string;
  topic: string;
  score: number;
  mode: string;
  created_at: string;
};

type TopicGroup = {
  topic: string;
  entries: AttemptRow[];
};

function Sparkline({ scores }: { scores: number[] }) {
  const width = 240;
  const height = 56;
  const padding = 4;

  if (scores.length < 2) {
    return (
      <div className="flex h-14 items-center text-xs text-gray-400 dark:text-gray-600">
        {scores.length === 1 ? `${scores[0]}%` : "—"}
      </div>
    );
  }

  const step = (width - padding * 2) / (scores.length - 1);
  const points = scores
    .map((score, i) => {
      const x = padding + i * step;
      const y = height - padding - (score / 100) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-blue-600 dark:text-blue-400"
      />
      {scores.map((score, i) => {
        const x = padding + i * step;
        const y = height - padding - (score / 100) * (height - padding * 2);
        return <circle key={i} cx={x} cy={y} r={2.5} className="fill-blue-600 dark:fill-blue-400" />;
      })}
    </svg>
  );
}

export default function HistoryPage() {
  const { t } = useLanguage();
  const { user, loading: authLoading } = useAuth();

  const [groups, setGroups] = useState<TopicGroup[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      const supabase = createClient();
      const { data } = await supabase
        .from("attempts")
        .select("id, topic, score, mode, created_at")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: true });

      if (cancelled) return;

      const byTopic = new Map<string, TopicGroup>();
      (data ?? []).forEach((row) => {
        const key = row.topic.trim().toLowerCase();
        const existing = byTopic.get(key);
        if (existing) {
          existing.entries.push(row);
        } else {
          byTopic.set(key, { topic: row.topic, entries: [row] });
        }
      });

      // Most recently practiced topic first.
      const sorted = Array.from(byTopic.values()).sort((a, b) => {
        const aLast = a.entries[a.entries.length - 1].created_at;
        const bLast = b.entries[b.entries.length - 1].created_at;
        return bLast.localeCompare(aLast);
      });

      setGroups(sorted);
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  async function handleClear() {
    if (!user) return;
    setClearing(true);
    const supabase = createClient();
    await supabase.from("attempts").delete().eq("user_id", user.id);
    setGroups([]);
    setClearing(false);
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
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white">
          {t.history.backHome}
        </Link>

        <h1 className="mt-6 text-4xl font-bold">{t.history.title}</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">{t.history.subtitle}</p>

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

        {(authLoading || loading) && user && (
          <p className="mt-10 text-gray-400 dark:text-gray-600">{t.history.loading}</p>
        )}

        {user && !loading && groups && groups.length === 0 && (
          <p className="mt-10 text-gray-400 dark:text-gray-600">{t.history.empty}</p>
        )}

        {user && !loading && groups && groups.length > 0 && (
          <>
            <div className="mt-10 space-y-4">
              {groups.map((group) => {
                const scores = group.entries.map((e) => e.score);
                const latest = scores[scores.length - 1];
                return (
                  <div
                    key={group.topic}
                    className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold">{group.topic}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {group.entries.length} × · {t.history.scoreLabel}: {latest}%
                        </p>
                      </div>
                      <Sparkline scores={scores} />
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={handleClear}
              disabled={clearing}
              className="mt-8 text-sm font-medium text-red-500 hover:underline disabled:opacity-50"
            >
              {t.history.clearAll}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
