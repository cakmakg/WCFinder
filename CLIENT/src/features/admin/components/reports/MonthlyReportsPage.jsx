// features/admin/components/reports/MonthlyReportsPage.jsx
// Monthly Reports Management Page - View, Generate, Export

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Alert,
  CircularProgress,
  Tooltip,
  Divider,
  Stack,
  LinearProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Business as BusinessIcon,
  CalendarMonth as CalendarIcon,
  Euro as EuroIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Description as ReportIcon,
  PlaylistAddCheck as BulkIcon,
  Receipt as ReceiptIcon
} from '@mui/icons-material';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { COLORS, RADII, SHADOWS } from '../../../../theme/designTokens';
import { monthlyReportService } from '../../services/monthlyReportService';
import { adminService } from '../../services/adminService';
import { exportService } from '../../services/exportService';
import { invoiceService } from '../../services/invoiceService';
import { toastSuccessNotify, toastErrorNotify } from '../../../../helper/ToastNotify';

// Admin-Designsprache: Stil-Konstanten
const sectionTitleSx = {
  fontWeight: 800,
  color: COLORS.textHeading,
  letterSpacing: '-0.02em'
};

const panelSx = {
  backgroundColor: 'white',
  border: `1px solid ${COLORS.border}`,
  borderRadius: RADII.panel,
  boxShadow: SHADOWS.subtle,
  overflow: 'hidden'
};

const statCardSx = {
  height: '100%',
  backgroundColor: 'white',
  border: `1px solid ${COLORS.border}`,
  borderRadius: RADII.card,
  boxShadow: SHADOWS.subtle
};

const containedButtonSx = {
  background: COLORS.primaryGradient,
  textTransform: 'none',
  fontWeight: 600,
  borderRadius: RADII.button,
  boxShadow: SHADOWS.brand,
  '&:hover': {
    background: COLORS.primaryGradientHover,
    boxShadow: SHADOWS.brandHover
  }
};

const outlinedButtonSx = {
  textTransform: 'none',
  fontWeight: 600,
  borderRadius: RADII.button
};

const inputSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: RADII.input,
    backgroundColor: COLORS.backgroundLight,
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: COLORS.primary
    }
  }
};

const tableHeadRowSx = {
  backgroundColor: COLORS.backgroundLight,
  '& .MuiTableCell-head': {
    fontWeight: 600,
    color: COLORS.textSecondary,
    borderColor: COLORS.border
  }
};

const tableBodyRowSx = {
  '& .MuiTableCell-root': { borderColor: COLORS.border },
  '&:hover': { backgroundColor: COLORS.backgroundLight }
};

const moneySx = { fontVariantNumeric: 'tabular-nums' };

const dialogPaperProps = {
  sx: { borderRadius: RADII.panel, boxShadow: SHADOWS.panel }
};

// Pill-Stile: MUI-Farbsemantik auf weiche Hintergründe abbilden (Semantik unverändert)
const pillSxByMuiColor = {
  success: { backgroundColor: '#ecfdf5', color: '#059669', '& .MuiChip-icon': { color: '#059669' } },
  warning: { backgroundColor: '#fffbeb', color: '#d97706', '& .MuiChip-icon': { color: '#d97706' } },
  error: { backgroundColor: '#fef2f2', color: '#dc2626', '& .MuiChip-icon': { color: '#dc2626' } },
  info: { backgroundColor: COLORS.accentBoxBg, color: COLORS.primaryDark, '& .MuiChip-icon': { color: COLORS.primaryDark } },
  primary: { backgroundColor: COLORS.accentBoxBg, color: COLORS.primaryDark, '& .MuiChip-icon': { color: COLORS.primaryDark } },
  default: { backgroundColor: '#f1f5f9', color: COLORS.textSecondary, '& .MuiChip-icon': { color: COLORS.textSecondary } }
};

const pillSx = (muiColor) => ({
  borderRadius: '999px',
  fontWeight: 600,
  ...(pillSxByMuiColor[muiColor] || pillSxByMuiColor.default)
});

/**
 * MonthlyReportsPage Component
 * Manage and view monthly business reports
 */
