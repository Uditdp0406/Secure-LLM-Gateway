/**
 * Enterprise Secure LLM Gateway Core
 * Includes:
 * - Role-based enforcement
 * - Token counting
 * - Cost estimation
 * - Timeout protection
 * - Retry logic
 * - Circuit breaker protection
 * - Redis response caching
 * - RAG support
 */

const providerFactory = require('./providerFactory');
const logger = require('../utils/logger');
const countTokens = require('../utils/tokenCounter');
const {
  ValidationError,
  ProviderError
} = require('../utils/errors');
const config = require('../utils/config');
const CircuitBreaker = require('../utils/circuitBreaker');
const cacheService = require('../utils/cacheService');
const ragService = require('../services/ragService');

class Gateway {
  constructor() {
    this.logger = logger.child({ component: 'gateway' });
    this.circuitBreakers = {};
  }

  /**
   * Circuit breaker per provider (config-driven)
   */
  getCircuitBreaker(providerName) {
    if (!this.circuitBreakers[providerName]) {
      this.circuitBreakers[providerName] =
        new CircuitBreaker(
          config.circuitBreaker.failureThreshold,
          config.circuitBreaker.recoveryTimeMs
        );
    }
    return this.circuitBreakers[providerName];
  }

  async complete(request) {
    const {
      prompt,
      options = {},
      provider,
      requestId,
      user
    } = request;

    this.validateRequest(request);

    const providerName = provider || this.getDefaultProvider();
    const role = user?.role || 'user';
    const roleLimit =
      config.roleLimits[role] || config.roleLimits.user;

    if (options.maxTokens && options.maxTokens > roleLimit.maxTokens) {
      throw new ValidationError(
        `maxTokens exceeds role limit of ${roleLimit.maxTokens}`,
        { role }
      );
    }

    // ==========================
    // RAG Integration
    // ==========================
    let finalPrompt = prompt;
    let ragUsed = false;

    if (options.useRag && config.rag?.enabled) {
      finalPrompt =
        await ragService.enrichPromptWithContext(prompt);
      ragUsed = true;
    }

    // ==========================
    // Cache
    // ==========================
    let cacheKey = null;

    if (config.cache?.enabled && !options.noCache) {
      try {
        cacheKey = cacheService.generateCacheKey({
          prompt: finalPrompt,
          provider: providerName,
          options
        });

        const cached =
          await cacheService.getFromCache(cacheKey);

        if (cached) {
          this.logger.info('Cache HIT', {
            requestId,
            provider: providerName
          });

          return {
            ...cached,
            metadata: {
              ...cached.metadata,
              cache: 'HIT'
            }
          };
        }

        this.logger.info('Cache MISS', {
          requestId,
          provider: providerName
        });
      } catch (err) {
        this.logger.warn('Cache read failed', {
          error: err.message
        });
      }
    }

    const selectedProvider =
      providerFactory.getProvider(providerName);
    const breaker =
      this.getCircuitBreaker(providerName);

    const startTime = Date.now();
    const inputTokens = countTokens(finalPrompt);

    this.logger.info('Processing completion request', {
      requestId,
      provider: providerName,
      role,
      inputTokens,
      ragUsed
    });

    try {
      const response = await breaker.execute(
        () =>
          this.executeWithTimeoutAndRetry(
            () =>
              selectedProvider.complete({
                prompt: finalPrompt,
                options
              }),
            config.globalTimeout
          ),
        providerName
      );

      const duration = Date.now() - startTime;

      const outputTokens =
        response.usage?.completionTokens || 0;
      const totalTokens =
        response.usage?.totalTokens ||
        inputTokens + outputTokens;

      const cost = this.calculateCost(
        response.model,
        totalTokens
      );

      const finalResponse = {
        requestId,
        provider: providerName,
        model: response.model,
        data: {
          text: response.text,
          finishReason: response.finishReason
        },
        usage: {
          inputTokens,
          outputTokens,
          totalTokens,
          estimatedCost: cost
        },
        metadata: {
          role,
          durationMs: duration,
          timestamp: new Date().toISOString(),
          circuitState: breaker.getState(),
          ragUsed,
          cache: 'MISS'
        }
      };

      this.logger.info('Completion successful', {
        requestId,
        provider: providerName,
        durationMs: duration,
        totalTokens,
        cost
      });

      // Save to cache
      if (cacheKey && config.cache?.enabled && !options.noCache) {
        try {
          await cacheService.saveToCache(
            cacheKey,
            finalResponse
          );
        } catch (err) {
          this.logger.warn('Cache write failed', {
            error: err.message
          });
        }
      }

      return finalResponse;
    } catch (error) {
      const duration = Date.now() - startTime;

      this.logger.error('Completion failed', {
        requestId,
        provider: providerName,
        durationMs: duration,
        error: error.message,
        circuitState: breaker.getState()
      });

      throw error;
    }
  }

