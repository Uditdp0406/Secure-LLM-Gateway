/**
 * Health check endpoint
 */

const express = require('express');
const router = express.Router();
const config = require('../../utils/config');

router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: config.environment,
    providers: config.enabledProviders
  });
});

module.exports = router;