/**
 * useAxios Hook for React Native
 *
 * Provides axios instances with token management.
 * The authenticated instance is the centralized `api` client (SecureStore-backed
 * token injection + refresh-and-retry). A separate public instance is used for
 * unauthenticated calls.
 */

import { useMemo } from 'react';
import axios from 'axios';
import api from '../services/api';
import { API_URL, API_TIMEOUT } from '../config/api';

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
  // Centralized API instance which includes refresh-and-retry logic
  const axiosWithToken = api;

  // Public axios instance (no token)
  const axiosPublic = useMemo(() => {
    const instance = axios.create({
      baseURL: API_URL,
      timeout: API_TIMEOUT,
    });

    // Request interceptor
    instance.interceptors.request.use(
      (config) => {
        if (__DEV__) {
          const fullURL = `${config.baseURL}${config.url}`;
          const safeData = config.data ? maskSensitiveData(config.data) : config.data;
          console.log("📤 [Public] Request:", {
            method: config.method?.toUpperCase(),
            url: config.url,
            baseURL: config.baseURL,
            fullURL,
            data: safeData,
          });
        }
        return config;
      },
      (error) => {
        if (__DEV__) console.error("❌ [Public] Request error:", error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    instance.interceptors.response.use(
      (response) => {
        if (__DEV__) console.log("✅ [Public] Response:", {
          status: response.status,
          url: response.config?.url,
          data: response.data,
        });
        return response;
      },
      (error) => {
        // Avoid leaking response bodies / server messages to production logs
        if (__DEV__) console.error("❌ [Public] Response error:", {
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
  }, []);

  return { axiosWithToken, axiosPublic };
};

export default useAxios;
