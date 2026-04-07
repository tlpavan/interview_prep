import { askGemini } from "../services/gemini.service.js";
import { saveModuleScore } from "../services/db.service.js";
import Joi from "joi";

function parseResumeJson(raw) {
  const fallback = {
    atsScore: 0,
    technicalStrength: "No response",
    communicationStrength: "No response",
    missingKeywords: [],
    suggestions: []
  };

  if (typeof raw !== "string") return fallback;
  const cleaned = raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

  try {
    const parsed = JSON.parse(cleaned);
    return { ...fallback, ...parsed };
  } catch {
    const block = cleaned.match(/\{[\s\S]*\}/);
    if (!block) return fallback;
    try {
      const parsed = JSON.parse(block[0]);
      return { ...fallback, ...parsed };
    } catch {
      return fallback;
    }
  }
}

function heuristicResumeAnalysis(resumeText) {
  const text = String(resumeText || "").toLowerCase();
  const techKeywords = [
    "javascript", "typescript", "node", "react", "python", "java",
    "sql", "mongodb", "aws", "docker", "kubernetes", "rest", "api", "git"
  ];
  const hits = techKeywords.filter(k => text.includes(k));

  const atsScore = Math.min(95, 35 + hits.length * 4);
  return {
    atsScore,
    technicalStrength: hits.length >= 5 ? "Strong technical stack coverage." : "Needs stronger technical keyword coverage.",
    communicationStrength: text.includes("led") || text.includes("collaborated")
      ? "Good communication indicators found."
      : "Add measurable communication and collaboration examples.",
    missingKeywords: techKeywords.filter(k => !text.includes(k)).slice(0, 6),
    suggestions: [
      "Add quantified impact (e.g., reduced latency by 30%).",
      "Mention core backend architecture and deployment tools.",
      "Ensure each project includes role, stack, and outcome."
    ]
  };
}

const analyzeResumeSchema = Joi.object({
  resumeText: Joi.string().min(50).required()
});

export async function analyzeResume(req, res) {
  try {
    const { error } = analyzeResumeSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: "Validation failed",
        details: error.details.map(d => d.message)
      });
    }

    const { resumeText } = req.body;
    const userId = req.headers["x-user-id"];

    const raw = await askGemini(`
Analyze this resume and return JSON only:
{
  "atsScore": number (0-100),
  "technicalStrength": "string",
  "communicationStrength": "string",
  "missingKeywords": ["string"],
  "suggestions": ["string"]
}
Resume text:
${resumeText}
`);

    const analysis = parseResumeJson(raw);
    const finalAnalysis =
      raw === "No response" || Number(analysis.atsScore) === 0
        ? heuristicResumeAnalysis(resumeText)
        : analysis;

    await saveModuleScore("resume", Number(finalAnalysis.atsScore || 0), userId || undefined);
    res.json({ analysis: finalAnalysis });
  } catch (error) {
    console.error("Analyze resume error:", error);
    res.status(500).json({
      error: "Failed to analyze resume",
      details: process.env.NODE_ENV === 'development' ? error?.message : undefined
    });
  }
}
