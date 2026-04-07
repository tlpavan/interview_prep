/**
 * InterviewSession Model
 * Stores completed interview sessions with feedback
 */

import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      default: "anonymous",
      index: true
    },
    userName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    type: {
      type: String,
      enum: ["technical", "hr"],
      required: true
    },
    domain: {
      type: String,
      trim: true,
      default: "general"
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      required: true
    },
    totalQuestions: {
      type: Number,
      min: 1,
      max: 20,
      default: 1
    },
    answers: [
      {
        question: {
          type: String,
          required: true
        },
        answer: {
          type: String,
          required: true
        }
      }
    ],
    feedback: {
      confidence: {
        type: Number,
        min: 0,
        max: 100
      },
      vocabulary: {
        type: Number,
        min: 0,
        max: 100
      },
      technical: {
        type: Number,
        min: 0,
        max: 100
      },
      communication: {
        type: Number,
        min: 0,
        max: 100
      },
      suggestions: [String]
    }
  },
  {
    timestamps: true
  }
);

// Index for performance
sessionSchema.index({ userId: 1, createdAt: -1 });
sessionSchema.index({ type: 1, createdAt: -1 });
sessionSchema.index({ createdAt: -1 });

export default mongoose.model("InterviewSession", sessionSchema);