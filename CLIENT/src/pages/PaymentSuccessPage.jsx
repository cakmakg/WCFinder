// CLIENT/src/pages/PaymentSuccessPage.jsx - TAM YENİ VERSİYON

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
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DownloadIcon from '@mui/icons-material/Download';
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
    // ✅ Ödeme başarılı olduktan sonra usage oluşturulmuş olmalı
    // Payment result'tan usageId'yi al veya bookingData'dan
    const usageId = bookingData?.usageId || paymentResult?.usageId || paymentResult?.metadata?.usageId;
    
    if (usageId) {
      fetchUsageDetails(usageId);
    } else {
      // Usage henüz oluşturulmamış olabilir, biraz bekle ve tekrar dene
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
      // Usage henüz oluşturulmamış olabilir, hata gösterme
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
    // Stripe success passes paymentIntent object
    if (paymentResult?.object === 'payment_intent' || paymentResult?.payment_method_types) {
      return t('paymentSuccess.creditCard');
    }
    // PayPal success returns Payment model from backend with paymentMethod
    if (paymentResult?.paymentMethod === 'paypal' || paymentResult?.paymentProvider === 'paypal') {
      return t('paymentSuccess.paypal');
    }
    return bookingData?.paymentMethod === 'paypal' ? t('paymentSuccess.paypal') : t('paymentSuccess.creditCard');
  };

  const handleOpenMaps = () => {
    const addr = bookingData?.business?.address || {};
    const coords = bookingData?.business?.location?.coordinates; // [lng, lat]
    let url = '';
    if (Array.isArray(coords) && coords.length === 2) {
      const lat = coords[1];
      const lng = coords[0];
      url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lat + ',' + lng)}`;
    } else {
      const line = [addr.street, addr.postalCode, addr.city, addr.country]
        .filter(Boolean)
        .join(' ');
      url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(line)}`;
    }
    window.open(url, '_blank', 'noopener');
  };

  if (!bookingData) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">
          {t('paymentSuccess.noBookingInfo')}
        </Alert>
        <Button onClick={() => navigate('/')} sx={{ mt: 2 }}>
          {t('paymentSuccess.backToHome')}
        </Button>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>{t('paymentSuccess.loadingDetails')}</Typography>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: { xs: 4, md: 8 } }}>
      <Container maxWidth="md"> {/* sm'den md'ye çıkarıldı - tablet için daha geniş */}
        <Paper sx={{ p: { xs: 2, sm: 4 }, textAlign: 'center' }}>
          {/* Success Icon */}
          <CheckCircleIcon 
            sx={{ fontSize: 80, color: 'success.main', mb: 2 }} 
          />
          
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
            {t('paymentSuccess.title')}
          </Typography>
          
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            {t('paymentSuccess.subtitle')}
          </Typography>

          <Divider sx={{ my: 3 }} />

          {/* Booking Details */}
          <Box sx={{ textAlign: 'left', mb: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
              {t('paymentSuccess.customerName')}
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {currentUser?.username || currentUser?.email || '—'}
            </Typography>

            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
              {t('paymentSuccess.transactionId')}
            </Typography>
            <Typography variant="body1" sx={{ fontFamily: 'monospace', mb: 2 }}>
              {transactionId}
            </Typography>

            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
              {t('paymentSuccess.paymentMethod')}
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {getPaymentMethodLabel()}
            </Typography>

            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
              {t('paymentSuccess.business')}
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {bookingData.business.name}
            </Typography>

            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
              {t('paymentSuccess.address')}
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ mb: 2, textDecoration: 'underline', cursor: 'pointer' }}
              onClick={handleOpenMaps}
            >
              {bookingData.business.address?.street}, {bookingData.business.address?.city}
            </Typography>

            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
              {t('paymentSuccess.date')}
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {new Date(bookingData.date).toLocaleDateString('de-DE')}
            </Typography>

            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
              {t('paymentSuccess.persons')}
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {bookingData.personCount}
            </Typography>

            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
              {t('paymentSuccess.totalAmount')}
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
              € {bookingData.pricing.total.toFixed(2)}
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* QR Code Section */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {usageDetails?.accessCode ? (
            <Card sx={{ mb: 3, bgcolor: 'grey.50' }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  {t('paymentSuccess.qrCodeTitle')}
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
                  <div id="qr-code-svg">
                    <QRCode 
                      value={usageDetails.accessCode} 
                      size={isMobile ? 150 : 200} // Mobile'da daha küçük
                      level="H"
                    />
                  </div>
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
                  {usageDetails.accessCode}
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {t('paymentSuccess.qrCodeDescription')}
                </Typography>

                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={downloadQRCode}
                  fullWidth
                >
                  {t('paymentSuccess.downloadQR')}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Alert severity="info" sx={{ mb: 3 }}>
              {t('paymentSuccess.qrGenerating')}
            </Alert>
          )}

          <Divider sx={{ my: 3 }} />

          {/* Action Buttons */}
          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={() => navigate('/my-bookings')}
            sx={{ mb: 1 }}
          >
            {t('paymentSuccess.viewBookings')}
          </Button>

          <Button
            fullWidth
            variant="outlined"
            size="large"
            onClick={() => navigate('/')}
          >
            {t('paymentSuccess.backToHome')}
          </Button>
        </Paper>
      </Container>
    </Box>
  );
};

export default PaymentSuccessPage;