/**
 * Configuration Validation Tests
 */

import { describe, it, expect } from '@jest/globals';
import { env } from '../../config/env.js';

describe('Environment Configuration', () => {
  test('has required PORT', () => {
    expect(env.PORT).toBeDefined();
    expect(typeof env.PORT).toBe('number');
    expect(env.PORT).toBeGreaterThan(0);
  });

  test('has GEMINI_API_KEY', () => {
    expect(env.GEMINI_API_KEY).toBeDefined();
    expect(typeof env.GEMINI_API_KEY).toBe('string');
    expect(env.GEMINI_API_KEY.length).toBeGreaterThan(0);
  });

  test('has NODE_ENV', () => {
    expect(env.NODE_ENV).toBeDefined();
    expect(['development', 'test', 'production']).toContain(env.NODE_ENV);
  });

  test('optional credentials exist when set', () => {
    // These are optional, so just test they're the right type if present
    if (env.OPENAI_API_KEY) {
      expect(typeof env.OPENAI_API_KEY).toBe('string');
    }
    if (env.VAPI_API_KEY) {
      expect(typeof env.VAPI_API_KEY).toBe('string');
    }
    if (env.DATABASE_URL) {
      expect(typeof env.DATABASE_URL).toBe('string');
    }
  });

  test('CORS_ORIGIN defaults to * if not set', () => {
    expect(env.CORS_ORIGIN).toBeDefined();
    if (!process.env.CORS_ORIGIN) {
      expect(env.CORS_ORIGIN).toBe('*');
    }
  });
});