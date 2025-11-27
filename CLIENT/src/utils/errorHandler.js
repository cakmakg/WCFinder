/**
 * Error Handling Utilities
 * 
 * Centralized error handling following Clean Code principles
 * Provides consistent error messages and logging
 */

/**
 * Error types enum
 */
export const ErrorTypes = {
  NETWORK: 'NETWORK_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  AUTHENTICATION: 'AUTHENTICATION_ERROR',
  AUTHORIZATION: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  SERVER: 'SERVER_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR',
};

/**
 * Maps HTTP status codes to error types
 * @param {number} statusCode - HTTP status code
 * @returns {string} - Error type
 */
export const getErrorType = (statusCode) => {
  if (!statusCode) return ErrorTypes.UNKNOWN;
  
  if (statusCode >= 400 && statusCode < 500) {
    if (statusCode === 401) return ErrorTypes.AUTHENTICATION;
    if (statusCode === 403) return ErrorTypes.AUTHORIZATION;
    if (statusCode === 404) return ErrorTypes.NOT_FOUND;
    if (statusCode === 422) return ErrorTypes.VALIDATION;
    return ErrorTypes.VALIDATION;
  }
  
  if (statusCode >= 500) return ErrorTypes.SERVER;
  
  return ErrorTypes.UNKNOWN;
};

/**
 * Extracts user-friendly error message from error object
 * @param {Error|object} error - Error object
 * @returns {string} - User-friendly error message
 */
export const getErrorMessage = (error) => {
  if (!error) return 'Ein unbekannter Fehler ist aufgetreten.';
  
  // Axios error
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  
  // Network error
  if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
    return 'Netzwerkfehler. Bitte überprüfen Sie Ihre Internetverbindung.';
  }
  
  // Rate limit error
  if (error.response?.status === 429) {
    const retryAfter = error.response.headers['retry-after'];
    if (retryAfter) {
      return `Zu viele Anfragen. Bitte versuchen Sie es in ${retryAfter} Sekunden erneut.`;
    }
    return 'Zu viele Anfragen. Bitte versuchen Sie es später erneut.';
  }
  
  // Default error messages by status code
  const statusMessages = {
    400: 'Ungültige Anfrage. Bitte überprüfen Sie Ihre Eingaben.',
    401: 'Sie sind nicht angemeldet. Bitte melden Sie sich an.',
    403: 'Sie haben keine Berechtigung für diese Aktion.',
    404: 'Die angeforderte Ressource wurde nicht gefunden.',
    422: 'Ungültige Eingabedaten. Bitte überprüfen Sie Ihre Eingaben.',
    500: 'Serverfehler. Bitte versuchen Sie es später erneut.',
    503: 'Service vorübergehend nicht verfügbar. Bitte versuchen Sie es später erneut.',
  };
  
  if (error.response?.status && statusMessages[error.response.status]) {
    return statusMessages[error.response.status];
  }
  
  // Fallback to error message or default
  return error.message || 'Ein unbekannter Fehler ist aufgetreten.';
};

/**
 * Logs error with appropriate level
 * @param {Error|object} error - Error object
 * @param {string} context - Context where error occurred
 * @param {object} metadata - Additional metadata
 */
export const logError = (error, context = 'Unknown', metadata = {}) => {
  const errorType = getErrorType(error?.response?.status);
  const message = getErrorMessage(error);
  
  const logData = {
    context,
    errorType,
    message,
    statusCode: error?.response?.status,
    url: error?.config?.url,
    method: error?.config?.method,
    ...metadata,
  };
  
  // In production, send to logging service
  // In development, log to console
  if (process.env.NODE_ENV === 'production') {
    // TODO: Integrate with logging service (e.g., Sentry, LogRocket)
    console.error('[ERROR]', logData);
  } else {
    console.error(`[${errorType}] ${context}:`, logData);
  }
  
  return logData;
};

/**
 * Handles error and returns user-friendly response
 * @param {Error|object} error - Error object
 * @param {string} context - Context where error occurred
 * @returns {{message: string, type: string, statusCode: number}} - Error response
 */
export const handleError = (error, context = 'Unknown') => {
  const errorData = logError(error, context);
  
  return {
    message: errorData.message,
    type: errorData.errorType,
    statusCode: errorData.statusCode,
  };
};

