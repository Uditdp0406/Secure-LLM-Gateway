/**
 * Redis-based distributed rate limiting
 * Role-aware + production scalable
 */

const redis = require('../../utils/redisClient');
const { RateLimitError } = require('../../utils/errors');
const config = require('../../utils/config');
const logger = require('../../utils/logger');

async function rateLimit(req, res, next) {
  try {
    const role = req.user?.role || 'user';
    const roleConfig = config.roleLimits[role] || config.roleLimits.user;

    const maxRequests =
      roleConfig.maxRequestsPerMinute ||
      config.rateLimit.maxRequests;

    const windowMs = config.rateLimit.windowMs;

    // Unique key per user + role
    const identifier =
      req.user?.id
        ? `user:${req.user.id}`
        : req.gateway
        ? `gateway`
        : `ip:${req.ip}`;

    const redisKey = `rate_limit:${identifier}:${Math.floor(Date.now() / windowMs)}`;

    const current = await redis.incr(redisKey);

    if (current === 1) {
      // Set expiry for new key
      await redis.pexpire(redisKey, windowMs);
    }

    if (current > maxRequests) {
      logger.warn('Rate limit exceeded (Redis)', {
        identifier,
        role,
        maxRequests
      });

      return next(
        new RateLimitError(
          'Rate limit exceeded. Please try again later.'
        )
      );
    }

    next();
  } catch (error) {
    logger.error('Rate limiter failure', {
      error: error.message
    });

    // Fail open (do not block requests if Redis fails)
    next();
  }
}

module.exports = rateLimit;
