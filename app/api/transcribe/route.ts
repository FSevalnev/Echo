import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

// Transcription-only endpoint used by the voice-mode "record -> edit -> submit"
// flow: right after a student stops recording, the audio is sent here first
// so they can review/correct the text before it ever goes to /api/analyze for
// grading. This keeps grading fully separate from transcription accuracy —
// what gets scored is exactly what the student confirms they said.
//
// Uses the same Gemini model as /api/analyze for consistency; see that file
// for notes on model choice and quota.
const GEMINI_MODEL = "gemini-3.5-flash-lite";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const LANGUAGE_NAMES: Record<string, string> = {
  en: "English",
  ru: "Russian",
  tg: "Tajik",
};

type TranscribeRequestBody = {
  audioBase64?: string;
  audioMimeType?: string;
  lang?: "en" | "ru" | "tg";
};

export async function POST(req: NextRequest) {
  let body: TranscribeRequestBody;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const audioBase64 = body.audioBase64;
  const audioMimeType = body.audioMimeType || "audio/webm";
  const languageName = LANGUAGE_NAMES[body.lang ?? "en"] ?? "English";

  if (!audioBase64) {
    return NextResponse.json({ error: "`audioBase64` is required" }, { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY is not configured on the server" },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: {
          parts: [
            {
              text: `Transcribe the audio recording verbatim, in whatever language the speaker is actually using (most likely ${languageName}, but transcribe the real spoken language, not a translation). Output ONLY the transcript text — no quotes, no markdown, no commentary, no speaker labels. If the audio is silent, unintelligible, or contains no speech, output an empty string.`,
            },
          ],
        },
        contents: [
          {
            role: "user",
            parts: [
              {
                inline_data: {
                  mime_type: audioMimeType,
                  data: audioBase64,
                },
              },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: "text/plain",
          temperature: 0,
          maxOutputTokens: 2048,
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API error ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const text: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (typeof text !== "string") {
      const finishReason = data?.candidates?.[0]?.finishReason;
      console.error(
        "Echo transcribe error: Gemini returned no text content. finishReason:",
        finishReason,
        "full response:",
        JSON.stringify(data)
      );
      throw new Error("Gemini returned no text content");
    }

    return NextResponse.json({ transcript: text.trim() });
  } catch (err) {
    console.error("Echo transcribe error:", err);
    return NextResponse.json({ error: "Failed to transcribe audio" }, { status: 502 });
  }
}
