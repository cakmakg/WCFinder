// features/admin/services/adminService.js
// Admin panel API services

import apiClient from "../../../shared/utils/apiClient";

export const adminService = {
  // ============ USERS ============
  // Get all users (admin only)
  getAllUsers: async () => {
    const response = await apiClient.get("/users");
    return response.data;
  },

  // Get single user
  getUserById: async (userId) => {
    const response = await apiClient.get(`/users/${userId}`);
    return response.data;
  },

  // Update user
  updateUser: async (userId, userData) => {
    const response = await apiClient.put(`/users/${userId}`, userData);
    return response.data;
  },

  // Delete user
  deleteUser: async (userId) => {
    const response = await apiClient.delete(`/users/${userId}`);
    return response.data;
  },

  // ============ BUSINESSES ============
  // Get all businesses (admin only)
  getAllBusinesses: async () => {
    const response = await apiClient.get("/business");
    return response.data;
  },

  // Get single business
  getBusinessById: async (businessId) => {
    const response = await apiClient.get(`/business/${businessId}`);
    return response.data;
  },

  // Update business approval status (approve/reject)
  updateBusinessApproval: async (businessId, action) => {
    // action: 'approve' or 'reject'
    const response = await apiClient.patch(`/business/${businessId}/approve`, {
      action,
    });
    return response.data;
  },

  // Update business
  updateBusiness: async (businessId, businessData) => {
    const response = await apiClient.patch(`/business/${businessId}`, businessData);
    return response.data;
  },

  // Delete business
  deleteBusiness: async (businessId) => {
    const response = await apiClient.delete(`/business/${businessId}`);
    return response.data;
  },

  // Get business stats
  getBusinessStats: async (businessId) => {
    const response = await apiClient.get(`/business/${businessId}/stats`);
    return response.data;
  },

  // ============ USAGES/BOOKINGS ============
  // Get all usages (admin only)
  getAllUsages: async () => {
    const response = await apiClient.get("/usages");
    return response.data;
  },

  // Get single usage
  getUsageById: async (usageId) => {
    const response = await apiClient.get(`/usages/${usageId}`);
    return response.data;
  },

  // Update usage status
  updateUsageStatus: async (usageId, status) => {
    const response = await apiClient.patch(`/usages/${usageId}`, { status });
    return response.data;
  },

  // Delete usage
  deleteUsage: async (usageId) => {
    const response = await apiClient.delete(`/usages/${usageId}`);
    return response.data;
  },

  // ============ PAYMENTS ============
  // Get all payments (admin only)
  getAllPayments: async () => {
    const response = await apiClient.get("/payments");
    return response.data;
  },

  // Get single payment
  getPaymentById: async (paymentId) => {
    const response = await apiClient.get(`/payments/${paymentId}`);
    return response.data;
  },

  // Refund payment
  refundPayment: async (paymentId, amount) => {
    const response = await apiClient.post(`/payments/${paymentId}/refund`, { amount });
    return response.data;
  },

  // ============ TOILETS ============
  // Get all toilets
  getAllToilets: async () => {
    const response = await apiClient.get("/toilets");
    return response.data;
  },

  // Get toilet by ID
  getToiletById: async (toiletId) => {
    const response = await apiClient.get(`/toilets/${toiletId}`);
    return response.data;
  },

  // Update toilet
  updateToilet: async (toiletId, toiletData) => {
    const response = await apiClient.patch(`/toilets/${toiletId}`, toiletData);
    return response.data;
  },

  // Delete toilet
  deleteToilet: async (toiletId) => {
    const response = await apiClient.delete(`/toilets/${toiletId}`);
    return response.data;
  },

  // ============ STATISTICS & ANALYTICS ============
  // Get dashboard stats
  getDashboardStats: async () => {
    const response = await apiClient.get("/admin/stats");
    return response.data;
  },

  // Get analytics data
  getAnalytics: async (startDate, endDate) => {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    const response = await apiClient.get(`/admin/analytics?${params.toString()}`);
    return response.data;
  },
};

