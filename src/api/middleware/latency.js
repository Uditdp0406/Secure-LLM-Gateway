const logger = require("../../utils/logger");
const metricsService = require("../../services/metricsService");

function latency(req, res, next) {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;

    metricsService.incrementRequestCount();

    logger.info("HTTP request", {
      requestId: req.requestId,
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: duration,
      ip: req.ip,
      userId: req.user?.id || null
    });
  });

  next();
}

module.exports = latency;
