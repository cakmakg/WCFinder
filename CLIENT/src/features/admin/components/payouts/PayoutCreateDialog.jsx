// features/admin/components/payouts/PayoutCreateDialog.jsx
// Dialog for creating new payouts with validation

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Divider,
  Autocomplete,
  Stack,
  Chip
} from '@mui/material';
import { COLORS, RADII, SHADOWS } from '../../../../theme/designTokens';
import { payoutService } from '../../services/payoutService';
import { formatCurrency } from '../../utils/exportHelpers';
import { formatDate } from '../../utils/dateHelpers';
import { toastErrorNotify } from '../../../../helper/ToastNotify';

// Admin-Designsprache: Stil-Konstanten
const inputSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: RADII.input,
    backgroundColor: COLORS.backgroundLight,
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: COLORS.primary
    }
  }
};

const neutralChipSx = {
  borderRadius: '999px',
  fontWeight: 600,
  backgroundColor: '#f1f5f9',
  color: COLORS.textSecondary
};

/**
 * PayoutCreateDialog Component
 * Modal for creating new payout with validation
 */
const PayoutCreateDialog = ({ open, onClose, onSuccess, businessData = null }) => {
  const [loading, setLoading] = useState(false);
  const [businesses, setBusinesses] = useState([]);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [formData, setFormData] = useState({
    businessId: '',
    amount: '',
    paymentMethod: 'bank_transfer',
    description: '',
    referenceNumber: ''
  });
  const [errors, setErrors] = useState({});
  const [selectedBusiness, setSelectedBusiness] = useState(null);

  // Initialize form with business data if provided
  useEffect(() => {
    if (businessData) {
      setFormData(prev => ({
        ...prev,
        businessId: businessData.businessId,
        amount: (Number(businessData.totalAmount) || 0).toFixed(2)
      }));
      setSelectedBusiness({
        businessId: businessData.businessId,
        businessName: businessData.businessName
      });
      setPendingPayments(businessData.payments || []);
    }
  }, [businessData]);

  // Fetch businesses for autocomplete
  useEffect(() => {
    if (open && !businessData) {
      fetchBusinessesWithPendingPayments();
    }
  }, [open]);

  const fetchBusinessesWithPendingPayments = async () => {
    try {
      // Geschäfte MIT ausstehenden Zahlungen (all-pending liefert je Geschäft
      // bereits businessName, totalPending und payments[]).
      const data = await payoutService.getAllPendingPayouts();
      const result = data?.result || {};
      setBusinesses(Array.isArray(result.businesses) ? result.businesses : []);
    } catch (error) {
      console.error('Error fetching businesses:', error);
      toastErrorNotify('Fehler beim Laden der Geschäfte');
    }
  };

  // Handle business selection — ausstehende Zahlungen & Betrag kommen direkt
  // aus dem gewählten Eintrag (kein separater Endpunkt nötig).
  const handleBusinessSelect = (event, value) => {
    setSelectedBusiness(value);

    if (value) {
      const payments = value.payments || [];
      const total =
        Number(value.totalPending) ||
        payments.reduce((sum, p) => sum + (Number(p.businessFee) || 0), 0);
      setPendingPayments(payments);
      setFormData(prev => ({
        ...prev,
        businessId: value.businessId || '',
        amount: total.toFixed(2)
      }));
    } else {
      setPendingPayments([]);
      setFormData(prev => ({
        ...prev,
        businessId: '',
        amount: ''
      }));
    }
  };

  // Handle form input change
  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.businessId) {
      newErrors.businessId = 'Geschäft ist erforderlich';
    }

    if (!formData.amount || Number(formData.amount) <= 0) {
      newErrors.amount = 'Betrag muss größer als 0 sein';
    }

    if (!formData.paymentMethod) {
      newErrors.paymentMethod = 'Zahlungsmethode ist erforderlich';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const payoutData = {
        businessId: formData.businessId,
        amount: Number(formData.amount),
        paymentMethod: formData.paymentMethod,
        // Server erwartet `notes` (nicht description); Referenz mit einbetten,
        // damit keine Eingabe still verworfen wird.
        notes: [formData.description, formData.referenceNumber]
          .filter(Boolean)
          .join(' · ') || undefined,
      };

      await payoutService.createPayout(payoutData);

      if (onSuccess) {
        onSuccess();
      }
      handleClose();
    } catch (error) {
      console.error('Error creating payout:', error);
      toastErrorNotify(error.response?.data?.message || 'Fehler beim Erstellen der Auszahlung');
    } finally {
      setLoading(false);
    }
  };

  // Handle close
  const handleClose = () => {
    if (!loading) {
      setFormData({
        businessId: '',
        amount: '',
        paymentMethod: 'bank_transfer',
        description: '',
        referenceNumber: ''
      });
      setSelectedBusiness(null);
      setPendingPayments([]);
      setErrors({});
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: RADII.panel,
          boxShadow: SHADOWS.panel
        }
      }}
    >
      <DialogTitle>
        <Typography
          variant="h6"
          component="span"
          sx={{ fontWeight: 800, color: COLORS.textHeading, letterSpacing: '-0.02em' }}
        >
          Neue Auszahlung erstellen
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ pt: 2 }}>
          {/* Business Selection */}
          <FormControl fullWidth sx={{ mb: 3 }}>
            <Autocomplete
              value={selectedBusiness}
              onChange={handleBusinessSelect}
              options={businesses}
              getOptionLabel={(option) => option.businessName || ''}
              isOptionEqualToValue={(option, value) => option.businessId === value.businessId}
              disabled={!!businessData || loading}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Geschäft auswählen *"
                  error={!!errors.businessId}
                  helperText={errors.businessId}
                  sx={inputSx}
                />
              )}
              renderOption={(props, option) => (
                <Box component="li" {...props}>
                  <Box>
                    <Typography variant="body1">{option.businessName}</Typography>
                    <Typography variant="caption" sx={{ color: COLORS.textSecondary }}>
                      {option.paymentCount} ausstehende Zahlung(en)
                    </Typography>
                  </Box>
                </Box>
              )}
            />
          </FormControl>

          {/* Pending Payments Info */}
          {pendingPayments.length > 0 && (
            <Box
              sx={{
                mb: 3,
                p: 2,
                backgroundColor: COLORS.accentBoxBg,
                borderLeft: `3px solid ${COLORS.primary}`,
                borderRadius: RADII.input
              }}
            >
              <Typography variant="body2" fontWeight={600} gutterBottom sx={{ color: COLORS.textPrimary }}>
                Ausstehende Zahlungen: {pendingPayments.length}
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" mt={1}>
                {pendingPayments.slice(0, 5).map((payment) => (
                  <Chip
                    key={payment._id}
                    label={`${formatCurrency(payment.businessFee)} - ${formatDate(payment.createdAt)}`}
                    size="small"
                    sx={neutralChipSx}
                  />
                ))}
                {pendingPayments.length > 5 && (
                  <Chip
                    label={`+${pendingPayments.length - 5} weitere`}
                    size="small"
                    sx={neutralChipSx}
                  />
                )}
              </Stack>
            </Box>
          )}

          {/* Amount */}
          <TextField
            fullWidth
            label="Auszahlungsbetrag *"
            type="number"
            value={formData.amount}
            onChange={(e) => handleChange('amount', e.target.value)}
            error={!!errors.amount}
            helperText={errors.amount || 'Gesamtbetrag für diese Auszahlung'}
            disabled={loading}
            InputProps={{
              startAdornment: <Typography sx={{ mr: 1, color: COLORS.textSecondary }}>€</Typography>
            }}
            inputProps={{
              min: 0,
              step: 0.01
            }}
            sx={{ mb: 3, ...inputSx }}
          />

          {/* Payment Method */}
          <FormControl fullWidth sx={{ mb: 3, ...inputSx }}>
            <InputLabel>Zahlungsmethode *</InputLabel>
            <Select
              value={formData.paymentMethod}
              onChange={(e) => handleChange('paymentMethod', e.target.value)}
              label="Zahlungsmethode *"
              error={!!errors.paymentMethod}
              disabled={loading}
            >
              <MenuItem value="bank_transfer">Banküberweisung</MenuItem>
              <MenuItem value="paypal">PayPal</MenuItem>
              <MenuItem value="stripe">Stripe</MenuItem>
              <MenuItem value="cash">Bar</MenuItem>
            </Select>
          </FormControl>

          {/* Reference Number */}
          <TextField
            fullWidth
            label="Referenznummer"
            value={formData.referenceNumber}
            onChange={(e) => handleChange('referenceNumber', e.target.value)}
            helperText="Optional: Transaktions- oder Referenznummer"
            disabled={loading}
            sx={{ mb: 3, ...inputSx }}
          />

          {/* Description */}
          <TextField
            fullWidth
            label="Beschreibung"
            multiline
            rows={3}
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            helperText="Optional: Zusätzliche Notizen oder Beschreibung"
            disabled={loading}
            sx={inputSx}
          />

          <Divider sx={{ my: 3, borderColor: COLORS.border }} />

          {/* Summary */}
          <Box
            sx={{
              backgroundColor: COLORS.accentBoxBg,
              p: 2,
              borderRadius: RADII.input,
              borderLeft: `3px solid ${COLORS.primary}`
            }}
          >
            <Typography variant="subtitle2" sx={{ color: COLORS.textSecondary, fontWeight: 600 }} gutterBottom>
              Zusammenfassung
            </Typography>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="body2" sx={{ color: COLORS.textPrimary }}>Geschäft:</Typography>
              <Typography variant="body2" fontWeight={600} sx={{ color: COLORS.textPrimary }}>
                {selectedBusiness?.businessName || '-'}
              </Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="body2" sx={{ color: COLORS.textPrimary }}>Zahlungen:</Typography>
              <Typography variant="body2" fontWeight={600} sx={{ fontVariantNumeric: 'tabular-nums', color: COLORS.textPrimary }}>
                {pendingPayments.length}
              </Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="body2" sx={{ color: COLORS.textPrimary }}>Methode:</Typography>
              <Typography variant="body2" fontWeight={600} sx={{ color: COLORS.textPrimary }}>
                {formData.paymentMethod === 'bank_transfer' && 'Banküberweisung'}
                {formData.paymentMethod === 'paypal' && 'PayPal'}
                {formData.paymentMethod === 'stripe' && 'Stripe'}
                {formData.paymentMethod === 'cash' && 'Bar'}
              </Typography>
            </Box>
            <Divider sx={{ my: 1, borderColor: COLORS.border }} />
            <Box display="flex" justifyContent="space-between">
              <Typography variant="body1" fontWeight={600} sx={{ color: COLORS.textHeading }}>
                Gesamtbetrag:
              </Typography>
              <Typography
                variant="h6"
                sx={{ fontWeight: 800, color: COLORS.primary, fontVariantNumeric: 'tabular-nums' }}
              >
                {formatCurrency(Number(formData.amount) || 0)}
              </Typography>
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={handleClose}
          disabled={loading}
          sx={{ textTransform: 'none', fontWeight: 600, borderRadius: RADII.button, color: COLORS.textSecondary }}
        >
          Abbrechen
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading || !formData.businessId || !formData.amount}
          startIcon={loading && <CircularProgress size={16} />}
          sx={{
            background: COLORS.primaryGradient,
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: RADII.button,
            boxShadow: SHADOWS.brand,
            '&:hover': {
              background: COLORS.primaryGradientHover,
              boxShadow: SHADOWS.brandHover
            }
          }}
        >
          {loading ? 'Erstelle...' : 'Auszahlung erstellen'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PayoutCreateDialog;
