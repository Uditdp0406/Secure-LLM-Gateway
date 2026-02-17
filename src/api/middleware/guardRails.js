/**
 * Prompt Guardrails Middleware
 * Detects basic prompt injection and jailbreak attempts
 */

const { ValidationError } = require('../../utils/errors');

const suspiciousPatterns = [
  /ignore previous instructions/i,
  /disregard earlier instructions/i,
  /system prompt/i,
  /reveal hidden/i,
  /override security/i,
  /act as system/i,
  /jailbreak/i,
  /bypass restrictions/i
];

function guardrails(req, res, next) {
  const { prompt } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    return next();
  }

  // Hard length enforcement (extra safety)
  if (prompt.length > 100000) {
    return next(
      new ValidationError('Prompt too large for processing')
    );
  }

  // Injection detection
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(prompt)) {
      return next(
        new ValidationError(
          'Prompt rejected due to potential injection attempt'
        )
      );
    }
  }

  next();
}

module.exports = guardrails;
