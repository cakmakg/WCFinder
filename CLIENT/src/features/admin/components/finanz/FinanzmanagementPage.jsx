// features/admin/components/finanz/FinanzmanagementPage.jsx
// Basit Finanzmanagement - İşletme Aylık Raporları ve Rechnungen

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
  Visibility as ViewIcon
} from '@mui/icons-material';
import { monthlyReportService } from '../../services/monthlyReportService';
import { invoiceService } from '../../services/invoiceService';
import { formatCurrency } from '../../utils/exportHelpers';
import { toastSuccessNotify, toastErrorNotify } from '../../../../helper/ToastNotify';

/**
 * Basit FinanzmanagementPage
 * - İşletme aylık raporları listesi
 * - Tek tıkla Rechnung oluştur/görüntüle
 * - PDF indir
 */
const FinanzmanagementPage = () => {
  // State
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [invoices, setInvoices] = useState([]);
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

  // Fetch data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch monthly reports
      const reportResponse = await monthlyReportService.getReports({ limit: 500 });
      setReports(reportResponse?.result || []);
      
      // Fetch invoices to check which reports have invoices
      const invoiceResponse = await invoiceService.getInvoices();
      setInvoices(invoiceResponse?.result || []);
      
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
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box mb={3} display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h5" fontWeight={600}>
            💰 Finanzmanagement
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Monatliche Geschäftsberichte und Rechnungen
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchData}
        >
          Aktualisieren
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={6} sm={3}>
          <Card variant="outlined">
            <CardContent sx={{ py: 2 }}>
              <Typography variant="caption" color="text.secondary">Berichte</Typography>
              <Typography variant="h5" fontWeight={600}>{totals.reportCount}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card variant="outlined">
            <CardContent sx={{ py: 2 }}>
              <Typography variant="caption" color="text.secondary">Gesamtumsatz</Typography>
              <Typography variant="h5" fontWeight={600} color="primary.main">
                {formatCurrency(totals.totalRevenue)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card variant="outlined">
            <CardContent sx={{ py: 2 }}>
              <Typography variant="caption" color="text.secondary">Platform Gebühr</Typography>
              <Typography variant="h5" fontWeight={600} color="info.main">
                {formatCurrency(totals.platformFee)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card variant="outlined">
            <CardContent sx={{ py: 2 }}>
              <Typography variant="caption" color="text.secondary">Geschäftsanteil</Typography>
              <Typography variant="h5" fontWeight={600} color="success.main">
                {formatCurrency(totals.businessRevenue)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Geschäft suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
            >
              <MenuItem value="all">Alle Monate</MenuItem>
              {monthNames.map((name, idx) => (
                <MenuItem key={idx} value={idx + 1}>{name}</MenuItem>
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
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.50' }}>
              <TableCell><strong>Geschäft</strong></TableCell>
              <TableCell><strong>Zeitraum</strong></TableCell>
              <TableCell align="right"><strong>Umsatz</strong></TableCell>
              <TableCell align="right"><strong>Geschäftsanteil</strong></TableCell>
              <TableCell align="center"><strong>Rechnung</strong></TableCell>
              <TableCell align="center"><strong>Aktion</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredReports.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
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
                    <TableRow key={report._id} hover>
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
                        <Typography variant="body2" fontWeight={500}>
                          {formatCurrency(report.financials?.totalRevenue || 0)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={600} color="success.main">
                          {formatCurrency(report.financials?.businessRevenue || 0)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        {hasInvoice ? (
                          <Chip
                            icon={<PaidIcon fontSize="small" />}
                            label={invoice.rechnungsnummer}
                            size="small"
                            color="success"
                            variant="outlined"
                          />
                        ) : (
                          <Chip
                            icon={<PendingIcon fontSize="small" />}
                            label="Ausstehend"
                            size="small"
                            color="warning"
                            variant="outlined"
                          />
                        )}
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
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <InvoiceIcon color="primary" />
            <Typography variant="h6">Rechnung</Typography>
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
                    <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1 }}>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">Rechnungsnummer</Typography>
                          <Typography variant="body1" fontWeight={600}>{invoice.rechnungsnummer}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">Status</Typography>
                          <Box>
                            <Chip 
                              label={invoice.status} 
                              size="small" 
                              color={invoice.status === 'bezahlt' ? 'success' : 'warning'}
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
                    
                    <Box sx={{ bgcolor: 'primary.50', p: 2, borderRadius: 1 }}>
                      <Grid container spacing={2}>
                        <Grid item xs={4}>
                          <Typography variant="caption" color="text.secondary">Netto</Typography>
                          <Typography variant="body1">{formatCurrency(invoice.summen?.nettobetrag)}</Typography>
                        </Grid>
                        <Grid item xs={4}>
                          <Typography variant="caption" color="text.secondary">MwSt (19%)</Typography>
                          <Typography variant="body1">{formatCurrency(invoice.summen?.mehrwertsteuer?.betrag)}</Typography>
                        </Grid>
                        <Grid item xs={4}>
                          <Typography variant="caption" color="text.secondary">Gesamt</Typography>
                          <Typography variant="h6" fontWeight={700} color="primary.main">
                            {formatCurrency(invoice.summen?.bruttobetrag)}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  </Stack>
                );
              })()}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setInvoiceDialogOpen(false)}>
            Schließen
          </Button>
          <Button
            variant="contained"
            startIcon={downloading ? <CircularProgress size={20} /> : <DownloadIcon />}
            onClick={handleDownloadPDF}
            disabled={downloading || !getInvoiceForReport(selectedReport?._id)}
          >
            PDF Herunterladen
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
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <CircularProgress sx={{ mb: 2 }} />
            <Typography>Rechnung wird erstellt...</Typography>
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default FinanzmanagementPage;
