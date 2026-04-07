import express from "express";
import {
  startInterview,
  getVoiceConfig,
  extractName,
  nextQuestion,
  transcribeAudio,
  dsaPracticeQuestions,
  evaluateDsaPractice,
  recentInterviews,
  sessionsSummary,
  profileSummary,
  geminiHealth
} from "../controllers/interview.controller.js";

const router = express.Router();

router.post("/start", startInterview);
router.get("/voice-config", getVoiceConfig);
router.get("/recent", recentInterviews);
router.get("/sessions", sessionsSummary);
router.get("/profile-summary", profileSummary);
router.get("/gemini-health", geminiHealth);
router.get("/dsa-practice/questions", dsaPracticeQuestions);
router.post("/extract-name", extractName);
router.post("/next-question", nextQuestion);
router.post("/transcribe", transcribeAudio);
router.post("/dsa-practice/evaluate", evaluateDsaPractice);

export default router;
