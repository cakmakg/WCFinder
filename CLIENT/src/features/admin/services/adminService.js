// features/admin/services/adminService.js
// Admin panel API services

import apiClient from "../../../shared/utils/apiClient";

export const adminService = {
  // Get all users (admin only)
  getAllUsers: async () => {
    const response = await apiClient.get("/users");
    return response.data;
  },

  // Get all businesses (admin only)
  getAllBusinesses: async () => {
    const response = await apiClient.get("/business");
    return response.data;
  },

  // Get all usages (admin only)
  getAllUsages: async () => {
    const response = await apiClient.get("/usages");
    return response.data;
  },

  // Get all payments (admin only)
  getAllPayments: async () => {
    const response = await apiClient.get("/payments");
    return response.data;
  },

  // Update business approval status
  updateBusinessApproval: async (businessId, approvalStatus) => {
    const response = await apiClient.patch(`/business/${businessId}`, {
      approvalStatus,
    });
    return response.data;
  },
};

