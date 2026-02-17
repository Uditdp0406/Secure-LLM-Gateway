/**
 * Anthropic provider implementation
 * Handles communication with Anthropic Claude API
 */

const BaseProvider = require('./baseProvider');
const { ProviderError } = require('../utils/errors');
const logger = require('../utils/logger');

class AnthropicProvider extends BaseProvider {
  constructor(config) {
    super(config);
    this.apiKey = config.apiKey;
    this.baseURL = config.baseURL;
    this.defaultModel = config.defaultModel;
    this.timeout = config.timeout;
    this.logger = logger.child({ provider: 'anthropic' });
  }

  getName() {
    return 'anthropic';
  }

  isConfigured() {
    return !!this.apiKey;
  }

  buildRequest(request) {
    return {
      model: request.options.model || this.defaultModel,
      messages: [
        {
          role: 'user',
          content: request.prompt
        }
      ],
      max_tokens: request.options.maxTokens || 1000,
      temperature: request.options.temperature ?? 0.7,
      ...(request.options.topP && { top_p: request.options.topP }),
      ...(request.options.stopSequences && { stop_sequences: request.options.stopSequences })
    };
  }

  async complete(request) {
    if (!this.isConfigured()) {
      throw new ProviderError('Anthropic provider not configured', this.getName());
    }

    const anthropicRequest = this.buildRequest(request);
    
    this.logger.debug('Sending request to Anthropic', {
      model: anthropicRequest.model,
      promptLength: request.prompt.length
    });

    try {
      const response = await this.makeHttpRequest('/messages', anthropicRequest);
      return this.normalizeResponse(response);
    } catch (error) {
      this.logger.error('Anthropic request failed', {
        error: error.message,
        promptLength: request.prompt.length
      });
      throw new ProviderError(
        `Anthropic request failed: ${error.message}`,
        this.getName(),
        error
      );
    }
  }

  async makeHttpRequest(endpoint, body) {
    const url = `${this.baseURL}${endpoint}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify(body),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorBody}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }

  normalizeResponse(anthropicResponse) {
    return {
      provider: this.getName(),
      text: anthropicResponse.content[0].text,
      model: anthropicResponse.model,
      usage: {
        promptTokens: anthropicResponse.usage.input_tokens,
        completionTokens: anthropicResponse.usage.output_tokens,
        totalTokens: anthropicResponse.usage.input_tokens + anthropicResponse.usage.output_tokens
      },
      finishReason: anthropicResponse.stop_reason,
      raw: anthropicResponse
    };
  }
}

module.exports = AnthropicProvider;