import { runInterview } from "../services/interview.engine.js";
import { getVapiConfig } from "../services/vapi.service.js";
import {
  checkGeminiHealth,
  transcribeAudioWithGemini
} from "../services/gemini.service.js";
import {
  extractNameFromSpeech,
  generateInterviewQuestion
} from "../services/question.service.js";
import {
  evaluateDsaPracticeAnswer,
  getDsaPracticeQuestions
} from "../services/dsa-practice.service.js";
import {
  saveInterviewSession,
  getRecentSessions,
  getProfileSummary,
  getSessionSummary,
  saveModuleScore
} from "../services/db.service.js";
import Joi from "joi";

const startInterviewSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  type: Joi.string().valid('technical', 'hr').required(),
  domain: Joi.string().max(100).optional().allow(''),
  difficulty: Joi.string().valid('easy', 'medium', 'hard').required(),
  totalQuestions: Joi.number().integer().min(1).max(20).required(),
  answers: Joi.array().items(
    Joi.object({
      question: Joi.string().required(),
      answer: Joi.string().required()
    })
  ).optional()
});

export const startInterview = async (req, res) => {
  try {
    const { error } = startInterviewSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: "Validation failed",
        details: error.details.map(d => d.message)
      });
    }

    const { name, type, domain, difficulty, totalQuestions, answers = [] } = req.body;
    const userId = req.headers["x-user-id"];

    const result = await runInterview({
      userName: name,
      interviewType: domain ? `${type} (${domain})` : type,
      difficulty,
      maxQuestions: totalQuestions,
      answers
    });

    await saveInterviewSession({
      userName: name || "User",
      type: type || "technical",
      domain: domain || "general",
      difficulty: difficulty || "medium",
      totalQuestions: Number(totalQuestions) || answers.length || 1,
      answers,
      feedback: result
    }, userId);

    res.json(result);
  } catch (error) {
    console.error("Start interview error:", error);
    res.status(500).json({
      error: "Failed to run interview",
      details: process.env.NODE_ENV === 'development' ? error?.message : undefined
    });
  }
};

export const recentInterviews = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 10;
    const userId = req.headers["x-user-id"];
    const sessions = await getRecentSessions(limit, userId || undefined);
    res.json({ sessions });
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch recent interviews",
      details: error?.message || "Unknown error"
    });
  }
};

export const sessionsSummary = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 50;
    const userId = req.headers["x-user-id"];
    const summary = await getSessionSummary(limit, userId || undefined);
    res.json(summary);
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch session summary",
      details: error?.message || "Unknown error"
    });
  }
};

export const profileSummary = async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const summary = await getProfileSummary(userId || undefined);
    res.json({ summary });
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch profile summary",
      details: error?.message || "Unknown error"
    });
  }
};

export const geminiHealth = async (_req, res) => {
  try {
    const status = await checkGeminiHealth();
    res.json(status);
  } catch (error) {
    res.status(500).json({
      ok: false,
      reason: error?.message || "Failed to check Gemini health"
    });
  }
};

export const getVoiceConfig = (_req, res) => {
  try {
    const config = getVapiConfig();
    res.json(config);
  } catch (error) {
    res.status(500).json({
      error: "Failed to load voice config",
      details: error?.message || "Unknown error"
    });
  }
};

const extractNameSchema = Joi.object({
  transcript: Joi.string().required()
});

export const extractName = async (req, res) => {
  try {
    const { error } = extractNameSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: "Validation failed",
        details: error.details.map(d => d.message)
      });
    }

    const { transcript } = req.body;
    const name = await extractNameFromSpeech(transcript || "");
    res.json({ name });
  } catch (error) {
    console.error("Extract name error:", error);
    res.status(500).json({
      error: "Failed to extract name",
      details: process.env.NODE_ENV === 'development' ? error?.message : undefined
    });
  }
};

const nextQuestionSchema = Joi.object({
  userName: Joi.string().optional(),
  interviewType: Joi.string().required(),
  domain: Joi.string().optional().allow(''),
  difficulty: Joi.string().valid('easy', 'medium', 'hard').required(),
  askedQuestions: Joi.number().integer().min(0).optional(),
  lastAnswer: Joi.string().optional().allow('')
});

export const nextQuestion = async (req, res) => {
  try {
    const { error } = nextQuestionSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: "Validation failed",
        details: error.details.map(d => d.message)
      });
    }

    const {
      userName,
      interviewType,
      domain,
      difficulty,
      askedQuestions = 0,
      lastAnswer = ""
    } = req.body;

    const question = await generateInterviewQuestion({
      userName: userName || "User",
      interviewType: interviewType || "technical",
      domain: domain || "general",
      difficulty: difficulty || "medium",
      askedQuestions: Number(askedQuestions) || 0,
      lastAnswer
    });

    res.json({ question });
  } catch (error) {
    console.error("Next question error:", error);
    res.status(500).json({
      error: "Failed to generate question",
      details: process.env.NODE_ENV === 'development' ? error?.message : undefined
    });
  }
};

const transcribeAudioSchema = Joi.object({
  audioBase64: Joi.string().required(),
  mimeType: Joi.string().optional().default('audio/webm')
});

export const transcribeAudio = async (req, res) => {
  try {
    const { error } = transcribeAudioSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: "Validation failed",
        details: error.details.map(d => d.message)
      });
    }

    const { audioBase64, mimeType } = req.body;
    const cleanBase64 = String(audioBase64).replace(/^data:[^,]+,/, "");
    const transcript = await transcribeAudioWithGemini({
      audioBase64: cleanBase64,
      mimeType: mimeType || "audio/webm"
    });

    if (!transcript) {
      return res.status(422).json({
        error: "Could not transcribe audio"
      });
    }

    return res.json({ transcript });
  } catch (error) {
    console.error("Transcribe audio error:", error);
    return res.status(500).json({
      error: "Failed to transcribe audio",
      details: process.env.NODE_ENV === 'development' ? error?.message : undefined
    });
  }
};

export const dsaPracticeQuestions = (_req, res) => {
  try {
    const questions = getDsaPracticeQuestions();
    res.json({ questions });
  } catch (error) {
    res.status(500).json({
      error: "Failed to load DSA practice questions",
      details: error?.message || "Unknown error"
    });
  }
};

const evaluateDsaSchema = Joi.object({
  questionId: Joi.string().required(),
  answer: Joi.string().optional().allow(''),
  language: Joi.string().optional().default('javascript')
});

export const evaluateDsaPractice = async (req, res) => {
  try {
    const { error } = evaluateDsaSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: "Validation failed",
        details: error.details.map(d => d.message)
      });
    }

    const { questionId, answer, language } = req.body;
    const userId = req.headers["x-user-id"];

    const result = await evaluateDsaPracticeAnswer({
      questionId,
      answer: answer || "",
      language: language || "javascript"
    });

    await saveModuleScore("technical", Number(result?.evaluation?.score || 0), userId || undefined);
    return res.json(result);
  } catch (error) {
    console.error("Evaluate DSA practice error:", error);
    return res.status(500).json({
      error: "Failed to evaluate DSA practice answer",
      details: process.env.NODE_ENV === 'development' ? error?.message : undefined
    });
  }
};
