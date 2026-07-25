"use client";

import { useEffect, useRef, useState, FormEvent } from "react";
import { useLanguage } from "../i18n/LanguageContext";
import { Dictionary, Lang } from "../i18n/translations";

type Level = "beginner" | "intermediate" | "advanced" | "auto";
type Cause = "theory" | "carelessness" | "misreading" | "logic" | "calculation";

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

type AnalysisResult = {
  score: number;
  summary: string;
  strengths: string[];
  mistakes: Mistake[];
  criteria: Criterion[];
  recommendations: string[];
  reviewTopics: string[];
  practiceExamples: string[];
  progressNote: string;
  motivation: string;
  followUp: string;
  transcript?: string;
};

type Feedback = AnalysisResult & { source: "ai" | "mock" };

// --- Local progress history (per browser, per topic) -----------------
// No backend/accounts yet, so "progress vs previous attempts" is tracked
// client-side in localStorage, keyed by a normalized topic string. Only
// real AI-graded attempts are recorded (not the offline mock fallback),
// so history stays meaningful.
const HISTORY_KEY = "echo_attempt_history";
type HistoryMap = Record<string, { date: string; score: number }[]>;

function normalizeTopicKey(topic: string): string {
  return topic.trim().toLowerCase();
}

function readHistory(): HistoryMap {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as HistoryMap) : {};
  } catch {
    return {};
  }
}

function getPreviousScores(topic: string): number[] {
  if (!topic.trim()) return [];
  const history = readHistory();
  return (history[normalizeTopicKey(topic)] ?? []).map((entry) => entry.score);
}

