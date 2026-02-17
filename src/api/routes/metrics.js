const express = require('express');
const router = express.Router();
const metricsService = require('../../services/metricsService');

/**
 * GET /v1/metrics
 * Returns system metrics
 * Admin only
 */
router.get('/metrics', async (req, res, next) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        error: {
          message: 'Access denied',
          type: 'Forbidden'
        }
      });
    }

    const metrics = await metricsService.getMetrics();
    res.json(metrics);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
