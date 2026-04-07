/**
 * Email Controller
 * Handles email-related operations
 */

import { Router } from "express";
import Joi from "joi";
import { sendEmail, sendInterviewFeedbackEmail } from "../services/email.service.js";
import { env } from "../config/env.js";

const router = Router();

// Validation schemas
const sendTestSchema = Joi.object({
  to: Joi.string().email().required(),
  subject: Joi.string().max(200).required(),
  message: Joi.string().required()
});

const sendFeedbackSchema = Joi.object({
  to: Joi.string().email().required(),
  feedback: Joi.object({
    scores: Joi.object({
      confidence: Joi.number().min(0).max(100).required(),
      vocabulary: Joi.number().min(0).max(100).required(),
      technical: Joi.number().min(0).max(100).required(),
      communication: Joi.number().min(0).max(100).required()
    }).required(),
    overall: Joi.number().min(0).max(100).required(),
    suggestions: Joi.array().items(Joi.string()).required()
  }).required(),
  sessionInfo: Joi.object({
    type: Joi.string().required(),
    domain: Joi.string().required(),
    createdAt: Joi.string().isoDate().required()
  }).required()
});

/**
 * POST /api/email/test
 * Send a test email (requires API_KEY env for auth)
 * Used for verifying email configuration
 */
router.post("/test", async (req, res, next) => {
  try {
    // Simple API key check for safety
    const apiKey = req.headers["x-api-key"];
    if (env.NODE_ENV === "production" && apiKey !== env.API_KEY) {
      return res.status(403).json({ error: "Invalid or missing API key" });
    }

    const { error } = sendTestSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: "Validation failed", details: error.details.map(d => d.message) });
    }

    const { to, subject, message } = req.body;

    // Dummy email service will just log
    await sendEmail({
      to,
      subject,
      text: message,
      html: `<p>${message}</p>`
    });

    res.json({ success: true, message: `Test email queued to ${to}` });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/email/feedback
 * Send interview feedback email to candidate
 */
router.post("/feedback", async (req, res, next) => {
  try {
    const { error } = sendFeedbackSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: "Validation failed", details: error.details.map(d => d.message) });
    }

    const { to, feedback, sessionInfo } = req.body;

    await sendInterviewFeedbackEmail(to, feedback, sessionInfo);

    res.json({ success: true, message: `Feedback email sent to ${to}` });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/email/status
 * Check email service configuration status
 */
router.get("/status", (_req, res) => {
  const configured = !!(env.SMTP_HOST && env.SMTP_PORT && env.SMTP_USER && env.SMTP_PASS);
  res.json({
    configured,
    from: env.EMAIL_FROM || env.SMTP_USER || null,
    mode: configured ? "smtp" : "dummy"
  });
});

console.log("📧 Email controller loaded");
export default router;
