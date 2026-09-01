/**
 * Python Microservices Client
 * Calls the Python backend for specialized services
 */

const PYTHON_BASE_URL = process.env.PYTHON_BACKEND_URL || 'http://localhost:5001';

/**
 * Check if Python backend is available
 */
export async function isPythonBackendAvailable() {
  try {
    const response = await fetch(`${PYTHON_BASE_URL}/health`, { timeout: 2000 });
    return response.ok;
  } catch (e) {
    console.warn('Python backend unavailable:', e.message);
    return false;
  }
}

/**
 * Evaluate DSA code solution
 */
export async function evaluateDsaCode(code, problem = '', testCases = []) {
  try {
    const response = await fetch(`${PYTHON_BASE_URL}/api/dsa/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        problem,
        test_cases: testCases
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'DSA evaluation failed');
    }

    return await response.json();
  } catch (e) {
    console.error('DSA evaluation error:', e);
    return {
      error: e.message,
      is_valid: false,
      verdict: 'Evaluation Failed'
    };
  }
}

/**
 * Analyze audio metrics
 */
export async function analyzeAudio(audioBase64, mimeType = 'audio/wav', transcript = '') {
  try {
    const response = await fetch(`${PYTHON_BASE_URL}/api/audio/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        audio_base64: audioBase64,
        mime_type: mimeType,
        transcript
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Audio analysis failed');
    }

    return await response.json();
  } catch (e) {
    console.error('Audio analysis error:', e);
    return {
      error: e.message,
      confidence_score: 0,
      overall_score: 0
    };
  }
}

/**
 * Get performance analytics for user
 */
export async function getPerformanceAnalytics(userId) {
  try {
    const response = await fetch(`${PYTHON_BASE_URL}/api/analytics/performance/${userId}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Analytics failed');
    }

    return await response.json();
  } catch (e) {
    console.error('Analytics error:', e);
    return {
      error: e.message,
      user_id: userId,
      progress: null,
      recommendations: []
    };
  }
}

export default {
  isPythonBackendAvailable,
  evaluateDsaCode,
  analyzeAudio,
  getPerformanceAnalytics
};
