/**
 * Structured logging utility
 * Production-ready logging with JSON output and log levels
 */

const config = require('./config');

const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3
};

const currentLevel = LOG_LEVELS[config.logLevel] || LOG_LEVELS.info;

class Logger {
  constructor() {
    this.context = {};
  }

  log(level, message, metadata = {}) {
    if (LOG_LEVELS[level] > currentLevel) return;

    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...this.context,
      ...metadata
    };

    const output = JSON.stringify(logEntry);
    
    if (level === 'error') {
      console.error(output);
    } else {
      console.log(output);
    }
  }

  error(message, metadata) {
    this.log('error', message, metadata);
  }

  warn(message, metadata) {
    this.log('warn', message, metadata);
  }

  info(message, metadata) {
    this.log('info', message, metadata);
  }

  debug(message, metadata) {
    this.log('debug', message, metadata);
  }

  // Create a child logger with additional context
  child(context) {
    const childLogger = new Logger();
    childLogger.context = { ...this.context, ...context };
    return childLogger;
  }
}

module.exports = new Logger();