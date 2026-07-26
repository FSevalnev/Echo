"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth, isSupabaseConfigured } from "../auth/AuthContext";
import { createClient } from "../../lib/supabase/client";
import { useLanguage } from "../i18n/LanguageContext";
import type { Dictionary } from "../i18n/translations";

type Mode = "text" | "audio" | "file";
type Cause = "theory" | "carelessness" | "misreading" | "logic" | "calculation";
type Status = "mastered" | "inProgress" | "needsWork";

type Mistake = {
  issue: string;
  whyWrong: string;
  correction: string;
  cause: Cause;
};

type Criterion = {
  name: string;
  score: number;
  comment: string;
};

type AttemptRow = {
  id: string;
  topic: string;
  mode: Mode;
  level: string | null;
  explanation: string | null;
  score: number;
  summary: string | null;
  criteria: Criterion[] | null;
  mistakes: Mistake[] | null;
  recommendations: string[] | null;
  created_at: string;
};

type TopicGroup = {
  key: string;
  topic: string;
  entries: AttemptRow[]; // ascending by created_at
};

type TopicStats = {
  first: AttemptRow;
  last: AttemptRow;
  best: AttemptRow;
  avg: number;
  improvement: number | null;
  daysSpan: number;
  status: Status;
  topCauses: [Cause, number][];
};

// ---- pure helpers (no component state) --------------------------------

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;
}

function computeStats(group: TopicGroup): TopicStats {
  const entries = group.entries;
  const first = entries[0];
  const last = entries[entries.length - 1];
  const best = entries.reduce((a, b) => (b.score > a.score ? b : a), entries[0]);
  const avg = Math.round(entries.reduce((sum, e) => sum + e.score, 0) / entries.length);
  const improvement = entries.length > 1 ? last.score - first.score : null;
  const daysSpan = Math.max(
    0,
    Math.round((new Date(last.created_at).getTime() - new Date(first.created_at).getTime()) / 86400000)
  );
  const status: Status = last.score >= 90 ? "mastered" : last.score < 60 ? "needsWork" : "inProgress";

  const causeCounts = new Map<Cause, number>();
  entries.forEach((e) =>
    (e.mistakes ?? []).forEach((m) => {
      causeCounts.set(m.cause, (causeCounts.get(m.cause) ?? 0) + 1);
    })
  );
  const topCauses = Array.from(causeCounts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 2);

  return { first, last, best, avg, improvement, daysSpan, status, topCauses };
}

function scoreBandClasses(score: number) {
  if (score >= 90)
    return {
      text: "text-green-600 dark:text-green-400",
      bg: "bg-green-50 dark:bg-green-500/10",
      border: "border-green-200 dark:border-green-500/30",
    };
  if (score >= 70)
    return {
      text: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-500/10",
      border: "border-blue-200 dark:border-blue-500/30",
    };
  if (score >= 50)
    return {
      text: "text-yellow-600 dark:text-yellow-400",
      bg: "bg-yellow-50 dark:bg-yellow-500/10",
      border: "border-yellow-200 dark:border-yellow-500/30",
    };
  return {
    text: "text-red-600 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-500/10",
    border: "border-red-200 dark:border-red-500/30",
  };
}

const CAUSE_COLORS: Record<Cause, { text: string; border: string; bg: string }> = {
  theory: {
    text: "text-red-600 dark:text-red-400",
    border: "border-red-400 dark:border-red-500/60",
    bg: "bg-red-50/60 dark:bg-red-500/5",
  },
  logic: {
    text: "text-orange-600 dark:text-orange-400",
    border: "border-orange-400 dark:border-orange-500/60",
    bg: "bg-orange-50/60 dark:bg-orange-500/5",
  },
  misreading: {
    text: "text-yellow-600 dark:text-yellow-400",
    border: "border-yellow-400 dark:border-yellow-500/60",
    bg: "bg-yellow-50/60 dark:bg-yellow-500/5",
  },
  calculation: {
    text: "text-purple-600 dark:text-purple-400",
    border: "border-purple-400 dark:border-purple-500/60",
    bg: "bg-purple-50/60 dark:bg-purple-500/5",
  },
  carelessness: {
    text: "text-blue-600 dark:text-blue-400",
    border: "border-blue-400 dark:border-blue-500/60",
    bg: "bg-blue-50/60 dark:bg-blue-500/5",
  },
};

