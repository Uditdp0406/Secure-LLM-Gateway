/**
 * Custom error classes for better error handling
 */

class GatewayError extends Error {
  constructor(message, statusCode = 500, details = {}) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      error: {
        message: this.message,
        type: this.name,
        details: this.details
      }
    };
  }
}

class ValidationError extends GatewayError {
  constructor(message, details = {}) {
    super(message, 400, details);
  }
}

class AuthenticationError extends GatewayError {
  constructor(message = 'Authentication failed') {
    super(message, 401);
  }
}

class ProviderError extends GatewayError {
  constructor(message, providerName, originalError = null) {
    super(message, 502, { provider: providerName });
    this.providerName = providerName;
    this.originalError = originalError;
  }
}

class RateLimitError extends GatewayError {
  constructor(message = 'Rate limit exceeded') {
    super(message, 429);
  }
}

module.exports = {
  GatewayError,
  ValidationError,
  AuthenticationError,
  ProviderError,
  RateLimitError
};