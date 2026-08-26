import { describe, expect, beforeEach, afterAll, test } from '@jest/globals';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  registerUser,
  loginUser,
  logoutUser,
  getUserFromToken,
  getUserById,
  getUserAccountOverview
} from '../../services/auth.service.js';
import { saveModuleScore, saveInterviewSession } from '../../services/db.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, '../../data');
const testDbPath = path.join(dataDir, 'interviews.json');

await fs.mkdir(dataDir, { recursive: true });

describe('Auth Service (JSON Fallback)', () => {
  beforeEach(async () => {
    await fs.writeFile(testDbPath, JSON.stringify({ sessions: [], moduleScores: [], users: [] }), 'utf-8');
  });

  afterAll(async () => {
    try {
      await fs.unlink(testDbPath);
    } catch {
      // Ignore cleanup errors.
    }
  });

  test('registers a user with a stored hashed password and returns a session token', async () => {
    const result = await registerUser({
      name: 'Test User',
      email: 'test@example.com',
      password: 'secret123'
    });

    expect(result.user.email).toBe('test@example.com');
    expect(result.user.name).toBe('Test User');
    expect(result.token).toBeTruthy();

    const raw = JSON.parse(await fs.readFile(testDbPath, 'utf-8'));
    expect(raw.users).toHaveLength(1);
    expect(raw.users[0].passwordHash).not.toBe('secret123');
    expect(raw.users[0].passwordHash).toContain(':');
  });

  test('logs in an existing user and resolves the user from the returned token', async () => {
    await registerUser({
      name: 'Login User',
      email: 'login@example.com',
      password: 'secret123'
    });

    const login = await loginUser({
      email: 'login@example.com',
      password: 'secret123'
    });

    const user = await getUserFromToken(login.token);
    expect(user?.email).toBe('login@example.com');
    expect(user?.id).toBe(login.user.id);
  });

  test('clears the active session on logout', async () => {
    const registered = await registerUser({
      name: 'Logout User',
      email: 'logout@example.com',
      password: 'secret123'
    });

    await logoutUser(registered.token);

    const user = await getUserFromToken(registered.token);
    expect(user).toBeNull();
  });

  test('returns user overview with scores and history', async () => {
    const registered = await registerUser({
      name: 'Overview User',
      email: 'overview@example.com',
      password: 'secret123'
    });
    const userId = registered.user.id;

    await saveModuleScore('technical', 88, userId);
    await saveInterviewSession({
      userName: 'Overview User',
      type: 'technical',
      difficulty: 'medium',
      totalQuestions: 1,
      answers: [{ question: 'Q1', answer: 'A1' }],
      feedback: {
        confidence: 80,
        vocabulary: 78,
        technical: 88,
        communication: 82,
        suggestions: []
      }
    }, userId);

    const overview = await getUserAccountOverview(userId);
    const user = await getUserById(userId);

    expect(user?.email).toBe('overview@example.com');
    expect(overview?.user?.id).toBe(userId);
    expect(overview?.summary?.technical).toBeGreaterThan(0);
    expect(overview?.history?.sessions?.length).toBeGreaterThan(0);
  });
});
