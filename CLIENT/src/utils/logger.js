/**
 * Logging Utility
 * 
 * Centralized logging with different log levels
 * Production-ready with environment-based configuration
 */

const LogLevel = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
};

const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development';

/**
 * Logger class following Singleton pattern
 */
class Logger {
  constructor() {
    // ✅ DEBUG: Her zaman log'ları göster
    this.enabled = true; // Her zaman aktif
    this.minLevel = LogLevel.DEBUG; // Tüm log seviyelerini göster
  }

  /**
   * Logs debug message (only in development)
   * @param {string} message - Log message
   * @param {object} data - Additional data
   */
  debug(message, data = {}) {
    if (this.enabled && this.shouldLog(LogLevel.DEBUG)) {
      console.debug(`[DEBUG] ${message}`, data);
    }
  }

  /**
   * Logs info message
   * @param {string} message - Log message
   * @param {object} data - Additional data
   */
  info(message, data = {}) {
    if (this.enabled && this.shouldLog(LogLevel.INFO)) {
      console.info(`[INFO] ${message}`, data);
    }
  }

  /**
   * Logs warning message
   * @param {string} message - Log message
   * @param {object} data - Additional data
   */
  warn(message, data = {}) {
    if (this.enabled && this.shouldLog(LogLevel.WARN)) {
      console.warn(`[WARN] ${message}`, data);
    }
  }

  /**
   * Logs error message
   * @param {string} message - Log message
   * @param {Error|object} error - Error object
   * @param {object} data - Additional data
   */
  error(message, error = null, data = {}) {
    if (this.enabled && this.shouldLog(LogLevel.ERROR)) {
      console.error(`[ERROR] ${message}`, { error, ...data });
      
      // In production, send to error tracking service
      if (!isDevelopment && error) {
        // TODO: Integrate with error tracking (e.g., Sentry)
        // Sentry.captureException(error, { extra: data });
      }
    }
  }

  /**
   * Checks if log level should be logged
   * @param {string} level - Log level
   * @returns {boolean} - True if should log
   */
  shouldLog(level) {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
    const currentIndex = levels.indexOf(level);
    const minIndex = levels.indexOf(this.minLevel);
    return currentIndex >= minIndex;
  }
}

// Export singleton instance
export const logger = new Logger();
export default logger;

