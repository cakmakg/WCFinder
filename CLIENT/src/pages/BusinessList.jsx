import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import useCrudCall from '../hook/useCrudCall';
import BusinessCard from '../components/BusinessCard';
import { Box, Typography, CircularProgress, Alert, Grid, TextField } from '@mui/material';

const BusinessList = () => {
  const { getCrudData } = useCrudCall();
  // DÜZELTME: crudSlice'da field adı 'business' (businesses değil!)
  const { business, loading, error } = useSelector((state) => state.crud);
  const { token } = useSelector((state) => state.auth);
  const [search, setSearch] = useState("");

  // Veri çekme işlemi burada yapılmalı
  useEffect(() => {
    if (!token) {
      console.warn('No token available, cannot fetch business data');
      return;
    }
    
    console.log('BusinessList: Fetching business data...');
    getCrudData('business');
  }, [token]);

  // Debug için state'i kontrol et
  useEffect(() => {
    console.log('BusinessList Debug:', {
      businessCount: business?.length || 0,
      loading,
      error,
      tokenExists: !!token
    });
  }, [business, loading, error, token]);

  const normalize = (str) => (str || "").toLowerCase("tr-TR").trim();

  // DÜZELTME: business array'ini kullan (businesses değil)
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
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        İşletmeler ({business?.length || 0})
      </Typography>

      <TextField
        label="İşletme Ara..."
        variant="outlined"
        fullWidth
        size="small"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 2 }}
      />

      {/* Debug Bilgisi */}
      <Box sx={{ mb: 2, p: 1, bgcolor: 'info.light', borderRadius: 1 }}>
        <Typography variant="caption" sx={{ color: 'info.contrastText' }}>
          Debug: {business?.length || 0} işletme | Loading: {loading ? 'Yes' : 'No'} | Error: {error ? 'Yes' : 'No'}
        </Typography>
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
          <CircularProgress size={30} />
        </Box>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          İşletmeler yüklenemedi. Tekrar deneyin.
        </Alert>
      )}

      {!loading && !error && (
        <Grid container spacing={1}>
          {filteredBusinesses && filteredBusinesses.length > 0 ? (
            filteredBusinesses.map((businessItem) => (
              <Grid item key={businessItem._id} xs={12}>
                <BusinessCard business={businessItem} />
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Box textAlign="center" sx={{ p: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  {search 
                    ? `"${search}" için sonuç bulunamadı.` 
                    : business && business.length === 0
                    ? "Henüz işletme kaydı bulunmuyor."
                    : "Veri yükleniyor..."
                  }
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      )}
    </Box>
  );
};

export default BusinessList;