/**
 * Completion endpoint routes
 */

const express = require('express');
const router = express.Router();
const gateway = require('../../gateway/gateway');
const { validateCompletionRequest } = require('../middleware/validation');

/**
 * POST /v1/completion
 * Generate a completion using specified or default provider
 */
router.post('/completion', validateCompletionRequest, async (req, res, next) => {
  try {
    const { prompt, provider, options } = req.body;
    
    const result = await gateway.complete({
      prompt,
      provider,
      options: options || {}
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /v1/completion/fallback
 * Generate completion with automatic provider fallback
 */
router.post('/completion/fallback', validateCompletionRequest, async (req, res, next) => {
  try {
    const { prompt, providers, options } = req.body;
    
    const result = await gateway.completeWithFallback(
      { prompt, options: options || {} },
      providers
    );

    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /v1/providers
 * List available providers
 */
router.get('/providers', async (req, res, next) => {
  try {
    const providers = gateway.getAvailableProviders();
    res.json({ providers });
  } catch (error) {
    next(error);
  }
});

module.exports = router;