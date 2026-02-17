/**
 * Authentication middleware
 * Validates API key for gateway access
 */

const { AuthenticationError } = require('../../utils/errors');
const config = require('../../utils/config');
const logger = require('../../utils/logger');

function authenticate(req, res, next) {
  // Skip auth in development if no key is set
  if (config.environment === 'development' && !config.gatewayApiKey) {
    logger.warn('Authentication bypassed - no GATEWAY_API_KEY set in development');
    return next();
  }

  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return next(new AuthenticationError('Missing authorization header'));
  }

  // Support both "Bearer token" and "token" formats
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.substring(7)
    : authHeader;

  if (token !== config.gatewayApiKey) {
    logger.warn('Authentication failed', {
      ip: req.ip,
      path: req.path
    });
    return next(new AuthenticationError('Invalid API key'));
  }

  next();
}

module.exports = authenticate;