/**
 * Factory for creating provider instances
 * Centralizes provider instantiation and configuration
 */

const OpenAIProvider = require('../providers/openaiProvider');
const AnthropicProvider = require('../providers/anthropicProvider');
const config = require('../utils/config');
const logger = require('../utils/logger');

class ProviderFactory {
  constructor() {
    this.providers = new Map();
    this.initializeProviders();
  }

  initializeProviders() {
    // Initialize OpenAI
    if (config.providers.openai.apiKey) {
      this.providers.set('openai', new OpenAIProvider(config.providers.openai));
      logger.info('OpenAI provider initialized');
    }

    // Initialize Anthropic
    if (config.providers.anthropic.apiKey) {
      this.providers.set('anthropic', new AnthropicProvider(config.providers.anthropic));
      logger.info('Anthropic provider initialized');
    }

    if (this.providers.size === 0) {
      logger.warn('No providers initialized. Configure API keys to enable providers.');
    }
  }

  /**
   * Get a provider by name
   * @param {string} providerName - Name of the provider
   * @returns {BaseProvider} Provider instance
   */
  getProvider(providerName) {
    const provider = this.providers.get(providerName);
    if (!provider) {
      throw new Error(`Provider '${providerName}' not found or not configured`);
    }
    return provider;
  }

  /**
   * Get all configured providers
   * @returns {Array<BaseProvider>} Array of provider instances
   */
  getAllProviders() {
    return Array.from(this.providers.values());
  }

  /**
   * Get names of all configured providers
   * @returns {Array<string>} Array of provider names
   */
  getProviderNames() {
    return Array.from(this.providers.keys());
  }

  /**
   * Check if a provider is configured
   * @param {string} providerName - Name of the provider
   * @returns {boolean} True if provider is configured
   */
  hasProvider(providerName) {
    return this.providers.has(providerName);
  }
}

module.exports = new ProviderFactory();