import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type AnalyzeRequestBody = {
  mode?: "text" | "audio";
  topic?: string;
  explanation?: string;
  audioBase64?: string;
  audioMimeType?: string;
  lang?: "en" | "ru" | "tg";
};

type Feedback = {
  score: number;
  strengths: string[];
  gaps: string[];
  followUp: string;
  transcript?: string;
};

// Free tier, no billing/card required — get a key at
// https://aistudio.google.com/apikey and put it in .env.local as
// GEMINI_API_KEY=... (see .env.example).
const GEMINI_MODEL = "gemini-2.0-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const LANGUAGE_NAMES: Record<string, string> = {
  en: "English",
  ru: "Russian",
  tg: "Tajik",
};

function buildSystemPrompt(languageName: string, includeTranscript: boolean) {
  const transcriptField = includeTranscript
    ? `\n  "transcript": <a faithful text transcription of what the student said, in the language they spoke>,`
    : "";

  const audioNote = includeTranscript
    ? "You will be given an audio recording of a student explaining a topic out loud, instead of written text. First transcribe what they said, then assess it exactly as you would a written explanation."
    : "";

  return `You are Echo, an AI learning coach built on the Feynman technique: a student truly understands a topic once they can explain it in their own words, and gaps in their explanation reveal gaps in their understanding.

${audioNote}

You will be given a topic and the student's explanation of it. Assess how solid their understanding actually is, based only on what they said — not on how polished the delivery is.

Respond with ONLY a JSON object matching exactly this shape:
{${transcriptField}
  "score": <integer 0-100, how solid their understanding is>,
  "strengths": [<1 to 3 short strings, specific things they got right>],
  "gaps": [<1 to 3 short strings, specific missing, vague, or incorrect concepts>],
  "followUp": <one targeted question that would push the student to close the biggest gap themselves>
}

Write all string values (strengths, gaps, followUp${includeTranscript ? ", transcript" : ""}) in ${languageName}, regardless of what language the student used, unless transcribing — the transcript should stay in whatever language the student actually spoke.

Be concrete and reference what they actually said rather than giving generic advice. If the explanation is empty, nonsensical, or clearly unrelated to the topic, score it low and say so plainly in "gaps".`;
}

export async function POST(req: NextRequest) {
  let body: AnalyzeRequestBody;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const mode = body.mode === "audio" ? "audio" : "text";
  const topic = (body.topic ?? "").trim();
  const languageName = LANGUAGE_NAMES[body.lang ?? "en"] ?? "English";

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY is not configured on the server" },
      { status: 500 }
    );
  }

  let requestParts: Record<string, unknown>[];

  if (mode === "audio") {
    const audioBase64 = body.audioBase64;
    const audioMimeType = body.audioMimeType || "audio/webm";

    if (!audioBase64) {
      return NextResponse.json(
        { error: "`audioBase64` is required for mode=\"audio\"" },
        { status: 400 }
      );
    }

    requestParts = [
      {
        text: `Topic: ${topic || "(not specified)"}\n\nThe audio below is the student explaining this topic out loud.`,
      },
      {
        inline_data: {
          mime_type: audioMimeType,
          data: audioBase64,
        },
      },
    ];
  } else {
    const explanation = (body.explanation ?? "").trim();

    if (!explanation) {
      return NextResponse.json(
        { error: "`explanation` is required for mode=\"text\"" },
        { status: 400 }
      );
    }

    requestParts = [
      {
        text: `Topic: ${topic || "(not specified)"}\n\nStudent's explanation:\n${explanation}`,
      },
    ];
  }

  try {
    const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: buildSystemPrompt(languageName, mode === "audio") }],
        },
        contents: [{ role: "user", parts: requestParts }],
        generationConfig: {
          responseMimeType: "application/json",
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API error ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const text: string | undefined =
      data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error("Gemini returned no text content");
    }

    const feedback = parseFeedback(text, mode === "audio");
    return NextResponse.json(feedback);
  } catch (err) {
    console.error("Echo analyze error:", err);
    return NextResponse.json(
      { error: "Failed to analyze explanation" },
      { status: 502 }
    );
  }
}

function parseFeedback(raw: string, expectTranscript: boolean): Feedback {
  const cleaned = raw
    .trim()
    .replace(/^```(json)?/i, "")
    .replace(/```$/, "")
    .trim();

  const parsed = JSON.parse(cleaned);

  if (
    typeof parsed.score !== "number" ||
    !Array.isArray(parsed.strengths) ||
    !Array.isArray(parsed.gaps) ||
    typeof parsed.followUp !== "string"
  ) {
    throw new Error("Model response did not match the expected shape");
  }

  const feedback: Feedback = {
    score: Math.max(0, Math.min(100, Math.round(parsed.score))),
    strengths: parsed.strengths.slice(0, 3).map(String),
    gaps: parsed.gaps.slice(0, 3).map(String),
    followUp: String(parsed.followUp),
  };

  if (expectTranscript && typeof parsed.transcript === "string") {
    feedback.transcript = parsed.transcript;
  }

  return feedback;
}
