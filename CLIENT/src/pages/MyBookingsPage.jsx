// CLIENT/src/pages/MyBookingsPage.jsx - YENİ DOSYA

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Divider,
  useTheme,
  useMediaQuery,
  Tabs,
  Tab,
} from '@mui/material';
import QrCodeIcon from '@mui/icons-material/QrCode2';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PeopleIcon from '@mui/icons-material/People';
import QRCode from 'react-qr-code';
import usageService from '../services/usageService';
import businessService from '../services/businessService';
import { OwnerProfileForm } from '../components/owner/OwnerProfileForm';
import { OwnerStatsPanel } from '../components/owner/OwnerStatsPanel';
import { OwnerDailyMonthlyTable } from '../components/owner/OwnerDailyMonthlyTable';
import { OwnerFinancialPanel } from '../components/owner/OwnerFinancialPanel';

const MyBookingsPage = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.auth);
  
  // ✅ localStorage'dan da kontrol et (fallback) - useMemo ile optimize et
  const localStorageUser = useMemo(() => {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  }, []); // Sadece mount'ta çalışır
  
  const user = currentUser || localStorageUser;
  
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  
  // Owner states
  const [ownerBusiness, setOwnerBusiness] = useState(null);
  const [ownerStats, setOwnerStats] = useState(null);
  const [ownerLoading, setOwnerLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

  // ✅ Güçlü Owner kontrolü - hem Redux hem localStorage'dan kontrol et
  const isOwner = user?.role === 'owner' || 
                  user?.role === 'admin' || 
                  user?.isOwner === true || 
                  user?.isAdmin === true;
  
  // Debug
  console.log('🔍 Owner Check:', {
    currentUser,
    localStorageUser,
    user,
    role: user?.role,
    isOwner,
  });

  useEffect(() => {
    // Debug: currentUser ve role kontrolü
    console.log('🔍 MyBookingsPage useEffect - user:', user);
    console.log('🔍 MyBookingsPage useEffect - isOwner:', isOwner);
    console.log('🔍 MyBookingsPage useEffect - role:', user?.role);

    if (!user) {
      // User henüz yüklenmemiş, bekle
      console.log('⏳ Waiting for user data...');
      return;
    }

    if (isOwner) {
      console.log('✅ Owner detected, fetching owner data...');
      fetchOwnerData();
      // Normal user loading state'ini false yap
      setLoading(false);
    } else {
      console.log('👤 Regular user, fetching bookings...');
      fetchBookings();
      // Owner loading state'ini false yap
      setOwnerLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, localStorageUser]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await usageService.getMyUsages();
      setBookings(response.result);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError(t('myBookings.loadBookingsError'));
    } finally {
      setLoading(false);
    }
  };

  const fetchOwnerData = async () => {
    try {
      setOwnerLoading(true);
      setError(null); // Önceki hataları temizle
      console.log('📡 Fetching owner data...');
      
      const [businessResponse, statsResponse] = await Promise.all([
        businessService.getMyBusiness(),
        businessService.getOwnerStats()
      ]);
      
      console.log('✅ Owner data received:', {
        business: businessResponse,
        stats: statsResponse
      });
      
      setOwnerBusiness(businessResponse.result);
      setOwnerStats(statsResponse.result);
    } catch (err) {
      console.error('❌ Error fetching owner data:', err);
      console.error('❌ Error response:', err.response);
      setError(err.response?.data?.message || err.message || t('myBookings.loadError'));
    } finally {
      setOwnerLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      confirmed: 'success',
      active: 'info',
      completed: 'default',
      cancelled: 'error',
      expired: 'default',
    };
    return colors[status] || 'default';
  };

  const getStatusLabel = (status) => {
    return t(`myBookings.statusLabels.${status}`, { defaultValue: status });
  };

  const getPaymentStatusColor = (paymentStatus) => {
    const colors = {
      pending: 'warning',
      paid: 'success',
      failed: 'error',
      refunded: 'default',
    };
    return colors[paymentStatus] || 'default';
  };

  const getPaymentStatusLabel = (paymentStatus) => {
    return t(`myBookings.paymentStatusLabels.${paymentStatus}`, { defaultValue: paymentStatus });
  };

  // Debug: Render öncesi kontrol
  console.log('🎨 MyBookingsPage Render - isOwner:', isOwner, 'user:', user);
  console.log('🎨 MyBookingsPage Render - ownerLoading:', ownerLoading, 'ownerBusiness:', ownerBusiness);

  // ✅ Owner Profil Sayfası - Data yoksa bile formu göster
  if (isOwner) {
    // Loading state - sadece ilk yüklemede göster
    if (ownerLoading && !ownerBusiness && !error) {
      return (
        <Container sx={{ py: 4, textAlign: 'center' }}>
          <CircularProgress />
          <Typography sx={{ mt: 2 }}>{t('myBookings.loading')}</Typography>
        </Container>
      );
    }

    // Error state - ama formu yine de göster
    if (error && !ownerBusiness) {
      return (
        <Container sx={{ py: 4 }}>
          <Alert severity="warning" sx={{ mb: 3 }}>
            {error}
            <Typography variant="body2" sx={{ mt: 1 }}>
              Debug: isOwner={String(isOwner)}, role={user?.role || 'undefined'}
            </Typography>
          </Alert>
          {/* ✅ Hata olsa bile formu göster */}
          <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 4 }}>
            <Container maxWidth="lg">
              <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
                {t('myBookings.businessProfile')}
              </Typography>
              <Tabs 
                value={activeTab} 
                onChange={(e, newValue) => setActiveTab(newValue)}
                sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
              >
            <Tab label={t('myBookings.profile')} />
            <Tab label={t('myBookings.statistics')} />
            <Tab label={t('myBookings.dailyMonthly')} />
            <Tab label={t('myBookings.financial')} />
          </Tabs>
              {activeTab === 0 && (
                <OwnerProfileForm 
                  ownerUser={user} 
                  ownerBusiness={null} 
                />
              )}
              {activeTab === 1 && (
                <OwnerStatsPanel ownerStats={null} />
              )}
              {activeTab === 2 && (
                <OwnerDailyMonthlyTable ownerStats={null} />
              )}
              {activeTab === 3 && (
                <OwnerFinancialPanel />
              )}
            </Container>
          </Box>
        </Container>
      );
    }

    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 4 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
            {t('myBookings.businessProfile')}
          </Typography>

          <Tabs 
            value={activeTab} 
            onChange={(e, newValue) => setActiveTab(newValue)}
            sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label={t('myBookings.profile')} />
            <Tab label={t('myBookings.statistics')} />
            <Tab label={t('myBookings.dailyMonthly')} />
            <Tab label={t('myBookings.financial')} />
          </Tabs>

          {/* Tab 0: Profil */}
          {activeTab === 0 && (
            <OwnerProfileForm 
              ownerUser={user} 
              ownerBusiness={ownerBusiness} 
            />
          )}

          {/* Tab 1: Statistiken */}
          {activeTab === 1 && (
            <OwnerStatsPanel ownerStats={ownerStats} />
          )}

          {/* Tab 2: Tages-/Monatsübersicht */}
          {activeTab === 2 && (
            <OwnerDailyMonthlyTable ownerStats={ownerStats} />
          )}

          {/* Tab 3: Finansal Panel */}
          {activeTab === 3 && (
            <OwnerFinancialPanel />
          )}
        </Container>
      </Box>
    );
  }

  // Normal User - Booking Listesi
  // Debug: Normal user render
  console.log('👤 Normal user render - loading:', loading, 'bookings:', bookings.length, 'isOwner:', isOwner);

  if (loading) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>{t('myBookings.loading')}</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 4 }}>
      <Container maxWidth="lg">
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
          {t('myBookings.title')}
        </Typography>

        {bookings.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
              {t('myBookings.noBookings')}
            </Typography>
            <Button 
              variant="contained" 
              onClick={() => navigate('/')}
            >
              {t('myBookings.bookNow')}
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {bookings.map((booking) => (
              <Grid item xs={12} md={6} lg={4} key={booking._id}>
                <Card 
                  sx={{ 
                    height: '100%',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 3,
                    }
                  }}
                >
                  <CardContent>
                    {/* Status Badges */}
                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                      <Chip 
                        label={getStatusLabel(booking.status)} 
                        color={getStatusColor(booking.status)}
                        size="small"
                      />
                      <Chip 
                        label={getPaymentStatusLabel(booking.paymentStatus)} 
                        color={getPaymentStatusColor(booking.paymentStatus)}
                        size="small"
                      />
                    </Box>

                    {/* Business Info */}
                    <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                      {booking.businessId?.businessName || 'N/A'}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                      <LocationOnIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {booking.businessId?.address?.street}, {booking.businessId?.address?.city}
                      </Typography>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    {/* Booking Details */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <CalendarTodayIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          {new Date(booking.startTime).toLocaleDateString('de-DE')}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <PeopleIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          {booking.personCount} {booking.personCount === 1 ? t('common.person') : t('common.persons')}
                        </Typography>
                      </Box>
                    </Box>

                    <Typography variant="h6" sx={{ mt: 2, color: 'primary.main' }}>
                      € {booking.totalFee.toFixed(2)}
                    </Typography>

                    {/* QR Code Button */}
                    {booking.accessCode && (
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<QrCodeIcon />}
                        onClick={() => setSelectedBooking(booking)}
                        sx={{ mt: 2 }}
                      >
                        {t('myBookings.qrCode')}
                      </Button>
                    )}

                    <Typography 
                      variant="caption" 
                      color="text.secondary" 
                      sx={{ display: 'block', mt: 1 }}
                    >
                      {t('myBookings.bookedOn')} {new Date(booking.createdAt).toLocaleDateString('de-DE')}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* QR Code Modal */}
        {selectedBooking && (
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bgcolor: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1300,
            }}
            onClick={() => setSelectedBooking(null)}
          >
            <Paper 
              sx={{ 
                p: { xs: 2, sm: 4 }, 
                maxWidth: { xs: '90%', sm: 400 }, 
                width: '100%',
                textAlign: 'center',
                mx: { xs: 2, sm: 0 } // Mobile'da yan padding
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <Typography variant="h6" sx={{ mb: 2 }}>
                {t('myBookings.yourQRCode')}
              </Typography>

              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  p: 2,
                  bgcolor: 'white',
                  borderRadius: 2,
                  mb: 2,
                }}
              >
                <QRCode 
                  value={selectedBooking.accessCode} 
                  size={isMobile ? 150 : 200} // Mobile'da daha küçük
                  level="H"
                />
              </Box>

              <Typography 
                variant="h5" 
                sx={{ 
                  fontFamily: 'monospace', 
                  fontWeight: 600,
                  letterSpacing: 2,
                  mb: 2,
                }}
              >
                {selectedBooking.accessCode}
              </Typography>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {selectedBooking.businessId?.businessName}
              </Typography>

              <Button
                fullWidth
                variant="contained"
                onClick={() => setSelectedBooking(null)}
              >
                {t('common.close')}
              </Button>
            </Paper>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default MyBookingsPage;