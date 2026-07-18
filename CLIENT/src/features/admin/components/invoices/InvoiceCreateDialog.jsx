// features/admin/components/invoices/InvoiceCreateDialog.jsx
// Dialog for creating invoices from payouts

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Grid,
  Divider,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Checkbox,
  Chip,
  FormControlLabel,
  Switch
} from '@mui/material';
import {
  Receipt as ReceiptIcon,
  Business as BusinessIcon,
  Euro as EuroIcon
} from '@mui/icons-material';
import { COLORS, RADII } from '../../../../theme/designTokens';
import { payoutService } from '../../services/payoutService';
import { invoiceService } from '../../services/invoiceService';
import { formatCurrency } from '../../utils/exportHelpers';
import { formatDate } from '../../utils/dateHelpers';
import { toastErrorNotify } from '../../../../helper/ToastNotify';

const gradientButtonSx = {
  background: COLORS.primaryGradient,
  borderRadius: RADII.button,
  textTransform: 'none',
  fontWeight: 600,
  '&:hover': { background: COLORS.primaryGradientHover },
};

/**
 * InvoiceCreateDialog Component
 * Create invoice from completed payout
 */
const InvoiceCreateDialog = ({ open, onClose, onSuccess, payoutData = null }) => {
  // State
  const [loading, setLoading] = useState(false);
  const [payoutsLoading, setPayoutsLoading] = useState(true);
  const [completedPayouts, setCompletedPayouts] = useState([]);
  const [selectedPayout, setSelectedPayout] = useState(null);
  const [error, setError] = useState(null);
  const [kleinunternehmer, setKleinunternehmer] = useState(false);

  // Fetch completed payouts without invoices
  useEffect(() => {
    if (open) {
      if (payoutData) {
        setSelectedPayout(payoutData);
        setPayoutsLoading(false);
      } else {
        fetchCompletedPayouts();
      }
    }
  }, [open, payoutData]);

  const fetchCompletedPayouts = async () => {
    try {
      setPayoutsLoading(true);
      setError(null);
      
      const response = await payoutService.getBusinessesWithPayouts();
      const payouts = response?.result || response?.data || response || [];
      
      // Filter to completed payouts without invoices
      const completedWithoutInvoice = payouts.filter(
        p => p.status === 'completed' && !p.invoiceId
      );
      
      setCompletedPayouts(Array.isArray(completedWithoutInvoice) ? completedWithoutInvoice : []);
    } catch (err) {
      console.error('Error fetching payouts:', err);
      setError('Fehler beim Laden der Auszahlungen');
    } finally {
      setPayoutsLoading(false);
    }
  };

  const handleSelectPayout = (payout) => {
    setSelectedPayout(payout);
  };

  const handleCreateInvoice = async () => {
    if (!selectedPayout) {
      toastErrorNotify('Bitte wählen Sie eine Auszahlung aus');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await invoiceService.createInvoiceForPayout(selectedPayout._id, {
        kleinunternehmer
      });
      
      onSuccess?.();
      handleClose();
    } catch (err) {
      console.error('Error creating invoice:', err);
      setError(err.response?.data?.message || 'Fehler beim Erstellen der Rechnung');
      toastErrorNotify('Fehler beim Erstellen der Rechnung');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedPayout(null);
    setError(null);
    setKleinunternehmer(false);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: RADII.panel }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <ReceiptIcon sx={{ color: COLORS.primary }} />
          <Typography variant="h6" sx={{ fontWeight: 800, color: COLORS.textHeading, letterSpacing: '-0.02em' }}>
            Rechnung erstellen
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: RADII.input }}>
            {error}
          </Alert>
        )}

        {payoutsLoading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : payoutData ? (
          // Show selected payout info
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Rechnung wird erstellt für:
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: RADII.input, borderColor: COLORS.border }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <BusinessIcon color="primary" fontSize="small" />
                    <Typography variant="subtitle2">Geschäft</Typography>
                  </Box>
                  <Typography variant="body1" fontWeight={600}>
                    {payoutData.business?.name || payoutData.businessName || '-'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <EuroIcon color="success" fontSize="small" />
                    <Typography variant="subtitle2">Betrag</Typography>
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: '#059669', fontVariantNumeric: 'tabular-nums' }}>
                    {formatCurrency(payoutData.amount)}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="caption" color="text.secondary">
                    Zeitraum: {formatDate(payoutData.period?.startDate)} - {formatDate(payoutData.period?.endDate)}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Box>
        ) : completedPayouts.length === 0 ? (
          <Alert severity="info">
            Keine abgeschlossenen Auszahlungen ohne Rechnung gefunden.
          </Alert>
        ) : (
          // Show list of available payouts
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Wählen Sie eine abgeschlossene Auszahlung:
            </Typography>
            <Paper variant="outlined" sx={{ borderRadius: RADII.input, borderColor: COLORS.border, overflow: 'hidden' }}>
              <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                {completedPayouts.map((payout) => (
                  <ListItem
                    key={payout._id}
                    button
                    selected={selectedPayout?._id === payout._id}
                    onClick={() => handleSelectPayout(payout)}
                    sx={{
                      borderBottom: '1px solid',
                      borderColor: COLORS.border,
                      '&:hover': { bgcolor: COLORS.backgroundLight },
                      '&.Mui-selected': {
                        bgcolor: COLORS.accentBoxBg
                      }
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="body1" fontWeight={600}>
                            {payout.business?.name || 'Unbekanntes Geschäft'}
                          </Typography>
                          <Chip
                            label="Abgeschlossen"
                            size="small"
                            sx={{ borderRadius: '999px', bgcolor: '#ecfdf5', color: '#059669', fontWeight: 600 }}
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {formatDate(payout.period?.startDate)} - {formatDate(payout.period?.endDate)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Zahlungsmethode: {payoutService.getPaymentMethodDisplay(payout.paymentMethod)}
                          </Typography>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Box textAlign="right">
                        <Typography variant="h6" sx={{ fontWeight: 700, color: COLORS.primary, fontVariantNumeric: 'tabular-nums' }}>
                          {formatCurrency(payout.amount)}
                        </Typography>
                        <Checkbox
                          checked={selectedPayout?._id === payout._id}
                          onChange={() => handleSelectPayout(payout)}
                        />
                      </Box>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Box>
        )}

        {selectedPayout && !payoutData && (
          <Box mt={2}>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="subtitle2" gutterBottom>
              Ausgewählte Auszahlung:
            </Typography>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                bgcolor: COLORS.accentBoxBg,
                borderColor: COLORS.border,
                borderLeft: `3px solid ${COLORS.primary}`,
                borderRadius: RADII.input,
              }}
            >
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Geschäft
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {selectedPayout.business?.name || '-'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Betrag
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: COLORS.primary, fontVariantNumeric: 'tabular-nums' }}>
                    {formatCurrency(selectedPayout.amount)}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Box>
        )}

        {/* Kleinunternehmer Option */}
        <Paper variant="outlined" sx={{ p: 2, mt: 2, bgcolor: COLORS.backgroundLight, borderColor: COLORS.border, borderRadius: RADII.input }}>
          <FormControlLabel
            control={
              <Switch
                checked={kleinunternehmer}
                onChange={(e) => setKleinunternehmer(e.target.checked)}
                color="primary"
              />
            }
            label={
              <Box>
                <Typography variant="body2" fontWeight={500}>
                  §19 UStG Kleinunternehmerregelung
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Keine Umsatzsteuer berechnen (für Kleinunternehmer)
                </Typography>
              </Box>
            }
          />
        </Paper>

        <Alert severity="info" sx={{ mt: 2, borderRadius: RADII.input }}>
          <Typography variant="body2">
            <strong>§14 UStG / XRechnung 3.0:</strong> Nach der Erstellung wird die Rechnung automatisch als PDF 
            und XRechnung XML (EN 16931) generiert. Das System ist GoBD-konform mit vollständigem Audit-Log.
          </Typography>
        </Alert>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button
          onClick={handleClose}
          disabled={loading}
          sx={{ textTransform: 'none', fontWeight: 600, color: COLORS.textSecondary }}
        >
          Abbrechen
        </Button>
        <Button
          variant="contained"
          onClick={handleCreateInvoice}
          disabled={loading || !selectedPayout}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <ReceiptIcon />}
          sx={{ ...gradientButtonSx, px: 3 }}
        >
          {loading ? 'Erstelle...' : 'Rechnung erstellen'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InvoiceCreateDialog;

