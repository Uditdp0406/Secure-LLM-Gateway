const logger = require('./logger');

class CircuitBreaker {
  constructor(failureThreshold = 5, recoveryTimeMs = 30000) {
    this.failureThreshold = failureThreshold;
    this.recoveryTimeMs = recoveryTimeMs;

    this.state = 'CLOSED';
    this.failureCount = 0;
    this.nextAttemptTime = null;
  }

  async execute(fn, providerName) {
    if (this.state === 'OPEN') {
      if (Date.now() > this.nextAttemptTime) {
        this.state = 'HALF_OPEN';
        logger.warn('Circuit breaker HALF_OPEN', { providerName });
      } else {
        throw new Error(`Circuit is OPEN for ${providerName}`);
      }
    }

    try {
      const result = await fn();

      this.success(providerName);
      return result;
    } catch (error) {
      this.fail(providerName);
      throw error;
    }
  }

  success(providerName) {
    if (this.state === 'HALF_OPEN') {
      logger.info('Circuit breaker CLOSED after recovery', {
        providerName
      });
    }

    this.failureCount = 0;
    this.state = 'CLOSED';
  }

  fail(providerName) {
    this.failureCount++;

    logger.warn('Provider failure recorded', {
      providerName,
      failureCount: this.failureCount
    });

    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
      this.nextAttemptTime =
        Date.now() + this.recoveryTimeMs;

      logger.error('Circuit breaker OPENED', {
        providerName,
        recoveryTimeMs: this.recoveryTimeMs
      });
    }
  }

  getState() {
    return this.state;
  }
}

module.exports = CircuitBreaker;
