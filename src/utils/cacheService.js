const crypto = require('crypto');
const redis = require('./redisClient');
const config = require('./config');

function generateCacheKey({ prompt, provider, options }) {
  const hash = crypto
    .createHash('sha256')
    .update(
      JSON.stringify({
        prompt,
        provider,
        options
      })
    )
    .digest('hex');

  return `llm_cache:${hash}`;
}

async function getFromCache(key) {
  const cached = await redis.get(key);
  if (!cached) return null;

  return JSON.parse(cached);
}

async function saveToCache(key, data) {
  await redis.set(
    key,
    JSON.stringify(data),
    'EX',
    config.cache.ttlSeconds
  );
}

module.exports = {
  generateCacheKey,
  getFromCache,
  saveToCache
};
