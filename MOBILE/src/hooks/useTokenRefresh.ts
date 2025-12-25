/**
 * useTokenRefresh Hook
 * 
 * Handles token refresh when access token expires
 * Implements retry logic for 401 errors
 */

import { useState } from 'react';
import api from '../services/api';
import { setInitialAuth } from '../store/slices/authSlice';
import { store } from '../store/store';
import { tokenStorage, clearAllStorage } from '../utils/secureStorage';

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

export const useTokenRefresh = () => {
  const [isRefreshingToken, setIsRefreshingToken] = useState(false);

  const refreshToken = async (): Promise<string | null> => {
    if (isRefreshing) {
      // If already refreshing, queue this request
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      });
    }

    isRefreshing = true;
    setIsRefreshingToken(true);

    try {
      // Try to get refresh token from secure storage
      const refreshToken = await tokenStorage.getRefreshToken();
      
      if (!refreshToken) {
        // No refresh token, user needs to login again
        throw new Error('No refresh token available');
      }

      // Call refresh endpoint
      const response = await api.post('/auth/refresh', {
        refreshToken,
      });

      const { accessToken, user } = response.data;

      if (accessToken) {
        // Store new token securely
        await tokenStorage.saveAccessToken(accessToken);
        
        // Update Redux store
        store.dispatch(setInitialAuth({ token: accessToken, user }));
        
        // Process queued requests
        processQueue(null, accessToken);
        
        return accessToken;
      }

      throw new Error('No access token in refresh response');
    } catch (error: any) {
      // Refresh failed, clear secure storage
      await clearAllStorage();
      
      // Process queued requests with error
      processQueue(error, null);
      
      throw error;
    } finally {
      isRefreshing = false;
      setIsRefreshingToken(false);
    }
  };

  return {
    refreshToken,
    isRefreshingToken,
  };
};

