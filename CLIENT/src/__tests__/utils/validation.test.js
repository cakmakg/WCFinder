import { describe, it, expect } from 'vitest';
import {
  isValidObjectId,
  sanitizeString,
  isValidEmail,
  isValidPersonCount,
  isValidGenderPreference,
  validateBookingData,
  sanitizePaymentId,
  validateProfileData,
} from '../../utils/validation';

describe('Validation Utils', () => {
  // ==================== isValidObjectId ====================
  describe('isValidObjectId', () => {
    it('should accept valid 24-char hex ObjectId', () => {
      expect(isValidObjectId('507f1f77bcf86cd799439011')).toBe(true);
      expect(isValidObjectId('aabbccddeeff001122334455')).toBe(true);
    });

    it('should reject invalid ObjectIds', () => {
      expect(isValidObjectId('invalid')).toBe(false);
      expect(isValidObjectId('12345')).toBe(false);
      expect(isValidObjectId('')).toBe(false);
      expect(isValidObjectId(null)).toBe(false);
      expect(isValidObjectId(undefined)).toBe(false);
      expect(isValidObjectId(12345)).toBe(false);
    });
  });

  // ==================== sanitizeString ====================
  describe('sanitizeString', () => {
    it('should remove HTML tags', () => {
      const result = sanitizeString('<script>alert(1)</script>');
      expect(result).not.toContain('<');
      expect(result).not.toContain('>');
    });

    it('should remove javascript: protocol', () => {
      expect(sanitizeString('javascript:alert(1)')).not.toContain('javascript:');
    });

    it('should remove event handlers', () => {
      expect(sanitizeString('img onerror=alert(1)')).not.toMatch(/onerror=/i);
    });

    it('should trim whitespace', () => {
      expect(sanitizeString('  hello  ')).toBe('hello');
    });

    it('should limit length to 1000 chars', () => {
      const longString = 'a'.repeat(2000);
      expect(sanitizeString(longString).length).toBe(1000);
    });

    it('should return empty string for non-string input', () => {
      expect(sanitizeString(null)).toBe('');
      expect(sanitizeString(undefined)).toBe('');
      expect(sanitizeString(123)).toBe('');
    });
  });

  // ==================== isValidEmail ====================
  describe('isValidEmail', () => {
    it('should accept valid emails', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co')).toBe(true);
    });

    it('should reject invalid emails', () => {
      expect(isValidEmail('not-email')).toBe(false);
      expect(isValidEmail('@domain.com')).toBe(false);
      expect(isValidEmail('')).toBe(false);
      expect(isValidEmail(null)).toBe(false);
    });
  });

  // ==================== isValidPersonCount ====================
  describe('isValidPersonCount', () => {
    it('should accept valid counts (1-10)', () => {
      expect(isValidPersonCount(1)).toBe(true);
      expect(isValidPersonCount(5)).toBe(true);
      expect(isValidPersonCount(10)).toBe(true);
    });

    it('should reject invalid counts', () => {
      expect(isValidPersonCount(0)).toBe(false);
      expect(isValidPersonCount(-1)).toBe(false);
      expect(isValidPersonCount(11)).toBe(false);
      expect(isValidPersonCount(1.5)).toBe(false);
      expect(isValidPersonCount(null)).toBe(false);
    });
  });

  // ==================== isValidGenderPreference ====================
  describe('isValidGenderPreference', () => {
    it('should accept valid genders', () => {
      expect(isValidGenderPreference('male')).toBe(true);
      expect(isValidGenderPreference('female')).toBe(true);
      expect(isValidGenderPreference('unisex')).toBe(true);
    });

    it('should reject invalid genders', () => {
      expect(isValidGenderPreference('other')).toBe(false);
      expect(isValidGenderPreference('')).toBe(false);
    });
  });

  // ==================== validateBookingData ====================
  describe('validateBookingData', () => {
    const validBooking = {
      businessId: '507f1f77bcf86cd799439011',
      toiletId: 'aabbccddeeff001122334455',
      startTime: new Date(Date.now() + 86400000).toISOString(), // tomorrow
      personCount: 2,
    };

    it('should accept valid booking data', () => {
      const result = validateBookingData(validBooking);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject null booking data', () => {
      const result = validateBookingData(null);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should reject invalid businessId', () => {
      const result = validateBookingData({ ...validBooking, businessId: 'invalid' });
      expect(result.isValid).toBe(false);
    });

    it('should reject invalid personCount', () => {
      const result = validateBookingData({ ...validBooking, personCount: 0 });
      expect(result.isValid).toBe(false);
    });

    it('should accept optional genderPreference', () => {
      const result = validateBookingData({ ...validBooking, genderPreference: 'unisex' });
      expect(result.isValid).toBe(true);
    });

    it('should reject invalid genderPreference', () => {
      const result = validateBookingData({ ...validBooking, genderPreference: 'invalid' });
      expect(result.isValid).toBe(false);
    });
  });

  // ==================== sanitizePaymentId ====================
  describe('sanitizePaymentId', () => {
    it('should accept valid string ObjectId', () => {
      expect(sanitizePaymentId('507f1f77bcf86cd799439011')).toBe('507f1f77bcf86cd799439011');
    });

    it('should accept object with _id', () => {
      expect(sanitizePaymentId({ _id: '507f1f77bcf86cd799439011' })).toBe('507f1f77bcf86cd799439011');
    });

    it('should return null for invalid input', () => {
      expect(sanitizePaymentId(null)).toBe(null);
      expect(sanitizePaymentId('invalid')).toBe(null);
      expect(sanitizePaymentId('')).toBe(null);
    });
  });

  // ==================== validateProfileData ====================
  describe('validateProfileData', () => {
    it('should accept valid profile data', () => {
      const result = validateProfileData({
        username: 'validuser',
        email: 'valid@example.com',
      });
      expect(result.isValid).toBe(true);
      expect(result.sanitized.username).toBe('validuser');
      expect(result.sanitized.email).toBe('valid@example.com');
    });

    it('should reject short username', () => {
      const result = validateProfileData({ username: 'ab' });
      expect(result.isValid).toBe(false);
    });

    it('should reject invalid email', () => {
      const result = validateProfileData({ email: 'not-email' });
      expect(result.isValid).toBe(false);
    });

    it('should reject null data', () => {
      const result = validateProfileData(null);
      expect(result.isValid).toBe(false);
    });
  });
});
