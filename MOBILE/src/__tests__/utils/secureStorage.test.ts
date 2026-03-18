/**
 * SecureStorage Tests
 * Tests token and user storage operations
 */

import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  tokenStorage,
  userStorage,
  clearAllStorage,
  STORAGE_KEYS,
} from '../../utils/secureStorage';

describe('tokenStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (SecureStore as any).__clear();
  });

  describe('saveAccessToken', () => {
    it('should save token to SecureStore', async () => {
      await tokenStorage.saveAccessToken('my-token');
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        STORAGE_KEYS.ACCESS_TOKEN,
        'my-token'
      );
    });

    it('should throw on SecureStore failure', async () => {
      (SecureStore.setItemAsync as jest.Mock).mockRejectedValueOnce(new Error('Storage full'));
      await expect(tokenStorage.saveAccessToken('token')).rejects.toThrow('Storage full');
    });
  });

  describe('getAccessToken', () => {
    it('should retrieve token from SecureStore', async () => {
      await tokenStorage.saveAccessToken('stored-token');
      const token = await tokenStorage.getAccessToken();
      expect(token).toBe('stored-token');
    });

    it('should return null when no token stored', async () => {
      const token = await tokenStorage.getAccessToken();
      expect(token).toBeNull();
    });

    it('should return null on error', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockRejectedValueOnce(new Error('fail'));
      const token = await tokenStorage.getAccessToken();
      expect(token).toBeNull();
    });
  });

  describe('saveRefreshToken', () => {
    it('should save refresh token to SecureStore', async () => {
      await tokenStorage.saveRefreshToken('refresh-token');
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        STORAGE_KEYS.REFRESH_TOKEN,
        'refresh-token'
      );
    });
  });

  describe('getRefreshToken', () => {
    it('should retrieve refresh token', async () => {
      await tokenStorage.saveRefreshToken('my-refresh');
      const token = await tokenStorage.getRefreshToken();
      expect(token).toBe('my-refresh');
    });

    it('should return null on error', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockRejectedValueOnce(new Error('fail'));
      const token = await tokenStorage.getRefreshToken();
      expect(token).toBeNull();
    });
  });

  describe('clearTokens', () => {
    it('should delete both access and refresh tokens', async () => {
      await tokenStorage.saveAccessToken('access');
      await tokenStorage.saveRefreshToken('refresh');
      await tokenStorage.clearTokens();
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(STORAGE_KEYS.ACCESS_TOKEN);
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(STORAGE_KEYS.REFRESH_TOKEN);
    });
  });
});

describe('userStorage', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await AsyncStorage.clear();
  });

  describe('save', () => {
    it('should save sanitized user data', async () => {
      const userData = {
        _id: 'u1',
        username: 'john',
        email: 'john@test.com',
        firstName: 'John',
        lastName: 'Doe',
        isAdmin: false,
        isStaff: false,
        password: 'should-not-be-stored',
      };
      await userStorage.save(userData);
      expect(AsyncStorage.setItem).toHaveBeenCalled();

      const storedData = JSON.parse(
        (AsyncStorage.setItem as jest.Mock).mock.calls[0][1]
      );
      expect(storedData.password).toBeUndefined();
      expect(storedData._id).toBe('u1');
      expect(storedData.username).toBe('john');
    });
  });

  describe('get', () => {
    it('should return parsed user data', async () => {
      await userStorage.save({ _id: 'u1', username: 'john', email: 'j@t.com' });
      const data = await userStorage.get();
      expect(data).toBeTruthy();
      expect(data._id).toBe('u1');
    });

    it('should return null when no data', async () => {
      const data = await userStorage.get();
      expect(data).toBeNull();
    });

    it('should return null on error', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(new Error('fail'));
      const data = await userStorage.get();
      expect(data).toBeNull();
    });
  });

  describe('clear', () => {
    it('should remove user data', async () => {
      await userStorage.save({ _id: 'u1', username: 'john' });
      await userStorage.clear();
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEYS.USER_DATA);
    });
  });
});

describe('clearAllStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should clear both tokens and user data', async () => {
    await clearAllStorage();
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(STORAGE_KEYS.ACCESS_TOKEN);
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(STORAGE_KEYS.REFRESH_TOKEN);
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEYS.USER_DATA);
  });
});
