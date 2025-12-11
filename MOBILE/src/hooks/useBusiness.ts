/**
 * useBusiness Hook
 * 
 * Custom hook for business-related operations
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import businessService, { Business, BusinessListParams } from '../services/businessService';
import { cacheData, getCachedData } from '../utils/offline';

export const useBusiness = (params?: BusinessListParams) => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const paramsRef = useRef(params);
  const isFetchingRef = useRef(false);

  // Update params ref when params change
  useEffect(() => {
    paramsRef.current = params;
  }, [params]);

  // Memoize params string to detect changes
  const paramsKey = useMemo(() => {
    if (!params) return 'no-params';
    return JSON.stringify(params);
  }, [params]);

  const fetchBusinesses = useCallback(async (isRefresh = false) => {
    // Prevent multiple simultaneous requests
    if (isFetchingRef.current && !isRefresh) {
      return;
    }

    try {
      isFetchingRef.current = true;
      
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // Try to get from cache first (if not refreshing)
      if (!isRefresh) {
        const cached = await getCachedData<Business[]>('businesses');
        if (cached) {
          setBusinesses(cached);
          setLoading(false);
        }
      }

      // Fetch from API with current params
      const data = await businessService.getAll(paramsRef.current);
      setBusinesses(data);
      
      // Cache the data
      await cacheData('businesses', data, 5 * 60 * 1000); // 5 minutes
    } catch (err: any) {
      console.error('Error fetching businesses:', err);
      
      // Handle rate limiting (429) specially
      if (err.response?.status === 429) {
        setError('Too many requests. Please wait a moment and try again.');
      } else {
        setError(err.message || 'Failed to fetch businesses');
      }
      
      // If API fails, try to use cached data
      if (!isRefresh) {
        const cached = await getCachedData<Business[]>('businesses');
        if (cached && cached.length > 0) {
          setBusinesses(cached);
          // Don't show error if we have cached data
          if (err.response?.status !== 429) {
            setError(null);
          }
        }
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
      isFetchingRef.current = false;
    }
  }, []); // No dependencies - use paramsRef instead

  useEffect(() => {
    fetchBusinesses();
  }, [paramsKey, fetchBusinesses]);

  const refresh = useCallback(() => {
    fetchBusinesses(true);
  }, [fetchBusinesses]);

  return {
    businesses,
    loading,
    error,
    refreshing,
    refresh,
    refetch: fetchBusinesses,
  };
};

export const useBusinessDetail = (id: string | null) => {
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setBusiness(null);
      return;
    }

    const fetchBusiness = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await businessService.getById(id);
        setBusiness(data);
      } catch (err: any) {
        console.error('Error fetching business:', err);
        setError(err.message || 'Failed to fetch business');
      } finally {
        setLoading(false);
      }
    };

    fetchBusiness();
  }, [id]);

  return { business, loading, error };
};

