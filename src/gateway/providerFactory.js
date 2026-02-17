/**
 * Factory for creating provider instances
 */

const OpenAIProvider = require('../providers/openaiProvider');
const AnthropicProvider = require('../providers/anthropicProvider');
const MockProvider = require('../providers/mockProvider');

const config = require('../utils/config');
const logger = require('../utils/logger');

class ProviderFactory {
  constructor() {
    this.providers = new Map();
    this.initializeProviders();
  }

  initializeProviders() {
    // ------------------------
    // Real Providers
    // ------------------------

    if (config.providers.openai.apiKey) {
      this.providers.set(
        'openai',
        new OpenAIProvider(config.providers.openai)
      );
      logger.info('OpenAI provider initialized');
    }

    if (config.providers.anthropic.apiKey) {
      this.providers.set(
        'anthropic',
        new AnthropicProvider(config.providers.anthropic)
      );
      logger.info('Anthropic provider initialized');
    }

    // ------------------------
    // Mock Provider (Always)
    // ------------------------

    this.providers.set(
      'mock',
      new MockProvider({})
    );

    logger.info('Mock provider initialized');

    logger.info('Available providers', {
      providers: Array.from(this.providers.keys())
    });
  }

  getProvider(name) {
    const provider = this.providers.get(name);
    if (!provider) {
      throw new Error(`Provider '${name}' not found`);
    }
    return provider;
  }

  getProviderNames() {
    return Array.from(this.providers.keys());
  }

  hasProvider(name) {
    return this.providers.has(name);
  }
}

module.exports = new ProviderFactory();
