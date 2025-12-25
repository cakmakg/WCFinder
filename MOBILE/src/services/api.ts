/**
 * API Service for React Native
 *
 * Axios instance with SecureStore token management
 * Handles authentication tokens and API calls with enhanced error handling
 *
 * Security Features:
 * - Tokens stored in SecureStore (hardware-backed encryption)
 * - Automatic token injection for authenticated requests
 * - 401 error handling with automatic logout
 * - Request/response logging for debugging
 */

import axios from 'axios';
import { tokenStorage, clearAllStorage } from '../utils/secureStorage';
import { API_URL, API_TIMEOUT } from '../config/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add token to requests
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await tokenStorage.getAccessToken();
      console.log('[API] Request interceptor:', {
        url: config.url,
        method: config.method,
        hasToken: !!token,
        tokenPreview: token ? token.substring(0, 20) + '...' : 'null'
      });

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        console.warn('[API] No token found in SecureStore');
      }
    } catch (error) {
      console.error('[API] Error reading token from SecureStore:', error);
    }
    return config;
  },
  (error) => {
    console.error('[API] Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors and token refresh
api.interceptors.response.use(
  (response) => {
    console.log('[API] Response success:', {
      url: response.config.url,
      status: response.status
    });
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    console.error('[API] Response error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.response?.data?.message || error.message
    });

    // 401 Unauthorized - Clear tokens and force re-login
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        console.log('[API] 401 Unauthorized - Clearing all storage');
        await clearAllStorage();

        // Notify the app to redirect to login
        // This will be handled by the auth state management
        console.log('[API] Storage cleared - User should be redirected to login');
      } catch (clearError) {
        console.error('[API] Failed to clear storage:', clearError);
      }
    }

    // Network errors
    if (error.code === 'ECONNABORTED') {
      console.error('[API] Request timeout');
      error.message = 'Request timeout - please check your connection';
    } else if (!error.response) {
      console.error('[API] Network error - no response received');
      error.message = 'Network error - please check your connection';
    }

    return Promise.reject(error);
  }
);

export default api;

