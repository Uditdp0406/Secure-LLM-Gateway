/**
 * Simple in-memory rate limiting
 * For production, use Redis-backed rate limiting
 */

const { RateLimitError } = require('../../utils/errors');
const config = require('../../utils/config');
const logger = require('../../utils/logger');

class RateLimiter {
  constructor() {
    this.requests = new Map();
    this.windowMs = config.rateLimit.windowMs;
    this.maxRequests = config.rateLimit.maxRequests;
    
    // Cleanup old entries every minute
    setInterval(() => this.cleanup(), 60000);
  }

  getKey(req) {
    // Use API key or IP address as identifier
    const authHeader = req.headers.authorization;
    if (authHeader) {
      return authHeader.startsWith('Bearer ')
        ? authHeader.substring(7)
        : authHeader;
    }
    return req.ip;
  }

  check(req) {
    const key = this.getKey(req);
    const now = Date.now();
    
    if (!this.requests.has(key)) {
      this.requests.set(key, []);
    }

    const userRequests = this.requests.get(key);
    
    // Filter out old requests outside the window
    const recentRequests = userRequests.filter(
      timestamp => now - timestamp < this.windowMs
    );

    if (recentRequests.length >= this.maxRequests) {
      logger.warn('Rate limit exceeded', {
        key: key.substring(0, 10) + '...',
        requests: recentRequests.length,
        window: this.windowMs
      });
      return false;
    }

    // Add current request
    recentRequests.push(now);
    this.requests.set(key, recentRequests);
    
    return true;
  }

  cleanup() {
    const now = Date.now();
    for (const [key, timestamps] of this.requests.entries()) {
      const recent = timestamps.filter(t => now - t < this.windowMs);
      if (recent.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, recent);
      }
    }
  }
}

const limiter = new RateLimiter();

function rateLimit(req, res, next) {
  if (!limiter.check(req)) {
    return next(new RateLimitError('Rate limit exceeded. Please try again later.'));
  }
  next();
}

module.exports = rateLimit;