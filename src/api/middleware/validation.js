/**
 * Request validation middleware
 * Validates and sanitizes incoming requests
 */

const { ValidationError } = require('../../utils/errors');

function validateCompletionRequest(req, res, next) {
  const { prompt, provider, options } = req.body;

  // Validate prompt
  if (prompt === undefined || prompt === null) {
    return next(new ValidationError('prompt is required'));
  }

  if (typeof prompt !== 'string') {
    return next(new ValidationError('prompt must be a string'));
  }

  if (prompt.trim().length === 0) {
    return next(new ValidationError('prompt cannot be empty'));
  }

  // Validate provider (optional)
  if (provider !== undefined && typeof provider !== 'string') {
    return next(new ValidationError('provider must be a string'));
  }

  // Validate options (optional)
  if (options !== undefined) {
    if (typeof options !== 'object' || Array.isArray(options)) {
      return next(new ValidationError('options must be an object'));
    }

    // Validate specific option fields if present
    if (options.temperature !== undefined) {
      const temp = Number(options.temperature);
      if (isNaN(temp) || temp < 0 || temp > 2) {
        return next(new ValidationError('temperature must be between 0 and 2'));
      }
    }

    if (options.maxTokens !== undefined) {
      const tokens = Number(options.maxTokens);
      if (isNaN(tokens) || tokens < 1 || !Number.isInteger(tokens)) {
        return next(new ValidationError('maxTokens must be a positive integer'));
      }
    }

    if (options.topP !== undefined) {
      const topP = Number(options.topP);
      if (isNaN(topP) || topP < 0 || topP > 1) {
        return next(new ValidationError('topP must be between 0 and 1'));
      }
    }
  }

  next();
}

module.exports = {
  validateCompletionRequest
};