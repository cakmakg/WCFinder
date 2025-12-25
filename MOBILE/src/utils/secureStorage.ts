/**
 * Secure Storage Utility
 * Uses expo-secure-store for encrypted storage of sensitive data
 * Falls back to AsyncStorage for non-sensitive data or when SecureStore is unavailable
 */

import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Keys for secure storage
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER_DATA: 'userData',
} as const;

/**
 * Secure Token Storage
 * Uses hardware-backed encryption where available
 */
export const tokenStorage = {
  /**
   * Save access token securely
   */
  async saveAccessToken(token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, token);
      console.log('[SecureStorage] Access token saved successfully');
    } catch (error) {
      console.error('[SecureStorage] Failed to save access token:', error);
      throw error;
    }
  },

  /**
   * Get access token
   */
  async getAccessToken(): Promise<string | null> {
    try {
      const token = await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
      return token;
    } catch (error) {
      console.error('[SecureStorage] Failed to get access token:', error);
      return null;
    }
  },

  /**
   * Save refresh token securely
   */
  async saveRefreshToken(token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, token);
      console.log('[SecureStorage] Refresh token saved successfully');
    } catch (error) {
      console.error('[SecureStorage] Failed to save refresh token:', error);
      throw error;
    }
  },

  /**
   * Get refresh token
   */
  async getRefreshToken(): Promise<string | null> {
    try {
      const token = await SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
      return token;
    } catch (error) {
      console.error('[SecureStorage] Failed to get refresh token:', error);
      return null;
    }
  },

  /**
   * Delete all tokens (used during logout)
   */
  async clearTokens(): Promise<void> {
    try {
      await Promise.all([
        SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN),
        SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN),
      ]);
      console.log('[SecureStorage] All tokens cleared');
    } catch (error) {
      console.error('[SecureStorage] Failed to clear tokens:', error);
      throw error;
    }
  },
};

/**
 * User Data Storage
 * Uses AsyncStorage for non-sensitive user data
 */
export const userStorage = {
  /**
   * Save user data (sanitized - no passwords)
   */
  async save(userData: any): Promise<void> {
    try {
      // Ensure no sensitive data is stored
      const sanitizedData = {
        _id: userData._id,
        username: userData.username,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        isAdmin: userData.isAdmin,
        isStaff: userData.isStaff,
        // Never store password or other sensitive fields
      };

      await AsyncStorage.setItem(
        STORAGE_KEYS.USER_DATA,
        JSON.stringify(sanitizedData)
      );
      console.log('[UserStorage] User data saved successfully');
    } catch (error) {
      console.error('[UserStorage] Failed to save user data:', error);
      throw error;
    }
  },

  /**
   * Get user data
   */
  async get(): Promise<any | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('[UserStorage] Failed to get user data:', error);
      return null;
    }
  },

  /**
   * Clear user data
   */
  async clear(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
      console.log('[UserStorage] User data cleared');
    } catch (error) {
      console.error('[UserStorage] Failed to clear user data:', error);
      throw error;
    }
  },
};

/**
 * Clear all storage (used during logout)
 */
export const clearAllStorage = async (): Promise<void> => {
  try {
    await Promise.all([
      tokenStorage.clearTokens(),
      userStorage.clear(),
    ]);
    console.log('[Storage] All storage cleared');
  } catch (error) {
    console.error('[Storage] Failed to clear all storage:', error);
    throw error;
  }
};
