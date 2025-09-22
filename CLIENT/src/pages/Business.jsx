// pages/Businesses.jsx (YENİ DOSYA)

import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Box, List, CircularProgress, Alert, Typography } from '@mui/material';
import useBusinessCall from '../hook/useBusinessCall';
import BusinessListItem from '../components/BusinessListItem';

const Businesses = () => {
  const { getBusinesses } = useBusinessCall();
  const { businesses, loading, error } = useSelector((state) => state.business);

  useEffect(() => {
    // Sadece Redux'ta veri yoksa API'den çek
    if (!businesses?.length) {
      getBusinesses();
    }
  }, [getBusinesses, businesses?.length]);

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}><CircularProgress /></Box>;
  }
  if (error) {
    return <Alert severity="error" sx={{ m: 2 }}>İşletmeler yüklenemedi.</Alert>;
  }

  return (
    <Box>
      <Typography variant="h6" sx={{ p: 2, fontWeight: 'bold' }}>
        İşletmeler ({businesses?.length || 0})
      </Typography>
      <List sx={{ p: 1, height: 'calc(100vh - 128px)', overflowY: 'auto' }}>
        {businesses?.map((business) => (
          <BusinessListItem key={business._id} business={business} />
        ))}
      </List>
    </Box>
  );
};

export default Businesses;