function saveAttempt(topic: string, score: number) {
  if (!topic.trim()) return;
  try {
    const history = readHistory();
    const key = normalizeTopicKey(topic);
    const entries = history[key] ?? [];
    entries.push({ date: new Date().toISOString(), score });
    history[key] = entries.slice(-10);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {
    // localStorage might be unavailable (private mode, etc) — progress
    // tracking is a nice-to-have, fail silently rather than break submit.
  }
}

function getScoreBandLabel(score: number, bands: Dictionary["tryEcho"]["scoreBands"]): string {
  if (score <= 20) return bands.veryLow;
  if (score <= 40) return bands.low;
  if (score <= 60) return bands.medium;
  if (score <= 80) return bands.good;
  if (score <= 90) return bands.veryGood;
  if (score <= 99) return bands.excellent;
  return bands.perfect;
}

// Offline fallback so the text-mode demo still works if the API call
// fails (no GEMINI_API_KEY configured, network hiccup, rate limit, etc).
// Derives a plausible looking result from simple heuristics instead of
// real AI. There is no equivalent for voice mode since we have no local
// way to transcribe audio — that path shows an error instead.
//
// Localized per UI language so the fallback doesn't jarringly switch to
// English when the rest of the site is in Russian/Tajik.
const MOCK_COPY: Record<
  Lang,
  {
    strengthLong: string;
    strengthCausal: string;
    strengthCore: string;
    mistakeShortIssue: string;
    mistakeShortWhy: string;
    mistakeShortCorrection: string;
    mistakeExampleIssue: string;
    mistakeExampleWhy: string;
    mistakeExampleCorrection: string;
    summary: string;
    criteriaName: string;
    criteriaComment: string;
    recommendation: string;
    progressNote: string;
    motivation: string;
    followUpWithTopic: (topic: string) => string;
    followUpNoTopic: string;
  }
> = {
  en: {
    strengthLong: "Thorough, detailed explanation",
    strengthCausal: "Explains cause and effect, not just facts",
    strengthCore: "Got the core idea down in your own words",
    mistakeShortIssue: "The explanation is quite short.",
    mistakeShortWhy:
      "A short answer usually means part of the idea was left out, which makes it hard to confirm full understanding.",
    mistakeShortCorrection: "Try adding a sentence about why this happens, plus one concrete example.",
    mistakeExampleIssue: "No concrete example was given.",
    mistakeExampleWhy: "Without an example it's hard to tell if you can apply the idea, not just recite it.",
    mistakeExampleCorrection:
      "Pick one real situation where this applies and walk through it in a sentence or two.",
    summary:
      "This is a rough offline estimate based on simple heuristics, not a real AI analysis — reconnect to see the full breakdown.",
    criteriaName: "Completeness",
    criteriaComment: "Estimated from explanation length only (offline mode).",
    recommendation: "Reconnect to the AI (check your GEMINI_API_KEY) for a real, personalized analysis.",
    progressNote: "Progress tracking isn't available in offline mode.",
    motivation: "Keep going — every attempt helps you spot what to review next.",
    followUpWithTopic: (topic) => `Can you explain why ${topic} matters using a real-world example?`,
    followUpNoTopic: "Can you explain how this connects to something you already know?",
  },
  ru: {
    strengthLong: "Развёрнутое, подробное объяснение",
    strengthCausal: "Объясняет причину и следствие, а не только факты",
    strengthCore: "Уловил(а) суть своими словами",
    mistakeShortIssue: "Объяснение довольно короткое.",
    mistakeShortWhy:
      "Короткий ответ обычно означает, что часть идеи пропущена, и трудно подтвердить полное понимание.",
    mistakeShortCorrection: "Добавь предложение о том, почему это происходит, и один конкретный пример.",
    mistakeExampleIssue: "Не приведён конкретный пример.",
    mistakeExampleWhy:
      "Без примера сложно понять, можешь ли ты применить идею, а не просто повторить её.",
    mistakeExampleCorrection:
      "Выбери одну реальную ситуацию, где это применимо, и разбери её в одном-двух предложениях.",
    summary:
      "Это грубая офлайн-оценка по простым эвристикам, а не настоящий анализ ИИ — переподключись, чтобы увидеть полный разбор.",
    criteriaName: "Полнота",
    criteriaComment: "Оценено только по длине объяснения (офлайн-режим).",
    recommendation: "Переподключись к ИИ (проверь свой GEMINI_API_KEY) для настоящего персонального анализа.",
    progressNote: "Отслеживание прогресса недоступно в офлайн-режиме.",
    motivation: "Продолжай — каждая попытка помогает понять, что повторить.",
    followUpWithTopic: (topic) => `Можешь объяснить, почему ${topic} важен(на), на реальном примере?`,
    followUpNoTopic: "Можешь объяснить, как это связано с тем, что ты уже знаешь?",
  },
  tg: {
    strengthLong: "Шарҳи муфассал ва пурра",
    strengthCausal: "Сабаб ва натиҷаро шарҳ медиҳад, на танҳо далелҳоро",
    strengthCore: "Моҳиятро бо суханони худ дуруст гирифтед",
    mistakeShortIssue: "Шарҳ хеле кӯтоҳ аст.",
    mistakeShortWhy:
      "Ҷавоби кӯтоҳ маъмулан маънои онро дорад, ки қисме аз ғоя гузашта шудааст, ва тасдиқи фаҳмиши пурра душвор мешавад.",
    mistakeShortCorrection:
      "Ҷумлае дар бораи он, ки чаро ин рӯй медиҳад, ва як мисоли мушаххас илова кунед.",
    mistakeExampleIssue: "Мисоли мушаххас оварда нашудааст.",
    mistakeExampleWhy:
      "Бе мисол фаҳмидан душвор аст, ки шумо метавонед ғояро татбиқ кунед, на танҳо такрор кунед.",
    mistakeExampleCorrection:
      "Як вазъияти воқеиро, ки ин дар он татбиқ мешавад, интихоб кунед ва онро дар як-ду ҷумла шарҳ диҳед.",
    summary:
      "Ин баҳодиҳии тахминии офлайн дар асоси эвристикаҳои содда аст, на таҳлили воқеии AI — барои дидани таҳлили пурра дубора пайваст шавед.",
    criteriaName: "Пуррагӣ",
    criteriaComment: "Танҳо аз рӯи дарозии шарҳ баҳо дода шуд (реҷаи офлайн).",
    recommendation: "Барои таҳлили воқеӣ ва шахсӣ ба AI дубора пайваст шавед (GEMINI_API_KEY-и худро тафтиш кунед).",
    progressNote: "Пайгирии пешрафт дар реҷаи офлайн дастрас нест.",
    motivation: "Идома диҳед — ҳар кӯшиш ба шумо кӯмак мекунад бифаҳмед, ки чиро такрор кунед.",
    followUpWithTopic: (topic) => `Метавонед шарҳ диҳед, ки чаро ${topic} бо мисоли воқеӣ муҳим аст?`,
    followUpNoTopic: "Метавонед шарҳ диҳед, ки ин чӣ гуна бо чизе, ки шумо аллакай медонед, алоқаманд аст?",
  },
};

function getMockFeedback(topic: string, explanation: string, lang: Lang): AnalysisResult {
  const copy = MOCK_COPY[lang];
  const words = explanation.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const lower = explanation.toLowerCase();

  const score = Math.max(35, Math.min(96, 30 + wordCount * 3));

  const strengths: string[] = [];
  if (wordCount > 25) strengths.push(copy.strengthLong);
  if (lower.includes("because") || lower.includes("so that")) strengths.push(copy.strengthCausal);
  if (strengths.length === 0) strengths.push(copy.strengthCore);

  const mistakes: Mistake[] = [];
  if (wordCount < 20) {
    mistakes.push({
      issue: copy.mistakeShortIssue,
      whyWrong: copy.mistakeShortWhy,
      correction: copy.mistakeShortCorrection,
      cause: "theory",
    });
  }
  if (!lower.includes("example") && !lower.includes("for instance")) {
    mistakes.push({
      issue: copy.mistakeExampleIssue,
      whyWrong: copy.mistakeExampleWhy,
      correction: copy.mistakeExampleCorrection,
      cause: "carelessness",
    });
  }

  const followUp = topic ? copy.followUpWithTopic(topic) : copy.followUpNoTopic;

  return {
    score,
    summary: copy.summary,
    strengths,
    mistakes,
    criteria: [{ name: copy.criteriaName, score, comment: copy.criteriaComment }],
    recommendations: [copy.recommendation],
    reviewTopics: [],
    practiceExamples: [],
    progressNote: copy.progressNote,
    motivation: copy.motivation,
    followUp,
  };
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1] ?? "");
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

