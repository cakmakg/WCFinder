/**
 * UserStorage Tests
 * Tests user data sanitization and persistence
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  sanitizeUserData,
  storeUserData,
  getUserData,
  removeUserData,
} from '../../utils/userStorage';

describe('sanitizeUserData', () => {
  it('should remove password from user data', () => {
    const user = {
      _id: 'u1',
      username: 'john',
      role: 'user',
      password: 'secret123',
      email: 'john@test.com',
    };
    const sanitized = sanitizeUserData(user);
    expect(sanitized).not.toBeNull();
    expect((sanitized as any).password).toBeUndefined();
    expect(sanitized!._id).toBe('u1');
  });

  it('should keep only allowed fields', () => {
    const user = {
      _id: 'u1',
      username: 'john',
      role: 'user',
      isActive: true,
      email: 'john@test.com',
      firstName: 'John',
      lastName: 'Doe',
      creditCard: '1234-5678',
      __v: 0,
    };
    const sanitized = sanitizeUserData(user);
    expect(sanitized).toEqual({
      _id: 'u1',
      username: 'john',
      role: 'user',
      isActive: true,
      email: 'john@test.com',
      firstName: 'John',
      lastName: 'Doe',
    });
  });

  it('should return null for null input', () => {
    expect(sanitizeUserData(null)).toBeNull();
  });

  it('should return null for non-object input', () => {
    expect(sanitizeUserData('string')).toBeNull();
    expect(sanitizeUserData(123)).toBeNull();
  });

  it('should return null for undefined input', () => {
    expect(sanitizeUserData(undefined)).toBeNull();
  });
});

describe('storeUserData', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await AsyncStorage.clear();
  });

  it('should store sanitized data to AsyncStorage', async () => {
    const user = { _id: 'u1', username: 'john', role: 'user', password: 'secret' };
    await storeUserData(user);
    expect(AsyncStorage.setItem).toHaveBeenCalled();
    const stored = JSON.parse((AsyncStorage.setItem as jest.Mock).mock.calls[0][1]);
    expect(stored.password).toBeUndefined();
  });

  it('should not store if sanitization returns null', async () => {
    await storeUserData(null);
    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
  });

  it('should not throw on storage error', async () => {
    (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(new Error('fail'));
    await expect(storeUserData({ _id: 'u1', username: 'john', role: 'user' })).resolves.not.toThrow();
  });
});

describe('getUserData', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await AsyncStorage.clear();
  });

  it('should return stored user data', async () => {
    await storeUserData({ _id: 'u1', username: 'john', role: 'user' });
    const data = await getUserData();
    expect(data).toBeTruthy();
    expect(data!._id).toBe('u1');
  });

  it('should return null when no data stored', async () => {
    const data = await getUserData();
    expect(data).toBeNull();
  });

  it('should re-sanitize data on read (defense in depth)', async () => {
    // Manually inject unsanitized data
    await AsyncStorage.setItem(
      'user',
      JSON.stringify({ _id: 'u1', username: 'john', role: 'user', password: 'leaked' })
    );
    const data = await getUserData();
    expect((data as any)?.password).toBeUndefined();
  });

  it('should return null on parse error', async () => {
    await AsyncStorage.setItem('user', 'invalid-json{{{');
    // JSON.parse will throw, getUserData should catch and return null
    const data = await getUserData();
    expect(data).toBeNull();
  });
});

describe('removeUserData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should remove user data from AsyncStorage', async () => {
    await removeUserData();
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('user');
  });
});
