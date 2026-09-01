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
import {
  evaluateDsaSolution,
  checkDsaServiceHealth
} from "../controllers/dsa.controller.js";
import {
  getUserPerformanceAnalytics,
  getPerformanceSummary,
  getComparisonAnalytics
} from "../controllers/analytics.controller.js";

const router = express.Router();

// Original interview routes
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

// New Python backend integrated routes
router.post("/dsa/evaluate", evaluateDsaSolution);
router.get("/dsa/health", checkDsaServiceHealth);

// Analytics routes
router.get("/analytics/performance", getUserPerformanceAnalytics);
router.get("/analytics/summary", getPerformanceSummary);
router.get("/analytics/comparison", getComparisonAnalytics);

export default router;