const SUPPORTED_MIME_TYPES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/ogg;codecs=opus",
  "audio/mp4",
];

const MAX_RECORDING_MS = 90_000;

export default function TryEcho() {
  const { t, lang } = useLanguage();

  const [mode, setMode] = useState<"text" | "voice">("text");
  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState<Level>("auto");
  const [explanation, setExplanation] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [recordingState, setRecordingState] = useState<"idle" | "recording" | "recorded">("idle");
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [micError, setMicError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const autoStopTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (autoStopTimeoutRef.current) clearTimeout(autoStopTimeoutRef.current);
    };
  }, [audioUrl]);

  async function startRecording() {
    setMicError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = SUPPORTED_MIME_TYPES.find(
        (type) => typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(type)
      );
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setRecordingState("recording");

      autoStopTimeoutRef.current = setTimeout(() => {
        if (mediaRecorderRef.current?.state === "recording") stopRecording();
      }, MAX_RECORDING_MS);
    } catch (err) {
      console.error("Echo: microphone access failed —", err);
      setMicError(t.tryEcho.micError);
    }
  }

  function stopRecording() {
    if (autoStopTimeoutRef.current) {
      clearTimeout(autoStopTimeoutRef.current);
      autoStopTimeoutRef.current = null;
    }
    mediaRecorderRef.current?.stop();
    setRecordingState("recorded");
  }

  function resetRecording() {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingState("idle");
  }

  function switchMode(next: "text" | "voice") {
    setMode(next);
    setStatus("idle");
    setFeedback(null);
    setErrorMessage(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (mode === "text" && !explanation.trim()) return;
    if (mode === "voice" && !audioBlob) return;

    setStatus("loading");
    setErrorMessage(null);

    const trimmedTopic = topic.trim();
    const previousScores = getPreviousScores(trimmedTopic);

    try {
      let payload: Record<string, unknown>;

      if (mode === "voice" && audioBlob) {
        const audioBase64 = await blobToBase64(audioBlob);
        payload = {
          mode: "audio",
          topic: trimmedTopic,
          audioBase64,
          audioMimeType: audioBlob.type || "audio/webm",
          lang,
          level,
          previousScores,
        };
      } else {
        payload = {
          mode: "text",
          topic: trimmedTopic,
          explanation,
          lang,
          level,
          previousScores,
        };
      }

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`API responded with ${res.status}`);

      const result: AnalysisResult = await res.json();
      setFeedback({ ...result, source: "ai" });
      setStatus("done");
      saveAttempt(trimmedTopic, result.score);
    } catch (err) {
      console.warn("Echo: analysis failed, falling back —", err);

      if (mode === "text") {
        setFeedback({ ...getMockFeedback(trimmedTopic, explanation, lang), source: "mock" });
        setStatus("done");
      } else {
        setErrorMessage(t.tryEcho.apiError);
        setStatus("error");
      }
    }
  }

  const canSubmit =
    status !== "loading" && (mode === "text" ? explanation.trim().length > 0 : !!audioBlob);

  return (
    <section id="try" className="py-32 scroll-mt-24">

      <div className="max-w-6xl mx-auto px-6">

        <div className="text-center">

          <p className="text-blue-600 font-semibold uppercase tracking-widest dark:text-blue-400">
            {t.tryEcho.eyebrow}
          </p>

          <h2 className="mt-4 text-5xl font-bold">
            {t.tryEcho.title}
          </h2>

          <p className="mt-6 text-gray-500 text-lg max-w-2xl mx-auto dark:text-gray-400">
            {t.tryEcho.subtitle}
          </p>

        </div>

        <div className="grid lg:grid-cols-2 gap-10 mt-16 items-start">

          {/* LEFT: input form */}

          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-gray-200 bg-white shadow-sm p-8 space-y-6 dark:border-gray-800 dark:bg-gray-900"
          >

            {/* Mode tabs */}
            <div className="inline-flex rounded-full border border-gray-300 p-1 dark:border-gray-700">
              <button
                type="button"
                onClick={() => switchMode("text")}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  mode === "text"
                    ? "bg-black text-white dark:bg-white dark:text-black"
                    : "text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white"
                }`}
              >
                {t.tryEcho.modeText}
              </button>
              <button
                type="button"
                onClick={() => switchMode("voice")}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  mode === "voice"
                    ? "bg-black text-white dark:bg-white dark:text-black"
                    : "text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white"
                }`}
              >
                {t.tryEcho.modeVoice}
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">

              <div>
                <label
                  htmlFor="topic"
                  className="text-sm font-semibold text-gray-700 dark:text-gray-300"
                >
                  {t.tryEcho.topicLabel}
                </label>
                <input
                  id="topic"
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder={t.tryEcho.topicPlaceholder}
                  className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-950 dark:placeholder-gray-600"
                />
              </div>

              <div>
                <label
                  htmlFor="level"
                  className="text-sm font-semibold text-gray-700 dark:text-gray-300"
                >
                  {t.tryEcho.levelLabel}
                </label>
                <select
                  id="level"
                  value={level}
                  onChange={(e) => setLevel(e.target.value as Level)}
                  className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-950"
                >
                  <option value="auto">{t.tryEcho.levelAuto}</option>
                  <option value="beginner">{t.tryEcho.levelBeginner}</option>
                  <option value="intermediate">{t.tryEcho.levelIntermediate}</option>
                  <option value="advanced">{t.tryEcho.levelAdvanced}</option>
                </select>
              </div>

            </div>

            {mode === "text" ? (
              <div>
                <label
                  htmlFor="explanation"
                  className="text-sm font-semibold text-gray-700 dark:text-gray-300"
                >
                  {t.tryEcho.explanationLabel}
                </label>
                <textarea
                  id="explanation"
                  required
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  rows={7}
                  placeholder={t.tryEcho.explanationPlaceholder}
                  className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-950 dark:placeholder-gray-600"
                />
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-gray-300 p-6 text-center dark:border-gray-700">

                {recordingState === "idle" && (
                  <button
                    type="button"
                    onClick={startRecording}
                    className="rounded-full bg-black px-6 py-3 font-semibold text-white transition hover:scale-105 dark:bg-white dark:text-black"
                  >
                    🎙️ {t.tryEcho.recordStart}
                  </button>
                )}

                {recordingState === "recording" && (
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={stopRecording}
                      className="animate-pulse rounded-full bg-red-600 px-6 py-3 font-semibold text-white transition hover:scale-105"
                    >
                      ⏹ {t.tryEcho.recordStop}
                    </button>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t.tryEcho.recordingHint}
                    </p>
                  </div>
                )}

                {recordingState === "recorded" && audioUrl && (
                  <div className="space-y-3">
                    <audio controls src={audioUrl} className="mx-auto w-full max-w-xs" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t.tryEcho.reviewHint}
                    </p>
                    <button
                      type="button"
                      onClick={resetRecording}
                      className="text-sm font-semibold text-blue-600 hover:underline dark:text-blue-400"
                    >
                      ↻ {t.tryEcho.recordAgain}
                    </button>
                  </div>
                )}

                {micError && (
                  <p className="mt-3 text-sm text-red-600 dark:text-red-400">{micError}</p>
                )}

              </div>
            )}

            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full rounded-full bg-black px-8 py-4 text-lg font-semibold text-white transition hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 dark:bg-white dark:text-black"
            >
              {status === "loading" ? t.tryEcho.submitting : t.tryEcho.submit}
            </button>

          </form>

          {/* RIGHT: result card */}

          <div className="rounded-3xl border border-gray-200 bg-white shadow-2xl p-8 min-h-[420px] flex flex-col dark:border-gray-800 dark:bg-gray-900">

            {status === "idle" && (
              <div className="m-auto text-center text-gray-400 dark:text-gray-600">
                <div className="text-5xl">🤖</div>
                <p className="mt-4 max-w-xs mx-auto">
                  {t.tryEcho.idleHint}
                </p>
              </div>
            )}

            {status === "loading" && (
              <div className="m-auto text-center text-gray-400 animate-pulse dark:text-gray-600">
                <div className="text-5xl">🧠</div>
                <p className="mt-4">{t.tryEcho.loadingHint}</p>
              </div>
            )}

            {status === "error" && (
              <div className="m-auto text-center text-red-500 dark:text-red-400">
                <div className="text-5xl">⚠️</div>
                <p className="mt-4 max-w-xs mx-auto">{errorMessage}</p>
              </div>
            )}

            {status === "done" && feedback && (
              <>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t.tryEcho.aiAnalysis}
                  {feedback.source === "mock" && (
                    <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                      {t.tryEcho.offlineBadge}
                    </span>
                  )}
                </p>

                <h3 className="mt-2 text-3xl font-bold">
                  {t.tryEcho.understandingScore}
                </h3>

                <p className="mt-6 text-6xl font-bold text-blue-600 dark:text-blue-400">
                  {feedback.score}%
                </p>

                <p className="mt-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                  {getScoreBandLabel(feedback.score, t.tryEcho.scoreBands)}
                </p>

                <div className="mt-4 h-3 rounded-full bg-gray-200 overflow-hidden dark:bg-gray-800">
                  <div
                    className="h-full rounded-full bg-blue-600 transition-all dark:bg-blue-500"
                    style={{ width: `${feedback.score}%` }}
                  />
                </div>

                {feedback.progressNote && (
                  <div className="mt-4 rounded-xl bg-purple-50 p-3 text-sm text-purple-900 dark:bg-purple-500/10 dark:text-purple-200">
                    📈 <span className="font-semibold">{t.tryEcho.progressLabel}:</span>{" "}
                    {feedback.progressNote}
                  </div>
                )}

                {feedback.transcript && (
                  <div className="mt-4 rounded-xl bg-gray-50 p-4 text-sm text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                    <span className="font-semibold">{t.tryEcho.transcriptLabel}</span>{" "}
                    &ldquo;{feedback.transcript}&rdquo;
                  </div>
                )}

                <p className="mt-6 text-gray-700 dark:text-gray-300">{feedback.summary}</p>

                {feedback.strengths.length > 0 && (
                  <div className="mt-6 space-y-2">
                    {feedback.strengths.map((s, i) => (
                      <div key={i} className="rounded-xl bg-green-50 p-3 text-sm dark:bg-green-500/10">
                        ✅ {s}
                      </div>
                    ))}
                  </div>
                )}

                <details className="mt-6" open>
                  <summary className="cursor-pointer text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {t.tryEcho.mistakesTitle}
                    {feedback.mistakes.length > 0 ? ` (${feedback.mistakes.length})` : ""}
                  </summary>
                  <div className="mt-3 space-y-3">
                    {feedback.mistakes.length === 0 ? (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t.tryEcho.noMistakes}
                      </p>
                    ) : (
                      feedback.mistakes.map((m, i) => (
                        <div key={i} className="rounded-xl bg-yellow-50 p-4 text-sm dark:bg-yellow-500/10">
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-semibold">⚠ {m.issue}</p>
                            <span className="shrink-0 rounded-full bg-yellow-200/60 px-2 py-0.5 text-xs font-medium text-yellow-900 dark:bg-yellow-500/20 dark:text-yellow-200">
                              {t.tryEcho.causeLabels[m.cause]}
                            </span>
                          </div>
                          <p className="mt-2 text-gray-600 dark:text-gray-300">
                            <span className="font-medium">{t.tryEcho.whyWrongLabel}</span> {m.whyWrong}
                          </p>
                          <p className="mt-2 text-gray-600 dark:text-gray-300">
                            <span className="font-medium">{t.tryEcho.correctionLabel}</span> {m.correction}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </details>

                {feedback.criteria.length > 0 && (
                  <details className="mt-4">
                    <summary className="cursor-pointer text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {t.tryEcho.criteriaTitle}
                    </summary>
                    <div className="mt-3 space-y-2">
                      {feedback.criteria.map((c, i) => (
                        <div key={i} className="rounded-xl border border-gray-100 p-3 text-sm dark:border-gray-800">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{c.name}</span>
                            <span className="text-gray-500 dark:text-gray-400">{c.score}%</span>
                          </div>
                          <p className="mt-1 text-gray-500 dark:text-gray-400">{c.comment}</p>
                        </div>
                      ))}
                    </div>
                  </details>
                )}

                {feedback.recommendations.length > 0 && (
                  <details className="mt-4" open>
                    <summary className="cursor-pointer text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {t.tryEcho.recommendationsTitle}
                    </summary>
                    <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-gray-600 dark:text-gray-300">
                      {feedback.recommendations.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </details>
                )}

                {feedback.reviewTopics.length > 0 && (
                  <details className="mt-4">
                    <summary className="cursor-pointer text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {t.tryEcho.reviewTopicsTitle}
                    </summary>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {feedback.reviewTopics.map((topicName, i) => (
                        <span
                          key={i}
                          className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                        >
                          {topicName}
                        </span>
                      ))}
                    </div>
                  </details>
                )}

                {feedback.practiceExamples.length > 0 && (
                  <details className="mt-4">
                    <summary className="cursor-pointer text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {t.tryEcho.practiceTitle}
                    </summary>
                    <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-gray-600 dark:text-gray-300">
                      {feedback.practiceExamples.map((ex, i) => (
                        <li key={i}>{ex}</li>
                      ))}
                    </ul>
                  </details>
                )}

                <div className="mt-6 rounded-xl bg-blue-50 p-4 text-blue-900 dark:bg-blue-500/10 dark:text-blue-200">
                  💬 <span className="font-semibold">{t.tryEcho.followUpLabel}</span>{" "}
                  {feedback.followUp}
                </div>

                {feedback.motivation && (
                  <p className="mt-4 text-sm italic text-gray-500 dark:text-gray-400">
                    {feedback.motivation}
                  </p>
                )}
              </>
            )}

          </div>

        </div>

      </div>

    </section>
  );
}
