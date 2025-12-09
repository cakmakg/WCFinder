import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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

const ResetPasswordPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const apiCall = useApiCall();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) {
      setError('Ungültiger oder fehlender Reset-Link.');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError('Ungültiger oder fehlender Reset-Link.');
      return;
    }

    if (!password || !confirmPassword) {
      setError('Bitte füllen Sie alle Felder aus.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Die Passwörter stimmen nicht überein.');
      return;
    }

    if (password.length < 8) {
      setError('Das Passwort muss mindestens 8 Zeichen lang sein.');
      return;
    }

    setLoading(true);
    try {
      await apiCall({
        url: '/auth/reset-password',
        method: 'post',
        body: { token, newPassword: password },
        requiresAuth: false,
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      console.error('Reset password error:', err);
      setError(err.response?.data?.message || 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.');
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
            Passwort zurücksetzen
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Geben Sie Ihr neues Passwort ein.
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
              Ihr Passwort wurde erfolgreich zurückgesetzt. Sie werden zur Anmeldeseite weitergeleitet...
            </Alert>
            <Button
              fullWidth
              variant="contained"
              onClick={() => navigate('/login')}
              sx={{
                mt: 2,
                background: "linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)",
              }}
            >
              Zur Anmeldung
            </Button>
          </Box>
        ) : (
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Neues Passwort"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
              autoFocus
              helperText="Mindestens 8 Zeichen, Groß- und Kleinbuchstaben, Zahl und Sonderzeichen"
            />

            <TextField
              fullWidth
              label="Passwort bestätigen"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              margin="normal"
              required
            />

            <Button
              fullWidth
              type="submit"
              variant="contained"
              disabled={loading || !token}
              sx={{
                mt: 3,
                py: 1.5,
                background: "linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)",
                "&:hover": {
                  background: "linear-gradient(135deg, #0e7490 0%, #0891b2 100%)",
                },
              }}
            >
              {loading ? <CircularProgress size={24} /> : 'Passwort zurücksetzen'}
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

export default ResetPasswordPage;

