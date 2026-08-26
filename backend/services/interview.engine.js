import { askAiJson } from "./gemini.service.js";

const defaultFeedback = {
  confidence: 0,
  vocabulary: 0,
  technical: 0,
  communication: 0,
  suggestions: []
};

function clampScore(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function parseFeedback(rawFeedback) {
  if (typeof rawFeedback !== "string") {
    return defaultFeedback;
  }

  const cleaned = rawFeedback
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

  try {
    const parsed = JSON.parse(cleaned);
    return {
      confidence: clampScore(parsed?.confidence),
      vocabulary: clampScore(parsed?.vocabulary),
      technical: clampScore(parsed?.technical),
      communication: clampScore(parsed?.communication),
      suggestions: Array.isArray(parsed?.suggestions)
        ? parsed.suggestions.map(String).slice(0, 6)
        : []
    };
  } catch {
    const jsonBlock = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonBlock) {
      return defaultFeedback;
    }

    try {
      const parsed = JSON.parse(jsonBlock[0]);
      return {
        confidence: clampScore(parsed?.confidence),
        vocabulary: clampScore(parsed?.vocabulary),
        technical: clampScore(parsed?.technical),
        communication: clampScore(parsed?.communication),
        suggestions: Array.isArray(parsed?.suggestions)
          ? parsed.suggestions.map(String).slice(0, 6)
          : []
      };
    } catch {
      return defaultFeedback;
    }
  }
}

function computeVoiceConfidence(answers = []) {
  const metrics = answers
    .map(item => item?.voiceMetrics)
    .filter(Boolean);

  if (!metrics.length) {
    return 50;
  }

  const avgDurationSec =
    metrics.reduce((acc, m) => acc + (Number(m?.durationMs) || 0), 0) /
    metrics.length /
    1000;
  const avgVolume =
    metrics.reduce((acc, m) => acc + (Number(m?.avgVolume) || 0), 0) /
    metrics.length;
  const peakVolume =
    metrics.reduce((acc, m) => acc + (Number(m?.maxVolume) || 0), 0) /
    metrics.length;

  const durationScore =
    avgDurationSec < 2
      ? 35
      : avgDurationSec > 40
        ? 55
        : Math.min(100, 55 + avgDurationSec * 1.5);
  const avgVolScore =
    avgVolume < 1 ? 30 : avgVolume > 18 ? 70 : Math.min(100, 45 + avgVolume * 3);
  const peakScore =
    peakVolume < 2
      ? 35
      : peakVolume > 30
        ? 65
        : Math.min(100, 50 + peakVolume * 1.6);

  return clampScore(durationScore * 0.45 + avgVolScore * 0.35 + peakScore * 0.2);
}

function fallbackFeedback(answers = []) {
  const confidence = computeVoiceConfidence(answers);
  const wordCounts = answers.map(item =>
    String(item?.answer || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean).length
  );
  const avgWords = wordCounts.length
    ? wordCounts.reduce((a, b) => a + b, 0) / wordCounts.length
    : 0;

  return {
    confidence,
    vocabulary: clampScore(Math.min(100, 30 + avgWords * 1.8)),
    technical: clampScore(Math.min(100, 28 + avgWords * 1.7)),
    communication: clampScore(Math.min(100, 35 + avgWords * 2.2)),
    suggestions: [
      "Keep answers structured with problem, approach, and result.",
      "Use one concrete example in each answer.",
      "Keep each answer focused on impact and outcomes."
    ]
  };
}

export async function runInterview({
  userName,
  interviewType,
  difficulty,
  maxQuestions,
  answers = []
}) {
  const isHr = String(interviewType || "").toLowerCase().includes("hr");
  const transcript = answers.length
    ? answers
        .map((item, index) =>
          `Q${index + 1}: ${item.question || "N/A"}\nA${index + 1}: ${item.answer || "N/A"}`
        )
        .join("\n\n")
    : "No candidate answers were provided.";

  const local = fallbackFeedback(answers);

  const ai = parseFeedback(
    JSON.stringify(
      (await askAiJson(
        `
You are evaluating a ${interviewType} mock interview for ${userName}.
Difficulty: ${difficulty || "medium"}.
Question count: ${maxQuestions}.

Interview transcript:
${transcript}

Score the interview using this rubric:
- confidence: delivery confidence, certainty, composure
- vocabulary: clarity and quality of language
- technical: technical correctness and depth. For HR interviews, score answer relevance, structure, and professionalism instead of hard technical depth.
- communication: organization, directness, completeness, clarity

Return JSON with this exact schema:
{
  "confidence": number,
  "vocabulary": number,
  "technical": number,
  "communication": number,
  "suggestions": ["string", "string", "string"]
}

Rules:
- Scores must be 0-100.
- Suggestions must be specific and actionable.
- For HR interviews, suggestions should focus on behavioral storytelling, clarity, confidence, and professionalism.
        `,
        null
      )) || {}
    )
  );

  return {
    confidence: clampScore(
      ai.confidence ? ai.confidence * 0.6 + local.confidence * 0.4 : local.confidence
    ),
    vocabulary: ai.vocabulary || local.vocabulary,
    technical: ai.technical || (isHr ? clampScore((local.communication + local.vocabulary) / 2) : local.technical),
    communication: ai.communication || local.communication,
    suggestions: ai.suggestions?.length ? ai.suggestions : local.suggestions
  };
}
