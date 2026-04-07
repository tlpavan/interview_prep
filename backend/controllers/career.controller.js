import { askGemini } from "../services/gemini.service.js";
import { saveModuleScore } from "../services/db.service.js";
import Joi from "joi";

function buildFallbackRoadmap(skills, goals) {
  const skillList = String(skills || "")
    .split(",")
    .map(item => item.trim())
    .filter(Boolean);
  const goalText = String(goals || "software role").trim();
  const focus = skillList.length ? skillList.join(", ") : "core programming, databases, and system design";

  return [
    `Target role: ${goalText}`,
    "30 days: Strengthen foundations and complete one small project.",
    `60 days: Build two portfolio projects using ${focus}.`,
    "90 days: Practice interviews, refine resume, and apply with measurable project outcomes.",
    "Weekly: 3 coding sessions, 2 mock interviews, 1 project review."
  ].join("\n");
}

const careerPathSchema = Joi.object({
  skills: Joi.array().items(Joi.string()).min(1).required(),
  goals: Joi.string().min(5).max(500).required()
});

export async function careerPath(req, res) {
  try {
    const { error } = careerPathSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: "Validation failed",
        details: error.details.map(d => d.message)
      });
    }

    const { skills, goals } = req.body;
    const userId = req.headers["x-user-id"];

    const aiRoadmap = await askGemini(
      `Create a career roadmap for skills: ${skills}
       Goal: ${goals}
       Include timeline and technologies`
    );
    const roadmap =
      aiRoadmap && aiRoadmap !== "No response"
        ? aiRoadmap
        : buildFallbackRoadmap(skills, goals);

    const score = aiRoadmap && aiRoadmap !== "No response" ? 75 : 55;
    await saveModuleScore("career", score, userId || undefined);

    res.json({ roadmap });
  } catch (error) {
    console.error("Career path error:", error);
    res.status(500).json({
      error: "Failed to build career path",
      details: process.env.NODE_ENV === 'development' ? error?.message : undefined
    });
  }
}
