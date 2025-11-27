// src/hooks/useAxios.jsx - GÜNCELLENMİŞ

import axios from "axios";
import { useSelector } from "react-redux";

const useAxios = () => {
  const { token } = useSelector((state) => state.auth);

  // ✅ Fallback ile API URL
  const baseUrl = import.meta.env.VITE_BASE_URL || 
                   import.meta.env.VITE_API_URL || 
                   'http://localhost:8000';
  const BASE_URL = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;

  console.log("🔧 useAxios Config:", {
    VITE_BASE_URL: import.meta.env.VITE_BASE_URL,
    VITE_API_URL: import.meta.env.VITE_API_URL,
    baseUrl,
    BASE_URL,
    hasToken: !!token,
    finalBaseURL: BASE_URL,
  });

  const axiosWithToken = axios.create({
    baseURL: BASE_URL,
    headers: token ? { 
      Authorization: `Bearer ${token}`
    } : {},
  });

  const axiosPublic = axios.create({
    baseURL: BASE_URL,
  });

  // ✅ Request interceptor for axiosPublic (login/register için)
  axiosPublic.interceptors.request.use(
    (config) => {
      const fullURL = `${config.baseURL}${config.url}`;
      console.log("📤 [Public] Request:", {
        method: config.method?.toUpperCase(),
        url: config.url,
        baseURL: config.baseURL,
        fullURL: fullURL,
        headers: config.headers,
        data: config.data
      });
      return config;
    },
    (error) => {
      console.error("❌ [Public] Request error:", error);
      return Promise.reject(error);
    }
  );

  // ✅ Response interceptor for axiosPublic
  axiosPublic.interceptors.response.use(
    (response) => {
      console.log("✅ [Public] Response:", {
        status: response.status,
        url: response.config?.url,
        data: response.data
      });
      return response;
    },
    (error) => {
      console.error("❌ [Public] Response error:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: error.config?.url,
        message: error.response?.data?.message || error.message,
        responseData: error.response?.data
      });
      return Promise.reject(error);
    }
  );

  // Request interceptor
  axiosWithToken.interceptors.request.use(
    (config) => {
      const fullURL = `${config.baseURL}${config.url}`;
      console.log("📤 [WithToken] Request:", {
        method: config.method?.toUpperCase(),
        url: config.url,
        baseURL: config.baseURL,
        fullURL: fullURL,
        headers: config.headers,
      });
      return config;
    },
    (error) => {
      console.error("❌ [WithToken] Request error:", error);
      return Promise.reject(error);
    }
  );

  // Response interceptor
  axiosWithToken.interceptors.response.use(
    (response) => {
      console.log("✅ Response:", response.status, response.config.url);
      return response;
    },
    (error) => {
      console.error("❌ Response error:", {
        status: error.response?.status,
        url: error.config?.url,
        message: error.response?.data?.message || error.message,
      });
      
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      
      return Promise.reject(error);
    }
  );

  // Public Request interceptor
  axiosPublic.interceptors.request.use(
    (config) => {
      const fullURL = `${config.baseURL}${config.url}`;
      console.log("📤 [Public] Request:", {
        method: config.method?.toUpperCase(),
        url: config.url,
        baseURL: config.baseURL,
        fullURL: fullURL,
        headers: config.headers,
      });
      return config;
    },
    (error) => {
      console.error("❌ [Public] Request error:", error);
      return Promise.reject(error);
    }
  );

  // Public Response interceptor
  axiosPublic.interceptors.response.use(
    (response) => {
      const fullURL = `${response.config.baseURL}${response.config.url}`;
      console.log("✅ [Public] Response:", {
        status: response.status,
        url: response.config.url,
        fullURL: fullURL,
        data: response.data,
      });
      return response;
    },
    (error) => {
      const fullURL = error.config ? `${error.config.baseURL}${error.config.url}` : 'unknown';
      console.error("❌ [Public] Response error:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: error.config?.url,
        fullURL: fullURL,
        message: error.message,
        responseData: error.response?.data,
      });
      return Promise.reject(error);
    }
  );

  return { axiosWithToken, axiosPublic };
};

export default useAxios;