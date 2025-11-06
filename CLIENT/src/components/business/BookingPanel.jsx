import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  Divider,
  MenuItem,
  CircularProgress,
  Alert
} from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LockIcon from '@mui/icons-material/Lock';
import PeopleIcon from '@mui/icons-material/People';
import WcIcon from '@mui/icons-material/Wc';
import usageService from '../../services/usageService';

export const BookingPanel = ({ business, toilets }) => {
  const navigate = useNavigate();
  
  const [userGender, setUserGender] = useState('');
  const [date, setDate] = useState('');
  const [personCount, setPersonCount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ HATA KONTROLÜ - Component render aşamasında
  if (!toilets || toilets.length === 0) {
    return (
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Alert severity="warning">
          ⚠️ Keine Toiletten verfügbar. Bitte wählen Sie ein anderes Geschäft.
        </Alert>
      </Paper>
    );
  }

  const basePrice = toilets[0]?.fee || 5;
  const serviceFee = 1.75;
  const total = (basePrice * personCount) + serviceFee;

  const handleReservation = async () => {
    if (!userGender || !date) {
      setError('Bitte wählen Sie Geschlecht und Datum aus');
      return;
    }

    if (!business?._id) {
      setError('Business-Informationen fehlen');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const usageData = {
        businessId: business._id,
        toiletId: toilets[0]._id,
        personCount: personCount,
        startTime: new Date(date).toISOString(),
        genderPreference: userGender,
      };

      console.log('📤 Creating usage:', usageData);
      const usageResponse = await usageService.createUsage(usageData);
      console.log('✅ Usage created:', usageResponse);

      const bookingData = {
        usageId: usageResponse.result._id,
        business: {
          id: business._id,
          name: business.businessName,
          address: business.address
        },
        userGender,
        date,
        personCount,
        pricing: {
          basePrice,
          serviceFee,
          total
        }
      };

      console.log('📦 Navigating with bookingData:', bookingData);
      navigate('/payment', { state: bookingData });

    } catch (error) {
      console.error('❌ Reservation error:', error);
      setError(error.response?.data?.message || error.message || 'Fehler bei der Reservierung');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Preisdetails
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <TextField
        select
        fullWidth
        label="Geschlecht"
        value={userGender}
        onChange={(e) => setUserGender(e.target.value)}
        disabled={loading}
        InputProps={{
          startAdornment: <WcIcon sx={{ mr: 1, fontSize: '1rem', color: 'action.active' }} />
        }}
        sx={{ mb: 2 }}
        size="small"
      >
        <MenuItem value="male">Männer</MenuItem>
        <MenuItem value="female">Frauen</MenuItem>
      </TextField>

      <TextField
        fullWidth
        type="date"
        label="Datum"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        disabled={loading}
        InputLabelProps={{ shrink: true }}
        InputProps={{
          startAdornment: <CalendarTodayIcon sx={{ mr: 1, fontSize: '1rem', color: 'action.active' }} />,
          inputProps: { min: new Date().toISOString().split('T')[0] }
        }}
        sx={{ mb: 2 }}
        size="small"
      />

      <TextField
        fullWidth
        select
        label="Anzahl Personen"
        value={personCount}
        onChange={(e) => setPersonCount(e.target.value)}
        disabled={loading}
        InputProps={{
          startAdornment: <PeopleIcon sx={{ mr: 1, fontSize: '1rem', color: 'action.active' }} />
        }}
        sx={{ mb: 3 }}
        size="small"
      >
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
          <MenuItem key={num} value={num}>
            {num} {num === 1 ? 'Person' : 'Personen'}
          </MenuItem>
        ))}
      </TextField>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2">
            € {basePrice.toFixed(2)} × {personCount} {personCount === 1 ? 'Person' : 'Personen'}
          </Typography>
          <Typography variant="body2">
            € {(basePrice * personCount).toFixed(2)}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Servicegebühr
          </Typography>
          <Typography variant="body2" color="text.secondary">
            € {serviceFee.toFixed(2)}
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Gesamt
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          € {total.toFixed(2)}
        </Typography>
      </Box>

      <Button
        fullWidth
        variant="contained"
        size="large"
        onClick={handleReservation}
        disabled={!userGender || !date || loading}
        sx={{ 
          py: 1.5,
          textTransform: 'none',
          fontSize: '1rem',
          fontWeight: 600
        }}
      >
        {loading ? (
          <>
            <CircularProgress size={24} sx={{ color: 'white', mr: 1 }} />
            Wird verarbeitet...
          </>
        ) : (
          'Weiter zur Zahlung'
        )}
      </Button>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 2, gap: 0.5 }}>
        <LockIcon fontSize="small" color="action" />
        <Typography variant="caption" color="text.secondary">
          Sichere Zahlung
        </Typography>
      </Box>
    </Paper>
  );
};