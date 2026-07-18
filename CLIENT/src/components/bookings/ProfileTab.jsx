import React, { useState, useRef, useEffect } from 'react';
import {
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
// eslint-disable-next-line no-unused-vars
import { motion, useReducedMotion } from 'framer-motion';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import EditIcon from '@mui/icons-material/Edit';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import DeleteIcon from '@mui/icons-material/Delete';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import CloseIcon from '@mui/icons-material/Close';
import { COLORS, RADII, SHADOWS } from '../../theme/designTokens';

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
      <Icon sx={{ color: COLORS.primary, fontSize: 20 }} />
    </Box>
    <Typography
      variant="subtitle1"
      sx={{ fontWeight: 800, color: COLORS.textHeading, letterSpacing: '-0.02em' }}
    >
      {title}
    </Typography>
  </Box>
);

const cardSx = {
  p: 3,
  height: '100%',
  backgroundColor: 'white',
  border: `1px solid ${COLORS.border}`,
  borderRadius: RADII.card,
  boxShadow: SHADOWS.subtle,
  transition: 'transform 0.25s ease, box-shadow 0.25s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: SHADOWS.hover,
  },
};

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: RADII.input,
    '&:hover fieldset': { borderColor: COLORS.primary },
    '&.Mui-focused fieldset': { borderColor: COLORS.primary },
  },
  '& .MuiInputLabel-root.Mui-focused': { color: COLORS.primary },
};

const readFieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: RADII.input,
    backgroundColor: COLORS.backgroundLight,
    '& fieldset': { borderColor: 'rgba(0,0,0,0.08)' },
  },
};

const gradientButtonSx = {
  background: COLORS.primaryGradient,
  color: 'white',
  borderRadius: RADII.button,
  textTransform: 'none',
  fontWeight: 600,
  boxShadow: SHADOWS.brand,
  transition: 'transform 0.2s, box-shadow 0.2s',
  '&:hover': {
    background: COLORS.primaryGradientHover,
    transform: 'translateY(-1px)',
    boxShadow: SHADOWS.brandHover,
  },
  '&:active': { transform: 'translateY(0) scale(0.98)' },
};

const ProfileTab = ({ user, paymentMethods, onUpdateProfile, onDeleteProfile }) => {
  const reduce = useReducedMotion();
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

  const cardMotionProps = (index) => ({
    initial: reduce ? false : { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: 0.45,
      delay: reduce ? 0 : index * 0.08,
      ease: [0.16, 1, 0.3, 1],
    },
  });

  return (
    <>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 2.5,
        }}
      >
        {/* Profilinformationen */}
        <motion.div {...cardMotionProps(0)} style={{ minWidth: 0 }}>
          <Paper elevation={0} sx={cardSx}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0 }}>
              <SectionHeader icon={PersonOutlinedIcon} title="Profilinformationen" />
              {!isEditing && (
                <IconButton
                  size="small"
                  onClick={() => setIsEditing(true)}
                  sx={{
                    color: COLORS.primary,
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
                    sx={gradientButtonSx}
                  >
                    Speichern
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={handleCancel}
                    size="small"
                    sx={{
                      borderRadius: RADII.button,
                      textTransform: 'none',
                      fontWeight: 600,
                      color: COLORS.textSecondary,
                      borderColor: COLORS.border,
                      '&:hover': { borderColor: COLORS.textLight },
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
                  <Typography variant="caption" sx={{ color: COLORS.textSecondary, mb: 0.5, display: 'block' }}>
                    Rolle
                  </Typography>
                  <Chip
                    label={roleLabel[user?.role] || user?.role || '—'}
                    size="small"
                    sx={{
                      borderRadius: '999px',
                      backgroundColor: COLORS.accentBoxBg,
                      color: COLORS.primary,
                      fontWeight: 600,
                    }}
                  />
                </Box>
              </Box>
            )}
          </Paper>
        </motion.div>

        {/* Zahlungsmethoden */}
        <motion.div {...cardMotionProps(1)} style={{ minWidth: 0 }}>
          <Paper elevation={0} sx={cardSx}>
            <SectionHeader icon={CreditCardIcon} title="Zahlungsmethoden" />

            {paymentMethods.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {paymentMethods.map((payment) => (
                  <Box
                    key={payment._id || `${payment.paymentMethod}-${payment.paymentProvider}`}
                    sx={{
                      p: 2,
                      borderLeft: `3px solid ${COLORS.primary}`,
                      borderRadius: RADII.input,
                      backgroundColor: COLORS.accentBoxBg,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                    }}
                  >
                    <CreditCardIcon sx={{ color: COLORS.primary }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: COLORS.textHeading }}>
                        {payment.paymentMethod === 'credit_card' ? 'Kreditkarte' :
                         payment.paymentMethod === 'paypal' ? 'PayPal' :
                         payment.paymentMethod || 'Unbekannt'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: COLORS.textSecondary }}>
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
                    borderRadius: RADII.input,
                    backgroundColor: COLORS.accentBoxBg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 1.5,
                  }}
                >
                  <CreditCardIcon sx={{ color: COLORS.primary, fontSize: 24 }} />
                </Box>
                <Typography variant="body2" sx={{ color: COLORS.textSecondary }}>
                  Keine Zahlungsmethoden gefunden
                </Typography>
              </Box>
            )}
          </Paper>
        </motion.div>

        {/* Profil löschen */}
        <motion.div {...cardMotionProps(2)} style={{ minWidth: 0, gridColumn: '1 / -1' }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: RADII.card,
              border: '1px solid #fecaca',
              bgcolor: '#fef2f2',
              boxShadow: SHADOWS.subtle,
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.3, color: '#dc2626' }}>
                  Profil löschen
                </Typography>
                <Typography variant="body2" sx={{ color: COLORS.textSecondary }}>
                  Diese Aktion kann nicht rückgängig gemacht werden. Alle Daten werden permanent gelöscht.
                </Typography>
              </Box>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => setDeleteDialogOpen(true)}
                sx={{
                  borderRadius: RADII.button,
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
        </motion.div>
      </Box>

      {/* Lösch-Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => { setDeleteDialogOpen(false); setDeleteConfirmText(''); setError(null); }}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: RADII.panel } }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: COLORS.textHeading, letterSpacing: '-0.02em' }}>
            Profil löschen bestätigen
          </Typography>
          <IconButton
            aria-label="close"
            onClick={() => { setDeleteDialogOpen(false); setDeleteConfirmText(''); setError(null); }}
            sx={{ position: 'absolute', right: 12, top: 12, color: COLORS.textLight }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: RADII.input }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          <Alert severity="error" sx={{ mb: 2, borderRadius: RADII.input }}>
            Diese Aktion kann nicht rückgängig gemacht werden!
          </Alert>
          <Typography variant="body2" sx={{ mb: 2, color: COLORS.textPrimary }}>
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
            sx={{ borderRadius: RADII.button, textTransform: 'none', fontWeight: 600, color: COLORS.textSecondary }}
          >
            Abbrechen
          </Button>
          <Button
            onClick={handleDeleteClick}
            color="error"
            variant="contained"
            disabled={deleteConfirmText.trim().toLowerCase() !== 'löschen'}
            startIcon={<DeleteIcon />}
            sx={{ borderRadius: RADII.button, textTransform: 'none', fontWeight: 600 }}
          >
            Profil löschen
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ProfileTab;
