const Redis = require('ioredis');
const config = require('./config');
const logger = require('./logger');

if (!config.redisUrl) {
  logger.warn('REDIS_URL not configured. Redis features disabled.');
}

const redis = config.redisUrl
  ? new Redis(config.redisUrl)
  : null;

if (redis) {
  redis.on('connect', () => {
    logger.info('Connected to Redis');
  });

  redis.on('error', (err) => {
    logger.error('Redis connection error', { error: err.message });
  });
}

module.exports = redis;
