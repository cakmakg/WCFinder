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
  PlaylistAddCheck as BulkIcon
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
import { monthlyReportService } from '../../services/monthlyReportService';
import { adminService } from '../../services/adminService';
import { exportService } from '../../services/exportService';
import { toastSuccessNotify, toastErrorNotify } from '../../../../helper/ToastNotify';

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

      const { success, skipped, failed } = response.result || {};
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
          <Typography variant="h5" fontWeight={600} gutterBottom>
            Monatliche Berichte
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Aylık işletme raporlarını oluşturun, görüntüleyin ve PDF olarak indirin
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<BulkIcon />}
            onClick={() => setBulkDialogOpen(true)}
          >
            Toplu Oluştur
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setGenerateDialogOpen(true)}
          >
            Yeni Rapor
          </Button>
        </Stack>
      </Box>

      {/* Statistics */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={6} sm={3}>
          <Card variant="outlined">
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <ReportIcon color="primary" fontSize="small" />
                <Typography variant="caption" color="text.secondary">
                  Toplam Rapor
                </Typography>
              </Box>
              <Typography variant="h5" fontWeight={600}>
                {pagination.total}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card variant="outlined">
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <EuroIcon color="success" fontSize="small" />
                <Typography variant="caption" color="text.secondary">
                  Toplam Gelir
                </Typography>
              </Box>
              <Typography variant="h5" fontWeight={600} color="success.main">
                {monthlyReportService.formatCurrency(stats.totalRevenue)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card variant="outlined">
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <EuroIcon color="info" fontSize="small" />
                <Typography variant="caption" color="text.secondary">
                  Toplam Komisyon
                </Typography>
              </Box>
              <Typography variant="h5" fontWeight={600} color="info.main">
                {monthlyReportService.formatCurrency(stats.totalCommission)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card variant="outlined">
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <CalendarIcon color="warning" fontSize="small" />
                <Typography variant="caption" color="text.secondary">
                  Toplam Rezervasyon
                </Typography>
              </Box>
              <Typography variant="h5" fontWeight={600}>
                {stats.totalBookings}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel>İşletme</InputLabel>
              <Select
                value={filters.businessId}
                label="İşletme"
                onChange={(e) => setFilters(prev => ({ ...prev, businessId: e.target.value }))}
              >
                <MenuItem value="">Tümü</MenuItem>
                {businesses.map((b) => (
                  <MenuItem key={b._id} value={b._id}>
                    {b.businessName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Yıl</InputLabel>
              <Select
                value={filters.year}
                label="Yıl"
                onChange={(e) => setFilters(prev => ({ ...prev, year: e.target.value }))}
              >
                <MenuItem value="">Tümü</MenuItem>
                {availableYears.map((y) => (
                  <MenuItem key={y} value={y}>{y}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Ay</InputLabel>
              <Select
                value={filters.month}
                label="Ay"
                onChange={(e) => setFilters(prev => ({ ...prev, month: e.target.value }))}
              >
                <MenuItem value="">Tümü</MenuItem>
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
            >
              Yenile
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Reports Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell>İşletme</TableCell>
                <TableCell>Dönem</TableCell>
                <TableCell align="right">Gelir</TableCell>
                <TableCell align="right">Komisyon</TableCell>
                <TableCell align="center">Rezervasyon</TableCell>
                <TableCell align="center">Değişim</TableCell>
                <TableCell align="center">Durum</TableCell>
                <TableCell align="center">İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <CircularProgress size={32} />
                  </TableCell>
                </TableRow>
              ) : reports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
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
                    <TableRow key={report._id} hover>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <BusinessIcon color="primary" fontSize="small" />
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {report.businessSnapshot?.businessName || report.businessId?.businessName || '-'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
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
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={600} color="primary">
                          {monthlyReportService.formatCurrency(report.financials?.totalRevenue)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" color="success.main">
                          {monthlyReportService.formatCurrency(report.financials?.platformCommission)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        {report.bookings?.completed || 0}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          icon={growth.trend === 'up' ? <TrendingUpIcon /> : growth.trend === 'down' ? <TrendingDownIcon /> : null}
                          label={growth.label}
                          size="small"
                          color={growth.color}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={monthlyReportService.getStatusDisplay(report.status).label}
                          size="small"
                          color={monthlyReportService.getStatusDisplay(report.status).color}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={0.5} justifyContent="center">
                          <Tooltip title="Detayları Görüntüle">
                            <IconButton size="small" onClick={() => handleView(report)}>
                              <ViewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="PDF İndir">
                            <IconButton size="small" onClick={() => handleExportPDF(report)}>
                              <DownloadIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Sil">
                            <IconButton size="small" color="error" onClick={() => handleDelete(report._id)}>
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
          labelRowsPerPage="Sayfa başına:"
        />
      </Paper>

      {/* Generate Dialog */}
      <Dialog open={generateDialogOpen} onClose={() => setGenerateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <AddIcon color="primary" />
            Yeni Aylık Rapor Oluştur
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>İşletme *</InputLabel>
              <Select
                value={generateForm.businessId}
                label="İşletme *"
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
                <FormControl fullWidth>
                  <InputLabel>Yıl *</InputLabel>
                  <Select
                    value={generateForm.year}
                    label="Yıl *"
                    onChange={(e) => setGenerateForm(prev => ({ ...prev, year: e.target.value }))}
                  >
                    {availableYears.map((y) => (
                      <MenuItem key={y} value={y}>{y}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Ay *</InputLabel>
                  <Select
                    value={generateForm.month}
                    label="Ay *"
                    onChange={(e) => setGenerateForm(prev => ({ ...prev, month: e.target.value }))}
                  >
                    {availableMonths.map((m) => (
                      <MenuItem key={m.value} value={m.value}>
                        {m.label} ({m.labelTR})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <TextField
              fullWidth
              label="Notlar (opsiyonel)"
              multiline
              rows={3}
              value={generateForm.notes}
              onChange={(e) => setGenerateForm(prev => ({ ...prev, notes: e.target.value }))}
            />

            <Alert severity="info">
              Rapor, seçilen dönem için tüm finansal verileri, rezervasyonları ve istatistikleri içerecektir.
              Oluşturulan rapor kalıcı olarak saklanacaktır.
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setGenerateDialogOpen(false)}>İptal</Button>
          <Button
            variant="contained"
            onClick={handleGenerate}
            disabled={generating}
            startIcon={generating ? <CircularProgress size={20} /> : <AddIcon />}
          >
            {generating ? 'Oluşturuluyor...' : 'Rapor Oluştur'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Generate Dialog */}
      <Dialog open={bulkDialogOpen} onClose={() => setBulkDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <BulkIcon color="primary" />
            Toplu Rapor Oluştur
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Alert severity="warning">
              Bu işlem, seçilen dönem için TÜM aktif işletmelerin raporlarını oluşturacaktır.
              Mevcut raporlar atlanacaktır.
            </Alert>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Yıl *</InputLabel>
                  <Select
                    value={generateForm.year}
                    label="Yıl *"
                    onChange={(e) => setGenerateForm(prev => ({ ...prev, year: e.target.value }))}
                  >
                    {availableYears.map((y) => (
                      <MenuItem key={y} value={y}>{y}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Ay *</InputLabel>
                  <Select
                    value={generateForm.month}
                    label="Ay *"
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
          <Button onClick={() => setBulkDialogOpen(false)}>İptal</Button>
          <Button
            variant="contained"
            color="warning"
            onClick={handleBulkGenerate}
            disabled={generating}
            startIcon={generating ? <CircularProgress size={20} /> : <BulkIcon />}
          >
            {generating ? 'Oluşturuluyor...' : 'Tüm Raporları Oluştur'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Report Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box display="flex" alignItems="center" gap={1}>
              <ReportIcon color="primary" />
              <Typography variant="h6">
                {selectedReport?.businessSnapshot?.businessName} - {selectedReport && monthlyReportService.formatPeriodLabel(selectedReport.year, selectedReport.month)}
              </Typography>
            </Box>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={() => selectedReport && handleExportPDF(selectedReport)}
            >
              PDF İndir
            </Button>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedReport && (
            <Box>
              {/* Summary Cards */}
              <Grid container spacing={2} mb={3}>
                <Grid item xs={6} sm={3}>
                  <Card variant="outlined" sx={{ bgcolor: 'primary.50' }}>
                    <CardContent>
                      <Typography variant="caption" color="text.secondary">Toplam Gelir</Typography>
                      <Typography variant="h6" fontWeight={700} color="primary">
                        {monthlyReportService.formatCurrency(selectedReport.financials?.totalRevenue)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Card variant="outlined" sx={{ bgcolor: 'success.50' }}>
                    <CardContent>
                      <Typography variant="caption" color="text.secondary">Komisyon</Typography>
                      <Typography variant="h6" fontWeight={700} color="success.main">
                        {monthlyReportService.formatCurrency(selectedReport.financials?.platformCommission)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Card variant="outlined" sx={{ bgcolor: 'warning.50' }}>
                    <CardContent>
                      <Typography variant="caption" color="text.secondary">İşletme Geliri</Typography>
                      <Typography variant="h6" fontWeight={700} color="warning.main">
                        {monthlyReportService.formatCurrency(selectedReport.financials?.businessRevenue)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="caption" color="text.secondary">Rezervasyon</Typography>
                      <Typography variant="h6" fontWeight={700}>
                        {selectedReport.bookings?.completed} / {selectedReport.bookings?.total}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Daily Chart */}
              {selectedReport.dailyBreakdown?.length > 0 && (
                <Box mb={3}>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    Günlük Gelir Grafiği
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Box height={250}>
                      <ResponsiveContainer>
                        <AreaChart
                          data={selectedReport.dailyBreakdown.map((d, i) => ({
                            day: i + 1,
                            revenue: d.revenue,
                            bookings: d.bookings
                          }))}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="day" />
                          <YAxis />
                          <RechartsTooltip
                            formatter={(value, name) => [
                              name === 'revenue' ? `€${value.toFixed(2)}` : value,
                              name === 'revenue' ? 'Gelir' : 'Rezervasyon'
                            ]}
                          />
                          <Area
                            type="monotone"
                            dataKey="revenue"
                            stroke="#0891b2"
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
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    Tuvalet Bazlı İstatistikler
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ bgcolor: 'grey.50' }}>
                          <TableCell>Tuvalet</TableCell>
                          <TableCell align="center">Kullanım</TableCell>
                          <TableCell align="right">Gelir</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedReport.toiletStats.map((toilet, index) => (
                          <TableRow key={index}>
                            <TableCell>{toilet.toiletName}</TableCell>
                            <TableCell align="center">{toilet.usageCount}</TableCell>
                            <TableCell align="right">
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
                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    <strong>Notlar:</strong> {selectedReport.notes}
                  </Typography>
                </Alert>
              )}

              {/* Metadata */}
              <Box mt={2} pt={2} borderTop={1} borderColor="divider">
                <Typography variant="caption" color="text.secondary">
                  Oluşturulma: {new Date(selectedReport.createdAt).toLocaleString('de-DE')}
                  {selectedReport.generatedBy && ` • ${selectedReport.generatedBy.username}`}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Kapat</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MonthlyReportsPage;

