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
  Chip,
  useTheme
} from '@mui/material';
import StorefrontIcon from '@mui/icons-material/Storefront';
import SearchOffIcon from '@mui/icons-material/SearchOff';

const BusinessList = ({
  onBusinessClick,
  selectedBusinessId,
  onLocationSearch,
  initialSearch = ''
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  const { getCrudData } = useCrudCall();
  const { business, loading, error } = useSelector((state) => state.crud);

  const hasFetched = useRef(false);

  const {
    search,
    setSearch,
    isSearching,
    clearSearch
  } = useBusinessSearch(onLocationSearch);

  const filteredBusinesses = useBusinessFilter(business, search);

  useEffect(() => {
    if (initialSearch && initialSearch.trim()) {
      setSearch(initialSearch);
    }
  }, [initialSearch]);

  useEffect(() => {
    getCrudData('business', false, 1000);
    hasFetched.current = true;
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && hasFetched.current) {
        getCrudData('business', false, 1000);
      }
    };
    const handleFocus = () => {
      if (hasFetched.current) {
        getCrudData('business', false, 1000);
      }
    };
    const handleStorageChange = (e) => {
      if (e.key === 'business_updated' && hasFetched.current) {
        getCrudData('business', false, 1000);
      }
    };
    const handleBusinessUpdate = () => {
      if (hasFetched.current) {
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

  return (
    <Box sx={{
      p: 2,
      pb: 3,
      height: '100%',
      overflowY: 'auto',
      backgroundColor: '#f8fafc',
      boxSizing: 'border-box',
    }}>
      <BusinessSearchBar
        search={search}
        onSearchChange={setSearch}
        onClear={clearSearch}
        isSearching={isSearching}
        theme={theme}
      />

      {/* Sonuç sayısı chip */}
      {business && business.length > 0 && !loading && (
        <Box sx={{ mb: 2 }}>
          <Chip
            size="small"
            label={`${filteredBusinesses?.length || 0} ${t('businessList.locationsFound')}`}
            sx={{
              backgroundColor: 'rgba(8,145,178,0.08)',
              color: '#0891b2',
              fontWeight: 600,
              fontSize: '0.75rem',
              height: '24px',
              border: '1px solid rgba(8,145,178,0.15)',
            }}
          />
        </Box>
      )}

      {/* Loading */}
      {loading && (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 6, gap: 2 }}>
          <CircularProgress size={36} thickness={3} sx={{ color: '#0891b2' }} />
          <Typography variant="body2" sx={{ color: '#94a3b8', fontWeight: 500, fontSize: '0.85rem' }}>
            {t('common.loading')}
          </Typography>
        </Box>
      )}

      {/* Error */}
      {error && (
        <Alert severity="error" variant="outlined" sx={{ mb: 2, borderRadius: 2, fontSize: '0.85rem' }}>
          {t('businessList.loadError')}
        </Alert>
      )}

      {/* Liste */}
      {!loading && !error && filteredBusinesses && filteredBusinesses.length > 0 ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {filteredBusinesses.map((businessItem) => (
            <Box
              key={businessItem._id}
              sx={{ flexShrink: 0, cursor: 'pointer' }}
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
          <Box sx={{
            textAlign: 'center',
            py: 6,
            px: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1.5,
          }}>
            <Box sx={{
              width: 52,
              height: 52,
              borderRadius: '14px',
              backgroundColor: 'rgba(8,145,178,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {search
                ? <SearchOffIcon sx={{ fontSize: '1.6rem', color: '#0891b2' }} />
                : <StorefrontIcon sx={{ fontSize: '1.6rem', color: '#0891b2' }} />
              }
            </Box>
            <Typography variant="body2" sx={{ color: '#94a3b8', fontWeight: 500, fontSize: '0.85rem' }}>
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
