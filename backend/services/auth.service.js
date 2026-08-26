import { promises as fs } from "fs";
import crypto from "crypto";
import path from "path";
import { fileURLToPath } from "url";
import { isDatabaseConnected } from "../config/database.js";
import { getProfileSummary, getSessionSummary } from "./db.service.js";

let User;

async function loadModel() {
  if (isDatabaseConnected() && !User) {
    User = (await import("../models/User.js")).default;
  }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.resolve(__dirname, "../data");
const dbPath = path.join(dataDir, "interviews.json");
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30;

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function sanitizeUser(user) {
  if (!user) return null;
  return {
    id: String(user.id || user._id),
    email: user.email,
    name: user.name,
    createdAt: user.createdAt || null,
    lastLoginAt: user.lastLoginAt || null
  };
}

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const derived = crypto.scryptSync(String(password), salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

function verifyPassword(password, storedHash) {
  const [salt, original] = String(storedHash || "").split(":");
  if (!salt || !original) return false;
  const derived = crypto.scryptSync(String(password), salt, 64).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(derived, "hex"), Buffer.from(original, "hex"));
}

function createSessionToken() {
  return crypto.randomBytes(32).toString("hex");
}

function hashToken(token) {
  return crypto.createHash("sha256").update(String(token)).digest("hex");
}

async function ensureDbFile() {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    await fs.access(dbPath);
  } catch {
    const initial = { sessions: [], moduleScores: [], users: [] };
    await fs.writeFile(dbPath, JSON.stringify(initial, null, 2), "utf-8");
  }
}

async function readJsonDb() {
  await ensureDbFile();
  try {
    const raw = await fs.readFile(dbPath, "utf-8");
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.sessions)) parsed.sessions = [];
    if (!Array.isArray(parsed.moduleScores)) parsed.moduleScores = [];
    if (!Array.isArray(parsed.users)) parsed.users = [];
    return parsed;
  } catch (error) {
    console.error("Error reading auth JSON database:", error);
    return { sessions: [], moduleScores: [], users: [] };
  }
}

async function writeJsonDb(db) {
  await fs.writeFile(dbPath, JSON.stringify(db, null, 2), "utf-8");
}

function buildAuthResponse(user, token) {
  return {
    user: sanitizeUser(user),
    token
  };
}

export async function registerUser({ name, email, password }) {
  await loadModel();
  const normalizedEmail = normalizeEmail(email);
  const now = new Date().toISOString();
  const sessionToken = createSessionToken();
  const sessionTokenHash = hashToken(sessionToken);
  const sessionExpiresAt = new Date(Date.now() + SESSION_TTL_MS);

  if (isDatabaseConnected() && User) {
    const existing = await User.findOne({ email: normalizedEmail }).lean();
    if (existing) {
      throw new Error("EMAIL_ALREADY_EXISTS");
    }

    const created = await User.create({
      email: normalizedEmail,
      name: String(name || "").trim(),
      passwordHash: hashPassword(password),
      sessionTokenHash,
      sessionExpiresAt,
      lastLoginAt: now
    });

    return buildAuthResponse(created.toObject(), sessionToken);
  }

  const db = await readJsonDb();
  const existing = db.users.find(user => user.email === normalizedEmail);
  if (existing) {
    throw new Error("EMAIL_ALREADY_EXISTS");
  }

  const user = {
    id: crypto.randomUUID(),
    email: normalizedEmail,
    name: String(name || "").trim(),
    passwordHash: hashPassword(password),
    sessionTokenHash,
    sessionExpiresAt: sessionExpiresAt.toISOString(),
    lastLoginAt: now,
    createdAt: now
  };

  db.users.push(user);
  await writeJsonDb(db);
  return buildAuthResponse(user, sessionToken);
}

