import React, { useState } from 'react';
import {
  Grid,
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import CloseIcon from '@mui/icons-material/Close';

const ProfileTab = ({
  user,
  paymentMethods,
  onUpdateProfile,
  onDeleteProfile,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    username: user?.username || '',
    email: user?.email || '',
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [error, setError] = useState(null);

  const handleSave = () => {
    onUpdateProfile(profileData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setProfileData({
      username: user?.username || '',
      email: user?.email || '',
    });
    setIsEditing(false);
  };

  const handleDeleteClick = () => {
    if (deleteConfirmText !== 'LÖSCHEN') {
      setError('Bitte geben Sie "LÖSCHEN" ein, um zu bestätigen.');
      return;
    }
    onDeleteProfile();
    setDeleteDialogOpen(false);
    setDeleteConfirmText('');
  };

  return (
    <>
      <Grid container spacing={3}>
        {/* Profil Bilgileri */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" fontWeight={600}>
                Profilinformationen
              </Typography>
              {!isEditing && (
                <IconButton
                  size="small"
                  onClick={() => setIsEditing(true)}
                  sx={{ color: 'primary.main' }}
                >
                  <EditIcon />
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
                />
                <TextField
                  label="E-Mail"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  fullWidth
                  size="small"
                />
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <Button variant="contained" onClick={handleSave} size="small">
                    Speichern
                  </Button>
                  <Button variant="outlined" onClick={handleCancel} size="small">
                    Abbrechen
                  </Button>
                </Box>
              </Box>
            ) : (
              <Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    Benutzername
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {user?.username || 'N/A'}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    E-Mail
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {user?.email || 'N/A'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    Rolle
                  </Typography>
                  <Chip
                    label={user?.role === 'user' ? 'Benutzer' : user?.role || 'N/A'}
                    size="small"
                    color="primary"
                  />
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Zahlungsmethoden */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <CreditCardIcon sx={{ color: 'primary.main' }} />
              <Typography variant="h6" fontWeight={600}>
                Zahlungsmethoden
              </Typography>
            </Box>

            {paymentMethods.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {paymentMethods.map((payment, index) => (
                  <Box
                    key={index}
                    sx={{
                      p: 2,
                      border: '1px solid #e2e8f0',
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                    }}
                  >
                    <CreditCardIcon sx={{ color: 'text.secondary' }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" fontWeight={500}>
                        {payment.paymentMethod === 'credit_card' ? 'Kreditkarte' : 
                         payment.paymentMethod === 'paypal' ? 'PayPal' : 
                         payment.paymentMethod || 'Unbekannt'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {payment.paymentProvider === 'stripe' ? 'Stripe' : 
                         payment.paymentProvider === 'paypal' ? 'PayPal' : 
                         payment.paymentProvider || 'N/A'}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                Keine Zahlungsmethoden gefunden
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Profil löschen */}
        <Grid size={{ xs: 12 }}>
          <Paper 
            sx={{ 
              p: 3, 
              borderRadius: 2, 
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              border: '1px solid #fee2e2',
              bgcolor: '#fef2f2',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 0.5, color: '#dc2626' }}>
                  Profil löschen
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Diese Aktion kann nicht rückgängig gemacht werden. Alle Ihre Daten werden permanent gelöscht.
                </Typography>
              </Box>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => setDeleteDialogOpen(true)}
              >
                Profil löschen
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Delete Profile Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setDeleteConfirmText('');
          setError(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Profil löschen bestätigen
          <IconButton
            aria-label="close"
            onClick={() => {
              setDeleteDialogOpen(false);
              setDeleteConfirmText('');
              setError(null);
            }}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          <Alert severity="error" sx={{ mb: 2 }}>
            Diese Aktion kann nicht rückgängig gemacht werden!
          </Alert>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Um Ihr Profil zu löschen, geben Sie bitte <strong>"LÖSCHEN"</strong> in das Feld unten ein.
          </Typography>
          <TextField
            fullWidth
            label="Bestätigung"
            value={deleteConfirmText}
            onChange={(e) => {
              setDeleteConfirmText(e.target.value);
              setError(null);
            }}
            placeholder="LÖSCHEN"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setDeleteDialogOpen(false);
            setDeleteConfirmText('');
            setError(null);
          }}>
            Abbrechen
          </Button>
          <Button
            onClick={handleDeleteClick}
            color="error"
            variant="contained"
            disabled={deleteConfirmText !== 'LÖSCHEN'}
            startIcon={<DeleteIcon />}
          >
            Profil löschen
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ProfileTab;

