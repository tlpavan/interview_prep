/**
 * DSA Practice Evaluation Controller
 * Integrates with Python backend for code evaluation
 */

import { evaluateDsaCode, isPythonBackendAvailable } from '../services/python-client.js';
import { saveInterviewSession } from '../services/db.service.js';
import { resolveAuthenticatedUser } from '../services/auth.service.js';
import Joi from 'joi';

const evaluateDsaCodeSchema = Joi.object({
  code: Joi.string().required(),
  problem: Joi.string().optional(),
  test_cases: Joi.array().optional().default([])
});

/**
 * Evaluate DSA solution code
 * POST /api/dsa/evaluate
 */
export async function evaluateDsaSolution(req, res) {
  try {
    const { error, value } = evaluateDsaCodeSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map(d => d.message)
      });
    }

    const { code, problem, test_cases } = value;
    const user = await resolveAuthenticatedUser(req);

    // Check if Python backend is available
    const pythonAvailable = await isPythonBackendAvailable();
    
    if (!pythonAvailable) {
      return res.status(503).json({
        error: 'DSA evaluation service unavailable',
        reason: 'Python backend not responding'
      });
    }

    // Call Python backend
    console.log(`📝 Evaluating DSA code (${code.length} chars, ${test_cases.length} tests)`);
    const evaluation = await evaluateDsaCode(code, problem, test_cases);

    if (evaluation.error) {
      return res.status(400).json({
        error: 'Code evaluation failed',
        details: evaluation.error
      });
    }

    // Save to database if user is authenticated
    if (user?.id) {
      try {
        await saveInterviewSession({
          user_id: user.id,
          type: 'dsa-practice',
          problem,
          code_solution: code,
          evaluation_result: evaluation,
          score: evaluation.score || 0,
          passed: evaluation.verdict === 'Accepted ✓'
        });
      } catch (dbError) {
        console.warn('Could not save DSA session:', dbError.message);
      }
    }

    console.log(`✅ DSA Evaluation: ${evaluation.verdict} (Score: ${evaluation.score})`);
    return res.json(evaluation);

  } catch (error) {
    console.error('DSA evaluation error:', error);
    return res.status(500).json({
      error: 'Failed to evaluate code',
      details: process.env.NODE_ENV === 'development' ? error?.message : undefined
    });
  }
}

/**
 * Get Python backend health
 * GET /api/dsa/health
 */
export async function checkDsaServiceHealth(req, res) {
  try {
    const available = await isPythonBackendAvailable();
    
    return res.json({
      service: 'dsa-evaluator',
      available,
      backend_url: process.env.PYTHON_BACKEND_URL || 'http://localhost:5001',
      status: available ? 'healthy' : 'unavailable'
    });

  } catch (error) {
    console.error('DSA health check error:', error);
    return res.status(500).json({
      error: 'Health check failed'
    });
  }
}

export default {
  evaluateDsaSolution,
  checkDsaServiceHealth
};
