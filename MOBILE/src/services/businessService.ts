/**
 * Business Service
 * 
 * Handles all business-related API calls
 */

import api from './api';

export interface Business {
  _id: string;
  name?: string; // Backend'de businessName olabilir
  businessName?: string; // Backend field name
  description?: string;
  address?: string | {
    street?: string;
    city?: string;
    postalCode?: string;
    country?: string;
  };
  location: {
    type: string;
    coordinates: [number, number]; // [longitude, latitude]
  };
  phone?: string;
  email?: string;
  website?: string;
  images?: string[];
  rating?: number;
  reviewCount?: number;
  fee?: number;
  price?: number; // Backend'de price olabilir
  features?: {
    isAccessible?: boolean;
    hasBabyChanging?: boolean;
    hasWifi?: boolean;
    is24Hours?: boolean;
  };
  owner?: string | any;
  isActive?: boolean;
  approvalStatus?: string;
  businessType?: string;
  openingHours?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BusinessListParams {
  latitude?: number;
  longitude?: number;
  radius?: number; // in kilometers
  search?: string;
  minFee?: number;
  maxFee?: number;
  isAccessible?: boolean;
  limit?: number;
  page?: number;
}

export const businessService = {
  /**
   * Get all businesses (public, no auth required)
   */
  getAll: async (params?: BusinessListParams): Promise<Business[]> => {
    const queryParams = new URLSearchParams();
    
    if (params?.latitude) queryParams.append('latitude', params.latitude.toString());
    if (params?.longitude) queryParams.append('longitude', params.longitude.toString());
    if (params?.radius) queryParams.append('radius', params.radius.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.minFee !== undefined) queryParams.append('minFee', params.minFee.toString());
    if (params?.maxFee !== undefined) queryParams.append('maxFee', params.maxFee.toString());
    if (params?.isAccessible !== undefined) queryParams.append('isAccessible', params.isAccessible.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.page) queryParams.append('page', params.page.toString());

    const queryString = queryParams.toString();
    const url = queryString ? `/business?${queryString}` : '/business';
    
    const response = await api.get(url);
    // Backend response format: { error: false, result: [...], details: {...} }
    const businesses = response.data?.result || response.data?.data || response.data || [];
    
    // Normalize business data to match interface
    return businesses.map((business: any) => ({
      ...business,
      // Map backend field names to interface
      name: business.businessName || business.name,
      // Convert address object to string if needed
      address: typeof business.address === 'string' 
        ? business.address 
        : business.address 
          ? `${business.address.street || ''}, ${business.address.city || ''} ${business.address.postalCode || ''}`.trim()
          : '',
      // Map price to fee
      fee: business.fee || business.price || 0,
    }));
  },

  /**
   * Get business by ID (public, no auth required)
   */
  getById: async (id: string): Promise<Business> => {
    const response = await api.get(`/business/${id}`);
    const business = response.data?.data || response.data?.result || response.data;
    
    // Normalize business data to match interface
    if (business) {
      return {
        ...business,
        name: business.businessName || business.name,
        address: typeof business.address === 'string' 
          ? business.address 
          : business.address 
            ? `${business.address.street || ''}, ${business.address.city || ''} ${business.address.postalCode || ''}`.trim()
            : '',
        fee: business.fee || business.price || 0,
      };
    }
    
    return business;
  },

  /**
   * Get business reviews
   */
  getReviews: async (id: string): Promise<any[]> => {
    const response = await api.get(`/business/${id}/reviews`);
    return response.data?.data || response.data || [];
  },
};

export default businessService;

