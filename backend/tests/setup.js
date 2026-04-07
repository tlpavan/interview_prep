/**
 * Test setup file
 * Sets up test environment
 */

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.PORT = '5001';
process.env.GEMINI_API_KEY = 'test-gemini-key';
process.env.DATABASE_URL = ''; // Force JSON fallback

// Global test utilities (available in all tests)
globalThis.testUtils = {
  createMockSession(overrides = {}) {
    return {
      id: `test-${Date.now()}`,
      createdAt: new Date().toISOString(),
      userId: 'test-user',
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
      },
      ...overrides
    };
  },

  createMockProfileSummary() {
    return {
      technical: 75,
      hr: 70,
      resume: 85,
      career: 80
    };
  }
};

console.log('✅ Test environment initialized');