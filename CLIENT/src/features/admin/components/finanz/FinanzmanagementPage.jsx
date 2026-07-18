// features/admin/components/finanz/FinanzmanagementPage.jsx
// Finanzmanagement - Monatliche Geschäftsberichte und Rechnungen

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Tooltip,
  TextField,
  MenuItem,
  Button,
  CircularProgress,
  Alert,
  Stack,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider
} from '@mui/material';
import {
  Receipt as InvoiceIcon,
  Download as DownloadIcon,
  Business as BusinessIcon,
  Euro as EuroIcon,
  CalendarMonth as CalendarIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  CheckCircle as PaidIcon,
  Schedule as PendingIcon,
  Visibility as ViewIcon,
  AccountBalance as BankIcon,
  Send as PayoutIcon,
} from '@mui/icons-material';
import { motion, useReducedMotion } from 'framer-motion';
import { COLORS, RADII, SHADOWS } from '../../../../theme/designTokens';
import { monthlyReportService } from '../../services/monthlyReportService';
import { invoiceService } from '../../services/invoiceService';
import { payoutService } from '../../services/payoutService';
import { adminService } from '../../services/adminService';
import { formatCurrency } from '../../utils/exportHelpers';
import { toastSuccessNotify, toastErrorNotify } from '../../../../helper/ToastNotify';

// Pill-Statuschips: weicher Hintergrund + dunkler Text (Admin-Variante)
const CHIP_PALETTES = {
  success: { bg: '#ecfdf5', color: '#059669' },
  warning: { bg: '#fffbeb', color: '#d97706' },
  error: { bg: '#fef2f2', color: '#dc2626' },
  default: { bg: '#f1f5f9', color: '#64748b' },
};

const pillChipSx = (palette = 'default') => {
  const { bg, color } = CHIP_PALETTES[palette] || CHIP_PALETTES.default;
  return {
    borderRadius: '999px',
    bgcolor: bg,
    color,
    fontWeight: 600,
    border: 'none',
    '& .MuiChip-icon': { color },
  };
};

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: RADII.input,
    backgroundColor: COLORS.backgroundLight,
    '&:hover fieldset': { borderColor: COLORS.primary },
    '&.Mui-focused fieldset': { borderColor: COLORS.primary },
  },
  '& .MuiInputLabel-root.Mui-focused': { color: COLORS.primary },
};

const gradientButtonSx = {
  background: COLORS.primaryGradient,
  borderRadius: RADII.button,
  textTransform: 'none',
  fontWeight: 600,
  '&:hover': { background: COLORS.primaryGradientHover },
};

const panelSx = {
  backgroundColor: 'white',
  border: `1px solid ${COLORS.border}`,
  borderRadius: RADII.card,
  boxShadow: SHADOWS.subtle,
};

/**
 * FinanzmanagementPage
 * - Monatliche Geschäftsberichte
 * - Rechnung erstellen / anzeigen
 * - PDF herunterladen
 */
