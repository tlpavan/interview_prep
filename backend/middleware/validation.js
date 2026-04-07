/**
 * Validation middleware using Joi
 */

import Joi from 'joi';

const schemas = {
  startInterview: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    type: Joi.string().valid('technical', 'hr').required(),
    domain: Joi.string().max(100).optional(),
    difficulty: Joi.string().valid('easy', 'medium', 'hard').required(),
    totalQuestions: Joi.number().integer().min(1).max(20).required(),
    answers: Joi.array().items(
      Joi.object({
        question: Joi.string().required(),
        answer: Joi.string().required()
      })
    ).optional()
  }),

  extractName: Joi.object({
    transcript: Joi.string().required()
  }),

  nextQuestion: Joi.object({
    interviewType: Joi.string().required(),
    difficulty: Joi.string().valid('easy', 'medium', 'hard').required(),
    previousAnswer: Joi.string().optional(),
    questionCount: Joi.number().integer().min(1).max(20).required()
  }),

  transcribeAudio: Joi.object({
    audioBase64: Joi.string().required()
  }),

  analyzeResume: Joi.object({
    resumeText: Joi.string().min(50).required()
  }),

  careerPath: Joi.object({
    currentSkills: Joi.array().items(Joi.string()).min(1).required(),
    careerGoal: Joi.string().min(5).max(500).required()
  })
};

/**
 * Validate request body against a schema
 */
function validateBody(schemaName) {
  return (req, res, next) => {
    const schema = schemas[schemaName];
    if (!schema) {
      console.error(`No validation schema found for: ${schemaName}`);
      return next();
    }

    const { error } = schema.validate(req.body);
    if (error) {
      logger?.warn?.('Validation error:', {
        schema: schemaName,
        errors: error.details.map(d => d.message)
      }) || console.warn('Validation error:', error.details);

      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map(d => ({
          field: d.path[0],
          message: d.message
        }))
      });
    }

    next();
  };
}

/**
 * Validate query parameters
 */
function validateQuery(schema) {
  return (req, res, next) => {
    const { error } = schema.validate(req.query);
    if (error) {
      return res.status(400).json({
        error: 'Invalid query parameters',
        details: error.details.map(d => ({
          field: d.path[0],
          message: d.message
        }))
      });
    }
    next();
  };
}

const querySchemas = {
  limit: Joi.object({
    limit: Joi.number().integer().min(1).max(100).default(10)
  })
};

export { validateBody, validateQuery, querySchemas };
export default { validateBody, validateQuery, querySchemas };