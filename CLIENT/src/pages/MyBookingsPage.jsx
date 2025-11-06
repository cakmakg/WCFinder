// CLIENT/src/pages/MyBookingsPage.jsx - YENİ DOSYA

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from '@mui/material';
import QrCodeIcon from '@mui/icons-material/QrCode2';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PeopleIcon from '@mui/icons-material/People';
import QRCode from 'react-qr-code';
import usageService from '../services/usageService';

const MyBookingsPage = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await usageService.getMyUsages();
      setBookings(response.result);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Fehler beim Laden der Buchungen');
    } finally {
      setLoading(false);
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
    const labels = {
      pending: 'Ausstehend',
      confirmed: 'Bestätigt',
      active: 'Aktiv',
      completed: 'Abgeschlossen',
      cancelled: 'Storniert',
      expired: 'Abgelaufen',
    };
    return labels[status] || status;
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
    const labels = {
      pending: 'Ausstehend',
      paid: 'Bezahlt',
      failed: 'Fehlgeschlagen',
      refunded: 'Erstattet',
    };
    return labels[paymentStatus] || paymentStatus;
  };

  if (loading) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Buchungen werden geladen...</Typography>
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
          Meine Buchungen
        </Typography>

        {bookings.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
              Sie haben noch keine Buchungen
            </Typography>
            <Button 
              variant="contained" 
              onClick={() => navigate('/')}
            >
              Jetzt buchen
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
                          {booking.personCount} Person(en)
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
                        QR-Code anzeigen
                      </Button>
                    )}

                    <Typography 
                      variant="caption" 
                      color="text.secondary" 
                      sx={{ display: 'block', mt: 1 }}
                    >
                      Gebucht am: {new Date(booking.createdAt).toLocaleDateString('de-DE')}
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
              sx={{ p: 4, maxWidth: 400, textAlign: 'center' }}
              onClick={(e) => e.stopPropagation()}
            >
              <Typography variant="h6" sx={{ mb: 2 }}>
                Ihr QR-Code
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
                  size={200}
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
                Schließen
              </Button>
            </Paper>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default MyBookingsPage;