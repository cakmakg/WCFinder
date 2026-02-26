import React from 'react';
import { Box, Grid, Paper, Typography, Button, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import BookingCard from './BookingCard';

const BookingsTab = ({ bookings, loading, onViewDetails, onViewQR }) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress sx={{ color: '#0891b2' }} />
      </Box>
    );
  }

  if (bookings.length === 0) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 5,
          textAlign: 'center',
          borderRadius: '14px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        }}
      >
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: '16px',
            backgroundColor: '#f0f9ff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 2,
          }}
        >
          <CalendarTodayIcon sx={{ fontSize: 30, color: '#0891b2' }} />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', mb: 0.5 }}>
          Keine Reservierungen vorhanden
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748b', mb: 3 }}>
          Entdecken Sie WC-Standorte in Ihrer Nähe und buchen Sie Ihren ersten Besuch.
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/home')}
          sx={{
            background: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)',
            borderRadius: '10px',
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            py: 1,
            boxShadow: '0 2px 10px rgba(8,145,178,0.3)',
            '&:hover': {
              background: 'linear-gradient(135deg, #0e7490 0%, #0891b2 100%)',
            },
          }}
        >
          Jetzt WC finden
        </Button>
      </Paper>
    );
  }

  return (
    <Grid container spacing={2.5}>
      {bookings.map((booking) => (
        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={booking._id}>
          <BookingCard
            booking={booking}
            onViewDetails={() => onViewDetails(booking)}
            onViewQR={() => onViewQR(booking)}
          />
        </Grid>
      ))}
    </Grid>
  );
};

export default BookingsTab;
