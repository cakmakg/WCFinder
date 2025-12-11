/**
 * Toilet Service
 * 
 * Handles all toilet-related API calls
 */

import api from './api';

export interface Toilet {
  _id: string;
  name: string;
  fee: number;
  status: 'available' | 'in_use' | 'out_of_order';
  features?: {
    isAccessible?: boolean;
    hasBabyChangingStation?: boolean;
  };
  business?: string;
  averageRatings?: {
    cleanliness?: number;
    overall?: number;
  };
  reviewCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export const toiletService = {
  /**
   * Get toilets for a specific business
   */
  getByBusiness: async (businessId: string): Promise<Toilet[]> => {
    const response = await api.get(`/toilets?filter[business]=${businessId}`);
    return response.data?.result || response.data?.data || [];
  },

  /**
   * Get toilet by ID
   */
  getById: async (id: string): Promise<Toilet> => {
    const response = await api.get(`/toilets/${id}`);
    return response.data?.data || response.data?.result || response.data;
  },
};

export default toiletService;

