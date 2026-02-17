/**
 * Core gateway logic
 * Orchestrates requests to LLM providers with fallback and retry logic
 */

const providerFactory = require('./providerFactory');
const logger = require('../utils/logger');
const { ValidationError, ProviderError } = require('../utils/errors');
const config = require('../utils/config');

class Gateway {
  constructor() {
    this.logger = logger.child({ component: 'gateway' });
  }

  /**
   * Generate a completion using specified provider
   * @param {Object} request - Completion request
   * @param {string} request.prompt - The prompt text
   * @param {string} request.provider - Provider name (optional, uses default if not specified)
   * @param {Object} request.options - Generation options
   * @returns {Promise<Object>} Completion response
   */
  async complete(request) {
    this.validateRequest(request);

    const providerName = request.provider || this.getDefaultProvider();
    const provider = providerFactory.getProvider(providerName);

    const requestId = this.generateRequestId();
    const startTime = Date.now();

    this.logger.info('Processing completion request', {
      requestId,
      provider: providerName,
      promptLength: request.prompt.length,
      model: request.options?.model
    });

    try {
      const response = await provider.complete({
        prompt: request.prompt,
        options: request.options || {}
      });

      const duration = Date.now() - startTime;

      this.logger.info('Completion request successful', {
        requestId,
        provider: providerName,
        duration,
        tokensUsed: response.usage.totalTokens
      });

      return {
        id: requestId,
        ...response,
        metadata: {
          requestId,
          duration,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      
      this.logger.error('Completion request failed', {
        requestId,
        provider: providerName,
        duration,
        error: error.message
      });

      throw error;
    }
  }

  /**
   * Generate completion with automatic fallback to other providers
   * @param {Object} request - Completion request
   * @param {Array<string>} providers - Ordered list of providers to try
   * @returns {Promise<Object>} Completion response
   */
  async completeWithFallback(request, providers = null) {
    this.validateRequest(request);

    const providerList = providers || providerFactory.getProviderNames();
    
    if (providerList.length === 0) {
      throw new Error('No providers available');
    }

    const errors = [];
    
    for (const providerName of providerList) {
      try {
        return await this.complete({
          ...request,
          provider: providerName
        });
      } catch (error) {
        errors.push({ provider: providerName, error: error.message });
        this.logger.warn('Provider failed, trying next', {
          provider: providerName,
          error: error.message
        });
      }
    }

    // All providers failed
    throw new ProviderError(
      'All providers failed',
      'fallback',
      { attempts: errors }
    );
  }

  /**
   * Validate completion request
   * @param {Object} request - Request to validate
   */
  validateRequest(request) {
    if (!request) {
      throw new ValidationError('Request is required');
    }

    if (!request.prompt || typeof request.prompt !== 'string') {
      throw new ValidationError('Prompt must be a non-empty string');
    }

    if (request.prompt.length > config.maxPromptLength) {
      throw new ValidationError(
        `Prompt exceeds maximum length of ${config.maxPromptLength} characters`,
        { promptLength: request.prompt.length }
      );
    }

    if (request.options?.maxTokens && request.options.maxTokens > config.maxTokens) {
      throw new ValidationError(
        `maxTokens exceeds maximum of ${config.maxTokens}`,
        { requestedTokens: request.options.maxTokens }
      );
    }

    if (request.provider && !providerFactory.hasProvider(request.provider)) {
      throw new ValidationError(
        `Provider '${request.provider}' is not configured`,
        { availableProviders: providerFactory.getProviderNames() }
      );
    }
  }

  /**
   * Get default provider (first configured provider)
   * @returns {string} Provider name
   */
  getDefaultProvider() {
    const providers = providerFactory.getProviderNames();
    if (providers.length === 0) {
      throw new Error('No providers configured');
    }
    return providers[0];
  }

  /**
   * Get list of available providers
   * @returns {Array<Object>} Array of provider info
   */
  getAvailableProviders() {
    return providerFactory.getProviderNames().map(name => ({
      name,
      configured: true
    }));
  }

  /**
   * Generate unique request ID
   * @returns {string} Request ID
   */
  generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

module.exports = new Gateway();