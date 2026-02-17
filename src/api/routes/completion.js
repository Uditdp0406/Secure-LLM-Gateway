/**
 * Completion endpoint routes
 * Enterprise-ready routing layer
 */

const express = require('express');
const router = express.Router();
const gateway = require('../../gateway/gateway');
const { validateCompletionRequest } = require('../middleware/validation');
const { ValidationError } = require('../../utils/errors');

/**
 * POST /v1/completion
 * Generate a completion using specified or default provider
 */
router.post(
  '/completion',
  validateCompletionRequest,
  async (req, res, next) => {
    try {
      const { prompt, provider, options } = req.body;

      const result = await gateway.complete({
        prompt,
        provider,
        options: options || {},
        requestId: req.requestId,
        user: req.user || null
      });

      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /v1/completion/fallback
 * Generate completion with automatic provider fallback
 */
router.post(
  '/completion/fallback',
  validateCompletionRequest,
  async (req, res, next) => {
    try {
      const { prompt, providers, options } = req.body;

      // Optional: Restrict fallback usage by role
      if (req.user?.role !== 'admin') {
        throw new ValidationError(
          'Fallback endpoint is restricted to admin users'
        );
      }

      const result = await gateway.completeWithFallback(
        {
          prompt,
          options: options || {},
          requestId: req.requestId,
          user: req.user || null
        },
        providers
      );

      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /v1/providers
 * List available providers
 */
router.get('/providers', async (req, res, next) => {
  try {
    const providers = gateway.getAvailableProviders();

    res.json({
      requestId: req.requestId,
      providers
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
