const os = require('os');
const redis = require('../utils/redisClient');
const config = require('../utils/config');

let totalRequests = 0;

function incrementRequestCount() {
  totalRequests++;
}

async function getRedisHealth() {
  try {
    const pong = await redis.ping();
    return pong === 'PONG' ? 'healthy' : 'unhealthy';
  } catch {
    return 'unhealthy';
  }
}

async function getMetrics() {
  const redisStatus = await getRedisHealth();

  return {
    uptimeSeconds: process.uptime(),
    environment: config.environment,
    nodeVersion: process.version,
    memoryUsage: process.memoryUsage(),
    cpuLoad: os.loadavg(),
    totalRequests,
    redisStatus,
    providers: config.enabledProviders
  };
}

module.exports = {
  incrementRequestCount,
  getMetrics
};
