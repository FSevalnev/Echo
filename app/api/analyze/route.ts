import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type Level = "beginner" | "intermediate" | "advanced" | "auto";
type Cause = "theory" | "carelessness" | "misreading" | "logic" | "calculation";

type AnalyzeRequestBody = {
  mode?: "text" | "audio";
  topic?: string;
  explanation?: string;
  audioBase64?: string;
  audioMimeType?: string;
  lang?: "en" | "ru" | "tg";
  level?: Level;
  previousScores?: number[];
};

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

type Feedback = {
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

// Free tier, no billing/card required — get a key at
// https://aistudio.google.com/apikey and put it in .env.local as
// GEMINI_API_KEY=... (see .env.example).
//
// Google retires dated Gemini model IDs on a rolling basis (e.g.
// gemini-2.0-flash was shut down June 1, 2026 — which is why real
// analysis was silently failing and falling back to the offline mock).
// "gemini-flash-latest" is a moving alias that always points at
// whatever the current flash model is, so this doesn't have to be
// updated by hand every time Google deprecates the pinned version.
const GEMINI_MODEL = "gemini-flash-latest";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const LANGUAGE_NAMES: Record<string, string> = {
  en: "English",
  ru: "Russian",
  tg: "Tajik",
};

const CAUSE_VALUES: Cause[] = [
  "theory",
  "carelessness",
  "misreading",
  "logic",
  "calculation",
];

const LEVEL_INSTRUCTIONS: Record<Level, string> = {
  beginner:
    "The student self-identifies as a BEGINNER. Use the simplest possible language, explain every term you use, keep the explanation of correct answers very step-by-step, and be extra encouraging in tone.",
  intermediate:
    "The student self-identifies as INTERMEDIATE. Assume basic vocabulary is known. Give a deeper analysis, point out subtler issues, and don't over-explain the basics.",
  advanced:
    "The student self-identifies as ADVANCED. Use precise, professional/technical language. Focus on rigor, edge cases, optimization, and nuance rather than basics — treat them as a peer.",
  auto: "The student did not specify a level. Infer their likely level from the vocabulary, depth, and correctness of their explanation, and adapt your tone and depth accordingly. Do not mention that you inferred it.",
};

function buildSystemPrompt(
  languageName: string,
  includeTranscript: boolean,
  level: Level,
  previousScores: number[]
): string {
  const transcriptField = includeTranscript
    ? `\n  "transcript": <a faithful text transcription of what the student said, in the language they spoke>,`
    : "";

  const audioNote = includeTranscript
    ? "You will be given an audio recording of a student explaining a topic out loud, instead of written text. First transcribe what they said, then assess it exactly as you would a written explanation.\n\n"
    : "";

  const progressNote =
    previousScores.length > 0
      ? `The student's previous scores on this exact topic, oldest to newest, were: ${JSON.stringify(
          previousScores
        )}. In "progressNote", explicitly compare the current score to this history — say whether they're improving, plateauing, or regressing, by roughly how much, in one or two sentences.`
      : `This is the student's first recorded attempt on this topic (no history yet). Set "progressNote" to a short, friendly note saying so — do not invent a comparison.`;

  return `You are Echo, an AI learning coach built on the Feynman technique: a student truly understands a topic once they can explain it in their own words, and the specific gaps in their explanation reveal the specific gaps in their understanding.

${audioNote}Your job is to give a fully individualized, non-generic analysis of ONE student's explanation of ONE topic — never a templated response. Judge based on everything they actually wrote/said: correctness, completeness, logical coherence, accurate use of terms and concepts, and the quality of their reasoning process, not just whether the final "answer" sounds right.

${LEVEL_INSTRUCTIONS[level]}

${progressNote}

## Scoring (0–100)

Use the full 0–100 scale honestly and consistently — do not cluster scores near round numbers out of politeness. Two identical explanations must always receive the identical score. The scale means:
- 0–20: the explanation barely meets the requirements of the topic.
- 21–40: only a small part is covered correctly; many mistakes.
- 41–60: average — there are significant gaps.
- 61–80: good, but with some mistakes or inaccuracies.
- 81–90: very good, only minor notes.
- 91–99: nearly flawless.
- 100: fully correct and complete, no mistakes at all.

Give partial credit for partially correct reasoning — never grade as pure pass/fail. Weigh a conceptual/foundational mistake more heavily than a minor wording slip.

## What to evaluate

Score against 3–6 criteria you choose as relevant to this specific topic and explanation (e.g. correctness, completeness, logical coherence, correct use of terminology/concepts, quality of the reasoning process/argumentation, and — only if the explanation involves a calculation or formula — computational accuracy). Each criterion gets its own 0–100 sub-score and a one-sentence justification.

For every distinct mistake you find (factual error, missing concept, vague claim, logical gap, miscalculation, misunderstanding of the topic itself), classify its root cause as exactly one of: "theory" (gap in theoretical knowledge), "carelessness", "misreading" (misunderstood what the topic/task actually asks), "logic" (flawed reasoning step), or "calculation" (arithmetic/computational error). If there truly are no mistakes, return an empty "mistakes" array.

## Output format

Respond with ONLY a JSON object, no markdown fences, no commentary, matching exactly this shape:
{${transcriptField}
  "score": <integer 0-100>,
  "summary": <2-3 sentence overall verdict covering both strengths and weaknesses>,
  "strengths": [<1-4 short strings — specific things the student got right, not generic praise>],
  "mistakes": [
    {
      "issue": <what specifically was wrong, vague, or missing>,
      "whyWrong": <why that is incorrect, explained clearly>,
      "correction": <the correct explanation of that point, in simple step-by-step language matching the student's level>,
      "cause": <one of "theory" | "carelessness" | "misreading" | "logic" | "calculation">
    }
  ],
  "criteria": [
    { "name": <criterion name>, "score": <0-100>, "comment": <one sentence justification> }
  ],
  "recommendations": [<1-4 short, personalized action items that target THIS student's specific weak spots — not generic study tips>],
  "reviewTopics": [<0-3 short names of prerequisite or related topics worth revisiting, based on the gaps found>],
  "practiceExamples": [<0-3 short example prompts/questions the student could practice next on this same topic, to reinforce what they got wrong>],
  "followUp": <one targeted question that would push the student to close their single biggest gap themselves>,
  "motivation": <one honest, specific, non-generic motivational sentence — acknowledge real effort or real progress, do not praise for its own sake, and do not be discouraging even for a low score>
}

Write every string value in ${languageName}, except "transcript" (if present), which should stay in whatever language the student actually spoke, and except the "cause" field, which must always be exactly one of the five English enum values listed above.

Be concrete and reference what the student actually wrote/said. If the explanation is empty, nonsensical, or clearly unrelated to the topic, score it low, explain plainly why in "mistakes", and keep "strengths" as an empty array rather than inventing one.`;
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
  const level: Level = ["beginner", "intermediate", "advanced", "auto"].includes(
    body.level ?? ""
  )
    ? (body.level as Level)
    : "auto";
  const previousScores = Array.isArray(body.previousScores)
    ? body.previousScores.filter((n) => typeof n === "number").slice(-5)
    : [];

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
          parts: [
            {
              text: buildSystemPrompt(languageName, mode === "audio", level, previousScores),
            },
          ],
        },
        contents: [{ role: "user", parts: requestParts }],
        generationConfig: {
          responseMimeType: "application/json",
          // Low temperature so the same explanation scores the same way
          // on repeat checks, per the "consistent grading" requirement.
          temperature: 0,
          // The detailed feedback schema (mistakes, criteria, etc.) is
          // long — without an explicit cap the response could get cut
          // off mid-JSON and fail to parse.
          maxOutputTokens: 4096,
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
    const finishReason = data?.candidates?.[0]?.finishReason;

    if (!text) {
      console.error(
        "Echo analyze error: Gemini returned no text content. Full response:",
        JSON.stringify(data)
      );
      throw new Error(`Gemini returned no text content (finishReason: ${finishReason})`);
    }

    try {
      const feedback = parseFeedback(text, mode === "audio");
      return NextResponse.json(feedback);
    } catch (parseErr) {
      // Log the raw model output so the exact cause (truncation,
      // stray prose, wrong shape, etc.) is visible in server logs.
      console.error(
        "Echo analyze error: failed to parse model output. finishReason:",
        finishReason,
        "raw text:",
        text
      );
      throw parseErr;
    }
  } catch (err) {
    console.error("Echo analyze error:", err);
    return NextResponse.json(
      { error: "Failed to analyze explanation" },
      { status: 502 }
    );
  }
}

