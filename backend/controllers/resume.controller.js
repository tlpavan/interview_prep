import { askAiJson } from "../services/gemini.service.js";
import { saveModuleScore } from "../services/db.service.js";
import { resolveAuthenticatedUser } from "../services/auth.service.js";
import Joi from "joi";

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

function rewriteBullet(text, fallbackPrefix = "Delivered") {
  const clean = String(text || "").replace(/\s+/g, " ").trim();
  if (!clean) return "";
  const sentence = clean.charAt(0).toUpperCase() + clean.slice(1).replace(/[.]+$/, "");
  if (/^Worked on\s+/i.test(sentence)) {
    return `Developed ${sentence.replace(/^Worked on\s+/i, "").trim()}.`;
  }
  if (/^Added\s+/i.test(sentence)) {
    return `Added ${sentence.replace(/^Added\s+/i, "").trim()}.`;
  }
  if (/^Improved\s+/i.test(sentence)) {
    return `Improved ${sentence.replace(/^Improved\s+/i, "").trim()}.`;
  }
  const startsWithVerb = /^(Built|Led|Designed|Developed|Implemented|Improved|Optimized|Created|Reduced|Delivered|Automated|Integrated)\b/i.test(sentence);
  return startsWithVerb ? `${sentence}.` : `${fallbackPrefix} ${sentence.charAt(0).toLowerCase() + sentence.slice(1)}.`;
}

function heuristicResumeImprovement(data) {
  const skills = Array.isArray(data.skills) ? data.skills.filter(Boolean) : [];
  const role = data.role || "Software Developer";
  const summary = data.summary?.trim()
    ? rewriteBullet(data.summary, "Built")
    : `Backend-focused ${role} with experience building APIs, shipping user-facing features, and improving application performance.`;

  const experience = (data.experience || []).map(item => ({
    role: item.role || "",
    company: item.company || "",
    dates: item.dates || "",
    location: item.location || "",
    bullets: (item.bullets || [])
      .map(bullet => rewriteBullet(bullet, "Improved"))
      .filter(Boolean)
  }));

  const projects = (data.projects || []).map(item => ({
    name: item.name || "",
    stack: item.stack || "",
    link: item.link || "",
    bullets: (item.bullets || [])
      .map(bullet => rewriteBullet(bullet, "Built"))
      .filter(Boolean)
  }));

  return {
    summary,
    skills,
    experience,
    projects
  };
}

const analyzeResumeSchema = Joi.object({
  resumeText: Joi.string().min(20).required()
});

const improveResumeSchema = Joi.object({
  fullName: Joi.string().allow("").optional(),
  role: Joi.string().allow("").optional(),
  summary: Joi.string().allow("").optional(),
  skills: Joi.array().items(Joi.string()).optional().default([]),
  experience: Joi.array().items(
    Joi.object({
      role: Joi.string().allow("").optional(),
      company: Joi.string().allow("").optional(),
      dates: Joi.string().allow("").optional(),
      location: Joi.string().allow("").optional(),
      bullets: Joi.array().items(Joi.string()).optional().default([])
    })
  ).optional().default([]),
  projects: Joi.array().items(
    Joi.object({
      name: Joi.string().allow("").optional(),
      stack: Joi.string().allow("").optional(),
      link: Joi.string().allow("").optional(),
      bullets: Joi.array().items(Joi.string()).optional().default([])
    })
  ).optional().default([])
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
    const user = await resolveAuthenticatedUser(req);
    const userId = user?.id;

    const analysis = await askAiJson(
      `
Analyze this resume for ATS quality and return JSON.

Schema:
{
  "atsScore": number,
  "technicalStrength": "string",
  "communicationStrength": "string",
  "missingKeywords": ["string"],
  "suggestions": ["string"]
}

Rules:
- atsScore must be 0-100.
- missingKeywords should contain practical missing terms.
- suggestions should be specific improvements.

Resume text:
${resumeText}
      `,
      null
    );
    const finalAnalysis =
      !analysis || Number(analysis.atsScore) === 0
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

export async function improveResumeBuilder(req, res) {
  let value;
  try {
    const { error, value: validated } = improveResumeSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: "Validation failed",
        details: error.details.map(d => d.message)
      });
    }
    value = validated;

    const result = await askAiJson(
      `
You are an expert ATS resume writer.
Rewrite the provided resume-builder data to be sharper, ATS-friendly, and impact-focused.

Input JSON:
${JSON.stringify(value, null, 2)}

Return JSON only with this schema:
{
  "summary": "string",
  "skills": ["string"],
  "experience": [{"role":"string","company":"string","dates":"string","location":"string","bullets":["string"]}],
  "projects": [{"name":"string","stack":"string","link":"string","bullets":["string"]}]
}

Rules:
- Keep facts grounded in the provided input.
- Improve wording, grammar, and impact.
- Each bullet should start with a strong action verb.
- Keep bullets concise and ATS-friendly.
      `,
      null
    );

    return res.json({ improved: result || heuristicResumeImprovement(value) });
  } catch (error) {
    console.error("Improve resume builder error:", error);
    if (value) {
      return res.json({ improved: heuristicResumeImprovement(value), fallback: true });
    }
    return res.status(500).json({
      error: "Failed to improve resume builder content",
      details: process.env.NODE_ENV === 'development' ? error?.message : undefined
    });
  }
}
