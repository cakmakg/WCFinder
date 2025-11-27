import React from 'react';
import { Box, Grid, Paper, Typography, Button, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import BookingCard from './BookingCard';

const BookingsTab = ({ bookings, loading, onViewDetails, onViewQR }) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (bookings.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
          Keine Reservierungen vorhanden
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => navigate('/')}
          sx={{ mt: 2 }}
        >
          Jetzt reservieren
        </Button>
      </Paper>
    );
  }

  return (
    <Grid container spacing={2}>
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

