require('./helpers/dbSetup');
const {
  validateEmail,
  validatePassword,
  validateObjectId,
  sanitizeInput,
  escapeHtml,
} = require('../middleware/validation');
const passwordEncrypt = require('../helper/passwordEncrypt');

describe('Validation Functions', () => {
  // ==================== validateEmail ====================
  describe('validateEmail', () => {
    it('should accept valid emails', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@domain.co')).toBe(true);
      expect(validateEmail('a@b.cd')).toBe(true);
    });

    it('should reject invalid emails', () => {
      expect(validateEmail('not-an-email')).toBe(false);
      expect(validateEmail('@missing.com')).toBe(false);
      expect(validateEmail('missing@')).toBe(false);
      expect(validateEmail('')).toBe(false);
      expect(validateEmail(null)).toBe(false);
      expect(validateEmail(undefined)).toBe(false);
    });
  });

  // ==================== validatePassword ====================
  describe('validatePassword', () => {
    it('should accept strong passwords', () => {
      expect(validatePassword('Test1234')).toBe(true);
      expect(validatePassword('StrongPass9')).toBe(true);
      expect(validatePassword('Aa1bcdef')).toBe(true);
    });

    it('should reject weak passwords', () => {
      expect(validatePassword('short')).toBe(false);       // too short
      expect(validatePassword('alllowercase1')).toBe(false); // no uppercase
      expect(validatePassword('ALLUPPERCASE1')).toBe(false); // no lowercase
      expect(validatePassword('NoNumbers')).toBe(false);     // no number
      expect(validatePassword('')).toBe(false);
      expect(validatePassword(null)).toBe(false);
    });
  });

  // ==================== validateObjectId ====================
  describe('validateObjectId', () => {
    it('should accept valid MongoDB ObjectIds', () => {
      expect(validateObjectId('507f1f77bcf86cd799439011')).toBe(true);
      expect(validateObjectId('aabbccddeeff00112233445566')).toBe(false); // 26 chars
      expect(validateObjectId('aabbccddeeff001122334455')).toBe(true);
    });

    it('should reject invalid ObjectIds', () => {
      expect(validateObjectId('invalid')).toBe(false);
      expect(validateObjectId('12345')).toBe(false);
      expect(validateObjectId('')).toBe(false);
      expect(validateObjectId(null)).toBe(false);
      expect(validateObjectId(undefined)).toBe(false);
    });
  });

  // ==================== escapeHtml ====================
  describe('escapeHtml', () => {
    it('should escape HTML special characters', () => {
      expect(escapeHtml('<script>')).toBe('&lt;script&gt;');
      expect(escapeHtml('"quoted"')).toBe('&quot;quoted&quot;');
      expect(escapeHtml("it's")).toBe("it&#039;s");
      expect(escapeHtml('a&b')).toBe('a&amp;b');
    });

    it('should return non-string values unchanged', () => {
      expect(escapeHtml(123)).toBe(123);
      expect(escapeHtml(null)).toBe(null);
    });

    it('should not modify safe strings', () => {
      expect(escapeHtml('hello world')).toBe('hello world');
      expect(escapeHtml('test@example.com')).toBe('test@example.com');
    });
  });

  // ==================== sanitizeInput ====================
  describe('sanitizeInput', () => {
    it('should strip MongoDB operators', () => {
      const result = sanitizeInput({ $gt: 100, name: 'test' });
      expect(result.$gt).toBeUndefined();
      expect(result.name).toBe('test');
    });

    it('should sanitize nested objects', () => {
      const result = sanitizeInput({
        user: { $ne: 'admin', name: 'test' },
      });
      expect(result.user.$ne).toBeUndefined();
      expect(result.user.name).toBe('test');
    });

    it('should escape HTML in strings', () => {
      const result = sanitizeInput({ name: '<script>alert("xss")</script>' });
      expect(result.name).not.toContain('<script>');
      expect(result.name).toContain('&lt;script&gt;');
    });

    it('should handle null and non-object input', () => {
      expect(sanitizeInput(null)).toBe(null);
      expect(sanitizeInput('string')).toBe('string');
      expect(sanitizeInput(123)).toBe(123);
    });

    it('should preserve numbers and booleans', () => {
      const result = sanitizeInput({ count: 5, active: true });
      expect(result.count).toBe(5);
      expect(result.active).toBe(true);
    });

    it('should handle arrays', () => {
      const result = sanitizeInput(['<b>bold</b>', 'safe']);
      expect(result[0]).toContain('&lt;b&gt;');
      expect(result[1]).toBe('safe');
    });
  });

  // ==================== passwordEncrypt ====================
  describe('passwordEncrypt', () => {
    it('should produce consistent hash for same input', () => {
      const hash1 = passwordEncrypt('Test1234');
      const hash2 = passwordEncrypt('Test1234');
      expect(hash1).toBe(hash2);
    });

    it('should produce different hashes for different inputs', () => {
      const hash1 = passwordEncrypt('Test1234');
      const hash2 = passwordEncrypt('Test5678');
      expect(hash1).not.toBe(hash2);
    });

    it('should return a hex string', () => {
      const hash = passwordEncrypt('Test1234');
      expect(hash).toMatch(/^[0-9a-f]+$/);
    });
  });
});
