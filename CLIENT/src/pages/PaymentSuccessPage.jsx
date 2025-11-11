// CLIENT/src/pages/PaymentSuccessPage.jsx - TAM YENİ VERSİYON

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
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
    if (bookingData?.usageId) {
      fetchUsageDetails();
    } else {
      setLoading(false);
    }
  }, [bookingData]);

  const fetchUsageDetails = async () => {
    try {
      setLoading(true);
      const response = await usageService.getUsage(bookingData.usageId);
      setUsageDetails(response.result || response.data || response);
    } catch (err) {
      console.error('Error fetching usage details:', err);
      setError('Fehler beim Laden der Buchungsdetails');
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
      return 'Kredit-/Debitkarte (Stripe)';
    }
    // PayPal success returns Payment model from backend with paymentMethod
    if (paymentResult?.paymentMethod === 'paypal' || paymentResult?.paymentProvider === 'paypal') {
      return 'PayPal';
    }
    return bookingData?.paymentMethod === 'paypal' ? 'PayPal' : 'Kredit-/Debitkarte';
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
          Keine Buchungsinformationen gefunden
        </Alert>
        <Button onClick={() => navigate('/')} sx={{ mt: 2 }}>
          Zur Startseite
        </Button>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Buchungsdetails werden geladen...</Typography>
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
            Zahlung erfolgreich!
          </Typography>
          
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Ihre Buchung wurde bestätigt
          </Typography>

          <Divider sx={{ my: 3 }} />

          {/* Booking Details */}
          <Box sx={{ textAlign: 'left', mb: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
              Name des Kunden
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {currentUser?.username || currentUser?.email || '—'}
            </Typography>

            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
              Transaktions-ID
            </Typography>
            <Typography variant="body1" sx={{ fontFamily: 'monospace', mb: 2 }}>
              {transactionId}
            </Typography>

            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
              Zahlungsart
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {getPaymentMethodLabel()}
            </Typography>

            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
              Geschäft
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {bookingData.business.name}
            </Typography>

            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
              Adresse
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ mb: 2, textDecoration: 'underline', cursor: 'pointer' }}
              onClick={handleOpenMaps}
            >
              {bookingData.business.address?.street}, {bookingData.business.address?.city}
            </Typography>

            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
              Datum
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {new Date(bookingData.date).toLocaleDateString('de-DE')}
            </Typography>

            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
              Personen
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {bookingData.personCount}
            </Typography>

            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
              Gesamtbetrag
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
                  Ihr QR-Code für den Zugang
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
                  Zeigen Sie diesen QR-Code am Eingang vor
                </Typography>

                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={downloadQRCode}
                  fullWidth
                >
                  QR-Code herunterladen
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Alert severity="info" sx={{ mb: 3 }}>
              QR-Code wird generiert...
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
            Meine Buchungen ansehen
          </Button>

          <Button
            fullWidth
            variant="outlined"
            size="large"
            onClick={() => navigate('/')}
          >
            Zur Startseite
          </Button>
        </Paper>
      </Container>
    </Box>
  );
};

export default PaymentSuccessPage;