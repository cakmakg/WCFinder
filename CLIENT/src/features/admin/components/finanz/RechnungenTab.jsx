// features/admin/components/finanz/RechnungenTab.jsx
// Split View Rechnungen Tab - List on left, Detail on right

import React, { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Chip,
  IconButton,
  Tooltip,
  TextField,
  MenuItem,
  InputAdornment,
  Divider,
  Button,
  Stack,
  Card,
  CardContent,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Search as SearchIcon,
  Download as DownloadIcon,
  Code as XmlIcon,
  Email as EmailIcon,
  Payment as PaymentIcon,
  CheckCircle as PaidIcon,
  Warning as OverdueIcon,
  Schedule as PendingIcon,
  Edit as DraftIcon,
  Visibility as ViewedIcon,
  Cancel as CancelledIcon,
  Receipt as InvoiceIcon,
  Business as BusinessIcon,
  Euro as EuroIcon,
  CalendarMonth as CalendarIcon,
  AccountBalance as BankIcon
} from '@mui/icons-material';
import { invoiceService } from '../../services/invoiceService';
import { formatCurrency } from '../../utils/exportHelpers';
import { formatDate } from '../../utils/dateHelpers';
import { toastSuccessNotify, toastErrorNotify } from '../../../../helper/ToastNotify';

/**
 * RechnungenTab Component
 * Split view: Invoice list on left, detail on right
 */
