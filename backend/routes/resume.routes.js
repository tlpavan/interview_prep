import express from "express";
import { analyzeResume, improveResumeBuilder } from "../controllers/resume.controller.js";

const router = express.Router();

router.post("/analyze", analyzeResume);
router.post("/improve", improveResumeBuilder);

export default router;
