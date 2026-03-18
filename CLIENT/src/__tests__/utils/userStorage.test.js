import { describe, it, expect, beforeEach } from 'vitest';
import {
  sanitizeUserData,
  storeUserData,
  getUserData,
  removeUserData,
} from '../../utils/userStorage';

describe('User Storage Utils', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  // ==================== sanitizeUserData ====================
  describe('sanitizeUserData', () => {
    it('should remove password from user data', () => {
      const data = {
        _id: '123',
        username: 'test',
        email: 'test@example.com',
        role: 'user',
        isActive: true,
        password: 'secret123',
      };
      const result = sanitizeUserData(data);
      expect(result.password).toBeUndefined();
      expect(result.username).toBe('test');
      expect(result.email).toBe('test@example.com');
    });

    it('should keep allowed fields', () => {
      const data = {
        _id: '123',
        username: 'user1',
        role: 'admin',
        isActive: true,
        email: 'admin@example.com',
        firstName: 'Max',
        lastName: 'Mustermann',
      };
      const result = sanitizeUserData(data);
      expect(result._id).toBe('123');
      expect(result.username).toBe('user1');
      expect(result.role).toBe('admin');
      expect(result.firstName).toBe('Max');
      expect(result.lastName).toBe('Mustermann');
    });

    it('should return null for invalid input', () => {
      expect(sanitizeUserData(null)).toBe(null);
      expect(sanitizeUserData(undefined)).toBe(null);
      expect(sanitizeUserData('string')).toBe(null);
    });
  });

  // ==================== storeUserData + getUserData ====================
  describe('storeUserData / getUserData round-trip', () => {
    it('should store and retrieve user data', () => {
      const data = {
        _id: '123',
        username: 'testuser',
        email: 'test@example.com',
        role: 'user',
        isActive: true,
      };

      storeUserData(data);
      const result = getUserData();

      expect(result).toBeDefined();
      expect(result._id).toBe('123');
      expect(result.username).toBe('testuser');
    });

    it('should not store password even if provided', () => {
      storeUserData({
        _id: '123',
        username: 'test',
        password: 'secret',
        role: 'user',
      });

      const result = getUserData();
      expect(result.password).toBeUndefined();
    });

    it('should return null when nothing stored', () => {
      expect(getUserData()).toBe(null);
    });
  });

  // ==================== removeUserData ====================
  describe('removeUserData', () => {
    it('should clear stored user data', () => {
      storeUserData({
        _id: '123',
        username: 'test',
        role: 'user',
      });

      expect(getUserData()).not.toBe(null);

      removeUserData();

      expect(getUserData()).toBe(null);
    });
  });
});
