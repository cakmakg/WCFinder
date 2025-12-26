/**
 * useToilets Hook
 *
 * Hook for fetching toilets from the API
 * Provides loading states, error handling, and refresh functionality
 */

import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { businessService } from '../services/businessService';

export interface Toilet {
  _id: string;
  name: string;
  fee: number;
  genderPreference?: 'male' | 'female' | 'unisex';
  isAvailable?: boolean;
  location?: {
    type: string;
    coordinates: [number, number]; // [longitude, latitude]
  };
  business?: any;
  businessId?: string;
  image?: string;
}

interface UseToiletsParams {
  latitude?: number;
  longitude?: number;
  radius?: number; // in km
  limit?: number;
}

export const useToilets = (params?: UseToiletsParams) => {
  const [toilets, setToilets] = useState<Toilet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchToilets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // If location params are provided, fetch businesses first, then their toilets
      if (params?.latitude && params?.longitude) {
        console.log('[useToilets] Fetching businesses by location first...');
        
        // Fetch businesses by location
        const businesses = await businessService.getAll({
          latitude: params.latitude,
          longitude: params.longitude,
          radius: params.radius || 10,
          limit: params.limit || 100,
        });

        console.log('[useToilets] Found businesses:', businesses.length);

        if (businesses.length === 0) {
          setToilets([]);
          setLoading(false);
          return;
        }

        // Fetch toilets for all businesses in a SINGLE batch request
        const businessIds = businesses.map(b => b._id);
        const allToilets: Toilet[] = [];

        // OPTIMIZATION: Fetch all toilets in one request with comma-separated business IDs
        // This prevents rate limiting from multiple requests
        try {
          // Create filter query for multiple businesses
          const businessIdsQuery = businessIds.join(',');
          const response = await api.get(`/toilets?businessIds=${businessIdsQuery}`);
          const fetchedToilets = response.data?.result || response.data?.data || [];

          console.log('[useToilets] Fetched toilets in batch:', fetchedToilets.length);

          // Add business info to each toilet
          const toiletsWithBusiness = fetchedToilets.map((toilet: any) => {
            // Backend may have populated business (object) or just business ID (string)
            let business = null;
            
            if (toilet.business && typeof toilet.business === 'object') {
              // Business is already populated from backend
              business = toilet.business;
            } else {
              // Business is just an ID, find it from businesses array
              const businessId = toilet.business || toilet.businessId;
              business = businesses.find(b => b._id === businessId);
            }
            
            // Use business location if available, otherwise use toilet location
            const finalLocation = business?.location || toilet.location;
            
            return {
              ...toilet,
              business: business,
              location: finalLocation,
            };
          });

          allToilets.push(...toiletsWithBusiness);
        } catch (err: any) {
          console.warn('[useToilets] Batch fetch failed, trying individual requests with delay...', err);

          // Fallback: Fetch individually with delay to avoid rate limiting
          for (let i = 0; i < businessIds.length; i++) {
            const businessId = businessIds[i];

            try {
              // Add 100ms delay between requests to avoid rate limiting
              if (i > 0) {
                await new Promise(resolve => setTimeout(resolve, 100));
              }

              const response = await api.get(`/toilets?filter[business]=${businessId}`);
              const businessToilets = response.data?.result || response.data?.data || [];

              // Add business info to each toilet
              const toiletsWithBusiness = businessToilets.map((toilet: any) => {
                // Backend may have populated business (object) or just business ID (string)
                let business = null;
                
                if (toilet.business && typeof toilet.business === 'object') {
                  // Business is already populated from backend
                  business = toilet.business;
                } else {
                  // Business is just an ID, find it from businesses array
                  const toiletBusinessId = toilet.business || toilet.businessId || businessId;
                  business = businesses.find(b => b._id === toiletBusinessId);
                }
                
                // Use business location if available, otherwise use toilet location
                const finalLocation = business?.location || toilet.location;
                
                return {
                  ...toilet,
                  business: business,
                  location: finalLocation,
                };
              });

              allToilets.push(...toiletsWithBusiness);
            } catch (err: any) {
              // If we hit rate limit, stop trying
              if (err.response?.status === 429) {
                console.error('[useToilets] Rate limit hit, stopping requests');
                break;
              }
              console.warn(`[useToilets] Failed to fetch toilets for business ${businessId}:`, err);
            }
          }
        }

        console.log('[useToilets] Total fetched toilets:', allToilets.length);
        setToilets(allToilets);
      } else {
        // No location params - fetch all toilets
        const endpoint = `/toilets${params?.limit ? `?limit=${params.limit}` : ''}`;
        console.log('[useToilets] Fetching all toilets:', endpoint);

        const response = await api.get(endpoint);
        const toiletsData = response.data?.data || response.data?.result || response.data || [];

        console.log('[useToilets] Fetched toilets:', toiletsData.length);
        setToilets(Array.isArray(toiletsData) ? toiletsData : []);
      }
    } catch (err: any) {
      console.error('[useToilets] Error fetching toilets:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch toilets');
      setToilets([]);
    } finally {
      setLoading(false);
    }
  }, [params?.latitude, params?.longitude, params?.radius, params?.limit]);

  // Fetch on mount and when params change
  useEffect(() => {
    fetchToilets();
  }, [fetchToilets]);

  const refresh = useCallback(() => {
    fetchToilets();
  }, [fetchToilets]);

  return {
    toilets,
    loading,
    error,
    refresh,
  };
};
