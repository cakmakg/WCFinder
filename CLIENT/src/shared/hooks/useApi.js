// shared/hooks/useApi.js
// Reusable API call hook with error handling

import { useState, useCallback } from "react";
import apiClient from "../utils/apiClient";
import { handleApiError } from "../utils/errorHandler";

/**
 * Generic API call hook
 * @param {boolean} requiresAuth - Auth token gerektirir mi?
 */
export const useApi = (requiresAuth = true) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const apiCall = useCallback(
    async ({ url, method = "GET", data = null, config = {} }) => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiClient.request({
          url,
          method,
          data,
          ...config,
        });

        return response.data;
      } catch (err) {
        const errorMessage = handleApiError(err);
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { apiCall, loading, error };
};

