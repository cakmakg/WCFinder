import React, { useState, useRef, useEffect } from 'react';
import {
  Grid,
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  IconButton,
} from '@mui/material';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import EditIcon from '@mui/icons-material/Edit';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import DeleteIcon from '@mui/icons-material/Delete';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import CloseIcon from '@mui/icons-material/Close';

const SectionHeader = ({ icon: Icon, title }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
    <Box
      sx={{
        width: 36,
        height: 36,
        borderRadius: '10px',
        backgroundColor: 'rgba(8,145,178,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <Icon sx={{ color: '#0891b2', fontSize: 20 }} />
    </Box>
    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a' }}>
      {title}
    </Typography>
  </Box>
);

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '10px',
    '&:hover fieldset': { borderColor: '#0891b2' },
    '&.Mui-focused fieldset': { borderColor: '#0891b2' },
  },
  '& .MuiInputLabel-root.Mui-focused': { color: '#0891b2' },
};

const readFieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '10px',
    backgroundColor: '#f8fafc',
    '& fieldset': { borderColor: 'rgba(0,0,0,0.08)' },
  },
};

const ProfileTab = ({ user, paymentMethods, onUpdateProfile, onDeleteProfile }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    username: user?.username || '',
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [error, setError] = useState(null);
  const deleteInputRef = useRef(null);

  useEffect(() => {
    if (deleteDialogOpen) deleteInputRef.current?.focus();
  }, [deleteDialogOpen]);

  const handleSave = () => {
    onUpdateProfile(profileData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setProfileData({
      username: user?.username || '',
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
    });
    setIsEditing(false);
  };

  const handleDeleteClick = async () => {
    if (deleteConfirmText.trim().toLowerCase() !== 'löschen') {
      setError('Bitte geben Sie "LÖSCHEN" ein, um zu bestätigen.');
      return;
    }
    if (typeof onDeleteProfile !== 'function') {
      setError('Fehler: Löschfunktion nicht verfügbar.');
      return;
    }
    try {
      await onDeleteProfile();
      setDeleteDialogOpen(false);
      setDeleteConfirmText('');
      setError(null);
    } catch (err) {
      setError(err.message || 'Fehler beim Löschen des Profils.');
    }
  };

  const roleLabel = { user: 'Benutzer', owner: 'Inhaber', admin: 'Administrator' };

  return (
    <>
      <Grid container spacing={2.5}>
        {/* Profilinformationen */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: '14px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0 }}>
              <SectionHeader icon={PersonOutlinedIcon} title="Profilinformationen" />
              {!isEditing && (
                <IconButton
                  size="small"
                  onClick={() => setIsEditing(true)}
                  sx={{
                    color: '#0891b2',
                    border: '1px solid rgba(8,145,178,0.2)',
                    borderRadius: '8px',
                    '&:hover': { backgroundColor: 'rgba(8,145,178,0.06)' },
                  }}
                >
                  <EditIcon sx={{ fontSize: 18 }} />
                </IconButton>
              )}
            </Box>

            {isEditing ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Benutzername"
                  value={profileData.username}
                  onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                  fullWidth
                  size="small"
                  sx={fieldSx}
                />
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    label="Vorname"
                    value={profileData.firstName}
                    onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                    fullWidth
                    size="small"
                    sx={fieldSx}
                  />
                  <TextField
                    label="Nachname"
                    value={profileData.lastName}
                    onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                    fullWidth
                    size="small"
                    sx={fieldSx}
                  />
                </Box>
                <TextField
                  label="E-Mail"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  fullWidth
                  size="small"
                  sx={fieldSx}
                />
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <Button
                    variant="contained"
                    startIcon={<SaveOutlinedIcon />}
                    onClick={handleSave}
                    size="small"
                    sx={{
                      background: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)',
                      borderRadius: '10px',
                      textTransform: 'none',
                      fontWeight: 600,
                      boxShadow: 'none',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #0e7490 0%, #0891b2 100%)',
                      },
                    }}
                  >
                    Speichern
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={handleCancel}
                    size="small"
                    sx={{
                      borderRadius: '10px',
                      textTransform: 'none',
                      fontWeight: 600,
                      color: '#64748b',
                      borderColor: '#e2e8f0',
                      '&:hover': { borderColor: '#94a3b8' },
                    }}
                  >
                    Abbrechen
                  </Button>
                </Box>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField label="Benutzername" value={user?.username || '—'} fullWidth size="small" InputProps={{ readOnly: true }} sx={readFieldSx} />
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField label="Vorname" value={user?.firstName || '—'} fullWidth size="small" InputProps={{ readOnly: true }} sx={readFieldSx} />
                  <TextField label="Nachname" value={user?.lastName || '—'} fullWidth size="small" InputProps={{ readOnly: true }} sx={readFieldSx} />
                </Box>
                <TextField label="E-Mail" value={user?.email || '—'} fullWidth size="small" InputProps={{ readOnly: true }} sx={readFieldSx} />
                <Box>
                  <Typography variant="caption" sx={{ color: '#64748b', mb: 0.5, display: 'block' }}>
                    Rolle
                  </Typography>
                  <Chip
                    label={roleLabel[user?.role] || user?.role || '—'}
                    size="small"
                    sx={{
                      backgroundColor: 'rgba(8,145,178,0.1)',
                      color: '#0891b2',
                      fontWeight: 600,
                    }}
                  />
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Zahlungsmethoden */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: '14px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            }}
          >
            <SectionHeader icon={CreditCardIcon} title="Zahlungsmethoden" />

            {paymentMethods.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {paymentMethods.map((payment) => (
                  <Box
                    key={payment._id || `${payment.paymentMethod}-${payment.paymentProvider}`}
                    sx={{
                      p: 2,
                      borderLeft: '3px solid #0891b2',
                      borderRadius: '12px',
                      backgroundColor: '#f0f9ff',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                    }}
                  >
                    <CreditCardIcon sx={{ color: '#0891b2' }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a' }}>
                        {payment.paymentMethod === 'credit_card' ? 'Kreditkarte' :
                         payment.paymentMethod === 'paypal' ? 'PayPal' :
                         payment.paymentMethod || 'Unbekannt'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748b' }}>
                        {payment.paymentProvider === 'stripe' ? 'Stripe' :
                         payment.paymentProvider === 'paypal' ? 'PayPal' :
                         payment.paymentProvider || 'N/A'}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '12px',
                    backgroundColor: '#f0f9ff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 1.5,
                  }}
                >
                  <CreditCardIcon sx={{ color: '#0891b2', fontSize: 24 }} />
                </Box>
                <Typography variant="body2" sx={{ color: '#64748b' }}>
                  Keine Zahlungsmethoden gefunden
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Profil löschen */}
        <Grid size={{ xs: 12 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: '14px',
              border: '1px solid #fecaca',
              bgcolor: '#fef2f2',
              boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.3, color: '#dc2626' }}>
                  Profil löschen
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b' }}>
                  Diese Aktion kann nicht rückgängig gemacht werden. Alle Daten werden permanent gelöscht.
                </Typography>
              </Box>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => setDeleteDialogOpen(true)}
                sx={{
                  borderRadius: '10px',
                  textTransform: 'none',
                  fontWeight: 600,
                  flexShrink: 0,
                  ml: 2,
                }}
              >
                Löschen
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Delete Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => { setDeleteDialogOpen(false); setDeleteConfirmText(''); setError(null); }}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '16px' } }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a' }}>
            Profil löschen bestätigen
          </Typography>
          <IconButton
            aria-label="close"
            onClick={() => { setDeleteDialogOpen(false); setDeleteConfirmText(''); setError(null); }}
            sx={{ position: 'absolute', right: 12, top: 12, color: '#94a3b8' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: '10px' }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          <Alert severity="error" sx={{ mb: 2, borderRadius: '10px' }}>
            Diese Aktion kann nicht rückgängig gemacht werden!
          </Alert>
          <Typography variant="body2" sx={{ mb: 2, color: '#334155' }}>
            Um Ihr Profil zu löschen, geben Sie bitte <strong>"LÖSCHEN"</strong> in das Feld unten ein.
          </Typography>
          <TextField
            fullWidth
            label="Bestätigung"
            value={deleteConfirmText}
            onChange={(e) => { setDeleteConfirmText(e.target.value); setError(null); }}
            placeholder="LÖSCHEN"
            sx={{ mt: 1, ...fieldSx }}
            inputRef={deleteInputRef}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            onClick={() => { setDeleteDialogOpen(false); setDeleteConfirmText(''); setError(null); }}
            sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600, color: '#64748b' }}
          >
            Abbrechen
          </Button>
          <Button
            onClick={handleDeleteClick}
            color="error"
            variant="contained"
            disabled={deleteConfirmText.trim().toLowerCase() !== 'löschen'}
            startIcon={<DeleteIcon />}
            sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600 }}
          >
            Profil löschen
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ProfileTab;
