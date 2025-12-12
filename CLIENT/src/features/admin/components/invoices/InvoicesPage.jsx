// features/admin/components/invoices/InvoicesPage.jsx
// Main invoice management page

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
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
  TableSortLabel,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Stack,
  TextField,
  MenuItem,
  InputAdornment
} from '@mui/material';
import {
  Add as AddIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  Email as EmailIcon,
  Delete as DeleteIcon,
  Receipt as ReceiptIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Code as CodeIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { invoiceService } from '../../services/invoiceService';
import { formatCurrency } from '../../utils/exportHelpers';
import { formatDate } from '../../utils/dateHelpers';
import { toastSuccessNotify, toastErrorNotify } from '../../../../helper/ToastNotify';
import InvoiceCreateDialog from './InvoiceCreateDialog';
import InvoiceDetailDialog from './InvoiceDetailDialog';
import { ExportButton } from '../shared';

/**
 * InvoicesPage Component
 * Main page for managing invoices (Rechnungen)
 */
const InvoicesPage = () => {
  console.log('🧾 InvoicesPage: Component mounting...'); // Debug log
  
  // State
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState([]);
  const [stats, setStats] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState('rechnungsdatum');
  const [order, setOrder] = useState('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [componentError, setComponentError] = useState(null);

  // Dialogs
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Fetch invoices
  useEffect(() => {
    console.log('🧾 InvoicesPage: useEffect triggered, fetching invoices...'); // Debug log
    fetchInvoices();
  }, [refreshTrigger]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setComponentError(null);
      console.log('🧾 InvoicesPage: Calling invoiceService.getInvoices()...'); // Debug log
      
      const response = await invoiceService.getInvoices();
      console.log('🧾 InvoicesPage: API Response:', response); // Debug log
      
      const invoiceList = response?.result || response?.data || response || [];
      setInvoices(Array.isArray(invoiceList) ? invoiceList : []);

      // Calculate stats
      const calculatedStats = invoiceService.calculateInvoiceStats(invoiceList);
      setStats(calculatedStats);
      console.log('🧾 InvoicesPage: Invoices loaded successfully:', invoiceList.length); // Debug log
    } catch (error) {
      console.error('🧾 InvoicesPage: Error fetching invoices:', error);
      setComponentError(error.message || 'Fehler beim Laden');
      toastErrorNotify('Fehler beim Laden der Rechnungen');
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Component Error Display
  if (componentError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="h6">Fehler beim Laden der Rechnungen</Typography>
          <Typography variant="body2">{componentError}</Typography>
        </Alert>
        <Button variant="contained" onClick={() => { setComponentError(null); fetchInvoices(); }}>
          Erneut versuchen
        </Button>
      </Box>
    );
  }

  // Filtered and sorted invoices
  const filteredInvoices = useMemo(() => {
    let result = [...invoices];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(invoice =>
        invoice.rechnungsnummer?.toLowerCase().includes(term) ||
        invoice.rechnungsempfaenger?.businessName?.toLowerCase().includes(term) ||
        invoice._id?.toLowerCase().includes(term)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(invoice => invoice.status === statusFilter);
    }

    // Sorting
    result.sort((a, b) => {
      let aValue = a[orderBy];
      let bValue = b[orderBy];

      if (orderBy === 'rechnungsdatum' || orderBy === 'faelligkeitsdatum') {
        aValue = new Date(aValue || 0);
        bValue = new Date(bValue || 0);
      } else if (orderBy === 'gesamtbetrag') {
        aValue = Number(aValue) || 0;
        bValue = Number(bValue) || 0;
      }

      if (order === 'asc') {
        return aValue > bValue ? 1 : -1;
      }
      return aValue < bValue ? 1 : -1;
    });

    return result;
  }, [invoices, searchTerm, statusFilter, orderBy, order]);

  // Paginated invoices
  const paginatedInvoices = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredInvoices.slice(start, start + rowsPerPage);
  }, [filteredInvoices, page, rowsPerPage]);

  // Handlers
  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setDetailDialogOpen(true);
  };

  const handleDownloadInvoice = async (invoice) => {
    try {
      await invoiceService.downloadAndSaveInvoice(
        invoice._id,
        `Rechnung_${invoice.rechnungsnummer || invoice._id}.pdf`
      );
      toastSuccessNotify('PDF wurde heruntergeladen');
    } catch (error) {
      console.error('Error downloading invoice:', error);
      toastErrorNotify('Fehler beim Herunterladen der Rechnung');
    }
  };

  const handleDownloadXRechnung = async (invoice) => {
    try {
      await invoiceService.downloadAndSaveXRechnung(
        invoice._id,
        `${invoice.rechnungsnummer || invoice._id}_xrechnung.xml`
      );
      toastSuccessNotify('XRechnung XML wurde heruntergeladen');
    } catch (error) {
      console.error('Error downloading XRechnung:', error);
      toastErrorNotify('Fehler beim Herunterladen der XRechnung');
    }
  };

  const handleResendEmail = async (invoice) => {
    if (!confirm(`E-Mail für Rechnung ${invoice.rechnungsnummer} erneut senden?`)) {
      return;
    }

    try {
      await invoiceService.resendInvoiceEmail(invoice._id);
      toastSuccessNotify('E-Mail wurde erneut gesendet');
    } catch (error) {
      console.error('Error resending email:', error);
      toastErrorNotify('Fehler beim Senden der E-Mail');
    }
  };

  const handleDeleteInvoice = async (invoice) => {
    if (!invoiceService.canDeleteInvoice(invoice.status)) {
      toastErrorNotify('Nur Entwürfe können gelöscht werden');
      return;
    }

    if (!confirm(`Rechnung ${invoice.rechnungsnummer} wirklich löschen?`)) {
      return;
    }

    try {
      await invoiceService.deleteInvoice(invoice._id);
      toastSuccessNotify('Rechnung wurde gelöscht');
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error deleting invoice:', error);
      toastErrorNotify('Fehler beim Löschen der Rechnung');
    }
  };

  const handleInvoiceCreated = () => {
    toastSuccessNotify('Rechnung wurde erstellt');
    setRefreshTrigger(prev => prev + 1);
    setCreateDialogOpen(false);
  };

  const handleInvoiceUpdated = () => {
    setRefreshTrigger(prev => prev + 1);
    setDetailDialogOpen(false);
  };

  // Get status chip props
  const getStatusChip = (status) => {
    const statusInfo = invoiceService.getInvoiceStatusDisplay(status);
    const iconMap = {
      entwurf: <ScheduleIcon fontSize="small" />,
      versendet: <EmailIcon fontSize="small" />,
      bezahlt: <CheckCircleIcon fontSize="small" />,
      ueberfaellig: <WarningIcon fontSize="small" />,
      mahnung: <WarningIcon fontSize="small" />
    };

    return (
      <Chip
        icon={iconMap[status]}
        label={statusInfo.label}
        color={statusInfo.color}
        size="small"
      />
    );
  };

  // Export data
  const exportData = useMemo(() => {
    return filteredInvoices.map(invoice => ({
      'Rechnungsnummer': invoice.rechnungsnummer || '-',
      'Empfänger': invoice.rechnungsempfaenger?.businessName || '-',
      'Datum': formatDate(invoice.rechnungsdatum),
      'Fällig': formatDate(invoice.faelligkeitsdatum),
      'Netto': formatCurrency(invoice.nettobetrag),
      'MwSt': formatCurrency(invoice.mwstBetrag),
      'Gesamt': formatCurrency(invoice.gesamtbetrag),
      'Status': invoiceService.getInvoiceStatusDisplay(invoice.status).label
    }));
  }, [filteredInvoices]);

  // Loading state
  if (loading && invoices.length === 0) {
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
        <Typography variant="h5" fontWeight={600}>
          Rechnungsverwaltung
        </Typography>
        <Stack direction="row" spacing={2}>
          <ExportButton
            data={exportData}
            filename="rechnungen"
            title="Rechnungen Export"
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
          >
            Neue Rechnung
          </Button>
        </Stack>
      </Box>

      {/* Statistics Cards */}
      {stats && (
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  <ReceiptIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="subtitle2" color="text.secondary">
                    Gesamt Rechnungen
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight={600}>
                  {stats.total}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatCurrency(stats.totalAmount)} Gesamtwert
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                  <Typography variant="subtitle2" color="text.secondary">
                    Bezahlt
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight={600} color="success.main">
                  {stats.paid}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatCurrency(stats.paidAmount)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  <ScheduleIcon color="info" sx={{ mr: 1 }} />
                  <Typography variant="subtitle2" color="text.secondary">
                    Ausstehend
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight={600} color="info.main">
                  {stats.pending}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatCurrency(stats.pendingAmount)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  <WarningIcon color="error" sx={{ mr: 1 }} />
                  <Typography variant="subtitle2" color="text.secondary">
                    Überfällig
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight={600} color="error.main">
                  {stats.overdue}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatCurrency(stats.overdueAmount)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
          <TextField
            size="small"
            placeholder="Suchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
            sx={{ minWidth: 250 }}
          />

          <TextField
            select
            size="small"
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="all">Alle Status</MenuItem>
            <MenuItem value="entwurf">Entwurf</MenuItem>
            <MenuItem value="versendet">Versendet</MenuItem>
            <MenuItem value="bezahlt">Bezahlt</MenuItem>
            <MenuItem value="ueberfaellig">Überfällig</MenuItem>
            <MenuItem value="mahnung">Mahnung</MenuItem>
          </TextField>

          <Box flex={1} />

          <Typography variant="body2" color="text.secondary">
            {filteredInvoices.length} von {invoices.length} Rechnungen
          </Typography>
        </Stack>
      </Paper>

      {/* Invoices Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'rechnungsnummer'}
                    direction={orderBy === 'rechnungsnummer' ? order : 'asc'}
                    onClick={() => handleSort('rechnungsnummer')}
                  >
                    Rechnungsnr.
                  </TableSortLabel>
                </TableCell>
                <TableCell>Empfänger</TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'rechnungsdatum'}
                    direction={orderBy === 'rechnungsdatum' ? order : 'asc'}
                    onClick={() => handleSort('rechnungsdatum')}
                  >
                    Datum
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'faelligkeitsdatum'}
                    direction={orderBy === 'faelligkeitsdatum' ? order : 'asc'}
                    onClick={() => handleSort('faelligkeitsdatum')}
                  >
                    Fällig
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={orderBy === 'gesamtbetrag'}
                    direction={orderBy === 'gesamtbetrag' ? order : 'asc'}
                    onClick={() => handleSort('gesamtbetrag')}
                  >
                    Betrag
                  </TableSortLabel>
                </TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="center">Aktionen</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedInvoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      Keine Rechnungen gefunden
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedInvoices.map((invoice) => {
                  const daysUntilDue = invoiceService.getDaysUntilDue(invoice);

                  return (
                    <TableRow key={invoice._id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {invoice.rechnungsnummer || '-'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ID: {invoice._id?.slice(-8)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {invoice.rechnungsempfaenger?.businessName || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {formatDate(invoice.rechnungsdatum)}
                      </TableCell>
                      <TableCell>
                        <Box>
                          {formatDate(invoice.faelligkeitsdatum)}
                          {daysUntilDue !== null && invoice.status !== 'bezahlt' && (
                            <Typography
                              variant="caption"
                              display="block"
                              color={daysUntilDue < 0 ? 'error' : daysUntilDue <= 7 ? 'warning.main' : 'text.secondary'}
                            >
                              {daysUntilDue < 0
                                ? `${Math.abs(daysUntilDue)} Tage überfällig`
                                : daysUntilDue === 0
                                  ? 'Heute fällig'
                                  : `Noch ${daysUntilDue} Tage`
                              }
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body1" fontWeight={600}>
                          {formatCurrency(invoice.gesamtbetrag)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Netto: {formatCurrency(invoice.nettobetrag)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        {getStatusChip(invoice.status)}
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={0.5} justifyContent="center">
                          <Tooltip title="Details anzeigen">
                            <IconButton
                              size="small"
                              onClick={() => handleViewInvoice(invoice)}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="PDF herunterladen">
                            <IconButton
                              size="small"
                              onClick={() => handleDownloadInvoice(invoice)}
                            >
                              <DownloadIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="XRechnung XML herunterladen">
                            <IconButton
                              size="small"
                              color="info"
                              onClick={() => handleDownloadXRechnung(invoice)}
                            >
                              <CodeIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          {invoice.status !== 'entwurf' && (
                            <Tooltip title="E-Mail erneut senden">
                              <IconButton
                                size="small"
                                onClick={() => handleResendEmail(invoice)}
                              >
                                <EmailIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          {invoiceService.canDeleteInvoice(invoice.status) && (
                            <Tooltip title="Löschen">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteInvoice(invoice)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
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
          count={filteredInvoices.length}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25, 50]}
          labelRowsPerPage="Zeilen pro Seite:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} von ${count}`}
        />
      </Paper>

      {/* Info Alert */}
      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body2">
          <strong>§14 UStG / XRechnung 3.0:</strong> Rechnungen werden automatisch aus abgeschlossenen Auszahlungen erstellt.
          Sie können PDF und XRechnung XML (EN 16931) herunterladen. Das System ist GoBD-konform mit Audit-Log.
        </Typography>
      </Alert>

      {/* Dialogs */}
      <InvoiceCreateDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSuccess={handleInvoiceCreated}
      />

      <InvoiceDetailDialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        invoice={selectedInvoice}
        onUpdate={handleInvoiceUpdated}
      />
    </Box>
  );
};

export default InvoicesPage;