function statusBadgeClasses(status: Status) {
  if (status === "mastered") return "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400";
  if (status === "needsWork") return "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400";
  return "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400";
}

function statusLabel(status: Status, t: Dictionary): string {
  if (status === "mastered") return t.history.statusMastered;
  if (status === "needsWork") return t.history.statusNeedsWork;
  return t.history.statusInProgress;
}

function levelLabel(level: string | null, t: Dictionary): string {
  if (level === "schoolchild") return t.tryEcho.levelSchoolchild;
  if (level === "student") return t.tryEcho.levelStudent;
  if (level === "professional") return t.tryEcho.levelProfessional;
  return level ?? "—";
}

function modeLabel(mode: Mode, t: Dictionary): string {
  if (mode === "audio") return t.tryEcho.modeVoice;
  if (mode === "file") return t.tryEcho.modeFile;
  return t.tryEcho.modeText;
}

function dateInRange(iso: string, from: string, to: string): boolean {
  const time = new Date(iso).getTime();
  if (from) {
    const fromTime = new Date(`${from}T00:00:00`).getTime();
    if (time < fromTime) return false;
  }
  if (to) {
    const toTime = new Date(`${to}T23:59:59`).getTime();
    if (time > toTime) return false;
  }
  return true;
}

// ---- small presentational components -----------------------------------

function Sparkline({ scores }: { scores: number[] }) {
  const width = 200;
  const height = 44;
  const padding = 4;

  if (scores.length < 2) {
    return (
      <div className="flex h-11 items-center text-xs text-gray-400 dark:text-gray-600">
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
    <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="h-11 w-full max-w-[200px] overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-blue-600 dark:text-blue-400"
      />
    </svg>
  );
}

function ProgressChart({ entries }: { entries: AttemptRow[] }) {
  const width = 600;
  const height = 180;
  const paddingX = 10;
  const paddingY = 16;

  if (entries.length < 2) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-gray-400 dark:text-gray-600">
        {entries.length === 1 ? `${entries[0].score}%` : "—"}
      </div>
    );
  }

  const step = (width - paddingX * 2) / (entries.length - 1);
  const scoreToY = (score: number) => height - paddingY - (score / 100) * (height - paddingY * 2);
  const points = entries.map((e, i) => `${paddingX + i * step},${scoreToY(e.score)}`).join(" ");

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="h-40 w-full overflow-visible">
        {[0, 25, 50, 75, 100].map((mark) => (
          <line
            key={mark}
            x1={paddingX}
            x2={width - paddingX}
            y1={scoreToY(mark)}
            y2={scoreToY(mark)}
            stroke="currentColor"
            strokeWidth={1}
            className="text-gray-100 dark:text-gray-800"
          />
        ))}
        <polyline
          points={points}
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-blue-600 dark:text-blue-400"
        />
        {entries.map((e, i) => (
          <circle
            key={e.id}
            cx={paddingX + i * step}
            cy={scoreToY(e.score)}
            r={3.5}
            className="fill-blue-600 dark:fill-blue-400"
          />
        ))}
      </svg>
      <div className="mt-1 flex justify-between text-xs text-gray-400 dark:text-gray-600">
        <span>{formatDate(entries[0].created_at)}</span>
        <span>{formatDate(entries[entries.length - 1].created_at)}</span>
      </div>
    </div>
  );
}

function StatBox({ label, value, valueClassName }: { label: string; value: string; valueClassName?: string }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-950">
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className={`mt-1 text-lg font-semibold ${valueClassName ?? ""}`}>{value}</p>
    </div>
  );
}

