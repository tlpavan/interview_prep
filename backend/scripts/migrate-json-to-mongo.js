import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });
dotenv.config({ path: path.join(__dirname, "../../.env") });

const mongoUri = process.env.DATABASE_URL;
if (!mongoUri) {
  console.error("DATABASE_URL is required to migrate JSON data into MongoDB.");
  process.exit(1);
}

const dataPath = path.join(__dirname, "../data/interviews.json");
const raw = await fs.readFile(dataPath, "utf-8").catch(() => '{"sessions":[],"moduleScores":[],"users":[]}');
const parsed = JSON.parse(raw);

const { default: InterviewSession } = await import("../models/InterviewSession.js");
const { default: ModuleScore } = await import("../models/ModuleScore.js");
const { default: User } = await import("../models/User.js");

async function main() {
  const sessions = Array.isArray(parsed.sessions) ? parsed.sessions : [];
  const moduleScores = Array.isArray(parsed.moduleScores) ? parsed.moduleScores : [];
  const users = Array.isArray(parsed.users) ? parsed.users : [];

  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 });

  for (const user of users) {
    if (!user.email) continue;
    await User.updateOne(
      { email: user.email },
      {
        $setOnInsert: {
          email: user.email,
          name: user.name || "User",
          passwordHash: user.passwordHash || "migrated-account",
          createdAt: user.createdAt ? new Date(user.createdAt) : new Date()
        },
        $set: {
          sessionTokenHash: user.sessionTokenHash || null,
          sessionExpiresAt: user.sessionExpiresAt ? new Date(user.sessionExpiresAt) : null,
          lastLoginAt: user.lastLoginAt ? new Date(user.lastLoginAt) : null
        }
      },
      { upsert: true }
    );
  }

  for (const session of sessions) {
    await InterviewSession.updateOne(
      {
        userId: session.userId || "anonymous",
        userName: session.userName || "User",
        type: session.type || "technical",
        createdAt: session.createdAt ? new Date(session.createdAt) : undefined
      },
      {
        $setOnInsert: {
          userId: session.userId || "anonymous",
          userName: session.userName || "User",
          type: session.type || "technical",
          domain: session.domain || "general",
          difficulty: session.difficulty || "medium",
          totalQuestions: Number(session.totalQuestions || 1),
          answers: Array.isArray(session.answers) ? session.answers : [],
          feedback: session.feedback || {},
          createdAt: session.createdAt ? new Date(session.createdAt) : new Date()
        }
      },
      { upsert: true }
    );
  }

  for (const item of moduleScores) {
    if (!item.module) continue;
    await ModuleScore.updateOne(
      {
        userId: item.userId || "anonymous",
        module: item.module,
        score: Number(item.score || 0),
        createdAt: item.createdAt ? new Date(item.createdAt) : undefined
      },
      {
        $setOnInsert: {
          userId: item.userId || "anonymous",
          module: item.module,
          score: Number(item.score || 0),
          createdAt: item.createdAt ? new Date(item.createdAt) : new Date()
        }
      },
      { upsert: true }
    );
  }

  console.log(`Migrated ${users.length} users, ${sessions.length} sessions, and ${moduleScores.length} module scores to MongoDB.`);
  await mongoose.disconnect();
}

main().catch(async error => {
  console.error("Migration failed:", error.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
