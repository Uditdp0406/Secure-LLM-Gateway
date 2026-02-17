const fetch = global.fetch;
const config = require('../utils/config');
const logger = require('../utils/logger');

// Generate simple deterministic mock embedding
function generateMockEmbedding(text) {
  const dimension = 1536;

  const vector = new Array(dimension).fill(0).map((_, i) => {
    const charCode = text.charCodeAt(i % text.length) || 0;
    return ((charCode * (i + 1)) % 1000) / 1000;
  });

  return vector;
}

async function generateEmbedding(text) {
  const { apiKey, baseURL, embeddingModel } = config.providers.openai;

  // ==========================
  // MOCK FALLBACK
  // ==========================
  if (!apiKey) {
    logger.warn('OpenAI API key not found — using mock embeddings');

    return generateMockEmbedding(text);
  }

  try {
    const response = await fetch(`${baseURL}/embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: embeddingModel,
        input: text
      })
    });

    if (!response.ok) {
      const error = await response.text();
      logger.error('Embedding failed', { error });
      throw new Error('Embedding request failed');
    }

    const data = await response.json();
    return data.data[0].embedding;

  } catch (error) {
    logger.error('Embedding service error', {
      error: error.message
    });

    throw error;
  }
}

module.exports = {
  generateEmbedding
};
