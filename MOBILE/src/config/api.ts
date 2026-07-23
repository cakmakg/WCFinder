/**
 * API Configuration
 * 
 * Centralized API URL management
 * Uses Expo Constants to get environment variables
 */

import Constants from 'expo-constants';

export const getApiUrl = (): string => {
  // Priority: expoConfig.extra.apiUrl > EXPO_PUBLIC_API_URL > default
  const apiUrl = 
    Constants.expoConfig?.extra?.apiUrl ||
    process.env.EXPO_PUBLIC_API_URL ||
    'http://localhost:8000';

  // Ensure /api suffix
  return apiUrl.endsWith('/api') ? apiUrl : `${apiUrl}/api`;
};

export const API_URL = getApiUrl();

export const getEnv = (): string => {
  // `extra.env` is only populated when app.json/app.config declares it;
  // EXPO_PUBLIC_ENV (set per EAS build profile in eas.json) is the reliable source.
  return Constants.expoConfig?.extra?.env || process.env.EXPO_PUBLIC_ENV || 'development';
};

export const isDevelopment = (): boolean => {
  return getEnv() === 'development';
};

export const isProduction = (): boolean => {
  return getEnv() === 'production';
};

// API timeout settings
export const API_TIMEOUT = 30000; // 30 seconds

// Retry configuration
export const MAX_RETRIES = 3;
export const RETRY_DELAY = 1000; // 1 second

