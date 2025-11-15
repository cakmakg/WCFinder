// src/services/businessService.js

import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const businessService = {
  // Owner'ın kendi işletmesini getir
  getMyBusiness: async () => {
    const response = await api.get('/business/my-business');
    return response.data;
  },

  // Owner istatistiklerini getir
  getOwnerStats: async () => {
    const response = await api.get('/business/my-stats');
    return response.data;
  },
};

export default businessService;

