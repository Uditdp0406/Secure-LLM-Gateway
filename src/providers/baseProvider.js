/**
 * Abstract base class for LLM providers
 * All providers must implement this interface
 */

class BaseProvider {
  constructor(config) {
    if (this.constructor === BaseProvider) {
      throw new Error('BaseProvider is abstract and cannot be instantiated directly');
    }
    this.config = config;
  }

  /**
   * Generate a completion from the LLM
   * @param {Object} request - Normalized request object
   * @param {string} request.prompt - The prompt text
   * @param {Object} request.options - Generation options (temperature, maxTokens, etc.)
   * @returns {Promise<Object>} Normalized response object
   */
  async complete(request) {
    throw new Error('complete() must be implemented by provider');
  }

  /**
   * Validate provider configuration
   * @returns {boolean} True if provider is properly configured
   */
  isConfigured() {
    throw new Error('isConfigured() must be implemented by provider');
  }

  /**
   * Get provider name
   * @returns {string} Provider name
   */
  getName() {
    throw new Error('getName() must be implemented by provider');
  }

  /**
   * Normalize response from provider to common format
   * @param {Object} providerResponse - Raw response from provider
   * @returns {Object} Normalized response
   */
  normalizeResponse(providerResponse) {
    throw new Error('normalizeResponse() must be implemented by provider');
  }

  /**
   * Build provider-specific request from normalized request
   * @param {Object} request - Normalized request
   * @returns {Object} Provider-specific request
   */
  buildRequest(request) {
    throw new Error('buildRequest() must be implemented by provider');
  }
}

module.exports = BaseProvider;