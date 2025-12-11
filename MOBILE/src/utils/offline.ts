/**
 * Offline Utilities
 * 
 * Handles offline detection and caching
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
// Note: Install with: npx expo install @react-native-community/netinfo
// import NetInfo from '@react-native-community/netinfo';

const CACHE_PREFIX = '@wcfinder_cache_';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

export interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

/**
 * Check if device is online
 * Note: Requires @react-native-community/netinfo package
 */
export const isOnline = async (): Promise<boolean> => {
  try {
    // Dynamic import to avoid errors if package not installed
    const NetInfo = require('@react-native-community/netinfo');
    const state = await NetInfo.fetch();
    return state.isConnected ?? false;
  } catch (error) {
    // If NetInfo not available, assume online
    console.warn('NetInfo not available, assuming online');
    return true;
  }
};

/**
 * Cache data with expiry
 */
export const cacheData = async <T>(key: string, data: T, expiry: number = CACHE_EXPIRY): Promise<void> => {
  try {
    const cacheItem: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + expiry,
    };
    await AsyncStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(cacheItem));
  } catch (error) {
    console.error('Error caching data:', error);
  }
};

/**
 * Get cached data if not expired
 */
export const getCachedData = async <T>(key: string): Promise<T | null> => {
  try {
    const cached = await AsyncStorage.getItem(`${CACHE_PREFIX}${key}`);
    if (!cached) return null;

    const cacheItem: CacheItem<T> = JSON.parse(cached);
    
    // Check if expired
    if (Date.now() > cacheItem.expiry) {
      await AsyncStorage.removeItem(`${CACHE_PREFIX}${key}`);
      return null;
    }

    return cacheItem.data;
  } catch (error) {
    console.error('Error getting cached data:', error);
    return null;
  }
};

/**
 * Clear expired cache
 */
export const clearExpiredCache = async (): Promise<void> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter(key => key.startsWith(CACHE_PREFIX));
    
    for (const key of cacheKeys) {
      const cached = await AsyncStorage.getItem(key);
      if (cached) {
        const cacheItem = JSON.parse(cached);
        if (Date.now() > cacheItem.expiry) {
          await AsyncStorage.removeItem(key);
        }
      }
    }
  } catch (error) {
    console.error('Error clearing expired cache:', error);
  }
};

/**
 * Clear all cache
 */
export const clearAllCache = async (): Promise<void> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter(key => key.startsWith(CACHE_PREFIX));
    await AsyncStorage.multiRemove(cacheKeys);
  } catch (error) {
    console.error('Error clearing all cache:', error);
  }
};

