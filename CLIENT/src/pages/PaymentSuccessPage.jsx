// CLIENT/src/pages/PaymentSuccessPage.jsx

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  Container,
  Box,
  Paper,
  Typography,
  Button,
  Divider,
  Alert,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DownloadIcon from '@mui/icons-material/Download';
import BookmarksIcon from '@mui/icons-material/Bookmarks';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import TagIcon from '@mui/icons-material/Tag';
import PaymentIcon from '@mui/icons-material/Payment';
import StoreIcon from '@mui/icons-material/Store';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PeopleIcon from '@mui/icons-material/People';
import EuroIcon from '@mui/icons-material/Euro';
import QRCode from 'react-qr-code';
import usageService from '../services/usageService';

const PaymentSuccessPage = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const location = useLocation();
  const navigate = useNavigate();
  const { bookingData, transactionId, paymentResult } = location.state || {};
  const { currentUser } = useSelector((state) => state.auth);

  const [usageDetails, setUsageDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const usageId = bookingData?.usageId || paymentResult?.usageId || paymentResult?.metadata?.usageId;

    if (usageId) {
      fetchUsageDetails(usageId);
    } else {
      const timer = setTimeout(() => {
        const retryUsageId = bookingData?.usageId || paymentResult?.usageId || paymentResult?.metadata?.usageId;
        if (retryUsageId) {
          fetchUsageDetails(retryUsageId);
        } else {
          setLoading(false);
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [bookingData, paymentResult]);

  const fetchUsageDetails = async (usageId) => {
    try {
      setLoading(true);
      const response = await usageService.getUsage(usageId);
      setUsageDetails(response.result || response.data || response);
    } catch (err) {
      console.error('Error fetching usage details:', err);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  const downloadQRCode = () => {
    const svg = document.getElementById('qr-code-svg');
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');

      const downloadLink = document.createElement('a');
      downloadLink.download = `QR-Code-${usageDetails.accessCode}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  const getPaymentMethodLabel = () => {
    if (paymentResult?.object === 'payment_intent' || paymentResult?.payment_method_types) {
      return t('paymentSuccess.creditCard');
    }
    if (paymentResult?.paymentMethod === 'paypal' || paymentResult?.paymentProvider === 'paypal') {
      return t('paymentSuccess.paypal');
    }
    return bookingData?.paymentMethod === 'paypal' ? t('paymentSuccess.paypal') : t('paymentSuccess.creditCard');
  };

  const handleOpenMaps = () => {
    const addr = bookingData?.business?.address || {};
    const coords = bookingData?.business?.location?.coordinates;
    let url = '';
    if (Array.isArray(coords) && coords.length === 2) {
      const lat = coords[1];
      const lng = coords[0];
      url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lat + ',' + lng)}`;
    } else {
      const line = [addr.street, addr.postalCode, addr.city, addr.country].filter(Boolean).join(' ');
      url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(line)}`;
    }
    window.open(url, '_blank', 'noopener');
  };

  if (!bookingData) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">{t('paymentSuccess.noBookingInfo')}</Alert>
        <Button onClick={() => navigate('/home')} sx={{ mt: 2 }}>
          {t('paymentSuccess.backToHome')}
        </Button>
      </Container>
    );
  }

  if (loading) {
    return (
      <Box sx={{
        minHeight: '100vh', bgcolor: '#f8fafc',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 2,
      }}>
        <CircularProgress size={48} thickness={3} sx={{ color: '#0891b2' }} />
        <Typography sx={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 500 }}>
          {t('paymentSuccess.loadingDetails')}
        </Typography>
      </Box>
    );
  }

  const DetailRow = ({ icon, label, value, onClick }) => (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexShrink: 0 }}>
        {React.cloneElement(icon, { sx: { fontSize: '0.9rem', color: '#0891b2' } })}
        <Typography sx={{ fontSize: '0.82rem', color: '#64748b' }}>{label}</Typography>
      </Box>
      <Typography
        sx={{
          fontSize: '0.83rem',
          fontWeight: 600,
          color: onClick ? '#0891b2' : '#0f172a',
          textAlign: 'right',
          cursor: onClick ? 'pointer' : 'default',
          textDecoration: onClick ? 'underline' : 'none',
          wordBreak: 'break-all',
        }}
        onClick={onClick}
      >
        {value}
      </Typography>
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc' }}>
      {/* ── Green Hero Banner ── */}
      <Box
        component="header"
        sx={{
          background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
          pt: { xs: 4, sm: 5 },
          pb: { xs: 4, sm: 5 },
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          '&::after': {
            content: '""',
            position: 'absolute',
            top: -40, right: -40,
            width: 200, height: 200,
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.05)',
            pointerEvents: 'none',
          },
        }}
      >
        <Box
          sx={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 2,
          }}
        >
          <CheckCircleIcon sx={{ fontSize: '2.4rem', color: 'white' }} />
        </Box>
        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: '1.6rem', sm: '2rem' },
            fontWeight: 800,
            color: 'white',
            lineHeight: 1.2,
            mb: 0.75,
          }}
        >
          {t('paymentSuccess.title')}
        </Typography>
        <Typography sx={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>
          {t('paymentSuccess.subtitle')}
        </Typography>
      </Box>

      <Container maxWidth="md" sx={{ py: { xs: 3, sm: 4 } }}>
        {/* ── Booking Details Card ── */}
        <Paper
          sx={{
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            border: '1px solid rgba(0,0,0,0.06)',
            mb: 2.5,
          }}
        >
          <Box sx={{ p: { xs: 2.5, sm: 3 } }}>
            <Box
              sx={{
                backgroundColor: '#f0f9ff',
                borderRadius: '12px',
                borderLeft: '3px solid #0891b2',
                p: 2.5,
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
              }}
            >
              <DetailRow
                icon={<PersonIcon />}
                label={t('paymentSuccess.customerName')}
                value={currentUser?.username || currentUser?.email || '—'}
              />
              <Divider sx={{ borderColor: 'rgba(8,145,178,0.1)' }} />
              <DetailRow
                icon={<TagIcon />}
                label={t('paymentSuccess.transactionId')}
                value={transactionId}
              />
              <Divider sx={{ borderColor: 'rgba(8,145,178,0.1)' }} />
              <DetailRow
                icon={<PaymentIcon />}
                label={t('paymentSuccess.paymentMethod')}
                value={getPaymentMethodLabel()}
              />
              <Divider sx={{ borderColor: 'rgba(8,145,178,0.1)' }} />
              <DetailRow
                icon={<StoreIcon />}
                label={t('paymentSuccess.business')}
                value={bookingData.business.name}
              />
              <Divider sx={{ borderColor: 'rgba(8,145,178,0.1)' }} />
              <DetailRow
                icon={<LocationOnIcon />}
                label={t('paymentSuccess.address')}
                value={`${bookingData.business.address?.street}, ${bookingData.business.address?.city}`}
                onClick={handleOpenMaps}
              />
              <Divider sx={{ borderColor: 'rgba(8,145,178,0.1)' }} />
              <DetailRow
                icon={<CalendarTodayIcon />}
                label={t('paymentSuccess.date')}
                value={new Date(bookingData.date).toLocaleDateString('de-DE')}
              />
              <Divider sx={{ borderColor: 'rgba(8,145,178,0.1)' }} />
              <DetailRow
                icon={<PeopleIcon />}
                label={t('paymentSuccess.persons')}
                value={bookingData.personCount}
              />
              <Divider sx={{ borderColor: 'rgba(8,145,178,0.1)' }} />
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <EuroIcon sx={{ fontSize: '0.9rem', color: '#0891b2' }} />
                  <Typography sx={{ fontSize: '0.82rem', color: '#64748b' }}>
                    {t('paymentSuccess.totalAmount')}
                  </Typography>
                </Box>
                <Typography sx={{ fontSize: '1.05rem', fontWeight: 800, color: '#0891b2' }}>
                  € {bookingData.pricing.total.toFixed(2)}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Paper>

        {/* ── QR Code Card ── */}
        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: '10px' }}>
            {error}
          </Alert>
        )}

        {usageDetails?.accessCode ? (
          <Paper
            sx={{
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              border: '1px solid rgba(0,0,0,0.06)',
              mb: 2.5,
            }}
          >
            <Box sx={{ p: { xs: 2.5, sm: 3 }, textAlign: 'center' }}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.97rem', color: '#0f172a', mb: 2.5 }}>
                {t('paymentSuccess.qrCodeTitle')}
              </Typography>

              <Box
                sx={{
                  display: 'inline-flex',
                  p: 2.5,
                  bgcolor: 'white',
                  borderRadius: '12px',
                  border: '2px solid rgba(8,145,178,0.15)',
                  mb: 2,
                }}
              >
                <div id="qr-code-svg">
                  <QRCode
                    value={usageDetails.accessCode}
                    size={isMobile ? 150 : 200}
                    level="H"
                  />
                </div>
              </Box>

              <Typography
                sx={{
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  fontSize: '1.2rem',
                  letterSpacing: 3,
                  color: '#0f172a',
                  mb: 1,
                }}
              >
                {usageDetails.accessCode}
              </Typography>

              <Typography sx={{ fontSize: '0.82rem', color: '#64748b', mb: 2.5 }}>
                {t('paymentSuccess.qrCodeDescription')}
              </Typography>

              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={downloadQRCode}
                fullWidth
                sx={{
                  py: 1.3,
                  textTransform: 'none',
                  fontWeight: 600,
                  borderRadius: '12px',
                  borderColor: '#0891b2',
                  color: '#0891b2',
                  '&:hover': {
                    borderColor: '#0891b2',
                    backgroundColor: 'rgba(8,145,178,0.05)',
                  },
                }}
              >
                {t('paymentSuccess.downloadQR')}
              </Button>
            </Box>
          </Paper>
        ) : (
          <Alert severity="info" sx={{ mb: 2.5, borderRadius: '10px' }}>
            {t('paymentSuccess.qrGenerating')}
          </Alert>
        )}

        {/* ── Action Buttons ── */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Button
            fullWidth
            variant="contained"
            size="large"
            startIcon={<BookmarksIcon />}
            onClick={() => navigate('/my-bookings')}
            sx={{
              py: 1.4,
              textTransform: 'none',
              fontSize: '0.97rem',
              fontWeight: 700,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #0284c7 0%, #0e7490 100%)',
              },
            }}
          >
            {t('paymentSuccess.viewBookings')}
          </Button>

          <Button
            fullWidth
            variant="outlined"
            size="large"
            startIcon={<HomeIcon />}
            onClick={() => navigate('/home')}
            sx={{
              py: 1.4,
              textTransform: 'none',
              fontSize: '0.97rem',
              fontWeight: 600,
              borderRadius: '12px',
              borderColor: '#0891b2',
              color: '#0891b2',
              '&:hover': {
                borderColor: '#0891b2',
                backgroundColor: 'rgba(8,145,178,0.05)',
              },
            }}
          >
            {t('paymentSuccess.backToHome')}
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default PaymentSuccessPage;
