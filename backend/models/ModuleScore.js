/**
 * ModuleScore Model
 * Tracks scores for each module over time
 */

import mongoose from "mongoose";

const moduleScoreSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      default: "anonymous",
      index: true
    },
    module: {
      type: String,
      enum: ["technical", "hr", "resume", "career"],
      required: true,
      index: true
    },
    score: {
      type: Number,
      min: 0,
      max: 100,
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Indexes for performance
moduleScoreSchema.index({ userId: 1, module: 1, createdAt: -1 });
moduleScoreSchema.index({ module: 1, createdAt: -1 });

export default mongoose.model("ModuleScore", moduleScoreSchema);