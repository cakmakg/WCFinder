// src/services/paymentService.js

import axios from 'axios';
import { API_BASE_URL, attachAuthInterceptors } from '../utils/authSession';

// Axios instance oluştur
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token ekleme + 401'de refresh/oturum temizliği merkezi olarak yönetiliyor
attachAuthInterceptors(api);

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