/**
 * Email Service
 * Sends transactional emails using Nodemailer
 */

import nodemailer from "nodemailer";
import { env } from "../config/env.js";

let transporter = null;

/**
 * Initialize the email transporter using SMTP settings from environment
 */
function initializeTransporter() {
  // If SMTP credentials are not fully configured, use a dummy transporter
  if (!env.SMTP_HOST || !env.SMTP_PORT || !env.SMTP_USER || !env.SMTP_PASS) {
    console.log("📧 Email service not configured: SMTP credentials missing. Using dummy transport.");
    transporter = {
      sendMail: async (options) => {
        console.log("📧 [DUMMY] Would send email:", {
          to: options.to,
          from: options.from,
          subject: options.subject,
          text: options.text?.substring(0, 100) + "...",
          htmlLength: options.html?.length || 0
        });
        return { messageId: "dummy-" + Date.now() };
      }
    };
    return transporter;
  }

  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: Number(env.SMTP_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS
    },
    // Optional TLS configuration
    tls: {
      rejectUnauthorized: false // Set to true in production with valid certificates
    }
  });

  console.log("📧 Email transporter configured:", env.SMTP_HOST, env.SMTP_PORT);
  return transporter;
}

/**
 * Send an email
 * @param {Object} options - Email options
 * @param {string|string[]} options.to - Recipient email(s)
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text body
 * @param {string} options.html - HTML body
 * @param {string} [options.from] - Sender email (defaults to EMAIL_FROM env)
 * @returns {Promise<{messageId: string}>}
 */
export async function sendEmail(options) {
  if (!transporter) {
    initializeTransporter();
  }

  const from = options.from || env.EMAIL_FROM || env.SMTP_USER || "noreply@example.com";

  try {
    const result = await transporter.sendMail({
      from,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html
    });

    console.log(`📧 Email sent to ${options.to} (Message-ID: ${result.messageId})`);
    return { messageId: result.messageId };
  } catch (error) {
    console.error("📧 Failed to send email:", error);
    throw error;
  }
}

/**
 * Send interview feedback email
 * @param {string} to - Recipient email
 * @param {Object} feedback - Feedback object (scores, overall, suggestions)
 * @param {Object} sessionInfo - Interview session info (type, domain, date)
 */
export async function sendInterviewFeedbackEmail(to, feedback, sessionInfo) {
  const { scores, overall, suggestions } = feedback;
  const { type, domain, createdAt } = sessionInfo;

  const subject = `Your Interview Feedback - ${type.charAt(0).toUpperCase() + type.slice(1)} Interview`;

  // Plain text version
  const text = `
Hello,

Here is your interview feedback from ${new Date(createdAt).toLocaleDateString()}:

Interview Type: ${type}
Domain: ${domain}
Overall Score: ${overall}/100

Breakdown:
- Confidence: ${scores.confidence}%
- Vocabulary: ${scores.vocabulary}%
- Technical: ${scores.technical}%
- Communication: ${scores.communication}%

Suggestions for improvement:
${suggestions.map((s, i) => `${i + 1}. ${s}`).join('\n')}

Best of luck!
InterviewPrep AI Team
  `.trim();

  // HTML version (simple)
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Your Interview Feedback</h2>
      <p><strong>Interview Type:</strong> ${type}</p>
      <p><strong>Domain:</strong> ${domain}</p>
      <p><strong>Overall Score:</strong> <span style="font-size: 1.2em; color: ${overall >= 80 ? 'green' : overall >= 60 ? 'orange' : 'red'};">${overall}/100</span></p>
      <h3>Breakdown</h3>
      <ul>
        <li>Confidence: ${scores.confidence}%</li>
        <li>Vocabulary: ${scores.vocabulary}%</li>
        <li>Technical: ${scores.technical}%</li>
        <li>Communication: ${scores.communication}%</li>
      </ul>
      <h3>Suggestions</h3>
      <ul>
        ${suggestions.map(s => `<li>${s}</li>`).join('')}
      </ul>
      <p>Best of luck!<br/>InterviewPrep AI Team</p>
    </div>
  `;

  return sendEmail({ to, subject, text, html });
}

/**
 * Send password reset email (if using custom email instead of Firebase)
 * Note: Firebase Auth handles its own emails; this is for custom auth systems.
 */
export async function sendPasswordResetEmail(to, resetToken, redirectUrl = null) {
  const subject = "Reset your password";
  const resetLink = redirectUrl
    ? `${redirectUrl}?token=${resetToken}`
    : `http://localhost:5000/reset-password?token=${resetToken}`;

  const text = `
You requested a password reset. Click the link below to reset your password:

${resetLink}

This link will expire in 24 hours.

If you did not request this, please ignore this email.

InterviewPrep AI
  `.trim();

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Password Reset</h2>
      <p>You requested a password reset. Click the button below to reset your password:</p>
      <p style="margin: 20px 0;">
        <a href="${resetLink}" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Reset Password</a>
      </p>
      <p>Or copy this link:</p>
      <p style="word-break: break-all; color: #666;">${resetLink}</p>
      <p>This link will expire in 24 hours.</p>
      <p>If you did not request this, please ignore this email.</p>
      <p>Regards,<br/>InterviewPrep AI</p>
    </div>
  `;

  return sendEmail({ to, subject, text, html });
}

// Initialize on module load
initializeTransporter();
