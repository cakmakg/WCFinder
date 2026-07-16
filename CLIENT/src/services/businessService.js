// src/services/businessService.js

import axios from 'axios';
import { API_BASE_URL, attachAuthInterceptors } from '../utils/authSession';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token ekleme + 401'de refresh/oturum temizliği merkezi olarak yönetiliyor
attachAuthInterceptors(api);

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

  // Owner kendi işletmesini günceller
  updateMyBusiness: async (data) => {
    const response = await api.patch('/business/my-business', data);
    return response.data;
  },
};

export default businessService;

