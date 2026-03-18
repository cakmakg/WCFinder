/**
 * Offline Utilities Tests
 * Tests caching with expiry, clearing expired and all cache
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { cacheData, getCachedData, clearExpiredCache, clearAllCache } from '../../utils/offline';

const CACHE_PREFIX = '@wcfinder_cache_';

describe('cacheData', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await AsyncStorage.clear();
  });

  it('should store data with timestamp and expiry', async () => {
    const testData = { items: [1, 2, 3] };
    await cacheData('test-key', testData);

    expect(AsyncStorage.setItem).toHaveBeenCalled();
    const call = (AsyncStorage.setItem as jest.Mock).mock.calls[0];
    expect(call[0]).toBe(`${CACHE_PREFIX}test-key`);

    const stored = JSON.parse(call[1]);
    expect(stored.data).toEqual(testData);
    expect(stored.timestamp).toBeDefined();
    expect(stored.expiry).toBeDefined();
    expect(stored.expiry).toBeGreaterThan(stored.timestamp);
  });

  it('should use custom expiry time', async () => {
    const customExpiry = 5000; // 5 seconds
    await cacheData('short-cache', 'data', customExpiry);

    const call = (AsyncStorage.setItem as jest.Mock).mock.calls[0];
    const stored = JSON.parse(call[1]);
    expect(stored.expiry - stored.timestamp).toBeLessThanOrEqual(customExpiry + 100);
  });

  it('should not throw on storage error', async () => {
    (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(new Error('full'));
    await expect(cacheData('key', 'value')).resolves.not.toThrow();
  });
});

describe('getCachedData', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await AsyncStorage.clear();
  });

  it('should return cached data if not expired', async () => {
    await cacheData('valid', { name: 'test' });
    const result = await getCachedData('valid');
    expect(result).toEqual({ name: 'test' });
  });

  it('should return null for expired data', async () => {
    // Manually insert expired cache
    const expiredItem = {
      data: 'old',
      timestamp: Date.now() - 100000,
      expiry: Date.now() - 1000, // expired 1 second ago
    };
    await AsyncStorage.setItem(
      `${CACHE_PREFIX}expired-key`,
      JSON.stringify(expiredItem)
    );

    const result = await getCachedData('expired-key');
    expect(result).toBeNull();
  });

  it('should return null for non-existent key', async () => {
    const result = await getCachedData('non-existent');
    expect(result).toBeNull();
  });

  it('should remove expired cache item', async () => {
    const expiredItem = {
      data: 'old',
      timestamp: Date.now() - 100000,
      expiry: Date.now() - 1000,
    };
    await AsyncStorage.setItem(
      `${CACHE_PREFIX}old-key`,
      JSON.stringify(expiredItem)
    );

    await getCachedData('old-key');
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith(`${CACHE_PREFIX}old-key`);
  });

  it('should return null on parse error', async () => {
    await AsyncStorage.setItem(`${CACHE_PREFIX}bad`, 'not-json{{{');
    const result = await getCachedData('bad');
    expect(result).toBeNull();
  });
});

describe('clearExpiredCache', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await AsyncStorage.clear();
  });

  it('should remove only expired cache items', async () => {
    // Valid cache
    await cacheData('valid-item', 'still-good');

    // Expired cache (manually)
    const expiredItem = {
      data: 'expired',
      timestamp: Date.now() - 100000,
      expiry: Date.now() - 1000,
    };
    await AsyncStorage.setItem(
      `${CACHE_PREFIX}expired-item`,
      JSON.stringify(expiredItem)
    );

    jest.clearAllMocks(); // Clear call history

    await clearExpiredCache();

    // Should have checked all keys and removed only expired
    expect(AsyncStorage.getAllKeys).toHaveBeenCalled();
  });

  it('should not throw on error', async () => {
    (AsyncStorage.getAllKeys as jest.Mock).mockRejectedValueOnce(new Error('fail'));
    await expect(clearExpiredCache()).resolves.not.toThrow();
  });
});

describe('clearAllCache', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await AsyncStorage.clear();
  });

  it('should remove all cache prefixed items', async () => {
    await cacheData('item1', 'data1');
    await cacheData('item2', 'data2');
    // Non-cache item
    await AsyncStorage.setItem('user', 'non-cache');

    jest.clearAllMocks();

    await clearAllCache();

    expect(AsyncStorage.getAllKeys).toHaveBeenCalled();
    expect(AsyncStorage.multiRemove).toHaveBeenCalled();

    // Verify only cache keys were removed
    const removedKeys = (AsyncStorage.multiRemove as jest.Mock).mock.calls[0][0];
    removedKeys.forEach((key: string) => {
      expect(key.startsWith(CACHE_PREFIX)).toBe(true);
    });
  });

  it('should not throw on error', async () => {
    (AsyncStorage.getAllKeys as jest.Mock).mockRejectedValueOnce(new Error('fail'));
    await expect(clearAllCache()).resolves.not.toThrow();
  });
});