function TopicCard({
  group,
  stats,
  t,
  expanded,
  onToggle,
  selectedId,
  onSelect,
}: {
  group: TopicGroup;
  stats: TopicStats;
  t: Dictionary;
  expanded: boolean;
  onToggle: () => void;
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const entries = group.entries;
  const selectedIndex = Math.max(0, entries.findIndex((e) => e.id === selectedId));
  const selected = entries[selectedIndex] ?? entries[entries.length - 1];
  const scores = entries.map((e) => e.score);

  const improvementText =
    stats.improvement === null
      ? "—"
      : stats.improvement > 0
      ? `+${stats.improvement}`
      : String(stats.improvement);
  const improvementColor =
    stats.improvement === null
      ? "text-gray-400 dark:text-gray-600"
      : stats.improvement > 0
      ? "text-green-600 dark:text-green-400"
      : stats.improvement < 0
      ? "text-red-600 dark:text-red-400"
      : "text-gray-500 dark:text-gray-400";

  const daysText =
    stats.daysSpan <= 0
      ? t.history.daysPracticedToday
      : t.history.daysPracticedLabel.replace("{n}", String(stats.daysSpan));

  return (
    <div className="rounded-2xl border border-gray-200 bg-white transition-colors dark:border-gray-800 dark:bg-gray-900">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full flex-wrap items-center justify-between gap-4 p-6 text-left"
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-lg font-semibold">{group.topic}</h3>
            <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadgeClasses(stats.status)}`}>
              {statusLabel(stats.status, t)}
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {entries.length} × · {t.history.scoreLabel}: {stats.last.score}%
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Sparkline scores={scores} />
          <span
            className={`inline-block shrink-0 text-xl text-gray-400 transition-transform duration-300 dark:text-gray-600 ${
              expanded ? "rotate-180" : ""
            }`}
            aria-hidden
          >
            ⌄
          </span>
        </div>
      </button>

      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
          expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="space-y-6 border-t border-gray-100 px-6 pb-6 pt-5 dark:border-gray-800">
            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              <StatBox
                label={t.history.firstAttemptLabel}
                value={`${stats.first.score}% · ${formatDate(stats.first.created_at)}`}
                valueClassName={scoreBandClasses(stats.first.score).text}
              />
              <StatBox
                label={t.history.lastAttemptLabel}
                value={`${stats.last.score}% · ${formatDate(stats.last.created_at)}`}
                valueClassName={scoreBandClasses(stats.last.score).text}
              />
              <StatBox
                label={t.history.bestScoreLabel}
                value={`${stats.best.score}%`}
                valueClassName={scoreBandClasses(stats.best.score).text}
              />
              <StatBox label={t.history.averageScoreLabel} value={`${stats.avg}%`} valueClassName={scoreBandClasses(stats.avg).text} />
              <StatBox label={t.history.repetitionsLabel} value={String(entries.length)} />
              <StatBox label={t.history.improvementLabel} value={improvementText} valueClassName={improvementColor} />
              <StatBox label={t.history.daysPracticedShortLabel} value={daysText} />
              <StatBox
                label={t.history.topMistakeLabel}
                value={stats.topCauses.length > 0 ? `${t.tryEcho.causeLabels[stats.topCauses[0][0]]} (${stats.topCauses[0][1]})` : "—"}
              />
            </div>

            {/* Chart */}
            <div>
              <p className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">{t.history.chartTitle}</p>
              <ProgressChart entries={entries} />
            </div>

            {/* Attempt navigator */}
            <div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onSelect(entries[Math.max(0, selectedIndex - 1)].id)}
                  disabled={selectedIndex === 0}
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-gray-300 text-sm disabled:opacity-30 dark:border-gray-700"
                  aria-label="Previous attempt"
                >
                  ‹
                </button>

                <div className="flex flex-1 gap-2 overflow-x-auto pb-1">
                  {entries.map((e, i) => {
                    const band = scoreBandClasses(e.score);
                    const isSelected = e.id === selected.id;
                    return (
                      <button
                        key={e.id}
                        type="button"
                        onClick={() => onSelect(e.id)}
                        title={`${formatDate(e.created_at)} · ${e.score}%`}
                        className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border text-xs font-semibold transition ${band.border} ${band.bg} ${band.text} ${
                          isSelected ? "ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-900" : ""
                        }`}
                      >
                        {i + 1}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => onSelect(entries[Math.min(entries.length - 1, selectedIndex + 1)].id)}
                  disabled={selectedIndex === entries.length - 1}
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-gray-300 text-sm disabled:opacity-30 dark:border-gray-700"
                  aria-label="Next attempt"
                >
                  ›
                </button>
              </div>
            </div>

            {/* Selected attempt detail */}
            <div className="rounded-xl border border-gray-100 p-5 dark:border-gray-800">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {t.history.attemptLabel} {selectedIndex + 1} {t.rooms.ofLabel} {entries.length} · {formatDate(selected.created_at)}
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 dark:bg-gray-800">{modeLabel(selected.mode, t)}</span>
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 dark:bg-gray-800">{levelLabel(selected.level, t)}</span>
                </div>
              </div>

              <p className={`mt-3 text-3xl font-bold ${scoreBandClasses(selected.score).text}`}>{selected.score}%</p>

              {selected.summary && <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{selected.summary}</p>}

              {/* What you answered */}
              <div className="mt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-600">
                  {t.history.whatYouAnsweredLabel}
                </p>
                <p className="mt-1 rounded-lg bg-gray-50 p-3 text-sm text-gray-700 dark:bg-gray-950 dark:text-gray-300">
                  {selected.explanation
                    ? selected.explanation
                    : selected.mode === "file"
                    ? t.history.fileSubmissionNote
                    : t.history.voiceNoTranscriptNote}
                </p>
              </div>

              {/* Criteria */}
              {selected.criteria && selected.criteria.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t.tryEcho.criteriaTitle}</p>
                  <div className="mt-2 space-y-2">
                    {selected.criteria.map((c, i) => (
                      <div key={i}>
                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                          <span>{c.name}</span>
                          <span>{c.score}%</span>
                        </div>
                        <div className="mt-1 h-1.5 rounded-full bg-gray-100 dark:bg-gray-800">
                          <div
                            className="h-full rounded-full bg-blue-600 dark:bg-blue-500"
                            style={{ width: `${Math.max(0, Math.min(100, c.score))}%` }}
                          />
                        </div>
                        {c.comment && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{c.comment}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Mistakes */}
              <div className="mt-4">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t.tryEcho.mistakesTitle}</p>
                {!selected.mistakes || selected.mistakes.length === 0 ? (
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{t.tryEcho.noMistakes}</p>
                ) : (
                  <div className="mt-2 space-y-2">
                    {selected.mistakes.map((m, i) => {
                      const colors = CAUSE_COLORS[m.cause] ?? CAUSE_COLORS.theory;
                      return (
                        <div key={i} className={`rounded-lg border-l-4 p-3 ${colors.border} ${colors.bg}`}>
                          <p className="text-sm font-medium">{m.issue}</p>
                          <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                            <span className="font-semibold">{t.tryEcho.whyWrongLabel}</span> {m.whyWrong}
                          </p>
                          <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                            <span className="font-semibold">{t.tryEcho.correctionLabel}</span> {m.correction}
                          </p>
                          <p className={`mt-1 text-xs font-medium ${colors.text}`}>{t.tryEcho.causeLabels[m.cause]}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Recommendations */}
              {selected.recommendations && selected.recommendations.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t.tryEcho.recommendationsTitle}</p>
                  <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-gray-600 dark:text-gray-300">
                    {selected.recommendations.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---- page ----------------------------------------------------------------

export default function HistoryPage() {
  const { t } = useLanguage();
  const { user, loading: authLoading } = useAuth();

  const [attempts, setAttempts] = useState<AttemptRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | Status>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [minScore, setMinScore] = useState(0);
  const [sortBy, setSortBy] = useState<"recent" | "best" | "most">("recent");

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [selectedAttempt, setSelectedAttempt] = useState<Record<string, string>>({});

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
        .select("id, topic, mode, level, explanation, score, summary, criteria, mistakes, recommendations, created_at")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: true });

      if (cancelled) return;
      setAttempts((data as AttemptRow[]) ?? []);
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  const allGroups: TopicGroup[] = useMemo(() => {
    if (!attempts) return [];
    const byTopic = new Map<string, TopicGroup>();
    attempts.forEach((row) => {
      const key = row.topic.trim().toLowerCase();
      const existing = byTopic.get(key);
      if (existing) existing.entries.push(row);
      else byTopic.set(key, { key, topic: row.topic, entries: [row] });
    });
    return Array.from(byTopic.values());
  }, [attempts]);

  const groupsWithStats = useMemo(
    () => allGroups.map((group) => ({ group, stats: computeStats(group) })),
    [allGroups]
  );

  const overview = useMemo(() => {
    const mastered = groupsWithStats.filter((g) => g.stats.status === "mastered");
    const hardest = groupsWithStats
      .filter((g) => g.stats.status !== "mastered")
      .sort((a, b) => a.stats.avg - b.stats.avg)
      .slice(0, 3);
    return { total: groupsWithStats.length, mastered, hardest };
  }, [groupsWithStats]);

  const filteredSorted = useMemo(() => {
    let result = groupsWithStats;

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((g) => g.group.topic.toLowerCase().includes(q));
    }
    if (statusFilter !== "all") {
      result = result.filter((g) => g.stats.status === statusFilter);
    }
    if (dateFrom || dateTo) {
      result = result.filter((g) => g.group.entries.some((e) => dateInRange(e.created_at, dateFrom, dateTo)));
    }
    if (minScore > 0) {
      result = result.filter((g) => g.stats.best.score >= minScore);
    }

    result = [...result].sort((a, b) => {
      if (sortBy === "best") return b.stats.best.score - a.stats.best.score;
      if (sortBy === "most") return b.group.entries.length - a.group.entries.length;
      return b.stats.last.created_at.localeCompare(a.stats.last.created_at);
    });

    return result;
  }, [groupsWithStats, search, statusFilter, dateFrom, dateTo, minScore, sortBy]);

  async function handleClear() {
    if (!user) return;
    setClearing(true);
    const supabase = createClient();
    await supabase.from("attempts").delete().eq("user_id", user.id);
    setAttempts([]);
    setClearing(false);
  }

  const hasActiveFilters = !!(search || statusFilter !== "all" || dateFrom || dateTo || minScore > 0 || sortBy !== "recent");

  function resetFilters() {
    setSearch("");
    setStatusFilter("all");
    setDateFrom("");
    setDateTo("");
    setMinScore(0);
    setSortBy("recent");
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
      <div className="mx-auto max-w-5xl">
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
              className="mt-4 inline-block rounded-full bg-black px-6 py-3 font-semibold text-white transition duration-300 ease-out hover:scale-105 dark:bg-white dark:text-black"
            >
              {t.auth.signInTitle}
            </Link>
          </div>
        )}

        {(authLoading || loading) && user && <p className="mt-10 text-gray-400 dark:text-gray-600">{t.history.loading}</p>}

        {user && !loading && allGroups.length === 0 && <p className="mt-10 text-gray-400 dark:text-gray-600">{t.history.empty}</p>}

        {user && !loading && allGroups.length > 0 && (
          <>
            {/* Overview */}
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
                <p className="text-sm text-gray-500 dark:text-gray-400">{t.history.overviewTopicsTracked}</p>
                <p className="mt-1 text-3xl font-bold">{overview.total}</p>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
                <p className="text-sm text-gray-500 dark:text-gray-400">{t.history.overviewMasteredTitle}</p>
                <p className="mt-1 text-3xl font-bold text-green-600 dark:text-green-400">{overview.mastered.length}</p>
                {overview.mastered.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {overview.mastered.slice(0, 4).map((g) => (
                      <span
                        key={g.group.key}
                        className="truncate rounded-full bg-green-50 px-2 py-0.5 text-xs text-green-700 dark:bg-green-500/10 dark:text-green-400"
                      >
                        {g.group.topic}
                      </span>
                    ))}
                    {overview.mastered.length > 4 && (
                      <span className="text-xs text-gray-400 dark:text-gray-600">+{overview.mastered.length - 4}</span>
                    )}
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
                <p className="text-sm text-gray-500 dark:text-gray-400">{t.history.overviewHardestTitle}</p>
                {overview.hardest.length === 0 ? (
                  <p className="mt-2 text-sm text-gray-400 dark:text-gray-600">{t.history.overviewEmpty}</p>
                ) : (
                  <div className="mt-2 space-y-1">
                    {overview.hardest.map((g) => (
                      <div key={g.group.key} className="flex items-center justify-between text-sm">
                        <span className="truncate">{g.group.topic}</span>
                        <span className={scoreBandClasses(g.stats.avg).text}>{g.stats.avg}%</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Filters */}
            <div className="mt-8 flex flex-wrap items-end gap-3 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
              <div className="min-w-[180px] flex-1">
                <label className="text-xs text-gray-500 dark:text-gray-400">{t.history.topicLabel}</label>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t.history.searchPlaceholder}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-950"
                />
              </div>

              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400">{t.history.statusLabel}</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as "all" | Status)}
                  className="mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-950"
                >
                  <option value="all">{t.history.statusAll}</option>
                  <option value="mastered">{t.history.statusMastered}</option>
                  <option value="inProgress">{t.history.statusInProgress}</option>
                  <option value="needsWork">{t.history.statusNeedsWork}</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400">{t.history.dateFromLabel}</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-950"
                />
              </div>

              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400">{t.history.dateToLabel}</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-950"
                />
              </div>

              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400">
                  {t.history.minScoreLabel}: {minScore}%
                </label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={minScore}
                  onChange={(e) => setMinScore(Number(e.target.value))}
                  className="mt-2 block w-32"
                />
              </div>

              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400">{t.history.sortLabel}</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as "recent" | "best" | "most")}
                  className="mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-950"
                >
                  <option value="recent">{t.history.sortRecent}</option>
                  <option value="best">{t.history.sortBest}</option>
                  <option value="most">{t.history.sortMostPracticed}</option>
                </select>
              </div>

              {hasActiveFilters && (
                <button type="button" onClick={resetFilters} className="text-sm text-blue-600 hover:underline dark:text-blue-400">
                  ✕
                </button>
              )}
            </div>

            {/* Topic list */}
            {filteredSorted.length === 0 ? (
              <p className="mt-10 text-gray-400 dark:text-gray-600">{t.history.noResults}</p>
            ) : (
              <div className="mt-6 space-y-4">
                {filteredSorted.map(({ group, stats }) => {
                  const isExpanded = !!expanded[group.key];
                  const selectedId = selectedAttempt[group.key] ?? group.entries[group.entries.length - 1].id;
                  return (
                    <TopicCard
                      key={group.key}
                      group={group}
                      stats={stats}
                      t={t}
                      expanded={isExpanded}
                      onToggle={() => setExpanded((prev) => ({ ...prev, [group.key]: !prev[group.key] }))}
                      selectedId={selectedId}
                      onSelect={(id) => setSelectedAttempt((prev) => ({ ...prev, [group.key]: id }))}
                    />
                  );
                })}
              </div>
            )}

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
