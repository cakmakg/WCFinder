/**
 * Centralized Logger Utility
 *
 * Replaces raw console.log/warn/error calls throughout the app.
 * - debug/info/warn: Only logs in __DEV__ mode (stripped in production)
 * - error: Always logs (critical errors should be visible)
 */

export const logger = {
  debug: (...args: any[]) => {
    if (__DEV__) {
      console.log('[DEBUG]', ...args);
    }
  },

  info: (...args: any[]) => {
    if (__DEV__) {
      console.log('[INFO]', ...args);
    }
  },

  warn: (...args: any[]) => {
    if (__DEV__) {
      console.warn('[WARN]', ...args);
    }
  },

  error: (...args: any[]) => {
    // Always log errors — even in production
    console.error('[ERROR]', ...args);
  },
};

export default logger;
