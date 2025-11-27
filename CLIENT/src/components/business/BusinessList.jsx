// pages/BusinessList.jsx
import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import useCrudCall from '../../hook/useCrudCall';
import BusinessCard from '../BusinessCard';
import { BusinessSearchBar } from './BusinessSearchBar';
import { useBusinessSearch } from '../../hook/useBusinessSearch';
import { useBusinessFilter } from '../../hook/useBusinessFilter';
import { 
  Box, 
  Typography, 
  CircularProgress, 
  Alert,
  useTheme
} from '@mui/material';

const BusinessList = ({ 
  onBusinessClick, 
  selectedBusinessId, 
  onLocationSearch,
  initialSearch = '' // StartPage'den gelen search parametresi
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  
  const { getCrudData } = useCrudCall();
  const { business, loading, error } = useSelector((state) => state.crud);
  
  const hasFetched = useRef(false);

  // Debug: Business verilerini logla
  useEffect(() => {
    console.log("📊 BusinessList - Current business data:", {
      count: business?.length || 0,
      businesses: business,
      loading,
      error
    });
  }, [business, loading, error]);
  
  const { 
    search, 
    setSearch, 
    isSearching, 
    clearSearch 
  } = useBusinessSearch(onLocationSearch);
  
  const filteredBusinesses = useBusinessFilter(business, search);

  // Debug: Filtered businesses
  useEffect(() => {
    console.log("🔍 BusinessList - Filtered businesses:", {
      total: business?.length || 0,
      filtered: filteredBusinesses?.length || 0,
      searchTerm: search,
      filteredList: filteredBusinesses
    });
  }, [business, filteredBusinesses, search]);

  // URL'den gelen initialSearch'ü uygula
  useEffect(() => {
    if (initialSearch && initialSearch.trim()) {
      setSearch(initialSearch);
    }
  }, [initialSearch]);

  // Business verilerini yükle - auth gerekmeden
  useEffect(() => {
    console.log("🔄 BusinessList - Loading business data...");
    getCrudData('business', false, 1000); // ✅ Public endpoint, limit: 1000 (tüm business'ları getir)
    hasFetched.current = true;
  }, []);

  // Sayfa görünür olduğunda veya focus olduğunda veriyi yenile (yeni business oluşturulduktan sonra)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && hasFetched.current) {
        // Sayfa tekrar görünür olduğunda veriyi yenile
        console.log("🔄 Refreshing business list (visibility change)");
        getCrudData('business', false, 1000);
      }
    };

    const handleFocus = () => {
      if (hasFetched.current) {
        // Window focus olduğunda veriyi yenile
        console.log("🔄 Refreshing business list (window focus)");
        getCrudData('business', false, 1000);
      }
    };

    // Storage event listener - başka tab'da değişiklik olduğunda
    const handleStorageChange = (e) => {
      if (e.key === 'business_updated' && hasFetched.current) {
        console.log("🔄 Refreshing business list (storage event)");
        getCrudData('business', false, 1000);
      }
    };

    // Custom event listener - aynı tab'da değişiklik olduğunda
    const handleBusinessUpdate = () => {
      if (hasFetched.current) {
        console.log("🔄 Refreshing business list (custom event)");
        getCrudData('business', false, 1000);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('businessUpdated', handleBusinessUpdate);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('businessUpdated', handleBusinessUpdate);
    };
  }, [getCrudData]);

  const handleClearSearch = () => {
    clearSearch();
  };

  return (
    <Box sx={{ 
      p: 2,
      pb: 3, // Alt padding ekle ki son card tamamen görünsün
      height: '100%',
      overflowY: 'auto',
      backgroundColor: '#f8f9fa',
      boxSizing: 'border-box'
    }}>
      <BusinessSearchBar
        search={search}
        onSearchChange={setSearch}
        onClear={handleClearSearch}
        isSearching={isSearching}
        theme={theme}
      />

      {business && business.length > 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {filteredBusinesses?.length || 0} {t('businessList.locationsFound')}
        </Typography>
      )}

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress size={30} />
        </Box>
      )}
      
      {error && (
        <Alert severity="error" variant="outlined" sx={{ mb: 2 }}>
          {t('businessList.loadError')}
        </Alert>
      )}

      {!loading && !error && filteredBusinesses && filteredBusinesses.length > 0 ? (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          gap: 2
        }}>
          {filteredBusinesses.map((businessItem) => (
            <Box 
              key={businessItem._id} 
              sx={{ 
                height: '180px',
                flexShrink: 0,
                cursor: 'pointer'
              }}
              onClick={(e) => {
                e.stopPropagation();
                onBusinessClick(businessItem);
              }}
            >
              <BusinessCard 
                business={businessItem}
                isSelected={selectedBusinessId === businessItem._id}
              />
            </Box>
          ))}
        </Box>
      ) : (
        !loading && !error && (
          <Box sx={{ textAlign: 'center', p: 3 }}>
            <Typography variant="body2" color="text.secondary">
              {search 
                ? t('businessList.noResults', { search })
                : t('businessList.noLocations')
              }
            </Typography>
          </Box>
        )
      )}
    </Box>
  );
};

export default BusinessList;