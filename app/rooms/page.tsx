"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, isSupabaseConfigured } from "../auth/AuthContext";
import { createClient } from "../../lib/supabase/client";
import { useLanguage } from "../i18n/LanguageContext";
import {
  generateRoomCode,
  normalizeRoomCode,
  ROUND_COUNT_PRESETS,
  ROUND_TIME_PRESETS,
  type RoomLevel,
} from "../../lib/rooms";

export default function RoomsPage() {
  const { t, lang } = useLanguage();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState<RoomLevel>("student");
  const [totalRounds, setTotalRounds] = useState(3);
  const [secondsPerRound, setSecondsPerRound] = useState(90);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [topicLoading, setTopicLoading] = useState(false);
  const [topicError, setTopicError] = useState<string | null>(null);

  const [joinCode, setJoinCode] = useState("");
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  async function handleRandomTopic() {
    if (!subject.trim() || topicLoading) return;
    setTopicLoading(true);
    setTopicError(null);

    try {
      const res = await fetch("/api/random-topic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: subject.trim(), level, lang }),
      });
      if (!res.ok) throw new Error("random-topic failed");
      const data = await res.json();
      if (!data.topic) throw new Error("empty topic");
      setTopic(data.topic);
    } catch {
      setTopicError(t.rooms.randomTopicError);
    } finally {
      setTopicLoading(false);
    }
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    setCreating(true);
    setCreateError(null);

    const supabase = createClient();
    const displayName =
      (user.user_metadata?.full_name as string | undefined)?.trim() || user.email || "Player";

    // Retry a few times in case of a rare code collision (unique constraint).
    let lastError: string | null = null;
    for (let attempt = 0; attempt < 5; attempt++) {
      const code = generateRoomCode();
      const { data: room, error } = await supabase
        .from("rooms")
        .insert({
          code,
          host_user_id: user.id,
          subject: subject.trim() || t.rooms.subjectPlaceholder,
          topic: topic.trim() || t.rooms.topicPlaceholder,
          level,
          lang,
          total_rounds: totalRounds,
          seconds_per_round: secondsPerRound,
        })
        .select()
        .single();

      if (!error && room) {
        const { error: joinError } = await supabase.from("room_participants").insert({
          room_id: room.id,
          user_id: user.id,
          display_name: displayName,
        });

        if (joinError) {
          lastError = joinError.message;
          break;
        }

        router.push(`/rooms/${code}`);
        return;
      }

      lastError = error?.message ?? null;
      // Only worth retrying on a unique-code collision; anything else, stop.
      if (!error?.message?.includes("duplicate")) break;
    }

    setCreateError(lastError || t.rooms.genericError);
    setCreating(false);
  }

  async function handleJoin(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    setJoining(true);
    setJoinError(null);

    const code = normalizeRoomCode(joinCode);
    if (!code) {
      setJoinError(t.rooms.roomNotFound);
      setJoining(false);
      return;
    }

    const supabase = createClient();
    const { data: room, error } = await supabase
      .from("rooms")
      .select("id, code")
      .eq("code", code)
      .maybeSingle();

    if (error || !room) {
      setJoinError(t.rooms.roomNotFound);
      setJoining(false);
      return;
    }

    const displayName =
      (user.user_metadata?.full_name as string | undefined)?.trim() || user.email || "Player";

    const { error: joinErr } = await supabase
      .from("room_participants")
      .upsert(
        { room_id: room.id, user_id: user.id, display_name: displayName },
        { onConflict: "room_id,user_id", ignoreDuplicates: true }
      );

    if (joinErr) {
      setJoinError(joinErr.message);
      setJoining(false);
      return;
    }

    router.push(`/rooms/${room.code}`);
  }

  if (!isSupabaseConfigured) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <p className="max-w-sm text-center text-gray-500 dark:text-gray-400">
          {t.rooms.notConfigured}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-24">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white">
          {t.rooms.backHome}
        </Link>

        <h1 className="mt-6 text-4xl font-bold">{t.rooms.title}</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">{t.rooms.subtitle}</p>

        {!authLoading && !user && (
          <div className="mt-10 rounded-3xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-gray-900">
            <p className="text-gray-600 dark:text-gray-300">{t.rooms.signInPrompt}</p>
            <Link
              href="/login"
              className="mt-4 inline-block rounded-full bg-black px-6 py-3 font-semibold text-white transition hover:scale-105 dark:bg-white dark:text-black"
            >
              {t.auth.signInTitle}
            </Link>
          </div>
        )}

        {user && (
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <form
              onSubmit={handleCreate}
              className="space-y-4 rounded-3xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900"
            >
              <h2 className="text-lg font-semibold">{t.rooms.createTitle}</h2>

              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400">{t.rooms.subjectLabel}</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder={t.rooms.subjectPlaceholder}
                  className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-950"
                />
              </div>

              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400">{t.rooms.levelLabel}</label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value as RoomLevel)}
                  className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-950"
                >
                  <option value="schoolchild">{t.tryEcho.levelSchoolchild}</option>
                  <option value="student">{t.tryEcho.levelStudent}</option>
                  <option value="professional">{t.tryEcho.levelProfessional}</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400">{t.rooms.topicLabel}</label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => {
                    setTopic(e.target.value);
                    setTopicError(null);
                  }}
                  placeholder={t.rooms.topicPlaceholder}
                  title={topic}
                  className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-950"
                />
                <button
                  type="button"
                  onClick={handleRandomTopic}
                  disabled={!subject.trim() || topicLoading}
                  title={!subject.trim() ? t.rooms.subjectLabel : undefined}
                  className="mt-2 w-full whitespace-nowrap rounded-xl border border-gray-300 px-3 py-2.5 text-sm font-semibold transition hover:bg-gray-100 disabled:opacity-50 dark:border-gray-700 dark:hover:bg-gray-800"
                >
                  {topicLoading ? t.rooms.randomTopicLoading : t.rooms.randomTopic}
                </button>
                {topicError && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{topicError}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-gray-500 dark:text-gray-400">{t.rooms.roundsLabel}</label>
                  <select
                    value={totalRounds}
                    onChange={(e) => setTotalRounds(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-950"
                  >
                    {ROUND_COUNT_PRESETS.map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-500 dark:text-gray-400">{t.rooms.secondsLabel}</label>
                  <select
                    value={secondsPerRound}
                    onChange={(e) => setSecondsPerRound(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-950"
                  >
                    {ROUND_TIME_PRESETS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {createError && <p className="text-sm text-red-600 dark:text-red-400">{createError}</p>}

              <button
                type="submit"
                disabled={creating}
                className="w-full rounded-full bg-black px-6 py-3 font-semibold text-white transition hover:scale-105 disabled:opacity-50 dark:bg-white dark:text-black"
              >
                {creating ? t.rooms.creating : t.rooms.createSubmit}
              </button>
            </form>

            <form
              onSubmit={handleJoin}
              className="space-y-4 rounded-3xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900"
            >
              <h2 className="text-lg font-semibold">{t.rooms.joinTitle}</h2>

              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400">{t.rooms.codeLabel}</label>
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  placeholder={t.rooms.codePlaceholder}
                  className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-950"
                />
              </div>

              {joinError && <p className="text-sm text-red-600 dark:text-red-400">{joinError}</p>}

              <button
                type="submit"
                disabled={joining || !joinCode.trim()}
                className="w-full rounded-full border border-gray-300 px-6 py-3 font-semibold transition hover:bg-gray-100 disabled:opacity-50 dark:border-gray-700 dark:hover:bg-gray-800"
              >
                {joining ? t.rooms.joining : t.rooms.joinSubmit}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