const RechnungenTab = ({ invoices, onRefresh }) => {
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    betrag: '',
    zahlungsmethode: 'bank_transfer',
    transaktionsreferenz: '',
    zahlungsdatum: new Date().toISOString().split('T')[0],
    notizen: ''
  });

  // Filter invoices
  const filteredInvoices = useMemo(() => {
    let result = [...invoices];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(inv => 
        inv.rechnungsnummer?.toLowerCase().includes(term) ||
        inv.rechnungsempfaenger?.firmenname?.toLowerCase().includes(term)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(inv => inv.status === statusFilter);
    }

    // Sort by date descending
    result.sort((a, b) => new Date(b.rechnungsdatum) - new Date(a.rechnungsdatum));

    return result;
  }, [invoices, searchTerm, statusFilter]);

  // Get status info
  const getStatusInfo = (status) => {
    const statusMap = {
      entwurf: { label: 'Entwurf', color: 'default', icon: DraftIcon },
      versendet: { label: 'Versendet', color: 'info', icon: PendingIcon },
      angesehen: { label: 'Angesehen', color: 'info', icon: ViewedIcon },
      teilbezahlt: { label: 'Teilbezahlt', color: 'warning', icon: PaymentIcon },
      bezahlt: { label: 'Bezahlt', color: 'success', icon: PaidIcon },
      ueberfaellig: { label: 'Überfällig', color: 'error', icon: OverdueIcon },
      storniert: { label: 'Storniert', color: 'default', icon: CancelledIcon },
      mahnung: { label: 'Mahnung', color: 'error', icon: OverdueIcon }
    };
    return statusMap[status] || { label: status, color: 'default', icon: InvoiceIcon };
  };

  // Handle download PDF
  const handleDownloadPDF = async (invoice) => {
    try {
      await invoiceService.downloadAndSaveInvoice(
        invoice._id,
        `Rechnung_${invoice.rechnungsnummer}.pdf`
      );
      toastSuccessNotify('PDF heruntergeladen');
    } catch (error) {
      toastErrorNotify('Fehler beim Herunterladen');
    }
  };

  // Handle download XRechnung
  const handleDownloadXRechnung = async (invoice) => {
    try {
      await invoiceService.downloadXRechnung(
        invoice._id,
        `XRechnung_${invoice.rechnungsnummer}.xml`
      );
      toastSuccessNotify('XRechnung XML heruntergeladen');
    } catch (error) {
      toastErrorNotify('Fehler beim Herunterladen');
    }
  };

  // Handle open payment dialog
  const handleOpenPaymentDialog = () => {
    if (!selectedInvoice) return;
    setPaymentForm({
      betrag: selectedInvoice.offenerBetrag || selectedInvoice.summen?.bruttobetrag || '',
      zahlungsmethode: 'bank_transfer',
      transaktionsreferenz: '',
      zahlungsdatum: new Date().toISOString().split('T')[0],
      notizen: ''
    });
    setPaymentDialogOpen(true);
  };

  // Handle record payment
  const handleRecordPayment = async () => {
    if (!selectedInvoice || !paymentForm.betrag) {
      toastErrorNotify('Bitte geben Sie einen Betrag ein');
      return;
    }

    try {
      setPaymentLoading(true);
      const result = await invoiceService.recordPayment(selectedInvoice._id, {
        betrag: parseFloat(paymentForm.betrag),
        zahlungsmethode: paymentForm.zahlungsmethode,
        transaktionsreferenz: paymentForm.transaktionsreferenz,
        zahlungsdatum: paymentForm.zahlungsdatum,
        notizen: paymentForm.notizen
      });

      if (result.payout) {
        toastSuccessNotify(`Zahlung erfasst! Auszahlung erstellt.`);
      } else {
        toastSuccessNotify(`Teilzahlung erfasst.`);
      }

      setPaymentDialogOpen(false);
      setSelectedInvoice(null);
      onRefresh();
    } catch (error) {
      toastErrorNotify(error.response?.data?.message || 'Fehler beim Erfassen');
    } finally {
      setPaymentLoading(false);
    }
  };

  return (
    <Box>
      <Grid container spacing={2}>
        {/* Left Panel - Invoice List */}
        <Grid item xs={12} md={5} lg={4}>
          <Paper sx={{ height: 'calc(100vh - 380px)', display: 'flex', flexDirection: 'column' }}>
            {/* Filters */}
            <Box p={2} borderBottom={1} borderColor="divider">
              <TextField
                fullWidth
                size="small"
                placeholder="Suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  )
                }}
                sx={{ mb: 1 }}
              />
              <TextField
                fullWidth
                size="small"
                select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">Alle Status</MenuItem>
                <MenuItem value="entwurf">Entwurf</MenuItem>
                <MenuItem value="versendet">Versendet</MenuItem>
                <MenuItem value="teilbezahlt">Teilbezahlt</MenuItem>
                <MenuItem value="bezahlt">Bezahlt</MenuItem>
                <MenuItem value="ueberfaellig">Überfällig</MenuItem>
                <MenuItem value="storniert">Storniert</MenuItem>
              </TextField>
            </Box>

            {/* Invoice List */}
            <Box sx={{ flex: 1, overflow: 'auto' }}>
              <List dense disablePadding>
                {filteredInvoices.length === 0 ? (
                  <Box p={4} textAlign="center">
                    <Typography color="text.secondary">
                      Keine Rechnungen gefunden
                    </Typography>
                  </Box>
                ) : (
                  filteredInvoices.map((invoice) => {
                    const statusInfo = getStatusInfo(invoice.status);
                    const StatusIcon = statusInfo.icon;
                    const isSelected = selectedInvoice?._id === invoice._id;

                    return (
                      <ListItem 
                        key={invoice._id} 
                        disablePadding
                        sx={{
                          borderBottom: 1,
                          borderColor: 'divider',
                          bgcolor: isSelected ? 'primary.50' : 'transparent'
                        }}
                      >
                        <ListItemButton 
                          onClick={() => setSelectedInvoice(invoice)}
                          selected={isSelected}
                        >
                          <Box sx={{ width: '100%' }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                              <Typography variant="body2" fontWeight={600}>
                                {invoice.rechnungsnummer}
                              </Typography>
                              <Chip
                                icon={<StatusIcon sx={{ fontSize: 14 }} />}
                                label={statusInfo.label}
                                size="small"
                                color={statusInfo.color}
                                sx={{ height: 20, fontSize: '0.7rem' }}
                              />
                            </Box>
                            <Typography variant="caption" color="text.secondary" display="block">
                              {invoice.rechnungsempfaenger?.firmenname}
                            </Typography>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mt={0.5}>
                              <Typography variant="caption" color="text.secondary">
                                {formatDate(invoice.rechnungsdatum)}
                              </Typography>
                              <Typography variant="body2" fontWeight={600} color="primary.main">
                                {formatCurrency(invoice.summen?.bruttobetrag)}
                              </Typography>
                            </Box>
                          </Box>
                        </ListItemButton>
                      </ListItem>
                    );
                  })
                )}
              </List>
            </Box>

            {/* List Footer */}
            <Box p={1} borderTop={1} borderColor="divider" bgcolor="grey.50">
              <Typography variant="caption" color="text.secondary">
                {filteredInvoices.length} von {invoices.length} Rechnungen
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Right Panel - Invoice Detail */}
        <Grid item xs={12} md={7} lg={8}>
          <Paper sx={{ height: 'calc(100vh - 380px)', overflow: 'auto' }}>
            {!selectedInvoice ? (
              <Box 
                display="flex" 
                flexDirection="column"
                alignItems="center" 
                justifyContent="center" 
                height="100%"
                color="text.secondary"
              >
                <InvoiceIcon sx={{ fontSize: 64, mb: 2, opacity: 0.3 }} />
                <Typography variant="h6">
                  Wählen Sie eine Rechnung
                </Typography>
                <Typography variant="body2">
                  Klicken Sie auf eine Rechnung in der Liste
                </Typography>
              </Box>
            ) : (
              <Box p={3}>
                {/* Header */}
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
                  <Box>
                    <Typography variant="h5" fontWeight={700}>
                      {selectedInvoice.rechnungsnummer}
                    </Typography>
                    <Chip
                      icon={React.createElement(getStatusInfo(selectedInvoice.status).icon, { fontSize: 'small' })}
                      label={getStatusInfo(selectedInvoice.status).label}
                      color={getStatusInfo(selectedInvoice.status).color}
                      sx={{ mt: 1 }}
                    />
                  </Box>
                  <Stack direction="row" spacing={1}>
                    <Tooltip title="PDF herunterladen">
                      <IconButton onClick={() => handleDownloadPDF(selectedInvoice)}>
                        <DownloadIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="XRechnung XML">
                      <IconButton color="info" onClick={() => handleDownloadXRechnung(selectedInvoice)}>
                        <XmlIcon />
                      </IconButton>
                    </Tooltip>
                    {!['bezahlt', 'storniert'].includes(selectedInvoice.status) && (
                      <Button
                        variant="contained"
                        color="success"
                        startIcon={<PaymentIcon />}
                        onClick={handleOpenPaymentDialog}
                      >
                        Zahlung erfassen
                      </Button>
                    )}
                  </Stack>
                </Box>

                <Grid container spacing={3}>
                  {/* Business Info */}
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box display="flex" alignItems="center" gap={1} mb={2}>
                          <BusinessIcon color="primary" />
                          <Typography variant="subtitle1" fontWeight={600}>
                            Rechnungsempfänger
                          </Typography>
                        </Box>
                        <Typography variant="body1" fontWeight={600}>
                          {selectedInvoice.rechnungsempfaenger?.firmenname}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {selectedInvoice.rechnungsempfaenger?.strasse}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {selectedInvoice.rechnungsempfaenger?.plz} {selectedInvoice.rechnungsempfaenger?.ort}
                        </Typography>
                        {selectedInvoice.rechnungsempfaenger?.ustIdNr && (
                          <Typography variant="caption" color="text.secondary">
                            USt-IdNr: {selectedInvoice.rechnungsempfaenger.ustIdNr}
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Invoice Dates */}
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box display="flex" alignItems="center" gap={1} mb={2}>
                          <CalendarIcon color="primary" />
                          <Typography variant="subtitle1" fontWeight={600}>
                            Termine
                          </Typography>
                        </Box>
                        <Table size="small">
                          <TableBody>
                            <TableRow>
                              <TableCell sx={{ border: 0, pl: 0 }}>Rechnungsdatum:</TableCell>
                              <TableCell sx={{ border: 0, fontWeight: 600 }}>
                                {formatDate(selectedInvoice.rechnungsdatum)}
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell sx={{ border: 0, pl: 0 }}>Leistungszeitraum:</TableCell>
                              <TableCell sx={{ border: 0, fontWeight: 600 }}>
                                {formatDate(selectedInvoice.leistungszeitraum?.von)} - {formatDate(selectedInvoice.leistungszeitraum?.bis)}
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell sx={{ border: 0, pl: 0 }}>Fällig am:</TableCell>
                              <TableCell sx={{ border: 0, fontWeight: 600 }}>
                                {formatDate(selectedInvoice.zahlungsbedingungen?.faelligkeitsdatum)}
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Amounts */}
                  <Grid item xs={12}>
                    <Card variant="outlined" sx={{ bgcolor: 'primary.50' }}>
                      <CardContent>
                        <Box display="flex" alignItems="center" gap={1} mb={2}>
                          <EuroIcon color="primary" />
                          <Typography variant="subtitle1" fontWeight={600}>
                            Beträge
                          </Typography>
                        </Box>
                        <Grid container spacing={2}>
                          <Grid item xs={4}>
                            <Typography variant="caption" color="text.secondary">Nettobetrag</Typography>
                            <Typography variant="h6" fontWeight={600}>
                              {formatCurrency(selectedInvoice.summen?.nettobetrag)}
                            </Typography>
                          </Grid>
                          <Grid item xs={4}>
                            <Typography variant="caption" color="text.secondary">
                              MwSt ({selectedInvoice.summen?.mehrwertsteuer?.satz || 19}%)
                            </Typography>
                            <Typography variant="h6" fontWeight={600}>
                              {formatCurrency(selectedInvoice.summen?.mehrwertsteuer?.betrag)}
                            </Typography>
                          </Grid>
                          <Grid item xs={4}>
                            <Typography variant="caption" color="text.secondary">Gesamtbetrag</Typography>
                            <Typography variant="h5" fontWeight={700} color="primary.main">
                              {formatCurrency(selectedInvoice.summen?.bruttobetrag)}
                            </Typography>
                          </Grid>
                        </Grid>
                        
                        {selectedInvoice.bezahlterBetrag > 0 && (
                          <>
                            <Divider sx={{ my: 2 }} />
                            <Grid container spacing={2}>
                              <Grid item xs={4}>
                                <Typography variant="caption" color="success.main">Bereits bezahlt</Typography>
                                <Typography variant="h6" fontWeight={600} color="success.main">
                                  {formatCurrency(selectedInvoice.bezahlterBetrag)}
                                </Typography>
                              </Grid>
                              <Grid item xs={4}>
                                <Typography variant="caption" color="warning.main">Offener Betrag</Typography>
                                <Typography variant="h6" fontWeight={600} color="warning.main">
                                  {formatCurrency(selectedInvoice.offenerBetrag || 0)}
                                </Typography>
                              </Grid>
                            </Grid>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Bank Info */}
                  <Grid item xs={12}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box display="flex" alignItems="center" gap={1} mb={2}>
                          <BankIcon color="primary" />
                          <Typography variant="subtitle1" fontWeight={600}>
                            Bankverbindung
                          </Typography>
                        </Box>
                        <Typography variant="body2">
                          <strong>IBAN:</strong> {selectedInvoice.zahlungsbedingungen?.bankverbindung?.iban}
                        </Typography>
                        <Typography variant="body2">
                          <strong>BIC:</strong> {selectedInvoice.zahlungsbedingungen?.bankverbindung?.bic}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Verwendungszweck:</strong> {selectedInvoice.rechnungsnummer}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Payout Info */}
                  {selectedInvoice.payoutId && (
                    <Grid item xs={12}>
                      <Alert severity="success" icon={<PaidIcon />}>
                        <Typography variant="body2">
                          <strong>Auszahlung erstellt:</strong> {selectedInvoice.payoutId}
                        </Typography>
                      </Alert>
                    </Grid>
                  )}
                </Grid>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onClose={() => setPaymentDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <PaymentIcon color="success" />
            <Typography variant="h6">Zahlung erfassen</Typography>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedInvoice && (
            <Stack spacing={3} sx={{ mt: 1 }}>
              <Alert severity="info">
                <Typography variant="body2">
                  <strong>Rechnung:</strong> {selectedInvoice.rechnungsnummer}<br />
                  <strong>Gesamtbetrag:</strong> {formatCurrency(selectedInvoice.summen?.bruttobetrag)}<br />
                  <strong>Offener Betrag:</strong> {formatCurrency(selectedInvoice.offenerBetrag || selectedInvoice.summen?.bruttobetrag)}
                </Typography>
              </Alert>

              <TextField
                fullWidth
                label="Zahlungsbetrag *"
                type="number"
                value={paymentForm.betrag}
                onChange={(e) => setPaymentForm(prev => ({ ...prev, betrag: e.target.value }))}
                InputProps={{
                  startAdornment: <InputAdornment position="start">€</InputAdornment>,
                }}
              />

              <FormControl fullWidth>
                <InputLabel>Zahlungsmethode</InputLabel>
                <Select
                  value={paymentForm.zahlungsmethode}
                  label="Zahlungsmethode"
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, zahlungsmethode: e.target.value }))}
                >
                  <MenuItem value="bank_transfer">Banküberweisung</MenuItem>
                  <MenuItem value="cash">Bargeld</MenuItem>
                  <MenuItem value="credit_card">Kreditkarte</MenuItem>
                  <MenuItem value="paypal">PayPal</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Transaktionsreferenz"
                value={paymentForm.transaktionsreferenz}
                onChange={(e) => setPaymentForm(prev => ({ ...prev, transaktionsreferenz: e.target.value }))}
                placeholder="z.B. SEPA Referenz"
              />

              <TextField
                fullWidth
                label="Zahlungsdatum"
                type="date"
                value={paymentForm.zahlungsdatum}
                onChange={(e) => setPaymentForm(prev => ({ ...prev, zahlungsdatum: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                fullWidth
                label="Notizen"
                multiline
                rows={2}
                value={paymentForm.notizen}
                onChange={(e) => setPaymentForm(prev => ({ ...prev, notizen: e.target.value }))}
              />

              <Alert severity="success" icon={<BankIcon />}>
                Bei vollständiger Zahlung wird automatisch eine Auszahlung (Payout) erstellt.
              </Alert>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setPaymentDialogOpen(false)}>Abbrechen</Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleRecordPayment}
            disabled={paymentLoading || !paymentForm.betrag}
            startIcon={paymentLoading ? <CircularProgress size={20} /> : <PaymentIcon />}
          >
            {paymentLoading ? 'Verarbeite...' : 'Zahlung erfassen'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RechnungenTab;

