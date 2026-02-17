/**
 * Global error handling middleware
 * Catches all errors and returns consistent error responses
 */

const logger = require('../../utils/logger');
const { GatewayError } = require('../../utils/errors');

function errorHandler(err, req, res, next) {
  // Log error
  logger.error('Request error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip
  });

  // Handle known error types
  if (err instanceof GatewayError) {
    return res.status(err.statusCode).json(err.toJSON());
  }

  // Handle unknown errors - don't leak internals
  res.status(500).json({
    error: {
      message: 'An internal server error occurred',
      type: 'InternalError'
    }
  });
}

module.exports = errorHandler;