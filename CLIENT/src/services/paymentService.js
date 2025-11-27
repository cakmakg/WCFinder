// src/services/paymentService.js

import axios from 'axios';

const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:8000';
const API_URL = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;

// Axios instance oluştur
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token'ı her istekte ekle
api.interceptors.request.use(
  (config) => {
    // Token'ı localStorage'dan al
    let token = localStorage.getItem('token');
    
    // Token yoksa uyarı ver
    if (!token) {
      console.error('❌ [paymentService] No token found in localStorage');
      console.error('❌ [paymentService] Request will fail:', {
        url: config.url,
        method: config.method,
        fullURL: `${config.baseURL}${config.url}`
      });
    } else {
      // Token'ı temizle (boşluk vs. varsa)
      token = token.trim();
      
      // Token formatını kontrol et (Bearer prefix olmamalı)
      if (token.startsWith('Bearer ')) {
        token = token.replace('Bearer ', '').trim();
      }
      
      config.headers.Authorization = `Bearer ${token}`;
      
      console.log('🔐 [paymentService] Request with token:', {
        url: config.url,
        method: config.method?.toUpperCase(),
        hasToken: !!token,
        tokenLength: token.length,
        tokenPrefix: token.substring(0, 30) + '...',
        authorizationHeader: config.headers.Authorization.substring(0, 40) + '...'
      });
    }
    
    return config;
  },
  (error) => {
    console.error('❌ [paymentService] Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - 401 hatası için token refresh
api.interceptors.response.use(
  (response) => {
    console.log('✅ [paymentService] Response received:', {
      status: response.status,
      url: response.config?.url
    });
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      const token = localStorage.getItem('token');
      console.error('❌ [paymentService] 401 Unauthorized Error:', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        message: error.response?.data?.message,
        hasToken: !!token,
        tokenLength: token?.length,
        authorizationHeader: error.config?.headers?.Authorization?.substring(0, 40) + '...'
      });
      
      // Token geçersiz veya süresi dolmuş
      console.warn('⚠️ [paymentService] Removing invalid token and redirecting to login');
      
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Kullanıcıyı login sayfasına yönlendir
        const currentPath = window.location.pathname;
        if (currentPath !== '/login' && currentPath !== '/register') {
          window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
        }
      }
    } else {
      console.error('❌ [paymentService] Response error:', {
        status: error.response?.status,
        url: error.config?.url,
        message: error.response?.data?.message || error.message
      });
    }
    return Promise.reject(error);
  }
);

export const paymentService = {
  // Stripe Payment Intent oluştur
  createStripePayment: async (usageId) => {
    const response = await api.post('/payments/stripe/create', { usageId });
    return response.data;
  },

  // PayPal Order oluştur
  createPayPalOrder: async (usageId) => {
    const response = await api.post('/payments/paypal/create', { usageId });
    return response.data;
  },

  // PayPal Order'ı yakala
  capturePayPalOrder: async (orderId) => {
    const response = await api.post('/payments/paypal/capture', { orderId });
    return response.data;
  },

  // Kullanıcının ödemelerini getir
  getMyPayments: async () => {
    const response = await api.get('/payments/my-payments');
    return response.data;
  },

  // Tek bir ödeme detayı
  getPayment: async (paymentId) => {
    const response = await api.get(`/payments/${paymentId}`);
    return response.data;
  },
};

export default paymentService;