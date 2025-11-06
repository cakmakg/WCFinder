// pages/BusinessList.jsx
import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import useCrudCall from '../../hook/useCrudCall'; // ✅ Düzeltildi
import BusinessCard from '../BusinessCard'; // ✅ Düzeltildi
import { BusinessSearchBar } from './BusinessSearchBar';
import { useBusinessSearch } from '../../hook/useBusinessSearch'; // ✅ Düzeltildi
import { useBusinessFilter } from '../../hook/useBusinessFilter'; // ✅ Düzeltildi
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
  onLocationSearch 
}) => {
  const theme = useTheme();
  
  const { getCrudData } = useCrudCall();
  const { business, loading, error } = useSelector((state) => state.crud);
  const { token } = useSelector((state) => state.auth);
  
  const hasFetched = useRef(false);
  
  const { 
    search, 
    setSearch, 
    isSearching, 
    clearSearch 
  } = useBusinessSearch(onLocationSearch);
  
  const filteredBusinesses = useBusinessFilter(business, search);

  useEffect(() => {
    if (!token || hasFetched.current) return;
    getCrudData('business');
    hasFetched.current = true;
  }, [token]);

  const handleClearSearch = () => {
    clearSearch();
  };

  return (
    <Box sx={{ 
      p: 2,
      maxHeight: '100vh',
      overflowY: 'auto',
      backgroundColor: 'white'
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
          {filteredBusinesses?.length || 0} Locations found
        </Typography>
      )}

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress size={30} />
        </Box>
      )}
      
      {error && (
        <Alert severity="error" variant="outlined" sx={{ mb: 2 }}>
          Failed to load locations.
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
              onClick={() => onBusinessClick(businessItem)}
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
                ? `No results found for "${search}"` 
                : "No locations available"
              }
            </Typography>
          </Box>
        )
      )}
    </Box>
  );
};

export default BusinessList;