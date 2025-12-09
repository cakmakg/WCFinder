import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Paper,
  CircularProgress,
} from '@mui/material';
import LockResetIcon from '@mui/icons-material/LockReset';
import useApiCall from '../hook/useApiCall';

const ForgotPasswordPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const apiCall = useApiCall();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Email validation
    if (!email) {
      setError('Bitte geben Sie Ihre E-Mail-Adresse ein.');
      return;
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Bitte geben Sie eine gültige E-Mail-Adresse ein.');
      return;
    }

    console.log('📧 [ForgotPasswordPage] Submitting email:', email);
    setLoading(true);
    try {
      const response = await apiCall({
        url: '/auth/forgot-password',
        method: 'post',
        body: { email },
        requiresAuth: false,
      });

      console.log('✅ [ForgotPasswordPage] Email sent successfully:', response);
      setSuccess(true);
    } catch (err) {
      console.error('❌ [ForgotPasswordPage] Forgot password error:', err);
      // Backend always returns success for security, but show error if API call fails
      if (err.response?.status === 400 || err.response?.status === 500) {
        setError(err.response?.data?.message || 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.');
      } else {
        // Even if there's an error, show success message for security
        console.log('⚠️ [ForgotPasswordPage] Showing success message despite error (security)');
        setSuccess(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <LockResetIcon sx={{ fontSize: 48, color: '#0891b2', mb: 2 }} />
          <Typography variant="h4" fontWeight={600} gutterBottom>
            Passwort vergessen?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Geben Sie Ihre E-Mail-Adresse ein und wir senden Ihnen einen Link zum Zurücksetzen Ihres Passworts.
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {success ? (
          <Box>
            <Alert severity="success" sx={{ mb: 2 }}>
              Wenn diese E-Mail-Adresse in unserem System registriert ist, haben wir Ihnen einen Link zum Zurücksetzen Ihres Passworts gesendet.
            </Alert>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => navigate('/login')}
              sx={{ mt: 2 }}
            >
              Zurück zur Anmeldung
            </Button>
          </Box>
        ) : (
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="E-Mail-Adresse"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
              autoFocus
            />

            <Button
              fullWidth
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{
                mt: 3,
                py: 1.5,
                background: "linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)",
                "&:hover": {
                  background: "linear-gradient(135deg, #0e7490 0%, #0891b2 100%)",
                },
              }}
            >
              {loading ? <CircularProgress size={24} /> : 'Link senden'}
            </Button>

            <Button
              fullWidth
              variant="text"
              onClick={() => navigate('/login')}
              sx={{ mt: 2 }}
            >
              Zurück zur Anmeldung
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default ForgotPasswordPage;

