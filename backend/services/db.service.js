import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { isDatabaseConnected } from "../config/database.js";

// Mongoose models (only import if MongoDB is available)
let InterviewSession, ModuleScore;

async function loadModels() {
  if (isDatabaseConnected()) {
    InterviewSession = (await import("../models/InterviewSession.js")).default;
    ModuleScore = (await import("../models/ModuleScore.js")).default;
  }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.resolve(__dirname, "../data");
const dbPath = path.join(dataDir, "interviews.json");

// JSON fallback functions
async function ensureDbFile() {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    await fs.access(dbPath);
  } catch {
    const initial = { sessions: [], moduleScores: [] };
    await fs.writeFile(dbPath, JSON.stringify(initial, null, 2), "utf-8");
  }
}

async function readJsonDb() {
  await ensureDbFile();
  try {
    const raw = await fs.readFile(dbPath, "utf-8");
    return JSON.parse(raw);
  } catch (error) {
    console.error("Error reading JSON database:", error);
    return { sessions: [], moduleScores: [] };
  }
}

async function writeJsonDb(db) {
  await fs.writeFile(dbPath, JSON.stringify(db, null, 2), "utf-8");
}

/**
 * Save an interview session
 * Uses MongoDB if connected, otherwise falls back to JSON file
 */
export async function saveInterviewSession(session, userId) {
  await loadModels();

  // Try MongoDB first if connected
  if (isDatabaseConnected() && InterviewSession && ModuleScore) {
    try {
      const dbSession = new InterviewSession({
        userId: userId || "anonymous",
        userName: session.userName || "User",
        type: session.type || "technical",
        domain: session.domain || "general",
        difficulty: session.difficulty || "medium",
        totalQuestions: Number(session.totalQuestions) || 1,
        answers: session.answers || [],
        feedback: session.feedback
      });

      await dbSession.save();

      // Save module score
      const feedback = session.feedback || {};
      if (session.type?.includes("technical")) {
        const moduleScore = new ModuleScore({
          userId: userId || "anonymous",
          module: "technical",
          score: Number(feedback.technical || 0)
        });
        await moduleScore.save();
      } else if (session.type?.includes("hr")) {
        const moduleScore = new ModuleScore({
          userId: userId || "anonymous",
          module: "hr",
          score: Number(feedback.communication || 0)
        });
        await moduleScore.save();
      }

      return;
    } catch (error) {
      console.error("MongoDB save failed, falling back to JSON:", error);
      // Fall through to JSON fallback
    }
  }

  // JSON fallback
  const db = await readJsonDb();
  const record = {
    id: `${Date.now()}-${Math.floor(Math.random() * 100000)}`,
    createdAt: new Date().toISOString(),
    userId: userId || "anonymous",
    ...session
  };

  db.sessions.push(record);

  const type = String(session?.type || "").toLowerCase();
  if (type.includes("technical")) {
    db.moduleScores.push({
      module: "technical",
      score: Number(session?.feedback?.technical || 0),
      createdAt: record.createdAt,
      userId: userId || "anonymous"
    });
  } else if (type.includes("hr")) {
    db.moduleScores.push({
      module: "hr",
      score: Number(session?.feedback?.communication || 0),
      createdAt: record.createdAt,
      userId: userId || "anonymous"
    });
  }

  await writeJsonDb(db);
}

/**
 * Get recent interview sessions
 */
export async function getRecentSessions(limit = 10, userId = null) {
  await loadModels();

  if (isDatabaseConnected() && InterviewSession) {
    try {
      const query = userId ? { userId } : {};
      return await InterviewSession.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();
    } catch (error) {
      console.error("MongoDB fetch failed, falling back to JSON:", error);
    }
  }

  // JSON fallback
  const db = await readJsonDb();
  let sessions = db.sessions;
  if (userId) {
    sessions = sessions.filter(s => s.userId === userId);
  }
  return sessions.slice(-limit).reverse();
}

/**
 * Get session summary with pagination
 */
export async function getSessionSummary(limit = 50, userId = null) {
  await loadModels();

  if (isDatabaseConnected() && InterviewSession) {
    try {
      const query = userId ? { userId } : {};
      const sessions = await InterviewSession.find(query)
        .sort({ createdAt: -1 })
        .limit(Math.min(limit, 200))
        .lean();
      return {
        count: await InterviewSession.countDocuments(query),
        sessions
      };
    } catch (error) {
      console.error("MongoDB fetch failed, falling back to JSON:", error);
    }
  }

  // JSON fallback
  const db = await readJsonDb();
  let sessions = db.sessions;
  if (userId) {
    sessions = sessions.filter(s => s.userId === userId);
  }
  const safeLimit = Math.max(1, Math.min(200, Number(limit) || 50));
  const paginated = sessions.slice(-safeLimit).reverse();
  return {
    count: sessions.length,
    sessions: paginated
  };
}

/**
 * Save a module score manually
 */
export async function saveModuleScore(module, score, userId) {
  await loadModels();

  if (isDatabaseConnected() && ModuleScore) {
    try {
      const moduleScore = new ModuleScore({
        userId: userId || "anonymous",
        module,
        score: Number(score || 0)
      });
      await moduleScore.save();
      return;
    } catch (error) {
      console.error("MongoDB save failed, falling back to JSON:", error);
    }
  }

  // JSON fallback
  const db = await readJsonDb();
  db.moduleScores.push({
    module,
    score: Number(score || 0),
    createdAt: new Date().toISOString(),
    userId: userId || "anonymous"
  });
  await writeJsonDb(db);
}

/**
 * Get profile summary with average scores per module
 */
export async function getProfileSummary(userId = null) {
  await loadModels();

  function avg(list) {
    if (!list.length) return 0;
    return Math.round(list.reduce((s, n) => s + n, 0) / list.length);
  }

  if (isDatabaseConnected() && ModuleScore) {
    try {
      const query = userId ? { userId } : {};
      const modules = ["technical", "hr", "resume", "career"];

      const summary = {};
      for (const module of modules) {
        const scores = await ModuleScore.find({
          ...query,
          module
        }).distinct("score");
        summary[module] = avg(scores);
      }

      return summary;
    } catch (error) {
      console.error("MongoDB query failed, falling back to JSON:", error);
    }
  }

  // JSON fallback
  const db = await readJsonDb();
  const byModule = (module) =>
    db.moduleScores
      .filter(item => item.module === module && (!userId || item.userId === userId))
      .map(item => Number(item.score || 0));

  return {
    technical: avg(byModule("technical")),
    hr: avg(byModule("hr")),
    resume: avg(byModule("resume")),
    career: avg(byModule("career"))
  };
}
