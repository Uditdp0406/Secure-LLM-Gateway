const BaseProvider = require('./baseProvider');

class MockProvider extends BaseProvider {
  constructor(config) {
    super(config);
  }

  getName() {
    return 'mock';
  }

  isConfigured() {
    return true;
  }

  async complete(request) {
    const text = request.prompt;

    // Simulate failure for circuit breaker test
    if (text.includes('FAIL_PROVIDER')) {
      throw new Error('Simulated provider failure');
    }

    return {
      provider: 'mock',
      text: `Mock response for: ${text.substring(0, 100)}`,
      model: 'mock-model',
      usage: {
        promptTokens: 10,
        completionTokens: 20,
        totalTokens: 30
      },
      finishReason: 'stop'
    };
  }
}

module.exports = MockProvider;