const MonthlyReportsPage = () => {
  // State
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [pagination, setPagination] = useState({ page: 0, limit: 10, total: 0 });
  const [filters, setFilters] = useState({
    businessId: '',
    year: new Date().getFullYear(),
    month: ''
  });

  // Dialogs
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  // Generate form
  const [generateForm, setGenerateForm] = useState({
    businessId: '',
    year: new Date().getFullYear(),
    month: new Date().getMonth(), // Previous month
    notes: ''
  });
  const [generating, setGenerating] = useState(false);

  // Fetch data
  useEffect(() => {
    fetchData();
  }, [pagination.page, pagination.limit, filters]);

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page + 1,
        limit: pagination.limit,
        ...(filters.businessId && { businessId: filters.businessId }),
        ...(filters.year && { year: filters.year }),
        ...(filters.month && { month: filters.month })
      };

      const response = await monthlyReportService.getReports(params);
      setReports(response.result || []);
      setPagination(prev => ({
        ...prev,
        total: response.pagination?.total || 0
      }));
    } catch (error) {
      console.error('Error fetching reports:', error);
      toastErrorNotify('Fehler beim Laden der Berichte');
    } finally {
      setLoading(false);
    }
  };

  const fetchBusinesses = async () => {
    try {
      const response = await adminService.getAllBusinesses();
      setBusinesses(response.result || []);
    } catch (error) {
      console.error('Error fetching businesses:', error);
    }
  };

  // Generate report
  const handleGenerate = async () => {
    if (!generateForm.businessId || !generateForm.year || !generateForm.month) {
      toastErrorNotify('Bitte füllen Sie alle Pflichtfelder aus');
      return;
    }

    try {
      setGenerating(true);
      await monthlyReportService.generateReport({
        businessId: generateForm.businessId,
        year: generateForm.year,
        month: generateForm.month,
        notes: generateForm.notes
      });

      toastSuccessNotify('Bericht erfolgreich erstellt');
      setGenerateDialogOpen(false);
      setGenerateForm({
        businessId: '',
        year: new Date().getFullYear(),
        month: new Date().getMonth(),
        notes: ''
      });
      fetchData();
    } catch (error) {
      console.error('Error generating report:', error);
      const message = error.response?.data?.message || 'Fehler beim Erstellen des Berichts';
      toastErrorNotify(message);
    } finally {
      setGenerating(false);
    }
  };

  // Bulk generate
  const handleBulkGenerate = async () => {
    try {
      setGenerating(true);
      const response = await monthlyReportService.generateBulkReports(
        generateForm.year,
        generateForm.month
      );

      const { success, skipped, failed: _failed } = response.result || {};
      toastSuccessNotify(
        `${success?.length || 0} Berichte erstellt, ${skipped?.length || 0} übersprungen`
      );

      setBulkDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error in bulk generation:', error);
      toastErrorNotify('Fehler bei der Massenerstellung');
    } finally {
      setGenerating(false);
    }
  };

  // View report
  const handleView = async (report) => {
    try {
      const response = await monthlyReportService.getReportById(report._id);
      setSelectedReport(response.result);
      setViewDialogOpen(true);
    } catch (error) {
      console.error('Error fetching report:', error);
      toastErrorNotify('Fehler beim Laden des Berichts');
    }
  };

  // Delete report
  const handleDelete = async (reportId) => {
    if (!confirm('Bericht wirklich löschen?')) return;

    try {
      await monthlyReportService.deleteReport(reportId);
      toastSuccessNotify('Bericht gelöscht');
      fetchData();
    } catch (error) {
      console.error('Error deleting report:', error);
      toastErrorNotify('Fehler beim Löschen');
    }
  };

  // Create Invoice from Report - DOĞRU AKIŞ
  const handleCreateInvoice = async (report) => {
    if (!confirm(`Möchten Sie für diesen Bericht wirklich eine Rechnung erstellen?\n\nUnternehmen: ${report.businessSnapshot?.businessName}\nZeitraum: ${monthlyReportService.formatPeriodLabel(report.year, report.month)}\nBetrag: ${monthlyReportService.formatCurrency(report.financials?.businessRevenue)}`)) {
      return;
    }

    try {
      setGenerating(true);
      const response = await invoiceService.createFromMonthlyReport(report._id);

      toastSuccessNotify(
        `Rechnung erfolgreich erstellt: ${response.result?.rechnungsnummer || 'Erfolgreich'}`
      );

      // Optional: Open invoice detail or navigate to invoices page
    } catch (error) {
      console.error('Error creating invoice:', error);
      const message = error.response?.data?.message || 'Fehler beim Erstellen der Rechnung';
      toastErrorNotify(message);
    } finally {
      setGenerating(false);
    }
  };

  // Export report to PDF
  const handleExportPDF = (report) => {
    const data = [{
      'Geschäft': report.businessSnapshot?.businessName || '-',
      'Zeitraum': monthlyReportService.formatPeriodLabel(report.year, report.month),
      'Gesamtumsatz': monthlyReportService.formatCurrency(report.financials?.totalRevenue),
      'Kommission': monthlyReportService.formatCurrency(report.financials?.platformCommission),
      'Geschäft Einnahmen': monthlyReportService.formatCurrency(report.financials?.businessRevenue),
      'Buchungen': report.bookings?.completed || 0,
      'Abschlussrate': `${(report.bookings?.completionRate || 0).toFixed(1)}%`
    }];

    exportService.exportToPDF(
      data,
      [
        { key: 'Geschäft', header: 'Geschäft' },
        { key: 'Zeitraum', header: 'Zeitraum' },
        { key: 'Gesamtumsatz', header: 'Gesamtumsatz' },
        { key: 'Kommission', header: 'Kommission' },
        { key: 'Geschäft Einnahmen', header: 'Geschäft Einnahmen' },
        { key: 'Buchungen', header: 'Buchungen' },
        { key: 'Abschlussrate', header: 'Abschlussrate' }
      ],
      `Monatsbericht - ${report.businessSnapshot?.businessName} - ${monthlyReportService.formatPeriodLabel(report.year, report.month)}`,
      {
        subtitle: `Erstellt am: ${new Date(report.createdAt).toLocaleDateString('de-DE')}`,
        orientation: 'landscape'
      }
    );

    toastSuccessNotify('PDF wurde heruntergeladen');
  };

  // Statistics
  const stats = useMemo(() => {
    const totalRevenue = reports.reduce(
      (sum, r) => sum + (r.financials?.totalRevenue || 0),
      0
    );
    const totalCommission = reports.reduce(
      (sum, r) => sum + (r.financials?.platformCommission || 0),
      0
    );
    const totalBookings = reports.reduce(
      (sum, r) => sum + (r.bookings?.completed || 0),
      0
    );

    return { totalRevenue, totalCommission, totalBookings, count: reports.length };
  }, [reports]);

  // Available years and months
  const availableYears = monthlyReportService.getAvailableYears();
  const availableMonths = monthlyReportService.getAvailableMonths(generateForm.year);

  return (
    <Box>
      {/* Header */}
      <Box mb={3} display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h5" sx={sectionTitleSx} gutterBottom>
            Monatliche Berichte
          </Typography>
          <Typography variant="body2" sx={{ color: COLORS.textSecondary }}>
            Monatliche Geschäftsberichte erstellen, ansehen und als PDF herunterladen
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<BulkIcon />}
            onClick={() => setBulkDialogOpen(true)}
            sx={outlinedButtonSx}
          >
            Massenerstellung
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setGenerateDialogOpen(true)}
            sx={containedButtonSx}
          >
            Neuer Bericht
          </Button>
        </Stack>
      </Box>

      {/* Statistics */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={6} sm={3}>
          <Card elevation={0} sx={statCardSx}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <ReportIcon sx={{ color: COLORS.primary }} fontSize="small" />
                <Typography variant="caption" sx={{ color: COLORS.textSecondary, fontWeight: 600 }}>
                  Berichte gesamt
                </Typography>
              </Box>
              <Typography variant="h5" sx={{ ...moneySx, fontWeight: 800, color: COLORS.textHeading }}>
                {pagination.total}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card elevation={0} sx={statCardSx}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <EuroIcon sx={{ color: COLORS.primaryDark }} fontSize="small" />
                <Typography variant="caption" sx={{ color: COLORS.textSecondary, fontWeight: 600 }}>
                  Gesamtumsatz
                </Typography>
              </Box>
              <Typography variant="h5" sx={{ ...moneySx, fontWeight: 800, color: COLORS.textHeading }}>
                {monthlyReportService.formatCurrency(stats.totalRevenue)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card elevation={0} sx={statCardSx}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <EuroIcon sx={{ color: '#06b6d4' }} fontSize="small" />
                <Typography variant="caption" sx={{ color: COLORS.textSecondary, fontWeight: 600 }}>
                  Gesamtkommission
                </Typography>
              </Box>
              <Typography variant="h5" sx={{ ...moneySx, fontWeight: 800, color: COLORS.textHeading }}>
                {monthlyReportService.formatCurrency(stats.totalCommission)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card elevation={0} sx={statCardSx}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <CalendarIcon sx={{ color: COLORS.warning }} fontSize="small" />
                <Typography variant="caption" sx={{ color: COLORS.textSecondary, fontWeight: 600 }}>
                  Buchungen gesamt
                </Typography>
              </Box>
              <Typography variant="h5" sx={{ ...moneySx, fontWeight: 800, color: COLORS.textHeading }}>
                {stats.totalBookings}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, ...panelSx, borderRadius: RADII.card }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small" sx={inputSx}>
              <InputLabel>Geschäft</InputLabel>
              <Select
                value={filters.businessId}
                label="Geschäft"
                onChange={(e) => setFilters(prev => ({ ...prev, businessId: e.target.value }))}
              >
                <MenuItem value="">Alle</MenuItem>
                {businesses.map((b) => (
                  <MenuItem key={b._id} value={b._id}>
                    {b.businessName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} sm={3}>
            <FormControl fullWidth size="small" sx={inputSx}>
              <InputLabel>Jahr</InputLabel>
              <Select
                value={filters.year}
                label="Jahr"
                onChange={(e) => setFilters(prev => ({ ...prev, year: e.target.value }))}
              >
                <MenuItem value="">Alle</MenuItem>
                {availableYears.map((y) => (
                  <MenuItem key={y} value={y}>{y}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} sm={3}>
            <FormControl fullWidth size="small" sx={inputSx}>
              <InputLabel>Monat</InputLabel>
              <Select
                value={filters.month}
                label="Monat"
                onChange={(e) => setFilters(prev => ({ ...prev, month: e.target.value }))}
              >
                <MenuItem value="">Alle</MenuItem>
                {[...Array(12)].map((_, i) => (
                  <MenuItem key={i + 1} value={i + 1}>
                    {monthlyReportService.getMonthName(i + 1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchData}
              sx={outlinedButtonSx}
            >
              Aktualisieren
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Reports Table */}
      <Paper elevation={0} sx={panelSx}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={tableHeadRowSx}>
                <TableCell>Geschäft</TableCell>
                <TableCell>Zeitraum</TableCell>
                <TableCell align="right">Umsatz</TableCell>
                <TableCell align="right">Kommission</TableCell>
                <TableCell align="center">Buchungen</TableCell>
                <TableCell align="center">Veränderung</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="center">Aktionen</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4, borderColor: COLORS.border }}>
                    <CircularProgress size={32} sx={{ color: COLORS.primary }} />
                  </TableCell>
                </TableRow>
              ) : reports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4, borderColor: COLORS.border }}>
                    <Typography sx={{ color: COLORS.textSecondary }}>
                      Keine Berichte gefunden
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                reports.map((report) => {
                  const growth = monthlyReportService.getGrowthIndicator(
                    report.comparison?.revenueChange || 0
                  );

                  return (
                    <TableRow key={report._id} sx={tableBodyRowSx}>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <BusinessIcon sx={{ color: COLORS.primary }} fontSize="small" />
                          <Box>
                            <Typography variant="body2" fontWeight={600} sx={{ color: COLORS.textPrimary }}>
                              {report.businessSnapshot?.businessName || report.businessId?.businessName || '-'}
                            </Typography>
                            <Typography variant="caption" sx={{ color: COLORS.textSecondary }}>
                              {report.businessSnapshot?.businessType || '-'}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={<CalendarIcon />}
                          label={monthlyReportService.formatPeriodLabel(report.year, report.month)}
                          size="small"
                          sx={pillSx('default')}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          variant="body2"
                          sx={{ ...moneySx, fontWeight: 700, color: COLORS.primary }}
                        >
                          {monthlyReportService.formatCurrency(report.financials?.totalRevenue)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ ...moneySx, fontWeight: 700, color: '#059669' }}>
                          {monthlyReportService.formatCurrency(report.financials?.platformCommission)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center" sx={{ ...moneySx, fontWeight: 600 }}>
                        {report.bookings?.completed || 0}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          icon={growth.trend === 'up' ? <TrendingUpIcon /> : growth.trend === 'down' ? <TrendingDownIcon /> : null}
                          label={growth.label}
                          size="small"
                          sx={pillSx(growth.color)}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={monthlyReportService.getStatusDisplay(report.status).label}
                          size="small"
                          sx={pillSx(monthlyReportService.getStatusDisplay(report.status).color)}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={0.5} justifyContent="center">
                          <Tooltip title="Details anzeigen">
                            <IconButton size="small" onClick={() => handleView(report)} sx={{ color: COLORS.textSecondary }}>
                              <ViewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Rechnung erstellen">
                            <IconButton
                              size="small"
                              sx={{ color: '#059669' }}
                              onClick={() => handleCreateInvoice(report)}
                              disabled={generating}
                            >
                              <ReceiptIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="PDF herunterladen">
                            <IconButton size="small" onClick={() => handleExportPDF(report)} sx={{ color: COLORS.primary }}>
                              <DownloadIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Löschen">
                            <IconButton size="small" sx={{ color: '#dc2626' }} onClick={() => handleDelete(report._id)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={pagination.total}
          page={pagination.page}
          onPageChange={(e, newPage) => setPagination(prev => ({ ...prev, page: newPage }))}
          rowsPerPage={pagination.limit}
          onRowsPerPageChange={(e) => {
            setPagination(prev => ({ ...prev, limit: parseInt(e.target.value, 10), page: 0 }));
          }}
          rowsPerPageOptions={[5, 10, 25, 50]}
          labelRowsPerPage="Zeilen pro Seite:"
        />
      </Paper>

      {/* Generate Dialog */}
      <Dialog
        open={generateDialogOpen}
        onClose={() => setGenerateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={dialogPaperProps}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1} sx={sectionTitleSx}>
            <AddIcon sx={{ color: COLORS.primary }} />
            Neuen Monatsbericht erstellen
          </Box>
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: COLORS.border }}>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <FormControl fullWidth sx={inputSx}>
              <InputLabel>Geschäft *</InputLabel>
              <Select
                value={generateForm.businessId}
                label="Geschäft *"
                onChange={(e) => setGenerateForm(prev => ({ ...prev, businessId: e.target.value }))}
              >
                {businesses.map((b) => (
                  <MenuItem key={b._id} value={b._id}>
                    {b.businessName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <FormControl fullWidth sx={inputSx}>
                  <InputLabel>Jahr *</InputLabel>
                  <Select
                    value={generateForm.year}
                    label="Jahr *"
                    onChange={(e) => setGenerateForm(prev => ({ ...prev, year: e.target.value }))}
                  >
                    {availableYears.map((y) => (
                      <MenuItem key={y} value={y}>{y}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth sx={inputSx}>
                  <InputLabel>Monat *</InputLabel>
                  <Select
                    value={generateForm.month}
                    label="Monat *"
                    onChange={(e) => setGenerateForm(prev => ({ ...prev, month: e.target.value }))}
                  >
                    {availableMonths.map((m) => (
                      <MenuItem key={m.value} value={m.value}>
                        {m.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <TextField
              fullWidth
              label="Notizen (optional)"
              multiline
              rows={3}
              value={generateForm.notes}
              onChange={(e) => setGenerateForm(prev => ({ ...prev, notes: e.target.value }))}
              sx={inputSx}
            />

            <Box
              sx={{
                p: 2,
                backgroundColor: COLORS.accentBoxBg,
                borderLeft: `3px solid ${COLORS.primary}`,
                borderRadius: RADII.input
              }}
            >
              <Typography variant="body2" sx={{ color: COLORS.textPrimary }}>
                Der Bericht enthält alle Finanzdaten, Buchungen und Statistiken für den
                gewählten Zeitraum. Der erstellte Bericht wird dauerhaft gespeichert.
              </Typography>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setGenerateDialogOpen(false)}
            sx={{ ...outlinedButtonSx, color: COLORS.textSecondary }}
          >
            Abbrechen
          </Button>
          <Button
            variant="contained"
            onClick={handleGenerate}
            disabled={generating}
            startIcon={generating ? <CircularProgress size={20} /> : <AddIcon />}
            sx={containedButtonSx}
          >
            {generating ? 'Wird erstellt...' : 'Bericht erstellen'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Generate Dialog */}
      <Dialog
        open={bulkDialogOpen}
        onClose={() => setBulkDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={dialogPaperProps}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1} sx={sectionTitleSx}>
            <BulkIcon sx={{ color: COLORS.primary }} />
            Berichte per Massenerstellung anlegen
          </Box>
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: COLORS.border }}>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Alert severity="warning" sx={{ borderRadius: RADII.input }}>
              Dieser Vorgang erstellt Berichte für ALLE aktiven Unternehmen im ausgewählten Zeitraum.
              Vorhandene Berichte werden übersprungen.
            </Alert>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <FormControl fullWidth sx={inputSx}>
                  <InputLabel>Jahr *</InputLabel>
                  <Select
                    value={generateForm.year}
                    label="Jahr *"
                    onChange={(e) => setGenerateForm(prev => ({ ...prev, year: e.target.value }))}
                  >
                    {availableYears.map((y) => (
                      <MenuItem key={y} value={y}>{y}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth sx={inputSx}>
                  <InputLabel>Monat *</InputLabel>
                  <Select
                    value={generateForm.month}
                    label="Monat *"
                    onChange={(e) => setGenerateForm(prev => ({ ...prev, month: e.target.value }))}
                  >
                    {availableMonths.map((m) => (
                      <MenuItem key={m.value} value={m.value}>
                        {m.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setBulkDialogOpen(false)}
            sx={{ ...outlinedButtonSx, color: COLORS.textSecondary }}
          >
            Abbrechen
          </Button>
          <Button
            variant="contained"
            color="warning"
            onClick={handleBulkGenerate}
            disabled={generating}
            startIcon={generating ? <CircularProgress size={20} /> : <BulkIcon />}
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: RADII.button }}
          >
            {generating ? 'Wird erstellt...' : 'Alle Berichte erstellen'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Report Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={dialogPaperProps}
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box display="flex" alignItems="center" gap={1}>
              <ReportIcon sx={{ color: COLORS.primary }} />
              <Typography variant="h6" sx={sectionTitleSx}>
                {selectedReport?.businessSnapshot?.businessName} - {selectedReport && monthlyReportService.formatPeriodLabel(selectedReport.year, selectedReport.month)}
              </Typography>
            </Box>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={() => selectedReport && handleExportPDF(selectedReport)}
              sx={outlinedButtonSx}
            >
              PDF herunterladen
            </Button>
          </Box>
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: COLORS.border }}>
          {selectedReport && (
            <Box>
              {/* Summary Cards */}
              <Grid container spacing={2} mb={3}>
                <Grid item xs={6} sm={3}>
                  <Card elevation={0} sx={{ ...statCardSx, backgroundColor: COLORS.accentBoxBg }}>
                    <CardContent>
                      <Typography variant="caption" sx={{ color: COLORS.textSecondary, fontWeight: 600 }}>
                        Gesamtumsatz
                      </Typography>
                      <Typography variant="h6" sx={{ ...moneySx, fontWeight: 800, color: COLORS.primary }}>
                        {monthlyReportService.formatCurrency(selectedReport.financials?.totalRevenue)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Card elevation={0} sx={{ ...statCardSx, backgroundColor: '#ecfdf5' }}>
                    <CardContent>
                      <Typography variant="caption" sx={{ color: COLORS.textSecondary, fontWeight: 600 }}>
                        Kommission
                      </Typography>
                      <Typography variant="h6" sx={{ ...moneySx, fontWeight: 800, color: '#059669' }}>
                        {monthlyReportService.formatCurrency(selectedReport.financials?.platformCommission)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Card elevation={0} sx={{ ...statCardSx, backgroundColor: '#fffbeb' }}>
                    <CardContent>
                      <Typography variant="caption" sx={{ color: COLORS.textSecondary, fontWeight: 600 }}>
                        Geschäft Einnahmen
                      </Typography>
                      <Typography variant="h6" sx={{ ...moneySx, fontWeight: 800, color: '#d97706' }}>
                        {monthlyReportService.formatCurrency(selectedReport.financials?.businessRevenue)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Card elevation={0} sx={statCardSx}>
                    <CardContent>
                      <Typography variant="caption" sx={{ color: COLORS.textSecondary, fontWeight: 600 }}>
                        Buchungen
                      </Typography>
                      <Typography variant="h6" sx={{ ...moneySx, fontWeight: 800, color: COLORS.textHeading }}>
                        {selectedReport.bookings?.completed} / {selectedReport.bookings?.total}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Daily Chart */}
              {selectedReport.dailyBreakdown?.length > 0 && (
                <Box mb={3}>
                  <Typography variant="subtitle1" sx={sectionTitleSx} gutterBottom>
                    Tägliche Umsatzentwicklung
                  </Typography>
                  <Paper elevation={0} sx={{ p: 2, ...panelSx, borderRadius: RADII.card }}>
                    <Box height={250}>
                      <ResponsiveContainer>
                        <AreaChart
                          data={selectedReport.dailyBreakdown.map((d, i) => ({
                            day: i + 1,
                            revenue: d.revenue,
                            bookings: d.bookings
                          }))}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
                          <XAxis dataKey="day" stroke={COLORS.textSecondary} />
                          <YAxis stroke={COLORS.textSecondary} />
                          <RechartsTooltip
                            formatter={(value, name) => [
                              name === 'revenue' ? `€${value.toFixed(2)}` : value,
                              name === 'revenue' ? 'Umsatz' : 'Buchungen'
                            ]}
                          />
                          <Area
                            type="monotone"
                            dataKey="revenue"
                            stroke={COLORS.primary}
                            fill="#0891b220"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </Box>
                  </Paper>
                </Box>
              )}

              {/* Toilet Stats */}
              {selectedReport.toiletStats?.length > 0 && (
                <Box mb={3}>
                  <Typography variant="subtitle1" sx={sectionTitleSx} gutterBottom>
                    Statistiken pro Toilette
                  </Typography>
                  <TableContainer component={Paper} elevation={0} sx={{ ...panelSx, borderRadius: RADII.card }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={tableHeadRowSx}>
                          <TableCell>Toilette</TableCell>
                          <TableCell align="center">Nutzungen</TableCell>
                          <TableCell align="right">Umsatz</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedReport.toiletStats.map((toilet) => (
                          <TableRow key={toilet._id || toilet.toiletName} sx={tableBodyRowSx}>
                            <TableCell>{toilet.toiletName}</TableCell>
                            <TableCell align="center" sx={moneySx}>{toilet.usageCount}</TableCell>
                            <TableCell align="right" sx={{ ...moneySx, fontWeight: 700 }}>
                              {monthlyReportService.formatCurrency(toilet.revenue)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}

              {/* Notes */}
              {selectedReport.notes && (
                <Box
                  sx={{
                    mt: 2,
                    p: 2,
                    backgroundColor: COLORS.accentBoxBg,
                    borderLeft: `3px solid ${COLORS.primary}`,
                    borderRadius: RADII.input
                  }}
                >
                  <Typography variant="body2" sx={{ color: COLORS.textPrimary }}>
                    <strong>Notizen:</strong> {selectedReport.notes}
                  </Typography>
                </Box>
              )}

              {/* Metadata */}
              <Box mt={2} pt={2} sx={{ borderTop: `1px solid ${COLORS.border}` }}>
                <Typography variant="caption" sx={{ color: COLORS.textSecondary }}>
                  Erstellt: {new Date(selectedReport.createdAt).toLocaleString('de-DE')}
                  {selectedReport.generatedBy && ` • ${selectedReport.generatedBy.username}`}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setViewDialogOpen(false)}
            sx={{ ...outlinedButtonSx, color: COLORS.textSecondary }}
          >
            Schließen
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MonthlyReportsPage;
