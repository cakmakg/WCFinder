// components/business/BookingPanel.jsx
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
  Alert,
  Chip
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

  if (!toilets || toilets.length === 0) {
    return (
      <Paper 
        sx={{ 
          p: 3, 
          borderRadius: 3,
          boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
          border: '1px solid #e2e8f0'
        }}
      >
        <Alert 
          severity="warning"
          sx={{ 
            borderRadius: 2,
            '& .MuiAlert-icon': {
              color: '#f59e0b'
            }
          }}
        >
          Keine Toiletten verfügbar
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
          address: business.address,
          location: business.location
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
    <Paper 
      sx={{ 
        p: 3, 
        borderRadius: 3,
        boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
        border: '1px solid #e2e8f0',
        backgroundColor: 'white'
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography 
          variant="h5" 
          sx={{ 
            mb: 1, 
            fontWeight: 700,
            color: '#1e293b'
          }}
        >
          Buchung
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748b' }}>
          Wählen Sie Ihre Präferenzen
        </Typography>
      </Box>

      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 2,
            borderRadius: 2,
            backgroundColor: '#fee2e2',
            '& .MuiAlert-icon': {
              color: '#ef4444'
            }
          }} 
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      {/* Gender Selection */}
      <TextField
        select
        fullWidth
        label="Geschlecht"
        value={userGender}
        onChange={(e) => setUserGender(e.target.value)}
        disabled={loading}
        sx={{ 
          mb: 2,
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            '&:hover fieldset': {
              borderColor: '#0891b2',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#0891b2',
            }
          }
        }}
      >
        <MenuItem value="male">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WcIcon sx={{ fontSize: '1.2rem', color: '#0891b2' }} />
            <span>Männer</span>
          </Box>
        </MenuItem>
        <MenuItem value="female">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WcIcon sx={{ fontSize: '1.2rem', color: '#0891b2' }} />
            <span>Frauen</span>
          </Box>
        </MenuItem>
      </TextField>

      {/* Date Selection */}
      <TextField
        fullWidth
        type="date"
        label="Datum"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        disabled={loading}
        InputLabelProps={{ shrink: true }}
        InputProps={{
          inputProps: { min: new Date().toISOString().split('T')[0] }
        }}
        sx={{ 
          mb: 2,
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            '&:hover fieldset': {
              borderColor: '#0891b2',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#0891b2',
            }
          }
        }}
      />

      {/* Person Count */}
      <TextField
        fullWidth
        select
        label="Anzahl Personen"
        value={personCount}
        onChange={(e) => setPersonCount(e.target.value)}
        disabled={loading}
        sx={{ 
          mb: 3,
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            '&:hover fieldset': {
              borderColor: '#0891b2',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#0891b2',
            }
          }
        }}
      >
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
          <MenuItem key={num} value={num}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PeopleIcon sx={{ fontSize: '1.2rem', color: '#0891b2' }} />
              <span>{num} {num === 1 ? 'Person' : 'Personen'}</span>
            </Box>
          </MenuItem>
        ))}
      </TextField>

      {/* Price Breakdown */}
      <Box 
        sx={{ 
          p: 2, 
          borderRadius: 2,
          backgroundColor: '#f8fafc',
          mb: 2
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            € {basePrice.toFixed(2)} × {personCount} {personCount === 1 ? 'Person' : 'Personen'}
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            € {(basePrice * personCount).toFixed(2)}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            Servicegebühr
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            € {serviceFee.toFixed(2)}
          </Typography>
        </Box>
        
        <Divider sx={{ my: 1.5, borderColor: '#e2e8f0' }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
            Gesamt
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#0891b2' }}>
            € {total.toFixed(2)}
          </Typography>
        </Box>
      </Box>

      {/* Booking Button */}
      <Button
        fullWidth
        variant="contained"
        size="large"
        onClick={handleReservation}
        disabled={!userGender || !date || loading}
        sx={{ 
          py: 1.75,
          background: 'linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)',
          fontSize: '1rem',
          fontWeight: 700,
          textTransform: 'none',
          borderRadius: 2,
          boxShadow: '0 4px 12px rgba(8,145,178,0.3)',
          '&:hover': {
            background: 'linear-gradient(135deg, #0e7490 0%, #0891b2 100%)',
            boxShadow: '0 6px 16px rgba(8,145,178,0.4)',
            transform: 'translateY(-2px)',
          },
          '&:disabled': {
            background: '#cbd5e1',
            color: '#94a3b8'
          },
          transition: 'all 0.3s ease'
        }}
      >
        {loading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress size={20} sx={{ color: 'white' }} />
            Wird verarbeitet...
          </Box>
        ) : (
          'Weiter zur Zahlung'
        )}
      </Button>

      {/* Security Badge */}
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          mt: 2.5, 
          gap: 0.5,
          p: 1,
          borderRadius: 2,
          backgroundColor: '#f0f9ff'
        }}
      >
        <LockIcon sx={{ fontSize: '1rem', color: '#0891b2' }} />
        <Typography variant="caption" sx={{ color: '#0891b2', fontWeight: 600 }}>
          Sichere & verschlüsselte Zahlung
        </Typography>
      </Box>
    </Paper>
  );
};