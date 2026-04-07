/**
 * Scoring Services Tests
 */

import { describe, it, expect } from '@jest/globals';
import {
  calculateOverallScore,
  calculateConfidenceScore,
  generateSuggestions,
  generateInterviewFeedback
} from '../../services/scoring.services.js';

describe('Scoring Services', () => {
  describe('calculateOverallScore', () => {
    test('calculates weighted average correctly', () => {
      const scores = {
        confidence: 80,
        vocabulary: 70,
        technical: 90,
        communication: 75
      };
      const overall = calculateOverallScore(scores);
      // weights: confidence 0.2, vocab 0.15, technical 0.4, comm 0.25
      // (80*0.2 + 70*0.15 + 90*0.4 + 75*0.25) = 16 + 10.5 + 36 + 18.75 = 81.25
      expect(overall).toBe(81);
    });

    test('handles zero scores', () => {
      const scores = {
        confidence: 0,
        vocabulary: 0,
        technical: 0,
        communication: 0
      };
      const overall = calculateOverallScore(scores);
      expect(overall).toBe(0);
    });

    test('handles missing fields gracefully', () => {
      const scores = {};
      const overall = calculateOverallScore(scores);
      expect(overall).toBe(0);
    });

    test('caps score at 100', () => {
      const scores = {
        confidence: 100,
        vocabulary: 100,
        technical: 100,
        communication: 100
      };
      const overall = calculateOverallScore(scores);
      expect(overall).toBe(100);
    });
  });

  describe('calculateConfidenceScore', () => {
    test('returns baseline for empty transcript', async () => {
      const score = await calculateConfidenceScore('');
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    test('increases score for confident phrases', async () => {
      const confidentTranscript = "I believe in my experience that this solution is definitely correct. I'm confident about this approach.";
      const score = await calculateConfidenceScore(confidentTranscript);
      expect(score).toBeGreaterThan(70); // Should be high
    });

    test('decreases score for hesitant phrases', async () => {
      const hesitantTranscript = "Um, I guess maybe it could be sort of like that? I'm not sure, but I think it might work.";
      const score = await calculateConfidenceScore(hesitantTranscript);
      expect(score).toBeLessThan(60); // Should be low
    });
  });

  describe('generateSuggestions', () => {
    test('generates suggestions for low confidence', () => {
      const scores = { confidence: 40, vocabulary: 50, technical: 60, communication: 50 };
      const suggestions = generateSuggestions(scores, 'technical');

      expect(Array.isArray(suggestions)).toBe(true);
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.some(s => s.toLowerCase().includes('filler'))).toBe(true);
    });

    test('generates positive suggestions for high scores', () => {
      const scores = { confidence: 85, vocabulary: 90, technical: 95, communication: 88 };
      const suggestions = generateSuggestions(scores, 'technical');

      // Should include excellence message for high overall score
      expect(suggestions.some(s => s.toLowerCase().includes('excellent'))).toBe(true);
    });

    test('includes domain-specific suggestions for technical interviews', () => {
      const scores = { confidence: 60, vocabulary: 60, technical: 50, communication: 60 };
      const suggestions = generateSuggestions(scores, 'technical');

      expect(suggestions.some(s => s.includes('whiteboard') || s.includes('algorithm'))).toBe(true);
    });

    test('includes domain-specific suggestions for HR interviews', () => {
      const scores = { confidence: 60, vocabulary: 60, technical: 50, communication: 60 };
      const suggestions = generateSuggestions(scores, 'hr');

      expect(suggestions.some(s => s.includes('STAR') || s.includes('behavioral'))).toBe(true);
    });
  });

  describe('generateInterviewFeedback', () => {
    test('generates feedback from empty answers', () => {
      const feedback = generateInterviewFeedback([], 'technical');

      expect(feedback).toHaveProperty('scores');
      expect(feedback).toHaveProperty('overall');
      expect(feedback).toHaveProperty('suggestions');
      expect(typeof feedback.overall).toBe('number');
    });

    test('uses provided answer scores', () => {
      const answers = [
        { technicalScore: 85, confidenceScore: 80 },
        { technicalScore: 90, confidenceScore: 85 }
      ];
      const feedback = generateInterviewFeedback(answers, 'technical');

      expect(feedback.scores.technical).toBeGreaterThan(80);
      expect(feedback.scores.confidence).toBeGreaterThan(80);
    });

    test('generates suggestions based on low scores', () => {
      const feedback = generateInterviewFeedback([], 'technical');

      expect(feedback.suggestions.length).toBeGreaterThan(0);
    });
  });
});