function clampScore(value: unknown): number {
  const n = typeof value === "number" && Number.isFinite(value) ? value : 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function toStringArray(value: unknown, max: number): string[] {
  if (!Array.isArray(value)) return [];
  return value.slice(0, max).map(String);
}

function parseFeedback(raw: string, expectTranscript: boolean): Feedback {
  const cleaned = raw
    .trim()
    .replace(/^```(json)?/i, "")
    .replace(/```$/, "")
    .trim();

  const parsed = JSON.parse(cleaned);

  if (typeof parsed.score !== "number" || typeof parsed.summary !== "string") {
    throw new Error("Model response did not match the expected shape");
  }

  const mistakes: Mistake[] = Array.isArray(parsed.mistakes)
    ? parsed.mistakes.slice(0, 6).map((m: Record<string, unknown>) => ({
        issue: String(m?.issue ?? ""),
        whyWrong: String(m?.whyWrong ?? ""),
        correction: String(m?.correction ?? ""),
        cause: CAUSE_VALUES.includes(m?.cause as Cause) ? (m.cause as Cause) : "theory",
      }))
    : [];

  const criteria: Criterion[] = Array.isArray(parsed.criteria)
    ? parsed.criteria.slice(0, 8).map((c: Record<string, unknown>) => ({
        name: String(c?.name ?? ""),
        score: clampScore(c?.score),
        comment: String(c?.comment ?? ""),
      }))
    : [];

  const feedback: Feedback = {
    score: clampScore(parsed.score),
    summary: String(parsed.summary),
    strengths: toStringArray(parsed.strengths, 4),
    mistakes,
    criteria,
    recommendations: toStringArray(parsed.recommendations, 4),
    reviewTopics: toStringArray(parsed.reviewTopics, 3),
    practiceExamples: toStringArray(parsed.practiceExamples, 3),
    progressNote: typeof parsed.progressNote === "string" ? parsed.progressNote : "",
    motivation: typeof parsed.motivation === "string" ? parsed.motivation : "",
    followUp: typeof parsed.followUp === "string" ? parsed.followUp : "",
  };

  if (expectTranscript && typeof parsed.transcript === "string") {
    feedback.transcript = parsed.transcript;
  }

  return feedback;
}
