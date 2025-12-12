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
import { payoutService } from '../../services/payoutService';
import { formatCurrency } from '../../utils/exportHelpers';
import { formatDate } from '../../utils/dateHelpers';
import { toastSuccessNotify, toastErrorNotify } from '../../../../helper/ToastNotify';

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
        amount: businessData.totalAmount.toFixed(2)
      }));
      setSelectedBusiness({
        _id: businessData.businessId,
        name: businessData.businessName
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
      const data = await payoutService.getBusinessesWithPayouts();
      setBusinesses(data.businesses || []);
    } catch (error) {
      console.error('Error fetching businesses:', error);
      toastErrorNotify('Fehler beim Laden der Geschäfte');
    }
  };

  // Handle business selection
  const handleBusinessSelect = async (event, value) => {
    setSelectedBusiness(value);
    setFormData(prev => ({
      ...prev,
      businessId: value?._id || ''
    }));

    if (value?._id) {
      try {
        const data = await payoutService.getPendingPayoutsByBusiness(value._id);
        setPendingPayments(data.pendingPayments || []);

        // Calculate total amount
        const total = data.pendingPayments.reduce(
          (sum, payment) => sum + (Number(payment.businessFee) || 0),
          0
        );
        setFormData(prev => ({
          ...prev,
          amount: total.toFixed(2)
        }));
      } catch (error) {
        console.error('Error fetching pending payments:', error);
        setPendingPayments([]);
      }
    } else {
      setPendingPayments([]);
      setFormData(prev => ({
        ...prev,
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
        description: formData.description || undefined,
        referenceNumber: formData.referenceNumber || undefined,
        paymentIds: pendingPayments.map(p => p._id)
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
    >
      <DialogTitle>
        <Typography variant="h6" fontWeight={600}>
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
              getOptionLabel={(option) => option.name || ''}
              disabled={!!businessData || loading}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Geschäft auswählen *"
                  error={!!errors.businessId}
                  helperText={errors.businessId}
                />
              )}
              renderOption={(props, option) => (
                <Box component="li" {...props}>
                  <Box>
                    <Typography variant="body1">{option.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {option.address?.street}, {option.address?.city}
                    </Typography>
                  </Box>
                </Box>
              )}
            />
          </FormControl>

          {/* Pending Payments Info */}
          {pendingPayments.length > 0 && (
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2" fontWeight={600} gutterBottom>
                Ausstehende Zahlungen: {pendingPayments.length}
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" mt={1}>
                {pendingPayments.slice(0, 5).map((payment) => (
                  <Chip
                    key={payment._id}
                    label={`${formatCurrency(payment.businessFee)} - ${formatDate(payment.createdAt)}`}
                    size="small"
                    variant="outlined"
                  />
                ))}
                {pendingPayments.length > 5 && (
                  <Chip
                    label={`+${pendingPayments.length - 5} weitere`}
                    size="small"
                    variant="outlined"
                  />
                )}
              </Stack>
            </Alert>
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
              startAdornment: <Typography sx={{ mr: 1 }}>€</Typography>
            }}
            inputProps={{
              min: 0,
              step: 0.01
            }}
            sx={{ mb: 3 }}
          />

          {/* Payment Method */}
          <FormControl fullWidth sx={{ mb: 3 }}>
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
            sx={{ mb: 3 }}
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
          />

          <Divider sx={{ my: 3 }} />

          {/* Summary */}
          <Box
            sx={{
              bgcolor: 'grey.50',
              p: 2,
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Zusammenfassung
            </Typography>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="body2">Geschäft:</Typography>
              <Typography variant="body2" fontWeight={600}>
                {selectedBusiness?.name || '-'}
              </Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="body2">Zahlungen:</Typography>
              <Typography variant="body2" fontWeight={600}>
                {pendingPayments.length}
              </Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="body2">Methode:</Typography>
              <Typography variant="body2" fontWeight={600}>
                {formData.paymentMethod === 'bank_transfer' && 'Banküberweisung'}
                {formData.paymentMethod === 'paypal' && 'PayPal'}
                {formData.paymentMethod === 'stripe' && 'Stripe'}
                {formData.paymentMethod === 'cash' && 'Bar'}
              </Typography>
            </Box>
            <Divider sx={{ my: 1 }} />
            <Box display="flex" justifyContent="space-between">
              <Typography variant="body1" fontWeight={600}>
                Gesamtbetrag:
              </Typography>
              <Typography variant="h6" color="primary" fontWeight={600}>
                {formatCurrency(Number(formData.amount) || 0)}
              </Typography>
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={loading}>
          Abbrechen
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading || !formData.businessId || !formData.amount}
          startIcon={loading && <CircularProgress size={16} />}
        >
          {loading ? 'Erstelle...' : 'Auszahlung erstellen'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PayoutCreateDialog;
