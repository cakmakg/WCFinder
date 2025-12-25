/**
 * useAxios Hook for React Native
 * 
 * Provides axios instances with token management
 * Uses AsyncStorage for token persistence
 */

import { useSelector, useDispatch } from 'react-redux';
import { useMemo, useEffect, useState } from 'react';
import axios from 'axios';
import { tokenStorage, clearAllStorage } from '../utils/secureStorage';
import { logoutSuccess } from '../store/slices/authSlice';
import { API_URL, API_TIMEOUT, MAX_RETRIES, RETRY_DELAY } from '../config/api';

/**
 * Masks sensitive fields in data objects
 */
const maskSensitiveData = (data: any) => {
  if (!data || typeof data !== 'object') return data;
  
  const sensitiveFields = ['password', 'passwd', 'pwd', 'token', 'accessToken', 'refreshToken'];
  const masked = { ...data };
  
  for (const key in masked) {
    if (sensitiveFields.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
      masked[key] = '***REDACTED***';
    } else if (typeof masked[key] === 'object' && masked[key] !== null) {
      masked[key] = maskSensitiveData(masked[key]);
    }
  }
  
  return masked;
};

const useAxios = () => {
  const { token } = useSelector((state: any) => state.auth);
  const [asyncToken, setAsyncToken] = useState<string | null>(null);

  const dispatch = useDispatch();

  // Get token from secure storage on mount
  useEffect(() => {
    tokenStorage.getAccessToken().then(setAsyncToken).catch(console.error);
  }, []);

  // Use token from Redux or secure storage
  const currentToken = token || asyncToken;

  // Use centralized API URL
  const BASE_URL = API_URL;

  // Axios instance with token
  const axiosWithToken = useMemo(() => {
    const instance = axios.create({
      baseURL: BASE_URL,
      timeout: API_TIMEOUT,
    });

    // Request interceptor - Add token dynamically
    instance.interceptors.request.use(
      async (config) => {
        // Get token from secure storage for each request (in case it changed)
        const token = await tokenStorage.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        const fullURL = `${config.baseURL}${config.url}`;
        console.log("📤 [WithToken] Request:", {
          method: config.method?.toUpperCase(),
          url: config.url,
          baseURL: config.baseURL,
          fullURL: fullURL,
        });
        return config;
      },
      (error) => {
        console.error("❌ [WithToken] Request error:", error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    instance.interceptors.response.use(
      (response) => {
        console.log("✅ [WithToken] Response:", response.status, response.config.url);
        return response;
      },
      async (error) => {
        console.error("❌ [WithToken] Response error:", {
          status: error.response?.status,
          url: error.config?.url,
          message: error.response?.data?.message || error.message,
        });
        
        if (error.response?.status === 401) {
          // Token expired - clear secure storage and update auth state
          await clearAllStorage();
          dispatch(logoutSuccess());
          // Navigation will be handled by the component
        }
        
        return Promise.reject(error);
      }
    );



    return instance;
  }, [BASE_URL]);

  // Public axios instance (no token)
  const axiosPublic = useMemo(() => {
    const instance = axios.create({
      baseURL: BASE_URL,
      timeout: API_TIMEOUT,
    });

    // Request interceptor
    instance.interceptors.request.use(
      (config) => {
        const fullURL = `${config.baseURL}${config.url}`;
        const safeData = config.data ? maskSensitiveData(config.data) : config.data;
        
        console.log("📤 [Public] Request:", {
          method: config.method?.toUpperCase(),
          url: config.url,
          baseURL: config.baseURL,
          fullURL: fullURL,
          data: safeData,
        });
        return config;
      },
      (error) => {
        console.error("❌ [Public] Request error:", error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    instance.interceptors.response.use(
      (response) => {
        console.log("✅ [Public] Response:", {
          status: response.status,
          url: response.config?.url,
          data: response.data,
        });
        return response;
      },
      (error) => {
        console.error("❌ [Public] Response error:", {
          status: error.response?.status,
          statusText: error.response?.statusText,
          url: error.config?.url,
          message: error.response?.data?.message || error.message,
          responseData: error.response?.data,
        });
        return Promise.reject(error);
      }
    );

    return instance;
  }, [BASE_URL]);

  return { axiosWithToken, axiosPublic };
};

export default useAxios;

