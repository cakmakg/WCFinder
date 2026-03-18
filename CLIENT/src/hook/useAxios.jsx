// src/hooks/useAxios.jsx

import axios from "axios";
import { useSelector } from "react-redux";

/**
 * Masks sensitive fields in data objects (password, tokens, etc.)
 * Prevents sensitive data from appearing in console logs
 * @param {object} data - Data object to mask
 * @returns {object} - Masked data object
 */
const maskSensitiveData = (data) => {
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

/**
 * Masks sensitive headers (Authorization, etc.)
 * @param {object} headers - Headers object
 * @returns {object} - Masked headers object
 */
const maskSensitiveHeaders = (headers) => {
  if (!headers || typeof headers !== 'object') return headers;

  const safeHeaders = { ...headers };
  if (safeHeaders.Authorization || safeHeaders.authorization) {
    safeHeaders.Authorization = 'Bearer ***REDACTED***';
    safeHeaders.authorization = 'Bearer ***REDACTED***';
  }

  return safeHeaders;
};

const useAxios = () => {
  const { token } = useSelector((state) => state.auth);

  // Fallback ile API URL
  const baseUrl = import.meta.env.VITE_BASE_URL ||
                   import.meta.env.VITE_API_URL ||
                   'http://localhost:8000';
  const BASE_URL = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;

  if (import.meta.env.DEV) {
    console.log("🔧 useAxios Config:", {
      BASE_URL,
      hasToken: !!token,
    });
  }

  const axiosWithToken = axios.create({
    baseURL: BASE_URL,
    headers: token ? {
      Authorization: `Bearer ${token}`
    } : {},
  });

  const axiosPublic = axios.create({
    baseURL: BASE_URL,
  });

  // Request interceptor for axiosPublic (login/register)
  axiosPublic.interceptors.request.use(
    (config) => {
      if (import.meta.env.DEV) {
        const safeData = config.data ? maskSensitiveData(config.data) : config.data;
        const safeHeaders = config.headers ? maskSensitiveHeaders(config.headers) : config.headers;
        console.log("📤 [Public] Request:", {
          method: config.method?.toUpperCase(),
          url: config.url,
          headers: safeHeaders,
          data: safeData
        });
      }
      return config;
    },
    (error) => {
      if (import.meta.env.DEV) console.error("❌ [Public] Request error:", error.message);
      return Promise.reject(error);
    }
  );

  // Response interceptor for axiosPublic
  axiosPublic.interceptors.response.use(
    (response) => {
      if (import.meta.env.DEV) {
        console.log("✅ [Public] Response:", response.status, response.config?.url);
      }
      return response;
    },
    (error) => {
      if (import.meta.env.DEV) {
        console.error("❌ [Public] Response error:", {
          status: error.response?.status,
          url: error.config?.url,
          message: error.response?.data?.message || error.message,
        });
      }
      return Promise.reject(error);
    }
  );

  // Request interceptor for axiosWithToken
  axiosWithToken.interceptors.request.use(
    (config) => {
      if (import.meta.env.DEV) {
        console.log("📤 [WithToken] Request:", {
          method: config.method?.toUpperCase(),
          url: config.url,
          headers: maskSensitiveHeaders(config.headers),
        });
      }
      return config;
    },
    (error) => {
      if (import.meta.env.DEV) console.error("❌ [WithToken] Request error:", error.message);
      return Promise.reject(error);
    }
  );

  // Response interceptor for axiosWithToken
  axiosWithToken.interceptors.response.use(
    (response) => {
      if (import.meta.env.DEV) {
        console.log("✅ Response:", response.status, response.config.url);
      }
      return response;
    },
    (error) => {
      if (import.meta.env.DEV) {
        console.error("❌ Response error:", {
          status: error.response?.status,
          url: error.config?.url,
          message: error.response?.data?.message || error.message,
        });
      }

      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }

      return Promise.reject(error);
    }
  );

  return { axiosWithToken, axiosPublic };
};

export default useAxios;
