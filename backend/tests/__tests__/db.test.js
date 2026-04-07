/**
 * Database Service Tests (JSON Fallback)
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import {
  saveInterviewSession,
  getRecentSessions,
  getSessionSummary,
  saveModuleScore,
  getProfileSummary
} from '../../services/db.service.js';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use the actual data directory but dedicated test file
const dataDir = path.join(__dirname, '../../data');
const testDbPath = path.join(dataDir, 'interviews.json');

// Ensure data directory exists
await fs.mkdir(dataDir, { recursive: true });

describe('Database Service (JSON Fallback)', () => {
  beforeEach(async () => {
    // Clear database before each test
    await fs.writeFile(testDbPath, JSON.stringify({ sessions: [], moduleScores: [] }), 'utf-8');
  });

  afterAll(async () => {
    // Cleanup test data
    try {
      await fs.unlink(testDbPath);
    } catch (e) {
      // Ignore cleanup errors
    }
  });

  describe('saveInterviewSession', () => {
    test('saves a session and returns record', async () => {
      const session = {
        id: `test-${Date.now()}`,
        createdAt: new Date().toISOString(),
        userId: 'test-user-1',
        userName: 'Test User',
        type: 'technical',
        domain: 'web development',
        difficulty: 'medium',
        totalQuestions: 5,
        answers: [
          { question: 'What is React?', answer: 'A JavaScript library' },
          { question: 'Explain useState?', answer: 'It is a hook' }
        ],
        feedback: {
          confidence: 80,
          vocabulary: 75,
          technical: 85,
          communication: 70,
          suggestions: ['Improve clarity']
        }
      };

      await saveInterviewSession(session, 'test-user-1');

      const recent = await getRecentSessions(10, 'test-user-1');
      expect(recent.length).toBeGreaterThanOrEqual(1);
      expect(recent[0].userName).toBe('Test User');
    });

    test('automatically saves technical module score', async () => {
      const session = {
        createdAt: new Date().toISOString(),
        userId: 'test-user-2',
        type: 'technical',
        feedback: { technical: 85, communication: 70 }
      };

      await saveInterviewSession(session, 'test-user-2');

      const summary = await getProfileSummary('test-user-2');
      expect(summary.technical).toBe(85);
    });

    test('automatically saves hr communication score', async () => {
      const session = {
        createdAt: new Date().toISOString(),
        userId: 'test-user-3',
        type: 'hr',
        feedback: { technical: 70, communication: 85 }
      };

      await saveInterviewSession(session, 'test-user-3');

      const summary = await getProfileSummary('test-user-3');
      expect(summary.hr).toBe(85);
    });
  });

  describe('getRecentSessions', () => {
    test('returns sessions in reverse chronological order', async () => {
      const now = Date.now();

      await saveInterviewSession(
        { createdAt: new Date(now - 1000).toISOString(), userId: 'user-1' },
        'user-1'
      );
      await saveInterviewSession(
        { createdAt: new Date(now).toISOString(), userId: 'user-1' },
        'user-1'
      );

      const sessions = await getRecentSessions(10, 'user-1');
      expect(sessions.length).toBe(2);
      // Should be in reverse chronological (newest first)
      expect(new Date(sessions[0].createdAt).getTime()).toBeGreaterThan(
        new Date(sessions[1].createdAt).getTime()
      );
    });

    test('filters by userId', async () => {
      await saveInterviewSession({}, 'user-a');
      await saveInterviewSession({}, 'user-b');

      const sessions = await getRecentSessions(10, 'user-a');
      expect(sessions.every(s => s.userId === 'user-a')).toBe(true);
    });

    test('respects limit parameter', async () => {
      for (let i = 0; i < 5; i++) {
        await saveInterviewSession({}, `user-limit-${i}`);
      }

      const sessions = await getRecentSessions(3, 'user-limit-0');
      expect(sessions.length).toBeLessThanOrEqual(3);
    });
  });

  describe('getSessionSummary', () => {
    test('returns count and sessions', async () => {
      await saveInterviewSession({}, 'summary-user');

      const summary = await getSessionSummary(10, 'summary-user');
      expect(summary).toHaveProperty('count');
      expect(summary).toHaveProperty('sessions');
      expect(typeof summary.count).toBe('number');
      expect(Array.isArray(summary.sessions)).toBe(true);
    });

    test('applies pagination correctly', async () => {
      // Create 25 sessions
      for (let i = 0; i < 25; i++) {
        await saveInterviewSession({ createdAt: new Date(Date.now() - i * 60000).toISOString() }, 'pagination-user');
      }

      const summary = await getSessionSummary(10, 'pagination-user');
      expect(summary.sessions.length).toBe(10);
    });
  });

  describe('saveModuleScore', () => {
    test('saves a module score', async () => {
      await saveModuleScore('technical', 85, 'score-user-1');

      const summary = await getProfileSummary('score-user-1');
      expect(summary.technical).toBe(85);
    });

    test('averages multiple scores for same module', async () => {
      await saveModuleScore('technical', 80, 'avg-user');
      await saveModuleScore('technical', 90, 'avg-user');

      const summary = await getProfileSummary('avg-user');
      expect(summary.technical).toBe(85);
    });
  });

  describe('getProfileSummary', () => {
    test('calculates average for all modules', async () => {
      const userId = 'profile-summary-user';

      await saveModuleScore('technical', 80, userId);
      await saveModuleScore('hr', 75, userId);
      await saveModuleScore('resume', 90, userId);
      await saveModuleScore('career', 85, userId);

      const summary = await getProfileSummary(userId);

      expect(summary.technical).toBe(80);
      expect(summary.hr).toBe(75);
      expect(summary.resume).toBe(90);
      expect(summary.career).toBe(85);
    });

    test('returns 0 for modules with no scores', async () => {
      const summary = await getProfileSummary('no-scores-user');
      expect(summary).toEqual({
        technical: 0,
        hr: 0,
        resume: 0,
        career: 0
      });
    });

    test('filters by userId', async () => {
      await saveModuleScore('technical', 90, 'user-1');
      await saveModuleScore('technical', 70, 'user-2');

      const summary1 = await getProfileSummary('user-1');
      const summary2 = await getProfileSummary('user-2');

      expect(summary1.technical).toBe(90);
      expect(summary2.technical).toBe(70);
    });
  });
});
