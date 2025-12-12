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
import { payoutService } from '../../services/payoutService';
import { invoiceService } from '../../services/invoiceService';
import { formatCurrency } from '../../utils/exportHelpers';
import { formatDate } from '../../utils/dateHelpers';
import { toastSuccessNotify, toastErrorNotify } from '../../../../helper/ToastNotify';

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
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <ReceiptIcon color="primary" />
          <Typography variant="h6" fontWeight={600}>
            Rechnung erstellen
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
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
            <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
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
                  <Typography variant="h5" fontWeight={600} color="success.main">
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
            <Paper variant="outlined">
              <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                {completedPayouts.map((payout) => (
                  <ListItem
                    key={payout._id}
                    button
                    selected={selectedPayout?._id === payout._id}
                    onClick={() => handleSelectPayout(payout)}
                    sx={{
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      '&.Mui-selected': {
                        bgcolor: 'primary.50'
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
                            color="success"
                            size="small"
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
                        <Typography variant="h6" fontWeight={600} color="primary">
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
            <Paper variant="outlined" sx={{ p: 2, bgcolor: 'primary.50' }}>
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
                  <Typography variant="h6" fontWeight={600} color="primary">
                    {formatCurrency(selectedPayout.amount)}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Box>
        )}

        {/* Kleinunternehmer Option */}
        <Paper variant="outlined" sx={{ p: 2, mt: 2, bgcolor: 'grey.50' }}>
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

        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>§14 UStG / XRechnung 3.0:</strong> Nach der Erstellung wird die Rechnung automatisch als PDF 
            und XRechnung XML (EN 16931) generiert. Das System ist GoBD-konform mit vollständigem Audit-Log.
          </Typography>
        </Alert>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} disabled={loading}>
          Abbrechen
        </Button>
        <Button
          variant="contained"
          onClick={handleCreateInvoice}
          disabled={loading || !selectedPayout}
          startIcon={loading ? <CircularProgress size={20} /> : <ReceiptIcon />}
        >
          {loading ? 'Erstelle...' : 'Rechnung erstellen'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InvoiceCreateDialog;

