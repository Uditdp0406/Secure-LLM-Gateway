/**
 * Application entry point
 * Starts the HTTP server and initializes the gateway
 */

const server = require('./api/server');
const logger = require('./utils/logger');
const config = require('./utils/config');

const PORT = config.port;

// Start server
server.listen(PORT, () => {
  logger.info(`Secure LLM Gateway started on port ${PORT}`, {
    environment: config.environment,
    providers: config.enabledProviders
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', { reason, promise });
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
  process.exit(1);
});