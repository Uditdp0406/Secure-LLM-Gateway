/**
 * Centralized configuration management
 * All environment variables loaded and validated here
 */

require('dotenv').config();

const config = {
  // ==========================
  // Server
  // ==========================
  port: parseInt(process.env.PORT || '3000'),
  environment: process.env.NODE_ENV || 'development',

  // ==========================
  // Security
  // ==========================
  gatewayApiKey: process.env.GATEWAY_API_KEY || '',
  jwtSecret: process.env.JWT_SECRET || '',

  // ==========================
  // Redis
  // ==========================
  redisUrl: process.env.REDIS_URL || '',

  // ==========================
  // Global Timeout
  // ==========================
  globalTimeout: parseInt(
    process.env.GLOBAL_TIMEOUT || '35000'
  ),

  // ==========================
  // Cache Configuration
  // ==========================
  cache: {
    enabled: process.env.CACHE_ENABLED !== 'false',
    ttlSeconds: parseInt(
      process.env.CACHE_TTL_SECONDS || '600'
    )
  },

  // ==========================
  // RAG Configuration
  // ==========================
  rag: {
    enabled: process.env.RAG_ENABLED !== 'false',
    topK: parseInt(process.env.RAG_TOP_K || '3'),
    chunkSize: parseInt(process.env.RAG_CHUNK_SIZE || '800'),
    chunkOverlap: parseInt(process.env.RAG_CHUNK_OVERLAP || '150'),
    hybridAlpha: parseFloat(process.env.RAG_HYBRID_ALPHA || '0.7'),
    hybridBeta: parseFloat(process.env.RAG_HYBRID_BETA || '0.3')
  },

  // ==========================
  // Circuit Breaker
  // ==========================
  circuitBreaker: {
    failureThreshold: parseInt(
      process.env.CIRCUIT_FAILURE_THRESHOLD || '5'
    ),
    recoveryTimeMs: parseInt(
      process.env.CIRCUIT_RESET_TIMEOUT_MS || '30000'
    )
  },

  // ==========================
  // LLM Providers
  // ==========================
  providers: {
    openai: {
      apiKey: process.env.OPENAI_API_KEY || '',
      baseURL:
        process.env.OPENAI_BASE_URL ||
        'https://api.openai.com/v1',
      defaultModel:
        process.env.OPENAI_DEFAULT_MODEL || 'gpt-4',
      embeddingModel:
        process.env.OPENAI_EMBEDDING_MODEL ||
        'text-embedding-3-small',
      timeout: parseInt(
        process.env.OPENAI_TIMEOUT || '30000'
      )
    },
    anthropic: {
      apiKey: process.env.ANTHROPIC_API_KEY || '',
      baseURL:
        process.env.ANTHROPIC_BASE_URL ||
        'https://api.anthropic.com/v1',
      defaultModel:
        process.env.ANTHROPIC_DEFAULT_MODEL ||
        'claude-3-5-sonnet-20241022',
      timeout: parseInt(
        process.env.ANTHROPIC_TIMEOUT || '30000'
      )
    }
  },

  // ==========================
  // Request Limits
  // ==========================
  maxPromptLength: parseInt(
    process.env.MAX_PROMPT_LENGTH || '50000'
  ),
  maxTokens: parseInt(
    process.env.MAX_TOKENS || '4096'
  ),

  // ==========================
  // Role-Based Limits
  // ==========================
  roleLimits: {
    user: {
      maxTokens: parseInt(
        process.env.USER_MAX_TOKENS || '2048'
      ),
      maxRequestsPerMinute: parseInt(
        process.env.USER_MAX_RPM || '60'
      )
    },
    admin: {
      maxTokens: parseInt(
        process.env.ADMIN_MAX_TOKENS || '8192'
      ),
      maxRequestsPerMinute: parseInt(
        process.env.ADMIN_MAX_RPM || '500'
      )
    }
  },

  // ==========================
  // Cost per 1K Tokens
  // ==========================
  costPer1KTokens: {
    'gpt-4': parseFloat(
      process.env.COST_GPT4 || '0.03'
    ),
    'gpt-4o': parseFloat(
      process.env.COST_GPT4O || '0.005'
    ),
    'gpt-3.5-turbo': parseFloat(
      process.env.COST_GPT35 || '0.002'
    ),
    'claude-3-5-sonnet-20241022': parseFloat(
      process.env.COST_CLAUDE_SONNET || '0.003'
    ),
    'mock-model': 0
  },

  // ==========================
  // Rate Limiting
  // ==========================
  rateLimit: {
    windowMs: parseInt(
      process.env.RATE_LIMIT_WINDOW_MS || '60000'
    ),
    maxRequests: parseInt(
      process.env.RATE_LIMIT_MAX_REQUESTS || '100'
    )
  },

  // ==========================
  // Logging
  // ==========================
  logLevel: process.env.LOG_LEVEL || 'info'
};

// ==========================
// Validation Section
// ==========================

if (
  config.environment === 'production' &&
  !config.gatewayApiKey
) {
  throw new Error(
    'GATEWAY_API_KEY is required in production'
  );
}

if (
  config.environment === 'production' &&
  !config.jwtSecret
) {
  console.warn(
    'WARNING: JWT_SECRET is not set.'
  );
}

// Determine enabled providers
config.enabledProviders = [];

if (config.providers.openai.apiKey) {
  config.enabledProviders.push('openai');
}

if (config.providers.anthropic.apiKey) {
  config.enabledProviders.push('anthropic');
}

if (!config.enabledProviders.length) {
  console.warn(
    'WARNING: No LLM providers configured.'
  );
}

module.exports = config;
