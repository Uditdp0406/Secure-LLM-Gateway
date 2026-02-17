const express = require('express');
const authenticate = require('./middleware/auth');
const rateLimit = require('./middleware/rateLimit');
const guardrails = require('./middleware/guardrails');
const errorHandler = require('./middleware/errorHandler');
const completionRoutes = require('./routes/completion');
const healthRoutes = require('./routes/health');
const metricsRoutes = require('./routes/metrics');
const ragRoutes = require('./routes/rag');

const requestId = require('./middleware/requestId');
const latency = require('./middleware/latency');

const app = express();

// Body parsing
app.use(express.json({ limit: '1mb' }));

// ===== Global Middleware Order =====

// 1️⃣ Attach request ID
app.use(requestId);

// 2️⃣ Track latency
app.use(latency);

// 3️⃣ Health check (no auth required)
app.use('/', healthRoutes);

// 4️⃣ Protected API routes
app.use(
  '/v1',
  authenticate,
  rateLimit,
  guardrails,   // 🔥 Injection protection layer
  completionRoutes,
  metricsRoutes,
  ragRoutes
);

// 5️⃣ 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: {
      message: 'Not found',
      type: 'NotFoundError'
    }
  });
});

// 6️⃣ Global error handler (must be last)
app.use(errorHandler);

module.exports = app;
