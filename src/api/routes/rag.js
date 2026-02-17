const express = require('express');
const router = express.Router();
const embeddingService = require('../../services/embeddingService');
const vectorStore = require('../../services/vectorStore');
const chunker = require('../../services/chunker');
const config = require('../../utils/config');

router.post('/rag/documents', async (req, res, next) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        error: { message: 'Admin access required' }
      });
    }

    const { id, content } = req.body;

    if (!id || !content) {
      return res.status(400).json({
        error: { message: 'id and content required' }
      });
    }

    const chunks = chunker.chunkText(content);

    for (let i = 0; i < chunks.length; i++) {
      const embedding =
        await embeddingService.generateEmbedding(chunks[i]);

      await vectorStore.addChunk(id, i, chunks[i], embedding);
    }

    res.json({
      status: 'Document ingested',
      chunksStored: chunks.length
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