const FinanzmanagementPage = () => {
  const reduceMotion = useReducedMotion();

  // State
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [businessesMap, setBusinessesMap] = useState({});
  const [payouts, setPayouts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear());
  const [monthFilter, setMonthFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Dialog state
  const [selectedReport, setSelectedReport] = useState(null);
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [creatingPayout, setCreatingPayout] = useState(false);

  // Fetch data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [reportResponse, invoiceResponse, businessResponse, payoutResponse] = await Promise.all([
        monthlyReportService.getReports({ limit: 500 }).catch(() => ({ result: [] })),
        invoiceService.getInvoices().catch(() => ({ result: [] })),
        adminService.getAllBusinesses().catch(() => ({ result: [] })),
        payoutService.getBusinessesWithPayouts().catch(() => ({ result: [] })),
      ]);

      setReports(reportResponse?.result || []);
      setInvoices(invoiceResponse?.result || []);

      // Build businessId → business map (includes bankAccount)
      const bMap = {};
      (businessResponse?.result || []).forEach(b => { bMap[b._id] = b; });
      setBusinessesMap(bMap);

      setPayouts(payoutResponse?.result || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toastErrorNotify('Fehler beim Laden der Daten');
    } finally {
      setLoading(false);
    }
  };

  // Get invoice for report (if exists)
  const getInvoiceForReport = (reportId) => {
    return invoices.find(inv => inv.monthlyReportId === reportId);
  };

  // Get bank account for a report's business
  const getBankAccountForReport = (report) => {
    const business = businessesMap[report?.businessId];
    return business?.bankAccount || null;
  };

  // Find payout matching a report's business + period
  const getPayoutForReport = (report) => {
    if (!report || !payouts.length) return null;
    return payouts.find(p =>
      p.businessId === report.businessId || p.businessId?._id === report.businessId
    );
  };

  // Create payout for a report
  const handleCreatePayout = async (report) => {
    if (!report) return;
    try {
      setCreatingPayout(true);
      const startDate = new Date(report.year, report.month - 1, 1).toISOString();
      const endDate = new Date(report.year, report.month, 0).toISOString();

      await payoutService.createPayout({
        businessId: report.businessId,
        amount: report.financials?.businessRevenue || 0,
        paymentMethod: 'bank_transfer',
        periodStart: startDate,
        periodEnd: endDate,
        notes: `Auszahlung ${monthNames[report.month - 1]} ${report.year}`,
      });
      toastSuccessNotify('Auszahlung erstellt');
      await fetchData();
    } catch (error) {
      console.error('Error creating payout:', error);
      toastErrorNotify(error.response?.data?.message || 'Fehler beim Erstellen der Auszahlung');
    } finally {
      setCreatingPayout(false);
    }
  };

  // Mark payout as completed
  const handleCompletePayout = async (payoutId) => {
    if (!payoutId) return;
    try {
      setCreatingPayout(true);
      await payoutService.completePayout(payoutId, {
        transactionReference: `MANUAL-${Date.now()}`,
        notes: 'Manuell überwiesen',
      });
      toastSuccessNotify('Auszahlung als abgeschlossen markiert');
      await fetchData();
    } catch (error) {
      console.error('Error completing payout:', error);
      toastErrorNotify(error.response?.data?.message || 'Fehler beim Abschließen');
    } finally {
      setCreatingPayout(false);
    }
  };

  // Filter reports
  const filteredReports = useMemo(() => {
    let result = [...reports];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(r => 
        r.businessSnapshot?.businessName?.toLowerCase().includes(term)
      );
    }

    // Year filter
    if (yearFilter) {
      result = result.filter(r => r.year === yearFilter);
    }

    // Month filter
    if (monthFilter !== 'all') {
      result = result.filter(r => r.month === parseInt(monthFilter));
    }

    // Sort by date descending
    result.sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    });

    return result;
  }, [reports, searchTerm, yearFilter, monthFilter]);

  // Calculate totals
  const totals = useMemo(() => {
    const filtered = filteredReports;
    return {
      totalRevenue: filtered.reduce((sum, r) => sum + (r.financials?.totalRevenue || 0), 0),
      platformFee: filtered.reduce((sum, r) => sum + (r.financials?.platformFee || 0), 0),
      businessRevenue: filtered.reduce((sum, r) => sum + (r.financials?.businessRevenue || 0), 0),
      reportCount: filtered.length,
      withInvoice: filtered.filter(r => getInvoiceForReport(r._id)).length
    };
  }, [filteredReports, invoices]);

  // Month names
  const monthNames = [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
  ];

  // Handle view/create invoice
  const handleViewInvoice = async (report) => {
    setSelectedReport(report);
    const existingInvoice = getInvoiceForReport(report._id);
    
    if (existingInvoice) {
      // Invoice exists - show dialog with download option
      setInvoiceDialogOpen(true);
    } else {
      // No invoice - create one
      await handleCreateInvoice(report);
    }
  };

  // Create invoice from report
  const handleCreateInvoice = async (report) => {
    try {
      setCreating(true);
      setSelectedReport(report);
      
      const response = await invoiceService.createFromMonthlyReport(report._id);
      
      toastSuccessNotify(`Rechnung erstellt: ${response.result?.rechnungsnummer}`);
      
      // Refresh data
      await fetchData();
      
      // Show dialog
      setInvoiceDialogOpen(true);
      
    } catch (error) {
      console.error('Error creating invoice:', error);
      toastErrorNotify(error.response?.data?.message || 'Fehler beim Erstellen der Rechnung');
    } finally {
      setCreating(false);
    }
  };

  // Download PDF
  const handleDownloadPDF = async () => {
    if (!selectedReport) return;
    
    const invoice = getInvoiceForReport(selectedReport._id);
    if (!invoice) {
      toastErrorNotify('Keine Rechnung gefunden');
      return;
    }
    
    try {
      setDownloading(true);
      await invoiceService.downloadAndSaveInvoice(
        invoice._id,
        `Rechnung_${invoice.rechnungsnummer}.pdf`
      );
      toastSuccessNotify('PDF heruntergeladen');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toastErrorNotify('Fehler beim Herunterladen');
    } finally {
      setDownloading(false);
    }
  };

  // Years for filter
  const availableYears = useMemo(() => {
    const years = [...new Set(reports.map(r => r.year))];
    return years.sort((a, b) => b - a);
  }, [reports]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress sx={{ color: COLORS.primary }} />
      </Box>
    );
  }

  return (
    <Box
      component={motion.div}
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      {/* Header */}
      <Paper
        sx={{
          mb: 3,
          p: 3,
          background: COLORS.primaryGradient,
          borderRadius: RADII.panel,
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ color: 'white', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Finanzmanagement
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mt: 0.5 }}>
            Monatliche Geschäftsberichte und Rechnungen
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={fetchData}
          sx={{
            bgcolor: 'rgba(255,255,255,0.2)',
            color: 'white',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
            borderRadius: RADII.button,
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          Aktualisieren
        </Button>
      </Paper>

      {/* Summary Cards */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={6} sm={3}>
          <Card sx={{ ...panelSx, borderLeft: `3px solid ${COLORS.primary}` }}>
            <CardContent sx={{ py: 2 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>Berichte</Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: COLORS.textHeading, fontVariantNumeric: 'tabular-nums' }}>{totals.reportCount}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card sx={{ ...panelSx, borderLeft: `3px solid ${COLORS.primary}` }}>
            <CardContent sx={{ py: 2 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>Gesamtumsatz</Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: COLORS.primary, fontVariantNumeric: 'tabular-nums' }}>
                {formatCurrency(totals.totalRevenue)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card sx={{ ...panelSx, borderLeft: '3px solid #6366f1' }}>
            <CardContent sx={{ py: 2 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>Plattformgebühr</Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#6366f1', fontVariantNumeric: 'tabular-nums' }}>
                {formatCurrency(totals.platformFee)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card sx={{ ...panelSx, borderLeft: '3px solid #059669' }}>
            <CardContent sx={{ py: 2 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>Geschäftsanteil</Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#059669', fontVariantNumeric: 'tabular-nums' }}>
                {formatCurrency(totals.businessRevenue)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ ...panelSx, p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Geschäft suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={fieldSx}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <TextField
              fullWidth
              size="small"
              select
              label="Jahr"
              value={yearFilter}
              onChange={(e) => setYearFilter(parseInt(e.target.value))}
              sx={fieldSx}
            >
              {availableYears.map(year => (
                <MenuItem key={year} value={year}>{year}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={6} sm={3}>
            <TextField
              fullWidth
              size="small"
              select
              label="Monat"
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              sx={fieldSx}
            >
              <MenuItem value="all">Alle Monate</MenuItem>
              {monthNames.map((name, idx) => (
                <MenuItem key={name} value={idx + 1}>{name}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={2}>
            <Typography variant="body2" color="text.secondary">
              {totals.withInvoice} / {totals.reportCount} mit Rechnung
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Reports Table */}
      <TableContainer component={Paper} sx={{ ...panelSx, overflow: 'hidden' }}>
        <Table>
          <TableHead>
            <TableRow
              sx={{
                bgcolor: COLORS.backgroundLight,
                '& th': { fontWeight: 600, color: COLORS.textSecondary, borderColor: COLORS.border },
              }}
            >
              <TableCell>Geschäft</TableCell>
              <TableCell>Zeitraum</TableCell>
              <TableCell align="right">Umsatz</TableCell>
              <TableCell align="right">Geschäftsanteil</TableCell>
              <TableCell align="center">Rechnung</TableCell>
              <TableCell align="center">Auszahlung</TableCell>
              <TableCell align="center">Aktion</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredReports.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    Keine Berichte gefunden
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredReports
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((report) => {
                  const invoice = getInvoiceForReport(report._id);
                  const hasInvoice = !!invoice;
                  
                  return (
                    <TableRow
                      key={report._id}
                      hover
                      sx={{
                        borderLeft: `3px solid ${hasInvoice ? '#059669' : '#d97706'}`,
                        '& td': { borderColor: COLORS.border },
                        '&:hover': { bgcolor: COLORS.backgroundLight },
                      }}
                    >
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <BusinessIcon fontSize="small" color="action" />
                          <Typography variant="body2" fontWeight={500}>
                            {report.businessSnapshot?.businessName || 'Unbekannt'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <CalendarIcon fontSize="small" color="action" />
                          <Typography variant="body2">
                            {monthNames[report.month - 1]} {report.year}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                          {formatCurrency(report.financials?.totalRevenue || 0)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#059669', fontVariantNumeric: 'tabular-nums' }}>
                          {formatCurrency(report.financials?.businessRevenue || 0)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        {hasInvoice ? (
                          <Chip
                            icon={<PaidIcon fontSize="small" />}
                            label={invoice.rechnungsnummer}
                            size="small"
                            sx={pillChipSx('success')}
                          />
                        ) : (
                          <Chip
                            icon={<PendingIcon fontSize="small" />}
                            label="Ausstehend"
                            size="small"
                            sx={pillChipSx('warning')}
                          />
                        )}
                      </TableCell>
                      <TableCell align="center">
                        {(() => {
                          const payout = getPayoutForReport(report);
                          if (!payout) {
                            return (
                              <Chip
                                icon={<PendingIcon fontSize="small" />}
                                label="Offen"
                                size="small"
                                sx={pillChipSx('warning')}
                              />
                            );
                          }
                          const display = payoutService.getPayoutStatusDisplay(payout.status);
                          return (
                            <Chip
                              icon={payout.status === 'completed' ? <PaidIcon fontSize="small" /> : <PendingIcon fontSize="small" />}
                              label={display.label}
                              size="small"
                              sx={pillChipSx(display.color)}
                            />
                          );
                        })()}
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title={hasInvoice ? "Rechnung anzeigen & PDF" : "Rechnung erstellen"}>
                          <IconButton
                            color={hasInvoice ? "success" : "primary"}
                            onClick={() => handleViewInvoice(report)}
                            disabled={creating}
                          >
                            {hasInvoice ? <DownloadIcon /> : <InvoiceIcon />}
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={filteredReports.length}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 25, 50]}
          labelRowsPerPage="Pro Seite:"
        />
      </TableContainer>

      {/* Invoice Dialog */}
      <Dialog
        open={invoiceDialogOpen}
        onClose={() => setInvoiceDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: RADII.panel, overflow: 'hidden' } }}
      >
        <DialogTitle
          sx={{
            background: COLORS.primaryGradient,
            color: 'white',
            py: 2.5,
          }}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <InvoiceIcon sx={{ color: 'white' }} />
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 800, letterSpacing: '-0.02em' }}>Rechnung</Typography>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedReport && (
            <Box>
              {(() => {
                const invoice = getInvoiceForReport(selectedReport._id);
                
                if (!invoice) {
                  return (
                    <Alert severity="info">
                      Rechnung wird erstellt...
                    </Alert>
                  );
                }
                
                return (
                  <Stack spacing={2}>
                    <Box sx={{ bgcolor: COLORS.backgroundLight, p: 2, borderRadius: RADII.input, border: `1px solid ${COLORS.border}` }}>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">Rechnungsnummer</Typography>
                          <Typography variant="body1" fontWeight={700}>{invoice.rechnungsnummer}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">Status</Typography>
                          <Box>
                            <Chip
                              label={invoice.status}
                              size="small"
                              sx={pillChipSx(invoice.status === 'bezahlt' ? 'success' : 'warning')}
                            />
                          </Box>
                        </Grid>
                      </Grid>
                    </Box>
                    
                    <Divider />
                    
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>Geschäft</Typography>
                      <Typography variant="body2">{invoice.rechnungsempfaenger?.firmenname}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {invoice.rechnungsempfaenger?.strasse}, {invoice.rechnungsempfaenger?.plz} {invoice.rechnungsempfaenger?.ort}
                      </Typography>
                    </Box>
                    
                    <Divider />
                    
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>Leistungszeitraum</Typography>
                      <Typography variant="body2">
                        {monthNames[selectedReport.month - 1]} {selectedReport.year}
                      </Typography>
                    </Box>
                    
                    <Divider />
                    
                    <Box sx={{ backgroundColor: COLORS.accentBoxBg, borderLeft: `3px solid ${COLORS.primary}`, borderRadius: RADII.input, p: 2 }}>
                      <Grid container spacing={2}>
                        <Grid item xs={4}>
                          <Typography variant="caption" color="text.secondary">Netto</Typography>
                          <Typography variant="body1" sx={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(invoice.summen?.nettobetrag)}</Typography>
                        </Grid>
                        <Grid item xs={4}>
                          <Typography variant="caption" color="text.secondary">MwSt (19%)</Typography>
                          <Typography variant="body1" sx={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(invoice.summen?.mehrwertsteuer?.betrag)}</Typography>
                        </Grid>
                        <Grid item xs={4}>
                          <Typography variant="caption" color="text.secondary">Gesamt</Typography>
                          <Typography variant="h6" sx={{ fontWeight: 800, color: COLORS.primary, fontVariantNumeric: 'tabular-nums' }}>
                            {formatCurrency(invoice.summen?.bruttobetrag)}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>

                    <Divider />

                    {/* Bank account info */}
                    {(() => {
                      const bank = getBankAccountForReport(selectedReport);
                      return (
                        <Box>
                          <Box display="flex" alignItems="center" gap={1} mb={1}>
                            <BankIcon fontSize="small" sx={{ color: COLORS.primary }} />
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: COLORS.textHeading }}>Bankverbindung des Inhabers</Typography>
                          </Box>
                          {bank?.iban ? (
                            <Box sx={{ bgcolor: COLORS.backgroundLight, p: 2, borderRadius: RADII.input, border: `1px solid ${COLORS.border}` }}>
                              <Grid container spacing={1.5}>
                                <Grid item xs={6}>
                                  <Typography variant="caption" color="text.secondary">Kontoinhaber</Typography>
                                  <Typography variant="body2" fontWeight={500}>{bank.accountHolder || '—'}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                  <Typography variant="caption" color="text.secondary">Bankname</Typography>
                                  <Typography variant="body2" fontWeight={500}>{bank.bankName || '—'}</Typography>
                                </Grid>
                                <Grid item xs={8}>
                                  <Typography variant="caption" color="text.secondary">IBAN</Typography>
                                  <Typography variant="body2" fontWeight={600} sx={{ fontFamily: 'monospace' }}>{bank.iban}</Typography>
                                </Grid>
                                <Grid item xs={4}>
                                  <Typography variant="caption" color="text.secondary">BIC</Typography>
                                  <Typography variant="body2" fontWeight={500} sx={{ fontFamily: 'monospace' }}>{bank.bic || '—'}</Typography>
                                </Grid>
                              </Grid>
                            </Box>
                          ) : (
                            <Alert severity="warning" sx={{ borderRadius: '12px' }}>
                              Keine Bankverbindung hinterlegt. Der Inhaber muss seine Bankdaten im Profil eingeben.
                            </Alert>
                          )}
                        </Box>
                      );
                    })()}

                    <Divider />

                    {/* Payout actions */}
                    {(() => {
                      const payout = getPayoutForReport(selectedReport);
                      if (payout?.status === 'completed') {
                        return (
                          <Alert icon={<PaidIcon />} severity="success" sx={{ borderRadius: '12px' }}>
                            Auszahlung abgeschlossen — {formatCurrency(payout.amount)}
                            {payout.completedAt && ` am ${new Date(payout.completedAt).toLocaleDateString('de-DE')}`}
                          </Alert>
                        );
                      }
                      if (payout?.status === 'pending' || payout?.status === 'processing') {
                        return (
                          <Box sx={{ textAlign: 'center' }}>
                            <Alert severity="info" sx={{ borderRadius: '12px', mb: 1.5 }}>
                              Auszahlung erstellt — {formatCurrency(payout.amount)} (ausstehend)
                            </Alert>
                            <Button
                              variant="contained"
                              startIcon={creatingPayout ? <CircularProgress size={18} color="inherit" /> : <PaidIcon />}
                              onClick={() => handleCompletePayout(payout._id)}
                              disabled={creatingPayout}
                              sx={{
                                background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                                borderRadius: '12px',
                                textTransform: 'none',
                                fontWeight: 600,
                                '&:hover': { background: 'linear-gradient(135deg, #15803d 0%, #166534 100%)' },
                              }}
                            >
                              Als ausgezahlt markieren
                            </Button>
                          </Box>
                        );
                      }
                      // No payout yet
                      const bank = getBankAccountForReport(selectedReport);
                      return (
                        <Box sx={{ textAlign: 'center' }}>
                          <Button
                            variant="contained"
                            startIcon={creatingPayout ? <CircularProgress size={18} color="inherit" /> : <PayoutIcon />}
                            onClick={() => handleCreatePayout(selectedReport)}
                            disabled={creatingPayout || !bank?.iban}
                            sx={{ ...gradientButtonSx, px: 3 }}
                          >
                            Auszahlung erstellen ({formatCurrency(selectedReport?.financials?.businessRevenue || 0)})
                          </Button>
                          {!bank?.iban && (
                            <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                              Bankverbindung fehlt — Auszahlung nicht möglich
                            </Typography>
                          )}
                        </Box>
                      );
                    })()}
                  </Stack>
                );
              })()}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setInvoiceDialogOpen(false)}
            sx={{ textTransform: 'none', fontWeight: 600, color: COLORS.textSecondary }}
          >
            Schließen
          </Button>
          <Button
            variant="contained"
            startIcon={downloading ? <CircularProgress size={20} color="inherit" /> : <DownloadIcon />}
            onClick={handleDownloadPDF}
            disabled={downloading || !getInvoiceForReport(selectedReport?._id)}
            sx={{ ...gradientButtonSx, px: 3 }}
          >
            PDF herunterladen
          </Button>
        </DialogActions>
      </Dialog>

      {/* Creating indicator */}
      {creating && (
        <Box 
          sx={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            bgcolor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}
        >
          <Paper sx={{ p: 4, textAlign: 'center', borderRadius: RADII.panel }}>
            <CircularProgress sx={{ mb: 2, color: COLORS.primary }} />
            <Typography fontWeight={600} sx={{ color: COLORS.textHeading }}>Rechnung wird erstellt...</Typography>
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default FinanzmanagementPage;
