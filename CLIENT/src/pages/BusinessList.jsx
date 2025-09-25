import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import useCrudCall from '../hook/useCrudCall';
import BusinessCard from '../components/BusinessCard';
import { 
  Box, 
  Typography, 
  CircularProgress, 
  Alert,
  TextField, 
  InputAdornment,
  useTheme
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const BusinessList = () => {
  const theme = useTheme();
  
  const { getCrudData } = useCrudCall();
  const { business, loading, error } = useSelector((state) => state.crud);
  const { token } = useSelector((state) => state.auth);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!token) return;
    getCrudData('business');
  }, [token]);

  const normalize = (str) => (str || "").toLowerCase("tr-TR").trim();

  const filteredBusinesses = business?.filter((businessItem) => {
    const searchableValues = [
      businessItem.businessName,
      businessItem.businessType,
      businessItem.address?.city,
      businessItem.address?.street,
    ];
    return searchableValues.some((value) =>
      normalize(String(value)).includes(normalize(search))
    );
  });

  return (
    <Box sx={{ 
      p: 2,
      maxHeight: '100vh',
      overflowY: 'auto',
      backgroundColor: 'white'
    }}>
      {/* Simple Search */}
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search locations..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        size="small"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" color="action" />
            </InputAdornment>
          ),
          sx: {
            borderRadius: 2,
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: theme.palette.grey[300],
            }
          }
        }}
        sx={{ mb: 2 }}
      />

      {/* Results Count */}
      {business && business.length > 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {filteredBusinesses?.length || 0} Locations found
        </Typography>
      )}

      {/* Loading */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress size={30} />
        </Box>
      )}
      
      {/* Error */}
      {error && (
        <Alert severity="error" variant="outlined" sx={{ mb: 2 }}>
          Failed to load locations.
        </Alert>
      )}

      {/* Business Cards - FIXED CONTAINER */}
      {!loading && !error && filteredBusinesses && filteredBusinesses.length > 0 ? (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          gap: 2 // Card'lar arasında 16px gap
        }}>
          {filteredBusinesses.map((businessItem) => (
            <Box key={businessItem._id} sx={{ 
              height: '180px', // SABİT YÜKSEKLİK BURADA DA
              flexShrink: 0 // Card'ın küçülmesini engelle
            }}>
              <BusinessCard business={businessItem} />
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