// src/hooks/useAxios.jsx - GÜNCELLENMİŞ

import axios from "axios";
import { useSelector } from "react-redux";

const useAxios = () => {
  const { token } = useSelector((state) => state.auth);

  // ✅ Fallback ile API URL
  const BASE_URL = import.meta.env.VITE_BASE_URL || 
                   import.meta.env.VITE_API_URL || 
                   'http://localhost:8000';

  console.log("🔧 useAxios Config:", {
    BASE_URL,
    hasToken: !!token,
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

  // Request interceptor
  axiosWithToken.interceptors.request.use(
    (config) => {
      console.log("📤 Request:", config.method?.toUpperCase(), config.url);
      return config;
    },
    (error) => {
      console.error("❌ Request error:", error);
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

  // Public interceptor
  axiosPublic.interceptors.response.use(
    (response) => {
      console.log("✅ Public Response:", response.status, response.config.url);
      return response;
    },
    (error) => {
      console.error("❌ Public Response error:", error.response?.status, error.config?.url);
      return Promise.reject(error);
    }
  );

  return { axiosWithToken, axiosPublic };
};

export default useAxios;