  async completeWithFallback(request, providers = null) {
    const providerList =
      providers || providerFactory.getProviderNames();

    if (!providerList.length) {
      throw new ProviderError(
        'No providers available',
        'fallback'
      );
    }

    const errors = [];

    for (const providerName of providerList) {
      try {
        return await this.complete({
          ...request,
          provider: providerName
        });
      } catch (error) {
        errors.push({
          provider: providerName,
          error: error.message
        });

        this.logger.warn(
          'Provider failed, trying next',
          {
            provider: providerName,
            error: error.message
          }
        );
      }
    }

    throw new ProviderError(
      'All providers failed',
      'fallback',
      { attempts: errors }
    );
  }

  async executeWithTimeoutAndRetry(fn, timeoutMs) {
    let attempts = 0;
    const maxAttempts = 2;

    while (attempts < maxAttempts) {
      attempts++;

      try {
        return await Promise.race([
          fn(),
          new Promise((_, reject) =>
            setTimeout(
              () =>
                reject(
                  new Error(
                    'Global request timeout'
                  )
                ),
              timeoutMs
            )
          )
        ]);
      } catch (error) {
        if (
          attempts < maxAttempts &&
          this.isRetryableError(error)
        ) {
          this.logger.warn(
            'Retrying provider call',
            {
              attempt: attempts,
              error: error.message
            }
          );
          continue;
        }

        throw error;
      }
    }
  }

  isRetryableError(error) {
    const message = error.message || '';
    return (
      message.includes('timeout') ||
      message.includes('429') ||
      message.includes('503') ||
      message.includes('500')
    );
  }

  calculateCost(model, totalTokens) {
    const costPer1K =
      config.costPer1KTokens[model] || 0;

    return parseFloat(
      ((totalTokens / 1000) * costPer1K).toFixed(6)
    );
  }

  validateRequest(request) {
    if (!request) {
      throw new ValidationError(
        'Request is required'
      );
    }

    if (
      !request.prompt ||
      typeof request.prompt !== 'string'
    ) {
      throw new ValidationError(
        'Prompt must be a non-empty string'
      );
    }

    if (
      request.prompt.length >
      config.maxPromptLength
    ) {
      throw new ValidationError(
        `Prompt exceeds maximum length of ${config.maxPromptLength}`,
        { promptLength: request.prompt.length }
      );
    }

    if (
      request.options?.maxTokens &&
      request.options.maxTokens >
        config.maxTokens
    ) {
      throw new ValidationError(
        `maxTokens exceeds maximum of ${config.maxTokens}`,
        {
          requestedTokens:
            request.options.maxTokens
        }
      );
    }

    if (
      request.provider &&
      !providerFactory.hasProvider(
        request.provider
      )
    ) {
      throw new ValidationError(
        `Provider '${request.provider}' is not configured`,
        {
          availableProviders:
            providerFactory.getProviderNames()
        }
      );
    }
  }

  getDefaultProvider() {
    const providers =
      providerFactory.getProviderNames();
    if (!providers.length) {
      throw new Error(
        'No providers configured'
      );
    }
    return providers[0];
  }

  getAvailableProviders() {
    return providerFactory
      .getProviderNames()
      .map((name) => ({
        name,
        configured: true
      }));
  }
}

module.exports = new Gateway();
