const embeddingService = require('./embeddingService');
const vectorStore = require('./vectorStore');
const config = require('../utils/config');

async function enrichPromptWithContext(prompt) {
  const queryEmbedding =
    await embeddingService.generateEmbedding(prompt);

  const relevantChunks =
    await vectorStore.searchSimilar(
      queryEmbedding,
      prompt,
      config.rag.topK
    );

  if (!relevantChunks.length) {
    return prompt;
  }

  const contextBlock = relevantChunks
    .map((doc, i) => `Context ${i + 1}:\n${doc.content}`)
    .join('\n\n');

  return `
You must answer strictly using the context below.

${contextBlock}

User Question:
${prompt}
`;
}

module.exports = {
  enrichPromptWithContext
};
