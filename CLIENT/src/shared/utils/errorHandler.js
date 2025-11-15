// shared/utils/errorHandler.js
// Centralized error handling utilities

import { toast } from "react-toastify";

/**
 * API hatalarını işle ve kullanıcıya göster
 */
export const handleApiError = (error, customMessage = null) => {
  const message =
    customMessage ||
    error?.response?.data?.message ||
    error?.message ||
    "Bir hata oluştu";

  console.error("API Error:", error);
  toast.error(message);

  return message;
};

/**
 * Başarı mesajı göster
 */
export const showSuccessMessage = (message) => {
  toast.success(message);
};

/**
 * Error response'dan mesaj çıkar
 */
export const extractErrorMessage = (error) => {
  return (
    error?.response?.data?.message ||
    error?.message ||
    "Bilinmeyen bir hata oluştu"
  );
};

