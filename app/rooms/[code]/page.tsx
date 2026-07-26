"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth, isSupabaseConfigured } from "../../auth/AuthContext";
import { createClient } from "../../../lib/supabase/client";
import { useLanguage } from "../../i18n/LanguageContext";
import { SUPPORTED_MIME_TYPES, MAX_RECORDING_MS, blobToBase64 } from "../../../lib/audio";
import {
  normalizeRoomCode,
  type Room,
  type RoomParticipant,
  type RoomRound,
  type RoomAnswer,
} from "../../../lib/rooms";

const MEDALS = ["🥇", "🥈", "🥉"];

type Standing = {
  userId: string;
  displayName: string;
  score: number;
};

export default function RoomPage() {
  const { t } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams<{ code: string }>();
  const code = normalizeRoomCode(String(params?.code ?? ""));

  const [room, setRoom] = useState<Room | null>(null);
  const [participants, setParticipants] = useState<RoomParticipant[]>([]);
  const [rounds, setRounds] = useState<RoomRound[]>([]);
  const [answers, setAnswers] = useState<RoomAnswer[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [answerText, setAnswerText] = useState("");
  const [answerMode, setAnswerMode] = useState<"text" | "voice">("text");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [nowTick, setNowTick] = useState(() => Date.now());

  // Voice answer mode: same "record -> transcribe -> edit -> submit" flow
  // as the main Try Echo voice input, embedded here for round answers.
  const [recordingState, setRecordingState] = useState<"idle" | "recording" | "recorded">("idle");
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [micError, setMicError] = useState<string | null>(null);
  const [transcribeStatus, setTranscribeStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle"
  );
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [transcribeError, setTranscribeError] = useState<string | null>(null);

  const advancingRef = useRef(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const autoStopTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Guards against the round-timeout auto-submit and a manual click firing
  // twice for the same round (e.g. both racing right at the deadline).
  const submitLockRef = useRef<string | null>(null);

  const myParticipant = useMemo(
    () => participants.find((p) => p.user_id === user?.id) ?? null,
    [participants, user?.id]
  );
  const isHost = !!(room && user && room.host_user_id === user.id);

  const currentRound = useMemo(
    () => rounds.find((r) => r.round_number === room?.current_round) ?? null,
    [rounds, room?.current_round]
  );

  const currentRoundAnswers = useMemo(
    () => (currentRound ? answers.filter((a) => a.room_round_id === currentRound.id) : []),
    [answers, currentRound]
  );

  const myCurrentAnswer = useMemo(
    () => currentRoundAnswers.find((a) => a.user_id === user?.id) ?? null,
    [currentRoundAnswers, user?.id]
  );

  const participantsByUserId = useMemo(() => {
    const map = new Map<string, RoomParticipant>();
    participants.forEach((p) => map.set(p.user_id, p));
    return map;
  }, [participants]);

  const roundStandings: Standing[] = useMemo(() => {
    return currentRoundAnswers
      .map((a) => ({
        userId: a.user_id,
        displayName: participantsByUserId.get(a.user_id)?.display_name ?? "?",
        score: a.score ?? 0,
      }))
      .sort((a, b) => b.score - a.score);
  }, [currentRoundAnswers, participantsByUserId]);

  const finalStandings: Standing[] = useMemo(() => {
    const totals = new Map<string, number>();
    answers.forEach((a) => {
      totals.set(a.user_id, (totals.get(a.user_id) ?? 0) + (a.score ?? 0));
    });
    return participants
      .map((p) => ({
        userId: p.user_id,
        displayName: p.display_name,
        score: totals.get(p.user_id) ?? 0,
      }))
      .sort((a, b) => b.score - a.score);
  }, [answers, participants]);

  const refetchAll = useCallback(async () => {
    if (!code) return;
    const supabase = createClient();

    const { data: roomRow, error: roomErr } = await supabase
      .from("rooms")
      .select("*")
      .eq("code", code)
      .maybeSingle();

    if (roomErr || !roomRow) {
      setLoadError(t.rooms.roomNotFound);
      setLoading(false);
      return;
    }
    setRoom(roomRow as Room);

    const [{ data: participantRows }, { data: roundRows }, { data: answerRows }] = await Promise.all([
      supabase.from("room_participants").select("*").eq("room_id", roomRow.id).order("joined_at"),
      supabase.from("room_rounds").select("*").eq("room_id", roomRow.id).order("round_number"),
      supabase.from("room_answers").select("*").eq("room_id", roomRow.id),
    ]);

    setParticipants((participantRows as RoomParticipant[]) ?? []);
    setRounds((roundRows as RoomRound[]) ?? []);
    setAnswers((answerRows as RoomAnswer[]) ?? []);
    setLoading(false);
  }, [code, t.rooms.roomNotFound]);

  // Initial load + join if not already a participant.
  useEffect(() => {
    if (!isSupabaseConfigured || authLoading || !user || !code) return;

    (async () => {
      const supabase = createClient();
      const { data: roomRow } = await supabase.from("rooms").select("*").eq("code", code).maybeSingle();

      if (!roomRow) {
        setLoadError(t.rooms.roomNotFound);
        setLoading(false);
        return;
      }

      const displayName =
        (user.user_metadata?.full_name as string | undefined)?.trim() || user.email || "Player";

      await supabase
        .from("room_participants")
        .upsert(
          { room_id: roomRow.id, user_id: user.id, display_name: displayName },
          { onConflict: "room_id,user_id", ignoreDuplicates: true }
        );

      await refetchAll();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user, code]);

  // Realtime subscriptions — once we know the room id, listen for any
  // change to the four room-related tables and just refetch everything.
  // Simple and robust at hackathon scale, avoids hand-merging payloads.
  useEffect(() => {
    if (!room?.id) return;
    const supabase = createClient();

    const channel = supabase
      .channel(`room-${room.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "rooms", filter: `id=eq.${room.id}` },
        () => refetchAll()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "room_participants", filter: `room_id=eq.${room.id}` },
        () => refetchAll()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "room_rounds", filter: `room_id=eq.${room.id}` },
        () => refetchAll()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "room_answers", filter: `room_id=eq.${room.id}` },
        () => refetchAll()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room?.id]);

  // 1-second ticker, used for the countdown display and for the host's
  // client-driven round-end check below.
  useEffect(() => {
    const id = setInterval(() => setNowTick(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const secondsLeft = currentRound
    ? Math.max(0, Math.ceil((new Date(currentRound.ends_at).getTime() - nowTick) / 1000))
    : 0;

  // Host-only: end the round once time is up or everyone has answered.
  useEffect(() => {
    if (!isHost || !room || !currentRound || room.status !== "in_round") return;
    if (currentRound.status !== "active") return;
    if (advancingRef.current) return;

    const everyoneAnswered =
      participants.length > 0 && currentRoundAnswers.length >= participants.length;
    const timeUp = secondsLeft <= 0;

    if (!everyoneAnswered && !timeUp) return;

    advancingRef.current = true;
    const supabase = createClient();
    (async () => {
      await supabase.from("room_rounds").update({ status: "scored" }).eq("id", currentRound.id);
      await supabase.from("rooms").update({ status: "round_results" }).eq("id", room.id);
      advancingRef.current = false;
    })();
  }, [isHost, room, currentRound, participants.length, currentRoundAnswers.length, secondsLeft]);

  // Auto-submit whatever this participant currently has (typed text, an
  // edited voice transcript, or nothing at all) the instant the round's
  // timer runs out, instead of just disabling the submit button and
  // leaving them out of the round if they didn't click in time.
  useEffect(() => {
    if (!room || !currentRound) return;
    if (room.status !== "in_round" && room.status !== "round_results") return;
    if (myCurrentAnswer) return;
    if (secondsLeft > 0) return;
    void submitAnswer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft, room, currentRound, myCurrentAnswer]);

  // Reset the per-round input state (typed text, recording, transcript)
  // whenever a new round starts — otherwise leftover text/audio from the
  // previous round would carry over into the next one.
  useEffect(() => {
    setAnswerText("");
    setAnswerMode("text");
    setSubmitError(null);
    resetRecording();
    submitLockRef.current = null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentRound?.id]);

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
        void transcribeAudio(blob);
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
    setTranscribeStatus("idle");
    setVoiceTranscript("");
    setTranscribeError(null);
  }

  async function transcribeAudio(blob: Blob) {
    setTranscribeStatus("loading");
    setTranscribeError(null);
    setVoiceTranscript("");

    try {
      const audioBase64 = await blobToBase64(blob);
      const res = await fetch("/api/transcribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audioBase64,
          audioMimeType: blob.type || "audio/webm",
          lang: room?.lang ?? "en",
        }),
      });

      if (!res.ok) throw new Error(`API responded with ${res.status}`);

      const data = await res.json();
      setVoiceTranscript(typeof data.transcript === "string" ? data.transcript : "");
      setTranscribeStatus("done");
    } catch (err) {
      console.warn("Echo: transcription failed —", err);
      setTranscribeStatus("error");
      setTranscribeError(t.tryEcho.transcribeError);
    }
  }

  async function startRound() {
    if (!room || !isHost) return;
    setStarting(true);
    const supabase = createClient();
    const roundNumber = room.current_round + 1;
    const endsAt = new Date(Date.now() + room.seconds_per_round * 1000).toISOString();

    // "random" mode: ask for a fresh topic (based on the room's subject)
    // for every round instead of reusing the same one all game. Falls back
    // to the room's stored topic if the call fails, so a flaky request
    // never blocks starting the round.
    let question = room.topic;
    if (room.topic_mode === "random") {
      try {
        const res = await fetch("/api/random-topic", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subject: room.subject,
            level: room.level,
            grade: room.level === "schoolchild" ? room.grade ?? undefined : undefined,
            lang: room.lang,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (typeof data.topic === "string" && data.topic.trim()) {
            question = data.topic.trim();
          }
        }
      } catch (err) {
        console.warn("Echo: random topic generation failed, reusing subject —", err);
      }
    }

    await supabase.from("room_rounds").insert({
      room_id: room.id,
      round_number: roundNumber,
      question,
      ends_at: endsAt,
    });
    await supabase
      .from("rooms")
      .update({ current_round: roundNumber, status: "in_round" })
      .eq("id", room.id);

    setStarting(false);
  }

  async function finishRoom() {
    if (!room || !isHost) return;
    const supabase = createClient();
    await supabase.from("rooms").update({ status: "finished" }).eq("id", room.id);
  }

  // Unified submit path for both a manual click and the round-timeout
  // auto-submit effect above. Handles three cases: a typed text answer, a
  // voice answer whose transcript was successfully edited/confirmed, and
  // (only reachable via the timeout) nothing at all — recorded as a
  // zero-score placeholder so the participant still shows up fairly in
  // this round's standings instead of just disappearing from it.
  async function submitAnswer() {
    if (!room || !currentRound || !myParticipant || !user) return;
    if (myCurrentAnswer) return;
    if (submitLockRef.current === currentRound.id) return;

    const hasEditedTranscript =
      answerMode === "voice" && transcribeStatus === "done" && voiceTranscript.trim().length > 0;
    const hasRawAudioFallback = answerMode === "voice" && !hasEditedTranscript && !!audioBlob;
    const textAnswer =
      answerMode === "text" ? answerText.trim() : hasEditedTranscript ? voiceTranscript.trim() : "";

    submitLockRef.current = currentRound.id;
    setSubmitting(true);
    setSubmitError(null);

    try {
      const supabase = createClient();

      if (!textAnswer && !hasRawAudioFallback) {
        const { error } = await supabase.from("room_answers").insert({
          room_id: room.id,
          room_round_id: currentRound.id,
          participant_id: myParticipant.id,
          user_id: user.id,
          explanation: "",
          score: 0,
          summary: null,
          mistakes: [],
          recommendations: [],
        });
        if (error) throw error;
        await refetchAll();
        return;
      }

      let payload: Record<string, unknown>;

      if (hasRawAudioFallback && audioBlob) {
        // Transcription failed or never finished before time ran out —
        // fall back to sending the raw audio, same as Try Echo's fallback.
        const audioBase64 = await blobToBase64(audioBlob);
        payload = {
          mode: "audio",
          topic: currentRound.question,
          audioBase64,
          audioMimeType: audioBlob.type || "audio/webm",
          lang: room.lang,
          level: room.level,
          grade: room.level === "schoolchild" ? room.grade ?? undefined : undefined,
        };
      } else {
        payload = {
          mode: "text",
          topic: currentRound.question,
          explanation: textAnswer,
          lang: room.lang,
          level: room.level,
          grade: room.level === "schoolchild" ? room.grade ?? undefined : undefined,
        };
      }

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("analyze failed");
      const feedback = await res.json();

      const { error } = await supabase.from("room_answers").insert({
        room_id: room.id,
        room_round_id: currentRound.id,
        participant_id: myParticipant.id,
        user_id: user.id,
        explanation: textAnswer || feedback.transcript || "",
        score: feedback.score,
        summary: feedback.summary,
        mistakes: feedback.mistakes ?? [],
        recommendations: feedback.recommendations ?? [],
      });

      if (error) throw error;
      await refetchAll();
    } catch {
      setSubmitError(t.rooms.genericError);
      submitLockRef.current = null; // allow a retry
    } finally {
      setSubmitting(false);
    }
  }

  async function leaveRoom() {
    if (!room || !user) return;
    const supabase = createClient();
    await supabase.from("room_participants").delete().eq("room_id", room.id).eq("user_id", user.id);
    router.push("/rooms");
  }

  function copyCode() {
    if (!room) return;
    navigator.clipboard?.writeText(room.code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  if (!isSupabaseConfigured) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <p className="max-w-sm text-center text-gray-500 dark:text-gray-400">{t.rooms.notConfigured}</p>
      </div>
    );
  }

  if (!authLoading && !user) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="max-w-sm rounded-3xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-gray-900">
          <p className="text-gray-600 dark:text-gray-300">{t.rooms.signInPrompt}</p>
          <Link
            href="/login"
            className="mt-4 inline-block rounded-full bg-black px-6 py-3 font-semibold text-white transition duration-300 ease-out hover:scale-105 dark:bg-white dark:text-black"
          >
            {t.auth.signInTitle}
          </Link>
        </div>
      </div>
    );
  }

  if (loading || authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <p className="text-gray-500 dark:text-gray-400">{t.history.loading}</p>
      </div>
    );
  }

  if (loadError || !room) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <p className="max-w-sm text-center text-gray-500 dark:text-gray-400">
          {loadError ?? t.rooms.roomNotFound}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between">
          <Link href="/rooms" className="text-sm text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white">
            {t.rooms.backHome}
          </Link>
          {room.status === "lobby" && (
            <button onClick={leaveRoom} className="text-sm text-red-500 hover:underline">
              {t.rooms.leaveRoom}
            </button>
          )}
        </div>

        <h1 className="mt-4 text-3xl font-bold">{room.subject}</h1>
        <p className="text-gray-500 dark:text-gray-400">
          {room.topic_mode === "random" ? t.rooms.topicModeRandomHint : room.topic}
        </p>

        {/* LOBBY */}
        {room.status === "lobby" && (
          <div className="mt-8 space-y-6 animate-fade-in-up">
            <div className="rounded-3xl border border-gray-200 bg-white p-6 text-center dark:border-gray-800 dark:bg-gray-900">
              <p className="text-sm text-gray-500 dark:text-gray-400">{t.rooms.shareHint}</p>
              <p className="mt-2 text-4xl font-bold tracking-widest">{room.code}</p>
              <button
                onClick={copyCode}
                className="mt-3 rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold transition hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
              >
                {copied ? t.rooms.copied : t.rooms.copyCode}
              </button>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
              <h2 className="font-semibold">{t.rooms.participantsTitle}</h2>
              <ul className="mt-3 space-y-2">
                {participants.map((p) => (
                  <li key={p.id} className="flex items-center justify-between text-sm">
                    <span>{p.display_name}</span>
                    <span className="flex gap-2">
                      {p.user_id === room.host_user_id && (
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium dark:bg-gray-800">
                          {t.rooms.hostBadge}
                        </span>
                      )}
                      {p.user_id === user?.id && (
                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-500/20 dark:text-blue-300">
                          {t.rooms.youBadge}
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {isHost ? (
              <div>
                <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">{t.rooms.lobbyHostHint}</p>
                <button
                  onClick={startRound}
                  disabled={starting}
                  className="w-full rounded-full bg-black px-6 py-3 font-semibold text-white transition duration-300 ease-out hover:scale-105 disabled:opacity-50 dark:bg-white dark:text-black"
                >
                  {starting ? t.rooms.starting : t.rooms.startRound}
                </button>
              </div>
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400">{t.rooms.lobbyWaiting}</p>
            )}
          </div>
        )}

        {/* IN ROUND */}
        {room.status === "in_round" && currentRound && (
          <div className="mt-8 space-y-6 animate-fade-in-up">
            <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-5 py-4 dark:border-gray-800 dark:bg-gray-900">
              <span className="font-semibold">
                {t.rooms.roundLabel} {room.current_round} {t.rooms.ofLabel} {room.total_rounds}
              </span>
              <span className={secondsLeft <= 10 ? "font-bold text-red-500" : "font-semibold"}>
                {secondsLeft > 0 ? `${t.rooms.timeLeft}: ${secondsLeft}s` : t.rooms.timeUp}
              </span>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white px-5 py-4 text-center dark:border-gray-800 dark:bg-gray-900">
              <p className="text-sm text-gray-500 dark:text-gray-400">{t.rooms.topicLabel}</p>
              <p className="mt-1 text-lg font-semibold">{currentRound.question}</p>
            </div>

            {!myCurrentAnswer ? (
              <div className="space-y-4 rounded-3xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                <div className="flex w-fit flex-wrap gap-1 rounded-full border border-gray-300 p-1 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => setAnswerMode("text")}
                    className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                      answerMode === "text"
                        ? "bg-black text-white dark:bg-white dark:text-black"
                        : "text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white"
                    }`}
                  >
                    {t.tryEcho.modeText}
                  </button>
                  <button
                    type="button"
                    onClick={() => setAnswerMode("voice")}
                    className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                      answerMode === "voice"
                        ? "bg-black text-white dark:bg-white dark:text-black"
                        : "text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white"
                    }`}
                  >
                    {t.tryEcho.modeVoice}
                  </button>
                </div>

                {answerMode === "text" ? (
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">{t.rooms.answerLabel}</label>
                    <textarea
                      value={answerText}
                      onChange={(e) => setAnswerText(e.target.value)}
                      placeholder={t.rooms.answerPlaceholder}
                      rows={6}
                      className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-950"
                    />
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-gray-300 p-6 text-center dark:border-gray-700">
                    {recordingState === "idle" && (
                      <button
                        type="button"
                        onClick={startRecording}
                        className="rounded-full bg-black px-6 py-3 font-semibold text-white transition duration-300 ease-out hover:scale-105 dark:bg-white dark:text-black"
                      >
                        🎙️ {t.tryEcho.recordStart}
                      </button>
                    )}

                    {recordingState === "recording" && (
                      <div className="space-y-3">
                        <button
                          type="button"
                          onClick={stopRecording}
                          className="animate-pulse rounded-full bg-red-600 px-6 py-3 font-semibold text-white transition duration-300 ease-out hover:scale-105"
                        >
                          ⏹ {t.tryEcho.recordStop}
                        </button>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t.tryEcho.recordingHint}</p>
                      </div>
                    )}

                    {recordingState === "recorded" && audioUrl && (
                      <div className="space-y-3">
                        <audio controls src={audioUrl} className="mx-auto w-full max-w-xs" />

                        {transcribeStatus === "loading" && (
                          <p className="text-sm text-gray-500 animate-pulse dark:text-gray-400">
                            🧠 {t.tryEcho.transcribing}
                          </p>
                        )}

                        {transcribeStatus === "done" && (
                          <div className="text-left">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                              {t.tryEcho.transcriptEditLabel}
                            </label>
                            <textarea
                              value={voiceTranscript}
                              onChange={(e) => setVoiceTranscript(e.target.value)}
                              rows={6}
                              className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-950"
                            />
                            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                              {t.tryEcho.transcriptEditHint}
                            </p>
                          </div>
                        )}

                        {transcribeStatus === "error" && (
                          <div className="text-left">
                            <p className="text-sm text-red-600 dark:text-red-400">{transcribeError}</p>
                            <button
                              type="button"
                              onClick={() => audioBlob && transcribeAudio(audioBlob)}
                              className="mt-1 text-sm font-semibold text-blue-600 hover:underline dark:text-blue-400"
                            >
                              ↻ {t.tryEcho.transcribeRetry}
                            </button>
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={resetRecording}
                          className="text-sm font-semibold text-blue-600 hover:underline dark:text-blue-400"
                        >
                          ↻ {t.tryEcho.recordAgain}
                        </button>
                      </div>
                    )}

                    {micError && <p className="mt-3 text-sm text-red-600 dark:text-red-400">{micError}</p>}
                  </div>
                )}

                {submitError && <p className="text-sm text-red-600 dark:text-red-400">{submitError}</p>}

                <button
                  type="button"
                  onClick={() => submitAnswer()}
                  disabled={
                    submitting ||
                    (answerMode === "text"
                      ? !answerText.trim()
                      : transcribeStatus === "done"
                      ? !voiceTranscript.trim()
                      : !(transcribeStatus === "error" && audioBlob))
                  }
                  className="w-full rounded-full bg-black px-6 py-3 font-semibold text-white transition duration-300 ease-out hover:scale-105 disabled:opacity-50 dark:bg-white dark:text-black"
                >
                  {submitting ? t.rooms.submittingAnswer : t.rooms.submitAnswer}
                </button>
              </div>
            ) : (
              <div className="rounded-3xl border border-gray-200 bg-white p-6 text-center dark:border-gray-800 dark:bg-gray-900">
                <p className="font-medium">{t.rooms.answerSubmitted}</p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{t.rooms.waitingOthers}</p>
              </div>
            )}

            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              {currentRoundAnswers.length}/{participants.length} {t.rooms.submittedCount}
            </p>
          </div>
        )}

        {/* ROUND RESULTS */}
        {room.status === "round_results" && currentRound && (
          <div className="mt-8 space-y-6 animate-fade-in-up">
            <h2 className="text-xl font-semibold">
              {t.rooms.leaderboardTitle} — {t.rooms.roundLabel} {room.current_round}
            </h2>

            <div className="rounded-2xl border border-gray-200 bg-white px-5 py-4 text-center dark:border-gray-800 dark:bg-gray-900">
              <p className="text-sm text-gray-500 dark:text-gray-400">{t.rooms.topicLabel}</p>
              <p className="mt-1 text-lg font-semibold">{currentRound.question}</p>
            </div>

            <ul className="space-y-2">
              {roundStandings.map((s, i) => (
                <li
                  key={s.userId}
                  className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-5 py-3 dark:border-gray-800 dark:bg-gray-900"
                >
                  <span className="flex items-center gap-2 font-medium">
                    <span>{MEDALS[i] ?? `#${i + 1}`}</span>
                    {s.displayName}
                  </span>
                  <span className="font-semibold">
                    {s.score} <span className="text-xs font-normal text-gray-400">{t.rooms.roundScoreLabel}</span>
                  </span>
                </li>
              ))}
            </ul>

            {myCurrentAnswer && (
              <div className="rounded-3xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                <h3 className="font-semibold">{t.rooms.yourFeedback}</h3>
                <p className="mt-2 text-2xl font-bold">{myCurrentAnswer.score ?? 0}/100</p>
                {myCurrentAnswer.summary && (
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{myCurrentAnswer.summary}</p>
                )}
              </div>
            )}

            <div className="rounded-3xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
              <h3 className="font-semibold">{t.rooms.winnerAnswerLabel}</h3>
              <ul className="mt-3 space-y-4">
                {roundStandings.map((s, i) => {
                  const ans = currentRoundAnswers.find((a) => a.user_id === s.userId);
                  if (!ans) return null;
                  return (
                    <li
                      key={s.userId}
                      className="border-t border-gray-100 pt-4 first:border-t-0 first:pt-0 dark:border-gray-800"
                    >
                      <div className="flex items-center justify-between text-sm font-medium">
                        <span>
                          {MEDALS[i] ?? `#${i + 1}`} {s.displayName}
                          {s.userId === user?.id && ` (${t.rooms.youBadge})`}
                        </span>
                        <span>{s.score}/100</span>
                      </div>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                        {ans.explanation.trim() ? ans.explanation : t.rooms.noAnswerSubmitted}
                      </p>
                    </li>
                  );
                })}
              </ul>
            </div>

            {isHost ? (
              room.current_round < room.total_rounds ? (
                <button
                  onClick={startRound}
                  disabled={starting}
                  className="w-full rounded-full bg-black px-6 py-3 font-semibold text-white transition duration-300 ease-out hover:scale-105 disabled:opacity-50 dark:bg-white dark:text-black"
                >
                  {starting ? t.rooms.starting : t.rooms.nextRound}
                </button>
              ) : (
                <button
                  onClick={finishRoom}
                  className="w-full rounded-full bg-black px-6 py-3 font-semibold text-white transition duration-300 ease-out hover:scale-105 dark:bg-white dark:text-black"
                >
                  {t.rooms.finishRoom}
                </button>
              )
            ) : (
              <p className="text-center text-sm text-gray-500 dark:text-gray-400">{t.rooms.hostOnlyHint}</p>
            )}
          </div>
        )}

        {/* FINISHED */}
        {room.status === "finished" && (
          <div className="mt-8 space-y-6 animate-fade-in-up">
            <h2 className="text-xl font-semibold">{t.rooms.finalLeaderboardTitle}</h2>
            <ul className="space-y-2">
              {finalStandings.map((s, i) => (
                <li
                  key={s.userId}
                  className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-5 py-3 dark:border-gray-800 dark:bg-gray-900"
                >
                  <span className="flex items-center gap-2 font-medium">
                    <span>{MEDALS[i] ?? `#${i + 1}`}</span>
                    {s.displayName}
                  </span>
                  <span className="font-semibold">
                    {s.score} <span className="text-xs font-normal text-gray-400">{t.rooms.totalScoreLabel}</span>
                  </span>
                </li>
              ))}
            </ul>
            <Link
              href="/rooms"
              className="block w-full rounded-full bg-black px-6 py-3 text-center font-semibold text-white transition duration-300 ease-out hover:scale-105 dark:bg-white dark:text-black"
            >
              {t.rooms.playAgain}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
