// features/admin/services/adminService.js
// Admin panel API services

import apiClient from "../../../shared/utils/apiClient";

export const adminService = {
  // Pending payments
  getAllPendingPayments: async () => {
    const response = await apiClient.get("/business-payouts/all-pending");
    return response.data;
  },

  // Monthly summary
  getMonthlySummary: async (year, month) => {
    const response = await apiClient.get(
      `/business-payouts/monthly-summary?year=${year}&month=${month}`
    );
    return response.data;
  },

  // Businesses with payouts
  getBusinessesWithPayouts: async () => {
    const response = await apiClient.get(
      "/business-payouts/businesses-with-payouts"
    );
    return response.data;
  },

  // Create payout
  createPayout: async (payoutData) => {
    const response = await apiClient.post("/business-payouts/create", payoutData);
    return response.data;
  },

  // Complete payout
  completePayout: async (payoutId, transactionReference) => {
    const response = await apiClient.patch(
      `/business-payouts/${payoutId}/complete`,
      { transactionReference }
    );
    return response.data;
  },

  // Create Rechnung
  createRechnung: async (payoutId) => {
    const response = await apiClient.post("/rechnungen/create-for-payout", {
      payoutId,
    });
    return response.data;
  },

  // Download Rechnung
  downloadRechnung: async (rechnungId) => {
    const token = localStorage.getItem("token");
    const baseURL = import.meta.env.VITE_BASE_URL || "http://localhost:8000";
    const url = `${baseURL}/rechnungen/${rechnungId}/download`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Download failed");
    }

    const blob = await response.blob();
    const contentDisposition = response.headers.get("content-disposition");
    const filename = contentDisposition
      ? contentDisposition.split("filename=")[1]?.replace(/"/g, "")
      : `rechnung-${rechnungId}.pdf`;

    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);

    return filename;
  },
};

