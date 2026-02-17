const logger = require("./utils/logger");

class SecureLLMGateway {
  constructor(provider) {
    if (!provider) {
      throw new Error("LLM provider is required");
    }
    this.provider = provider;
  }

  async generate({ systemPrompt, userPrompt }) {
    if (!userPrompt) {
      throw new Error("userPrompt is required");
    }

    const messages = [
      {
        role: "system",
        content: systemPrompt || "You are a helpful assistant."
      },
      {
        role: "user",
        content: userPrompt
      }
    ];

    logger.log("request", {
      userPromptLength: userPrompt.length
    });

    const response = await this.provider.generate(messages);

    logger.log("response", {
      outputLength: response.length
    });

    return response;
  }
}

module.exports = SecureLLMGateway;
