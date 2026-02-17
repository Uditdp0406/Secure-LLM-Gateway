/**
 * Centralized configuration management
 * All environment variables loaded and validated here
 */

require('dotenv').config();

const config = {
  // Server
  port: process.env.PORT || 3000,
  environment: process.env.NODE_ENV || 'development',
  
  // Security
  gatewayApiKey: process.env.GATEWAY_API_KEY || '',
  
  // LLM Providers
  providers: {
    openai: {
      apiKey: process.env.OPENAI_API_KEY || '',
      baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
      defaultModel: process.env.OPENAI_DEFAULT_MODEL || 'gpt-4',
      timeout: parseInt(process.env.OPENAI_TIMEOUT || '30000')
    },
    anthropic: {
      apiKey: process.env.ANTHROPIC_API_KEY || '',
      baseURL: process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com/v1',
      defaultModel: process.env.ANTHROPIC_DEFAULT_MODEL || 'claude-3-5-sonnet-20241022',
      timeout: parseInt(process.env.ANTHROPIC_TIMEOUT || '30000')
    }
  },
  
  // Request limits
  maxPromptLength: parseInt(process.env.MAX_PROMPT_LENGTH || '50000'),
  maxTokens: parseInt(process.env.MAX_TOKENS || '4096'),
  
  // Rate limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'), // 1 minute
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100')
  },
  
  // Logging
  logLevel: process.env.LOG_LEVEL || 'info'
};

// Validate critical config
if (config.environment === 'production' && !config.gatewayApiKey) {
  throw new Error('GATEWAY_API_KEY is required in production');
}

// Determine which providers are enabled
config.enabledProviders = [];
if (config.providers.openai.apiKey) config.enabledProviders.push('openai');
if (config.providers.anthropic.apiKey) config.enabledProviders.push('anthropic');

if (config.enabledProviders.length === 0) {
  console.warn('WARNING: No LLM providers configured. Add API keys to enable providers.');
}

module.exports = config;