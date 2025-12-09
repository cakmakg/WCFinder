import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  MenuItem,
  Grid,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';
import useApiCall from '../../hook/useApiCall';

const steps = ['Owner Informationen', 'Geschäftsinformationen'];

const PartnerRegistrationModal = ({ open, onClose }) => {
  const apiCall = useApiCall();
  
  // Modal state değişikliklerini izle (production-safe)
  useEffect(() => {
    // Modal açıldığında body scroll'unu engelle
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Owner bilgileri
  const [ownerData, setOwnerData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  });

  // Business bilgileri
  const [businessData, setBusinessData] = useState({
    businessName: '',
    businessType: '',
    address: {
      street: '',
      city: '',
      postalCode: '',
      country: 'Deutschland',
    },
    location: {
      latitude: '',
      longitude: '',
    },
    openingHours: '',
    phone: '',
    ustIdNr: '',
  });

  const handleOwnerChange = (field) => (e) => {
    setOwnerData({ ...ownerData, [field]: e.target.value });
    setError(null);
  };

  const handleBusinessChange = (field) => (e) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setBusinessData({
        ...businessData,
        [parent]: {
          ...businessData[parent],
          [child]: e.target.value,
        },
      });
    } else {
      setBusinessData({ ...businessData, [field]: e.target.value });
    }
    setError(null);
  };

  const validateOwnerStep = () => {
    if (!ownerData.username || !ownerData.email || !ownerData.password || !ownerData.firstName || !ownerData.lastName) {
      setError('Bitte füllen Sie alle Pflichtfelder aus.');
      return false;
    }
    if (ownerData.password !== ownerData.confirmPassword) {
      setError('Die Passwörter stimmen nicht überein.');
      return false;
    }
    if (ownerData.password.length < 8) {
      setError('Das Passwort muss mindestens 8 Zeichen lang sein.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(ownerData.email)) {
      setError('Bitte geben Sie eine gültige E-Mail-Adresse ein.');
      return false;
    }
    return true;
  };

  const validateBusinessStep = () => {
    if (!businessData.businessName || !businessData.businessType || !businessData.address.street || 
        !businessData.address.city || !businessData.address.postalCode || !businessData.location.latitude || 
        !businessData.location.longitude) {
      setError('Bitte füllen Sie alle Pflichtfelder aus.');
      return false;
    }
    const lat = parseFloat(businessData.location.latitude);
    const lng = parseFloat(businessData.location.longitude);
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      setError('Bitte geben Sie gültige Koordinaten ein (Breitengrad: -90 bis 90, Längengrad: -180 bis 180).');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (activeStep === 0) {
      if (validateOwnerStep()) {
        setActiveStep(1);
      }
    } else {
      if (validateBusinessStep()) {
        handleSubmit();
      }
    }
  };

  const handleBack = () => {
    setActiveStep(0);
    setError(null);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      // Backend'e gönderilecek data
      const submissionData = {
        owner: {
          username: ownerData.username,
          email: ownerData.email,
          password: ownerData.password,
          firstName: ownerData.firstName,
          lastName: ownerData.lastName,
        },
        business: {
          businessName: businessData.businessName,
          businessType: businessData.businessType,
          address: businessData.address,
          location: {
            type: 'Point',
            coordinates: [
              parseFloat(businessData.location.longitude),
              parseFloat(businessData.location.latitude),
            ],
          },
          openingHours: businessData.openingHours || undefined,
          phone: businessData.phone || undefined,
          ustIdNr: businessData.ustIdNr || undefined,
        },
      };

      await apiCall({
        url: '/business/partner-registration',
        method: 'post',
        body: submissionData,
        requiresAuth: false,
      });

      setSuccess(true);
    } catch (err) {
      console.error('Partner registration error:', err);
      setError(err.response?.data?.message || 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setActiveStep(0);
      setOwnerData({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
      });
      setBusinessData({
        businessName: '',
        businessType: '',
        address: {
          street: '',
          city: '',
          postalCode: '',
          country: 'Deutschland',
        },
        location: {
          latitude: '',
          longitude: '',
        },
        openingHours: '',
        phone: '',
        ustIdNr: '',
      });
      setError(null);
      setSuccess(false);
      onClose();
    }
  };

  return (
    <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        sx={{
          zIndex: 9999, // Ensure modal is on top
        }}
        PaperProps={{
          sx: {
            borderRadius: 3,
          },
        }}
      >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <BusinessIcon sx={{ color: '#0891b2', fontSize: 28 }} />
          <Typography variant="h5" fontWeight={600}>
            Unser Partner werden
          </Typography>
        </Box>
        <Stepper activeStep={activeStep} sx={{ mt: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </DialogTitle>

      <DialogContent>
        {success ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Alert severity="success" sx={{ mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                Vielen Dank für Ihre Anmeldung!
              </Typography>
              <Typography>
                Ihre Partneranfrage wurde erfolgreich übermittelt. Wir werden Ihre Informationen prüfen und uns in Kürze bei Ihnen melden.
              </Typography>
            </Alert>
          </Box>
        ) : (
          <>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            {activeStep === 0 && (
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                  <PersonIcon sx={{ color: '#0891b2' }} />
                  <Typography variant="h6" fontWeight={600}>
                    Owner Informationen
                  </Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Vorname *"
                      value={ownerData.firstName}
                      onChange={handleOwnerChange('firstName')}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Nachname *"
                      value={ownerData.lastName}
                      onChange={handleOwnerChange('lastName')}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Benutzername *"
                      value={ownerData.username}
                      onChange={handleOwnerChange('username')}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="E-Mail-Adresse *"
                      type="email"
                      value={ownerData.email}
                      onChange={handleOwnerChange('email')}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Passwort *"
                      type="password"
                      value={ownerData.password}
                      onChange={handleOwnerChange('password')}
                      required
                      helperText="Mindestens 8 Zeichen"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Passwort bestätigen *"
                      type="password"
                      value={ownerData.confirmPassword}
                      onChange={handleOwnerChange('confirmPassword')}
                      required
                    />
                  </Grid>
                </Grid>
              </Box>
            )}

            {activeStep === 1 && (
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                  <BusinessIcon sx={{ color: '#0891b2' }} />
                  <Typography variant="h6" fontWeight={600}>
                    Geschäftsinformationen
                  </Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Geschäftsname *"
                      value={businessData.businessName}
                      onChange={handleBusinessChange('businessName')}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      select
                      label="Geschäftstyp *"
                      value={businessData.businessType}
                      onChange={handleBusinessChange('businessType')}
                      required
                    >
                      <MenuItem value="Cafe">Cafe</MenuItem>
                      <MenuItem value="Restaurant">Restaurant</MenuItem>
                      <MenuItem value="Hotel">Hotel</MenuItem>
                      <MenuItem value="Shop">Shop</MenuItem>
                      <MenuItem value="Gas Station">Tankstelle</MenuItem>
                      <MenuItem value="Other">Andere</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Telefonnummer"
                      value={businessData.phone}
                      onChange={handleBusinessChange('phone')}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Straße und Hausnummer *"
                      value={businessData.address.street}
                      onChange={handleBusinessChange('address.street')}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Postleitzahl *"
                      value={businessData.address.postalCode}
                      onChange={handleBusinessChange('address.postalCode')}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Stadt *"
                      value={businessData.address.city}
                      onChange={handleBusinessChange('address.city')}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Land *"
                      value={businessData.address.country}
                      onChange={handleBusinessChange('address.country')}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Breitengrad (Latitude) *"
                      type="number"
                      value={businessData.location.latitude}
                      onChange={handleBusinessChange('location.latitude')}
                      required
                      helperText="z.B. 52.5200"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Längengrad (Longitude) *"
                      type="number"
                      value={businessData.location.longitude}
                      onChange={handleBusinessChange('location.longitude')}
                      required
                      helperText="z.B. 13.4050"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Öffnungszeiten"
                      value={businessData.openingHours}
                      onChange={handleBusinessChange('openingHours')}
                      placeholder="z.B. Mo-Fr 09:00-18:00; Sa 10:00-16:00"
                      helperText="Optional"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="USt-IdNr. (Umsatzsteuer-Identifikationsnummer)"
                      value={businessData.ustIdNr}
                      onChange={handleBusinessChange('ustIdNr')}
                      helperText="Optional"
                    />
                  </Grid>
                </Grid>
              </Box>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        {!success && (
          <>
            <Button onClick={handleClose} disabled={loading}>
              Abbrechen
            </Button>
            <Box sx={{ flex: 1 }} />
            {activeStep > 0 && (
              <Button onClick={handleBack} disabled={loading} sx={{ mr: 1 }}>
                Zurück
              </Button>
            )}
            <Button
              onClick={handleNext}
              variant="contained"
              disabled={loading}
              sx={{
                background: 'linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #0e7490 0%, #0891b2 100%)',
                },
              }}
            >
              {loading ? (
                <CircularProgress size={24} />
              ) : activeStep === steps.length - 1 ? (
                'Absenden'
              ) : (
                'Weiter'
              )}
            </Button>
          </>
        )}
        {success && (
          <Button
            onClick={handleClose}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)',
            }}
          >
            Schließen
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default PartnerRegistrationModal;

