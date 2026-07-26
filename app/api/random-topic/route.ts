import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type Level = "schoolchild" | "student" | "professional";

type RandomTopicBody = {
  subject?: string;
  level?: Level;
  lang?: "en" | "ru" | "tg";
};

// Same model as /api/analyze — see the comment there for why Flash-Lite
// was chosen over the rolling "-latest" alias (much higher free quota).
const GEMINI_MODEL = "gemini-3.5-flash-lite";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const LANGUAGE_NAMES: Record<string, string> = {
  en: "English",
  ru: "Russian",
  tg: "Tajik",
};

const LEVEL_HINTS: Record<Level, string> = {
  schoolchild: "at a level suitable for a school (K-12) curriculum",
  student: "at a level suitable for a university course",
  professional: "at a level suitable for a professional/expert audience",
};

export async function POST(req: NextRequest) {
  let body: RandomTopicBody;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const subject = (body.subject ?? "").trim();
  if (!subject) {
    return NextResponse.json({ error: "`subject` is required" }, { status: 400 });
  }

  const languageName = LANGUAGE_NAMES[body.lang ?? "en"] ?? "English";
  const level: Level = ["schoolchild", "student", "professional"].includes(body.level ?? "")
    ? (body.level as Level)
    : "student";

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY is not configured on the server" },
      { status: 500 }
    );
  }

  const prompt = `Pick exactly ONE specific, concrete topic that falls within the subject "${subject}", ${LEVEL_HINTS[level]}. It must be narrow enough that someone could explain it out loud from memory in under two minutes — a single concept, law, mechanism, process, or event — never a whole broad field or "everything about X". Pick something different and unpredictable each time, drawn at random from across the entire breadth of the subject, not just the most obvious textbook-chapter-one example.

Respond with ONLY the topic name itself, written in ${languageName}, as a short phrase of 2-6 words. No quotation marks, no trailing punctuation, no explanation, no extra commentary — just the topic phrase and nothing else.`;

  try {
    const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          // Higher temperature than /api/analyze on purpose — this is a
          // "surprise me" feature, repeat clicks should give different
          // topics rather than converging on the same "obvious" one.
          temperature: 1.2,
          maxOutputTokens: 32,
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API error ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const text: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error("Gemini returned no text content");
    }

    const topic = text
      .trim()
      .split("\n")[0]
      .trim()
      .replace(/^["'«“]+|["'»”]+$/g, "")
      .replace(/[.。]+$/, "")
      .trim();

    if (!topic) {
      throw new Error("Empty topic after cleanup");
    }

    return NextResponse.json({ topic });
  } catch (err) {
    console.error("Echo random-topic error:", err);
    return NextResponse.json({ error: "Failed to generate a topic" }, { status: 502 });
  }
}