export async function loginUser({ email, password }) {
  await loadModel();
  const normalizedEmail = normalizeEmail(email);
  const sessionToken = createSessionToken();
  const sessionTokenHash = hashToken(sessionToken);
  const sessionExpiresAt = new Date(Date.now() + SESSION_TTL_MS);
  const lastLoginAt = new Date();

  if (isDatabaseConnected() && User) {
    const user = await User.findOne({ email: normalizedEmail });
    if (!user || !verifyPassword(password, user.passwordHash)) {
      throw new Error("INVALID_CREDENTIALS");
    }

    user.sessionTokenHash = sessionTokenHash;
    user.sessionExpiresAt = sessionExpiresAt;
    user.lastLoginAt = lastLoginAt;
    await user.save();
    return buildAuthResponse(user.toObject(), sessionToken);
  }

  const db = await readJsonDb();
  const user = db.users.find(entry => entry.email === normalizedEmail);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    throw new Error("INVALID_CREDENTIALS");
  }

  user.sessionTokenHash = sessionTokenHash;
  user.sessionExpiresAt = sessionExpiresAt.toISOString();
  user.lastLoginAt = lastLoginAt.toISOString();
  await writeJsonDb(db);
  return buildAuthResponse(user, sessionToken);
}

export async function logoutUser(token) {
  if (!token) return false;
  await loadModel();
  const sessionTokenHash = hashToken(token);

  if (isDatabaseConnected() && User) {
    const user = await User.findOne({ sessionTokenHash });
    if (!user) return false;
    user.sessionTokenHash = null;
    user.sessionExpiresAt = null;
    await user.save();
    return true;
  }

  const db = await readJsonDb();
  const user = db.users.find(entry => entry.sessionTokenHash === sessionTokenHash);
  if (!user) return false;
  user.sessionTokenHash = null;
  user.sessionExpiresAt = null;
  await writeJsonDb(db);
  return true;
}

export async function getUserById(userId) {
  if (!userId) return null;
  await loadModel();

  if (isDatabaseConnected() && User) {
    const user = await User.findById(userId).lean();
    return sanitizeUser(user);
  }

  const db = await readJsonDb();
  return sanitizeUser(db.users.find(entry => entry.id === userId));
}

export async function getUserFromToken(token) {
  if (!token) return null;
  await loadModel();
  const sessionTokenHash = hashToken(token);
  const now = Date.now();

  if (isDatabaseConnected() && User) {
    const user = await User.findOne({ sessionTokenHash });
    if (!user) return null;
    if (!user.sessionExpiresAt || new Date(user.sessionExpiresAt).getTime() < now) {
      user.sessionTokenHash = null;
      user.sessionExpiresAt = null;
      await user.save();
      return null;
    }
    return sanitizeUser(user.toObject());
  }

  const db = await readJsonDb();
  const user = db.users.find(entry => entry.sessionTokenHash === sessionTokenHash);
  if (!user) return null;
  if (!user.sessionExpiresAt || new Date(user.sessionExpiresAt).getTime() < now) {
    user.sessionTokenHash = null;
    user.sessionExpiresAt = null;
    await writeJsonDb(db);
    return null;
  }
  return sanitizeUser(user);
}

export async function resolveAuthenticatedUser(req) {
  const authHeader = req.headers.authorization || "";
  if (authHeader.toLowerCase().startsWith("bearer ")) {
    const token = authHeader.slice(7).trim();
    const user = await getUserFromToken(token);
    if (user) return user;
  }

  const userId = req.headers["x-user-id"];
  if (userId) {
    const user = await getUserById(userId);
    if (user) return user;
    return { id: String(userId), email: null, name: "User", createdAt: null, lastLoginAt: null };
  }

  return null;
}

export async function getUserAccountOverview(userId) {
  const user = await getUserById(userId);
  if (!user) return null;

  const [summary, history] = await Promise.all([
    getProfileSummary(user.id),
    getSessionSummary(20, user.id)
  ]);

  return {
    user,
    summary,
    history
  };
}
