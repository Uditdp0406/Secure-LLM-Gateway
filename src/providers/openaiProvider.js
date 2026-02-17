/**
 * OpenAI provider implementation
 * Handles communication with OpenAI API
 */

const BaseProvider = require('./baseProvider');
const { ProviderError } = require('../utils/errors');
const logger = require('../utils/logger');

class OpenAIProvider extends BaseProvider {
  constructor(config) {
    super(config);
    this.apiKey = config.apiKey;
    this.baseURL = config.baseURL;
    this.defaultModel = config.defaultModel;
    this.timeout = config.timeout;
    this.logger = logger.child({ provider: 'openai' });
  }

  getName() {
    return 'openai';
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
      temperature: request.options.temperature ?? 0.7,
      max_tokens: request.options.maxTokens || 1000,
      ...(request.options.topP && { top_p: request.options.topP }),
      ...(request.options.stopSequences && { stop: request.options.stopSequences })
    };
  }

  async complete(request) {
    if (!this.isConfigured()) {
      throw new ProviderError('OpenAI provider not configured', this.getName());
    }

    const openaiRequest = this.buildRequest(request);
    
    this.logger.debug('Sending request to OpenAI', {
      model: openaiRequest.model,
      promptLength: request.prompt.length
    });

    try {
      const response = await this.makeHttpRequest('/chat/completions', openaiRequest);
      return this.normalizeResponse(response);
    } catch (error) {
      this.logger.error('OpenAI request failed', {
        error: error.message,
        promptLength: request.prompt.length
      });
      throw new ProviderError(
        `OpenAI request failed: ${error.message}`,
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
          'Authorization': `Bearer ${this.apiKey}`
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

  normalizeResponse(openaiResponse) {
    const choice = openaiResponse.choices[0];
    
    return {
      provider: this.getName(),
      text: choice.message.content,
      model: openaiResponse.model,
      usage: {
        promptTokens: openaiResponse.usage.prompt_tokens,
        completionTokens: openaiResponse.usage.completion_tokens,
        totalTokens: openaiResponse.usage.total_tokens
      },
      finishReason: choice.finish_reason,
      raw: openaiResponse
    };
  }
}

module.exports = OpenAIProvider;