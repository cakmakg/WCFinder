/**
 * Usage Service
 * 
 * Handles all usage/booking related API calls
 * Includes input validation and error handling
 * 
 * Clean Code Principles:
 * - Single Responsibility: Only API calls for usage
 * - DRY: Reusable axios instance and interceptors
 * - Security: Input validation before API calls
 */
import axios from 'axios';
import { isValidObjectId, validateBookingData } from '../utils/validation';
import { handleError } from '../utils/errorHandler';
import logger from '../utils/logger';

// Environment variable validation
const getBaseUrl = () => {
  const baseUrl = import.meta.env.VITE_BASE_URL;
  if (!baseUrl) {
    logger.warn('VITE_BASE_URL not set, using default localhost');
  }
  const url = baseUrl || 'http://localhost:8000';
  return url.endsWith('/api') ? url : `${url}/api`;
};

const BASE_URL = getBaseUrl();

// Create axios instance with default config
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

// Request interceptor: Add authentication token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // Sanitize token (remove any whitespace)
      const cleanToken = token.trim();
      config.headers.Authorization = `Bearer ${cleanToken}`;
    }
    return config;
  },
  (error) => {
    logger.error('Request interceptor error', error);
    return Promise.reject(error);
  }
);

// Response interceptor: Handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorData = handleError(error, 'usageService');
    return Promise.reject(errorData);
  }
);

/**
 * Usage Service API
 */
export const usageService = {
  /**
   * Creates a new usage/booking
   * @param {object} usageData - Booking data
   * @returns {Promise<object>} - Created usage data
   * @throws {Error} - If validation fails or API call fails
   */
  createUsage: async (usageData) => {
    // Input validation
    const validation = validateBookingData(usageData);
    if (!validation.isValid) {
      const error = new Error(validation.errors.join(', '));
      error.statusCode = 400;
      logger.error('createUsage: Validation failed', error, { errors: validation.errors });
      throw error;
    }

    try {
      logger.debug('Creating usage', { businessId: usageData.businessId });
      const response = await api.post('/usages', usageData);
      logger.info('Usage created successfully', { usageId: response.data?.result?._id });
      return response.data;
    } catch (error) {
      logger.error('Failed to create usage', error, { usageData });
      throw error;
    }
  },

  /**
   * Gets all usages for current user
   * @returns {Promise<object>} - User's usages
   */
  getMyUsages: async () => {
    try {
      logger.debug('Fetching user usages');
      const response = await api.get('/usages/my-usages');
      logger.info('User usages fetched', { count: response.data?.result?.length || 0 });
      return response.data;
    } catch (error) {
      logger.error('Failed to fetch user usages', error);
      throw error;
    }
  },

  /**
   * Gets a single usage detail by ID
   * @param {string} usageId - Usage ID
   * @returns {Promise<object>} - Usage details
   * @throws {Error} - If ID is invalid or not found
   */
  getUsage: async (usageId) => {
    // Input validation
    if (!usageId || !isValidObjectId(usageId)) {
      const error = new Error('Invalid usage ID');
      error.statusCode = 400;
      logger.error('getUsage: Invalid ID', error, { usageId });
      throw error;
    }

    try {
      logger.debug('Fetching usage details', { usageId });
      // Use my-usages endpoint for user's own usage details
      const response = await api.get(`/usages/my-usages/${usageId}`);
      logger.info('Usage details fetched', { usageId });
      return response.data;
    } catch (error) {
      logger.error('Failed to fetch usage details', error, { usageId });
      throw error;
    }
  },

  /**
   * Deletes a usage (if allowed)
   * @param {string} usageId - Usage ID to delete
   * @returns {Promise<object>} - Deletion result
   */
  deleteUsage: async (usageId) => {
    // Input validation
    if (!usageId || !isValidObjectId(usageId)) {
      const error = new Error('Invalid usage ID');
      error.statusCode = 400;
      logger.error('deleteUsage: Invalid ID', error, { usageId });
      throw error;
    }

    try {
      logger.debug('Deleting usage', { usageId });
      const response = await api.delete(`/usages/${usageId}`);
      logger.info('Usage deleted', { usageId });
      return response.data;
    } catch (error) {
      logger.error('Failed to delete usage', error, { usageId });
      throw error;
    }
  },
};

export default usageService;