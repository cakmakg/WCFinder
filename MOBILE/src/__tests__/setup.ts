/**
 * Jest Test Setup for Mobile
 * Mocks for expo-secure-store, AsyncStorage, and React Native modules
 */

// Mock expo-secure-store
jest.mock('expo-secure-store', () => {
  const store: Record<string, string> = {};
  return {
    setItemAsync: jest.fn(async (key: string, value: string) => {
      store[key] = value;
    }),
    getItemAsync: jest.fn(async (key: string) => {
      return store[key] || null;
    }),
    deleteItemAsync: jest.fn(async (key: string) => {
      delete store[key];
    }),
    __store: store,
    __clear: () => {
      Object.keys(store).forEach((k) => delete store[k]);
    },
  };
});

// Mock @react-native-async-storage/async-storage
jest.mock('@react-native-async-storage/async-storage', () => {
  const store: Record<string, string> = {};
  return {
    __esModule: true,
    default: {
      setItem: jest.fn(async (key: string, value: string) => {
        store[key] = value;
      }),
      getItem: jest.fn(async (key: string) => {
        return store[key] || null;
      }),
      removeItem: jest.fn(async (key: string) => {
        delete store[key];
      }),
      getAllKeys: jest.fn(async () => Object.keys(store)),
      multiRemove: jest.fn(async (keys: string[]) => {
        keys.forEach((k) => delete store[k]);
      }),
      clear: jest.fn(async () => {
        Object.keys(store).forEach((k) => delete store[k]);
      }),
    },
    __store: store,
    __clear: () => {
      Object.keys(store).forEach((k) => delete store[k]);
    },
  };
});

// Mock @react-native-community/netinfo
jest.mock('@react-native-community/netinfo', () => ({
  fetch: jest.fn(() =>
    Promise.resolve({
      isConnected: true,
      isInternetReachable: true,
    })
  ),
  addEventListener: jest.fn(() => jest.fn()),
}));

// Suppress console.error/warn in tests (runs before framework, no beforeAll available)
console.error = jest.fn();
console.warn = jest.fn();
