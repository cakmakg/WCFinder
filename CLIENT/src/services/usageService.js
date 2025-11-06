// src/services/usageService.js

import axios from 'axios';

//const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

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

export const usageService = {
  createUsage: async (usageData) => {
    const response = await api.post('/usages', usageData);
    return response.data;
  },

  getMyUsages: async () => {
    const response = await api.get('/usages/my-usages');
    return response.data;
  },

  getUsage: async (usageId) => {
    const response = await api.get(`/usages/${usageId}`);
    return response.data;
  },
};

export default usageService;