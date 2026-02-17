const config = require('../utils/config');
const logger = require('../utils/logger');

class VectorStore {
  constructor() {
    this.documents = []; // In-memory store
  }

  // ==========================
  // Add document chunks
  // ==========================
  async addDocuments(docs) {
    /**
     * docs = [
     *   {
     *     id: string,
     *     content: string,
     *     embedding: number[]
     *   }
     * ]
     */

    for (const doc of docs) {
      this.documents.push(doc);
    }

    logger.info('Documents indexed', {
      totalDocuments: this.documents.length
    });
  }

  // ==========================
  // Hybrid Search
  // ==========================
  async searchSimilar(queryEmbedding, queryText, topK = 3) {
    if (!this.documents.length) {
      logger.warn('Vector store empty');
      return [];
    }

    const results = this.documents.map((doc) => {
      const vectorScore = this.cosineSimilarity(
        queryEmbedding,
        doc.embedding
      );

      const keywordScore = this.keywordSimilarity(
        queryText,
        doc.content
      );

      const hybridScore =
        config.rag.hybridAlpha * vectorScore +
        config.rag.hybridBeta * keywordScore;

      return {
        ...doc,
        score: hybridScore
      };
    });

    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }

  // ==========================
  // Cosine Similarity
  // ==========================
  cosineSimilarity(vecA, vecB) {
    if (!vecA || !vecB) return 0;

    const length = Math.min(vecA.length, vecB.length);

    let dot = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < length; i++) {
      dot += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    normA = Math.sqrt(normA);
    normB = Math.sqrt(normB);

    if (normA === 0 || normB === 0) return 0;

    return dot / (normA * normB);
  }

  // ==========================
  // Keyword Similarity
  // ==========================
  keywordSimilarity(query, content) {
    if (!query || !content) return 0;

    const queryWords = query.toLowerCase().split(/\s+/);
    const contentText = content.toLowerCase();

    let matches = 0;

    for (const word of queryWords) {
      if (contentText.includes(word)) {
        matches++;
      }
    }

    return matches / queryWords.length;
  }

  // ==========================
  // Utility
  // ==========================
  clear() {
    this.documents = [];
  }
}

module.exports = new VectorStore();
