// src/services/paymentService.js

import axios from 'axios';

const API_URL = import.meta.env.VITE_BASE_URL

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
    const token = localStorage.getItem('token'); // veya Redux'tan al
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
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