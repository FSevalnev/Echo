"use client";

import { useEffect, useRef, useState, FormEvent } from "react";
import { useLanguage } from "../i18n/LanguageContext";

type AnalysisResult = {
  score: number;
  strengths: string[];
  gaps: string[];
  followUp: string;
  transcript?: string;
};

type Feedback = AnalysisResult & { source: "ai" | "mock" };

// Offline fallback so the text-mode demo still works if the API call
// fails (no GEMINI_API_KEY configured, network hiccup, rate limit, etc).
// Derives a plausible looking result from simple heuristics instead of
// real AI. There is no equivalent for voice mode since we have no local
// way to transcribe audio — that path shows an error instead.
function getMockFeedback(topic: string, explanation: string): AnalysisResult {
  const words = explanation.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const lower = explanation.toLowerCase();

  const score = Math.max(35, Math.min(96, 30 + wordCount * 3));

  const strengths: string[] = [];
  if (wordCount > 25) strengths.push("Thorough, detailed explanation");
  if (lower.includes("because") || lower.includes("so that"))
    strengths.push("Explains cause and effect, not just facts");
  if (lower.includes("example") || lower.includes("for instance"))
    strengths.push("Backs up the idea with a concrete example");
  if (strengths.length === 0)
    strengths.push("Got the core idea down in your own words");

  const gaps: string[] = [];
  if (wordCount < 20)
    gaps.push("Explanation is quite short — try adding more detail");
  if (!lower.includes("because") && !lower.includes("since"))
    gaps.push("Missing the \"why\" — you describe what happens, not why");
  if (!lower.includes("example"))
    gaps.push("Add a concrete example to prove you can apply this");
  if (gaps.length === 0)
    gaps.push("Double-check any edge cases you might have skipped");

  const followUp = topic
    ? `Can you explain why ${topic} matters using a real-world example?`
    : "Can you explain how this connects to something you already know?";

  return { score, strengths, gaps: gaps.slice(0, 2), followUp };
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

    try {
      let payload: Record<string, unknown>;

      if (mode === "voice" && audioBlob) {
        const audioBase64 = await blobToBase64(audioBlob);
        payload = {
          mode: "audio",
          topic: topic.trim(),
          audioBase64,
          audioMimeType: audioBlob.type || "audio/webm",
          lang,
        };
      } else {
        payload = {
          mode: "text",
          topic: topic.trim(),
          explanation,
          lang,
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
    } catch (err) {
      console.warn("Echo: analysis failed, falling back —", err);

      if (mode === "text") {
        setFeedback({ ...getMockFeedback(topic.trim(), explanation), source: "mock" });
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

                <div className="mt-6 h-3 rounded-full bg-gray-200 overflow-hidden dark:bg-gray-800">
                  <div
                    className="h-full rounded-full bg-blue-600 transition-all dark:bg-blue-500"
                    style={{ width: `${feedback.score}%` }}
                  />
                </div>

                {feedback.transcript && (
                  <div className="mt-6 rounded-xl bg-gray-50 p-4 text-sm text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                    <span className="font-semibold">{t.tryEcho.transcriptLabel}</span>{" "}
                    &ldquo;{feedback.transcript}&rdquo;
                  </div>
                )}

                <div className="mt-8 space-y-3">
                  {feedback.strengths.map((s, i) => (
                    <div key={i} className="rounded-xl bg-green-50 p-4 dark:bg-green-500/10">
                      ✅ {s}
                    </div>
                  ))}

                  {feedback.gaps.map((g, i) => (
                    <div key={i} className="rounded-xl bg-yellow-50 p-4 dark:bg-yellow-500/10">
                      ⚠ {g}
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-xl bg-blue-50 p-4 text-blue-900 dark:bg-blue-500/10 dark:text-blue-200">
                  💬 <span className="font-semibold">{t.tryEcho.followUpLabel}</span>{" "}
                  {feedback.followUp}
                </div>
              </>
            )}

          </div>

        </div>

      </div>

    </section>
  );
}
