// features/admin/components/payouts/PayoutHistoryTable.jsx
// Filterable payout history table with export

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
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
  CircularProgress,
  Typography,
  Stack,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ReceiptIcon from '@mui/icons-material/Receipt';
import { payoutService } from '../../services/payoutService';
import { formatCurrency } from '../../utils/exportHelpers';
import { formatDate } from '../../utils/dateHelpers';
import { DateRangePicker, ExportButton, AdvancedFilters } from '../shared';
import { useDateRange } from '../../hooks/useDateRange';
import { useExport } from '../../hooks/useExport';
import { toastSuccessNotify, toastErrorNotify } from '../../../../helper/ToastNotify';

/**
 * PayoutHistoryTable Component
 * Displays payout history with filtering, sorting, and export
 */
const PayoutHistoryTable = () => {
  const [loading, setLoading] = useState(true);
  const [payouts, setPayouts] = useState([]);
  const [filteredPayouts, setFilteredPayouts] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedPayout, setSelectedPayout] = useState(null);

  const { dateRange, handleDateRangeChange, resetDateRange } = useDateRange('month');
  const { exportData } = useExport();

  // Fetch payouts
  useEffect(() => {
    fetchPayouts();
  }, []);

  // Filter payouts when date range changes
  useEffect(() => {
    filterPayouts();
  }, [payouts, dateRange]);

  const fetchPayouts = async () => {
    try {
      setLoading(true);
      const data = await payoutService.getBusinessesWithPayouts();

      // Flatten payouts from businesses
      const allPayouts = [];
      if (data.businesses) {
        data.businesses.forEach(business => {
          business.payouts?.forEach(payout => {
            allPayouts.push({
              ...payout,
              businessName: business.name,
              businessId: business._id
            });
          });
        });
      }

      setPayouts(allPayouts);
    } catch (error) {
      console.error('Error fetching payouts:', error);
      toastErrorNotify('Fehler beim Laden der Auszahlungen');
    } finally {
      setLoading(false);
    }
  };

  const filterPayouts = () => {
    let filtered = [...payouts];

    // Date range filter
    if (dateRange.startDate && dateRange.endDate) {
      filtered = filtered.filter(payout => {
        const payoutDate = new Date(payout.createdAt);
        return payoutDate >= dateRange.startDate && payoutDate <= dateRange.endDate;
      });
    }

    setFilteredPayouts(filtered);
  };

  // Handle advanced filters
  const handleFilterChange = (filters) => {
    let filtered = [...payouts];

    // Date range filter
    if (dateRange.startDate && dateRange.endDate) {
      filtered = filtered.filter(payout => {
        const payoutDate = new Date(payout.createdAt);
        return payoutDate >= dateRange.startDate && payoutDate <= dateRange.endDate;
      });
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter(payout => payout.status === filters.status);
    }

    // Payment method filter
    if (filters.paymentMethod) {
      filtered = filtered.filter(payout => payout.paymentMethod === filters.paymentMethod);
    }

    setFilteredPayouts(filtered);
    setPage(0);
  };

  // Handle search
  const handleSearchChange = (searchValue) => {
    if (!searchValue) {
      filterPayouts();
      return;
    }

    const searchLower = searchValue.toLowerCase();
    const filtered = payouts.filter(payout => {
      return (
        payout.businessName?.toLowerCase().includes(searchLower) ||
        payout.referenceNumber?.toLowerCase().includes(searchLower) ||
        payout.description?.toLowerCase().includes(searchLower)
      );
    });

    setFilteredPayouts(filtered);
    setPage(0);
  };

  // Handle reset filters
  const handleResetFilters = () => {
    resetDateRange();
    filterPayouts();
  };

  // Handle pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle menu
  const handleMenuOpen = (event, payout) => {
    setAnchorEl(event.currentTarget);
    setSelectedPayout(payout);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedPayout(null);
  };

  // Handle complete payout
  const handleCompletePayout = async () => {
    if (!selectedPayout) return;

    try {
      await payoutService.completePayout(selectedPayout._id);
      toastSuccessNotify('Auszahlung als abgeschlossen markiert');
      fetchPayouts();
    } catch (error) {
      console.error('Error completing payout:', error);
      toastErrorNotify('Fehler beim Abschließen der Auszahlung');
    } finally {
      handleMenuClose();
    }
  };

  // Handle export
  const handleExport = async (format) => {
    const columns = [
      { key: 'createdAt', label: 'Datum' },
      { key: 'businessName', label: 'Geschäft' },
      { key: 'amount', label: 'Betrag' },
      { key: 'paymentMethod', label: 'Methode' },
      { key: 'rechnungsnummer', label: 'Rechnung' },
      { key: 'status', label: 'Status' },
      { key: 'referenceNumber', label: 'Referenz' }
    ];

    await exportData(filteredPayouts, columns, {
      format,
      filename: 'payout-history',
      title: 'Auszahlungs-Verlauf'
    });
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon />;
      case 'pending':
        return <PendingIcon />;
      default:
        return null;
    }
  };

  // Get payment method label
  const getPaymentMethodLabel = (method) => {
    const labels = {
      bank_transfer: 'Banküberweisung',
      paypal: 'PayPal',
      stripe: 'Stripe',
      cash: 'Bar'
    };
    return labels[method] || method;
  };

  // Filter configurations
  const filterConfigs = [
    {
      key: 'status',
      type: 'select',
      label: 'Status',
      options: [
        { value: 'pending', label: 'Ausstehend' },
        { value: 'completed', label: 'Abgeschlossen' },
        { value: 'failed', label: 'Fehlgeschlagen' }
      ]
    },
    {
      key: 'paymentMethod',
      type: 'select',
      label: 'Zahlungsmethode',
      options: [
        { value: 'bank_transfer', label: 'Banküberweisung' },
        { value: 'paypal', label: 'PayPal' },
        { value: 'stripe', label: 'Stripe' },
        { value: 'cash', label: 'Bar' }
      ]
    }
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  const paginatedPayouts = filteredPayouts.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box>
      {/* Date Range Picker */}
      <Box mb={2}>
        <DateRangePicker
          value={dateRange}
          onChange={handleDateRangeChange}
        />
      </Box>

      {/* Advanced Filters */}
      <Box mb={2}>
        <AdvancedFilters
          searchPlaceholder="Geschäft, Referenz oder Beschreibung suchen..."
          filters={filterConfigs}
          onFilterChange={handleFilterChange}
          onSearchChange={handleSearchChange}
          onReset={handleResetFilters}
        />
      </Box>

      {/* Export and Summary */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="body2" color="text.secondary">
          {filteredPayouts.length} Auszahlungen gefunden
        </Typography>
        <ExportButton
          data={filteredPayouts}
          columns={[
            { key: 'createdAt', label: 'Datum' },
            { key: 'businessName', label: 'Geschäft' },
            { key: 'amount', label: 'Betrag' },
            { key: 'paymentMethod', label: 'Methode' },
            { key: 'rechnungsnummer', label: 'Rechnung' },
            { key: 'status', label: 'Status' }
          ]}
          filename="payout-history"
          title="Auszahlungs-Verlauf"
        />
      </Stack>

      {/* Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Datum</TableCell>
                <TableCell>Geschäft</TableCell>
                <TableCell align="right">Betrag</TableCell>
                <TableCell>Methode</TableCell>
                <TableCell>Rechnung</TableCell>
                <TableCell>Referenz</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="center">Aktionen</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedPayouts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                    <Typography color="text.secondary">
                      Keine Auszahlungen gefunden
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedPayouts.map((payout) => (
                  <TableRow key={payout._id} hover>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(payout.createdAt)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(payout.createdAt, 'HH:mm')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {payout.businessName}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight={600} color="primary">
                        {formatCurrency(payout.amount)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {getPaymentMethodLabel(payout.paymentMethod)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {payout.rechnungsnummer ? (
                        <Chip
                          icon={<ReceiptIcon />}
                          label={payout.rechnungsnummer}
                          size="small"
                          color="info"
                          variant="outlined"
                          clickable
                          onClick={() => {
                            // TODO: Navigate to invoice detail or open dialog
                            console.log('Rechnung:', payout.rechnungId);
                          }}
                        />
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          -
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {payout.referenceNumber || payout.transactionReference || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        icon={getStatusIcon(payout.status)}
                        label={
                          payout.status === 'completed' ? 'Abgeschlossen' :
                          payout.status === 'pending' ? 'Ausstehend' :
                          'Fehlgeschlagen'
                        }
                        size="small"
                        color={getStatusColor(payout.status)}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, payout)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={filteredPayouts.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
          labelRowsPerPage="Zeilen pro Seite:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} von ${count}`
          }
        />
      </Paper>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Details anzeigen</ListItemText>
        </MenuItem>
        {selectedPayout?.status === 'pending' && (
          <MenuItem onClick={handleCompletePayout}>
            <ListItemIcon>
              <CheckCircleIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Als abgeschlossen markieren</ListItemText>
          </MenuItem>
        )}
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <ReceiptIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Rechnung erstellen</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default PayoutHistoryTable;
