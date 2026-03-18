import { describe, it, expect } from 'vitest';
import {
  ErrorTypes,
  getErrorType,
  getErrorMessage,
  handleError,
} from '../../utils/errorHandler';

describe('Error Handler Utils', () => {
  // ==================== getErrorType ====================
  describe('getErrorType', () => {
    it('should return AUTHENTICATION for 401', () => {
      expect(getErrorType(401)).toBe(ErrorTypes.AUTHENTICATION);
    });

    it('should return AUTHORIZATION for 403', () => {
      expect(getErrorType(403)).toBe(ErrorTypes.AUTHORIZATION);
    });

    it('should return NOT_FOUND for 404', () => {
      expect(getErrorType(404)).toBe(ErrorTypes.NOT_FOUND);
    });

    it('should return VALIDATION for 422', () => {
      expect(getErrorType(422)).toBe(ErrorTypes.VALIDATION);
    });

    it('should return VALIDATION for other 4xx', () => {
      expect(getErrorType(400)).toBe(ErrorTypes.VALIDATION);
      expect(getErrorType(409)).toBe(ErrorTypes.VALIDATION);
    });

    it('should return SERVER for 5xx', () => {
      expect(getErrorType(500)).toBe(ErrorTypes.SERVER);
      expect(getErrorType(503)).toBe(ErrorTypes.SERVER);
    });

    it('should return UNKNOWN for no status', () => {
      expect(getErrorType(null)).toBe(ErrorTypes.UNKNOWN);
      expect(getErrorType(undefined)).toBe(ErrorTypes.UNKNOWN);
    });
  });

  // ==================== getErrorMessage ====================
  describe('getErrorMessage', () => {
    it('should return German default for null error', () => {
      expect(getErrorMessage(null)).toBe('Ein unbekannter Fehler ist aufgetreten.');
    });

    it('should extract message from axios response', () => {
      const error = { response: { data: { message: 'Custom error' } } };
      expect(getErrorMessage(error)).toBe('Custom error');
    });

    it('should return network error message in German', () => {
      const error = { message: 'Network Error' };
      expect(getErrorMessage(error)).toContain('Netzwerkfehler');
    });

    it('should return rate limit message for 429', () => {
      const error = { response: { status: 429, headers: {} } };
      expect(getErrorMessage(error)).toContain('Zu viele Anfragen');
    });

    it('should return German messages for status codes', () => {
      const make = (status) => ({ response: { status } });
      expect(getErrorMessage(make(401))).toContain('nicht angemeldet');
      expect(getErrorMessage(make(403))).toContain('keine Berechtigung');
      expect(getErrorMessage(make(404))).toContain('nicht gefunden');
      expect(getErrorMessage(make(500))).toContain('Serverfehler');
    });
  });

  // ==================== handleError ====================
  describe('handleError', () => {
    it('should return structured error response', () => {
      const error = { response: { status: 401 } };
      const result = handleError(error, 'Login');

      expect(result.type).toBe(ErrorTypes.AUTHENTICATION);
      expect(result.statusCode).toBe(401);
      expect(result.message).toBeDefined();
    });
  });
});
