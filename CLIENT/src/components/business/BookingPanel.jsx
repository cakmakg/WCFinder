// components/business/BookingPanel.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
} from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LockIcon from '@mui/icons-material/Lock';
import PeopleIcon from '@mui/icons-material/People';
import WcIcon from '@mui/icons-material/Wc';
import ShieldIcon from '@mui/icons-material/Shield';

const INPUT_SX = {
  mb: 2,
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    fontSize: '0.9rem',
    '&:hover fieldset': { borderColor: '#0891b2' },
    '&.Mui-focused fieldset': { borderColor: '#0891b2', borderWidth: '2px' },
  },
  '& .MuiInputLabel-root.Mui-focused': { color: '#0891b2' },
};

export const BookingPanel = ({ business, toilets }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [userGender, setUserGender] = useState('');
  const [date, setDate] = useState('');
  const [personCount, setPersonCount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!toilets || toilets.length === 0) {
    return (
      <Paper sx={{ borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 16px rgba(0,0,0,0.07)', border: '1px solid rgba(8,145,178,0.1)' }}>
        <Alert severity="warning" sx={{ m: 2, borderRadius: '10px' }}>
          {t('bookingPanel.noToilets')}
        </Alert>
      </Paper>
    );
  }

  const basePrice = toilets[0]?.fee || 1.00;
  const SERVICE_FEE_PER_PERSON = 0.75;
  const serviceFee = SERVICE_FEE_PER_PERSON * personCount;
  const total = (basePrice * personCount) + serviceFee;

  const handleReservation = async () => {
    if (!userGender || !date) {
      setError(t('bookingPanel.genderDateRequired'));
      return;
    }
    if (!business?._id) {
      setError(t('bookingPanel.businessInfoMissing'));
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const bookingData = {
        business: { id: business._id, name: business.businessName, address: business.address, location: business.location },
        toilet: { id: toilets[0]._id, name: toilets[0].name, fee: toilets[0].fee },
        userGender, date, personCount,
        pricing: { basePrice, serviceFee, total },
      };
      navigate('/payment', { state: bookingData });
    } catch (error) {
      setError(error.response?.data?.message || error.message || t('bookingPanel.reservationError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper
      sx={{
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 4px 24px rgba(8,145,178,0.1)',
        border: '1px solid rgba(8,145,178,0.12)',
      }}
    >
      {/* ── Gradient Header ── */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)',
          px: 2.5,
          py: 2.25,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
        }}
      >
        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: '11px',
            backgroundColor: 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <CalendarTodayIcon sx={{ color: 'white', fontSize: '1.15rem' }} />
        </Box>
        <Box>
          <Typography sx={{ color: 'white', fontWeight: 700, fontSize: '0.95rem', lineHeight: 1.2 }}>
            {t('bookingPanel.title')}
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.72rem' }}>
            {t('bookingPanel.subtitle')}
          </Typography>
        </Box>
      </Box>

      {/* ── Form Alanı ── */}
      <Box sx={{ p: 2.5 }}>
        {error && (
          <Alert
            severity="error"
            onClose={() => setError(null)}
            sx={{ mb: 2, borderRadius: '10px', fontSize: '0.85rem' }}
          >
            {error}
          </Alert>
        )}

        {/* Cinsiyet */}
        <TextField
          select fullWidth
          label={t('bookingPanel.gender')}
          value={userGender}
          onChange={(e) => setUserGender(e.target.value)}
          disabled={loading}
          sx={INPUT_SX}
        >
          <MenuItem value="male">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <WcIcon sx={{ fontSize: '1.1rem', color: '#0891b2' }} />
              <span>{t('bookingPanel.male')}</span>
            </Box>
          </MenuItem>
          <MenuItem value="female">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <WcIcon sx={{ fontSize: '1.1rem', color: '#0891b2' }} />
              <span>{t('bookingPanel.female')}</span>
            </Box>
          </MenuItem>
        </TextField>

        {/* Tarih */}
        <TextField
          fullWidth type="date"
          label={t('bookingPanel.date')}
          value={date}
          onChange={(e) => setDate(e.target.value)}
          disabled={loading}
          InputLabelProps={{ shrink: true }}
          InputProps={{ inputProps: { min: new Date().toISOString().split('T')[0] } }}
          sx={INPUT_SX}
        />

        {/* Kişi sayısı */}
        <TextField
          fullWidth select
          label={t('bookingPanel.personCount')}
          value={personCount}
          onChange={(e) => setPersonCount(e.target.value)}
          disabled={loading}
          sx={{ ...INPUT_SX, mb: 2.5 }}
        >
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
            <MenuItem key={num} value={num}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PeopleIcon sx={{ fontSize: '1.1rem', color: '#0891b2' }} />
                <span>{num} {num === 1 ? t('common.person') : t('common.persons')}</span>
              </Box>
            </MenuItem>
          ))}
        </TextField>

        {/* ── Fiyat Özeti ── */}
        <Box
          sx={{
            p: 2,
            borderRadius: '12px',
            backgroundColor: '#f0f9ff',
            border: '1px solid rgba(8,145,178,0.12)',
            borderLeft: '3px solid #0891b2',
            mb: 2.5,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.82rem' }}>
              € {basePrice.toFixed(2)} × {personCount} {personCount === 1 ? 'Person' : 'Personen'}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.82rem', color: '#334155' }}>
              € {(basePrice * personCount).toFixed(2)}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.82rem' }}>
              {t('bookingPanel.serviceFee')} (€{SERVICE_FEE_PER_PERSON.toFixed(2)} × {personCount})
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.82rem', color: '#334155' }}>
              € {serviceFee.toFixed(2)}
            </Typography>
          </Box>

          <Divider sx={{ my: 1.25, borderColor: 'rgba(8,145,178,0.15)' }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>
              {t('bookingPanel.total')}
            </Typography>
            <Typography sx={{ fontWeight: 800, fontSize: '1.3rem', color: '#0891b2', lineHeight: 1 }}>
              € {total.toFixed(2)}
            </Typography>
          </Box>
        </Box>

        {/* ── Rezervasyon Butonu ── */}
        <Button
          fullWidth variant="contained" size="large"
          onClick={handleReservation}
          disabled={!userGender || !date || loading}
          sx={{
            py: 1.6,
            background: 'linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)',
            fontSize: '0.95rem',
            fontWeight: 700,
            textTransform: 'none',
            borderRadius: '12px',
            boxShadow: '0 4px 14px rgba(8,145,178,0.3)',
            '&:hover': {
              background: 'linear-gradient(135deg, #0e7490 0%, #0891b2 100%)',
              boxShadow: '0 6px 18px rgba(8,145,178,0.4)',
              transform: 'translateY(-1px)',
            },
            '&:disabled': { background: '#e2e8f0', color: '#94a3b8', boxShadow: 'none' },
            transition: 'all 0.25s ease',
          }}
        >
          {loading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={18} sx={{ color: 'white' }} />
              {t('bookingPanel.processing')}
            </Box>
          ) : (
            t('bookingPanel.continueToPayment')
          )}
        </Button>

        {/* ── Güvenlik Badge ── */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mt: 2,
            gap: 0.75,
            py: 1,
            px: 1.5,
            borderRadius: '10px',
            backgroundColor: 'rgba(8,145,178,0.05)',
          }}
        >
          <ShieldIcon sx={{ fontSize: '0.9rem', color: '#0891b2' }} />
          <Typography variant="caption" sx={{ color: '#0891b2', fontWeight: 600, fontSize: '0.72rem' }}>
            {t('bookingPanel.securePayment')}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};
