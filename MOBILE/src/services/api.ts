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
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

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

    // If it's a 401 and the request hasn't been retried yet, attempt refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log('[API] 401 received. originalRequest._retry =', originalRequest?._retry, 'isRefreshing =', isRefreshing, 'url =', originalRequest?.url);

      // Avoid trying to refresh if the original request was the refresh endpoint
      if (originalRequest.url && originalRequest.url.includes('/auth/refresh')) {
        try {
          console.log('[API] Refresh endpoint returned 401 - clearing storage');
          await clearAllStorage();
          // Dispatch logout to update app state
          try {
            const { store } = await import('../store/store');
            const { logoutSuccess } = await import('../store/slices/authSlice');
            store.dispatch(logoutSuccess());
          } catch (dispatchErr) {
            console.warn('[API] Failed to dispatch logoutSuccess after refresh 401:', dispatchErr);
          }
        } catch (clearError) {
          console.error('[API] Failed to clear storage after refresh 401:', clearError);
        }
        return Promise.reject(error);
      }

      if (isRefreshing) {
        console.log('[API] Refresh already in progress - queueing request');
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (token && originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await tokenStorage.getRefreshToken();
        console.log('[API] Refresh token present:', !!refreshToken);
        if (!refreshToken) {
          console.log('[API] No refresh token available - clearing storage and logging out');
          await clearAllStorage();
          try {
            const { store } = await import('../store/store');
            const { logoutSuccess } = await import('../store/slices/authSlice');
            store.dispatch(logoutSuccess());
          } catch (dispatchErr) {
            console.warn('[API] Failed to dispatch logoutSuccess when no refresh token:', dispatchErr);
          }
          processQueue(new Error('No refresh token'), null);
          isRefreshing = false;
          return Promise.reject(error);
        }

        console.log('[API] Attempting token refresh');
        // Use plain axios to avoid interceptor loops
        const refreshResponse = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });

        const newAccessToken = refreshResponse.data?.accessToken || refreshResponse.data?.token || refreshResponse.data?.bearer?.accessToken;
        const newUser = refreshResponse.data?.user || refreshResponse.data?.result || null;

        if (newAccessToken) {
          await tokenStorage.saveAccessToken(newAccessToken);

          // Update Redux store (lazy import to avoid circular deps)
          try {
            const { store } = await import('../store/store');
            const { setInitialAuth } = await import('../store/slices/authSlice');
            store.dispatch(setInitialAuth({ token: newAccessToken, user: newUser }));
          } catch (storeErr) {
            console.warn('[API] Failed to dispatch setInitialAuth:', storeErr);
          }

          processQueue(null, newAccessToken);
          isRefreshing = false;

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }

          return api(originalRequest);
        }

        // If refresh did not return new token, clear storage
        console.log('[API] Refresh did not return new token - clearing storage and logging out');
        await clearAllStorage();
        try {
          const { store } = await import('../store/store');
          const { logoutSuccess } = await import('../store/slices/authSlice');
          store.dispatch(logoutSuccess());
        } catch (dispatchErr) {
          console.warn('[API] Failed to dispatch logoutSuccess after failed refresh:', dispatchErr);
        }
        processQueue(new Error('No new access token'), null);
        isRefreshing = false;
        return Promise.reject(error);
      } catch (refreshError) {
        console.error('[API] Token refresh failed:', refreshError);
        try {
          await clearAllStorage();
        } catch (clearError) {
          console.error('[API] Failed to clear storage after refresh failure:', clearError);
        }
        try {
          const { store } = await import('../store/store');
          const { logoutSuccess } = await import('../store/slices/authSlice');
          store.dispatch(logoutSuccess());
        } catch (dispatchErr) {
          console.warn('[API] Failed to dispatch logoutSuccess after refresh error:', dispatchErr);
        }
        processQueue(refreshError, null);
        isRefreshing = false;
        return Promise.reject(refreshError);
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

