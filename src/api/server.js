/**
 * Express server setup
 * Configures middleware and routes
 */

const express = require('express');
const authenticate = require('./middleware/auth');
const rateLimit = require('./middleware/rateLimit');
const errorHandler = require('./middleware/errorHandler');
const completionRoutes = require('./routes/completion');
const healthRoutes = require('./routes/health');
const logger = require('../utils/logger');

const app = express();

// Body parsing
app.use(express.json({ limit: '1mb' }));

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('HTTP request', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
      ip: req.ip
    });
  });
  
  next();
});

// Health check (no auth required)
app.use('/', healthRoutes);

// API routes (with auth and rate limiting)
app.use('/v1', authenticate, rateLimit, completionRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: {
      message: 'Not found',
      type: 'NotFoundError'
    }
  });
});

// Global error handler (must be last)
app.use(errorHandler);

module.exports = app;