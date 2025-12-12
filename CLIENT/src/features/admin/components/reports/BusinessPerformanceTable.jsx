// features/admin/components/reports/BusinessPerformanceTable.jsx
// Business performance comparison table

import React, { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TablePagination,
  TextField,
  InputAdornment,
  Chip,
  Rating,
  Stack,
  LinearProgress
} from '@mui/material';
import {
  Search as SearchIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon
} from '@mui/icons-material';
import { ExportButton } from '../shared';

/**
 * BusinessPerformanceTable Component
 * Sortable table showing business performance metrics
 */
const BusinessPerformanceTable = ({ data = [], dateRange }) => {
  const [orderBy, setOrderBy] = useState('totalRevenue');
  const [order, setOrder] = useState('desc');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter and sort data
  const filteredData = useMemo(() => {
    let result = [...data];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(b =>
        b.businessName?.toLowerCase().includes(term) ||
        b.businessType?.toLowerCase().includes(term)
      );
    }

    // Sort
    result.sort((a, b) => {
      const aValue = a[orderBy] || 0;
      const bValue = b[orderBy] || 0;

      if (order === 'asc') {
        return aValue > bValue ? 1 : -1;
      }
      return aValue < bValue ? 1 : -1;
    });

    return result;
  }, [data, searchTerm, orderBy, order]);

  // Pagination
  const paginatedData = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, page, rowsPerPage]);

  // Calculate totals for summary
  const totals = useMemo(() => {
    return filteredData.reduce(
      (acc, b) => ({
        totalRevenue: acc.totalRevenue + (b.totalRevenue || 0),
        bookingCount: acc.bookingCount + (b.bookingCount || 0),
        platformCommission: acc.platformCommission + (b.platformCommission || 0)
      }),
      { totalRevenue: 0, bookingCount: 0, platformCommission: 0 }
    );
  }, [filteredData]);

  // Sort handler
  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Export data
  const exportData = useMemo(() => {
    return filteredData.map((b, index) => ({
      'Rang': index + 1,
      'Geschäft': b.businessName,
      'Typ': getBusinessTypeLabel(b.businessType),
      'Umsatz (€)': b.totalRevenue.toFixed(2),
      'Kommission (€)': b.platformCommission.toFixed(2),
      'Buchungen': b.bookingCount,
      'Abschlussrate (%)': b.completionRate.toFixed(1),
      'Ø Buchungswert (€)': b.averageBookingValue.toFixed(2),
      'Bewertung': b.averageRating.toFixed(1),
      'Bewertungen': b.reviewCount
    }));
  }, [filteredData]);

  // Get business type label
  function getBusinessTypeLabel(type) {
    const types = {
      restaurant: 'Restaurant',
      cafe: 'Café',
      bar: 'Bar',
      hotel: 'Hotel',
      shopping: 'Geschäft',
      other: 'Sonstiges'
    };
    return types[type] || type;
  }

  // Get status color
  function getStatusColor(status) {
    const colors = {
      approved: 'success',
      pending: 'warning',
      rejected: 'error'
    };
    return colors[status] || 'default';
  }

  // Column definitions
  const columns = [
    { id: 'rank', label: '#', sortable: false, width: 50 },
    { id: 'businessName', label: 'Geschäft', sortable: true },
    { id: 'businessType', label: 'Typ', sortable: true },
    { id: 'totalRevenue', label: 'Umsatz', sortable: true, align: 'right' },
    { id: 'platformCommission', label: 'Kommission', sortable: true, align: 'right' },
    { id: 'bookingCount', label: 'Buchungen', sortable: true, align: 'center' },
    { id: 'completionRate', label: 'Abschlussrate', sortable: true, align: 'center' },
    { id: 'averageBookingValue', label: 'Ø Wert', sortable: true, align: 'right' },
    { id: 'averageRating', label: 'Bewertung', sortable: true, align: 'center' }
  ];

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
        <Typography variant="h6" fontWeight={600}>
          Geschäfts-Performance
        </Typography>

        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
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
            sx={{ minWidth: 200 }}
          />
          <ExportButton
            data={exportData}
            filename="geschaeft_performance"
            title="Performance Export"
          />
        </Stack>
      </Box>

      {/* Summary Row */}
      <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
        <Stack direction="row" spacing={4} justifyContent="center" flexWrap="wrap">
          <Box textAlign="center">
            <Typography variant="caption" color="text.secondary">
              Geschäfte
            </Typography>
            <Typography variant="h6" fontWeight={600}>
              {filteredData.length}
            </Typography>
          </Box>
          <Box textAlign="center">
            <Typography variant="caption" color="text.secondary">
              Gesamtumsatz
            </Typography>
            <Typography variant="h6" fontWeight={600} color="primary">
              €{totals.totalRevenue.toFixed(2)}
            </Typography>
          </Box>
          <Box textAlign="center">
            <Typography variant="caption" color="text.secondary">
              Kommission
            </Typography>
            <Typography variant="h6" fontWeight={600} color="success.main">
              €{totals.platformCommission.toFixed(2)}
            </Typography>
          </Box>
          <Box textAlign="center">
            <Typography variant="caption" color="text.secondary">
              Buchungen
            </Typography>
            <Typography variant="h6" fontWeight={600}>
              {totals.bookingCount}
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {/* Table */}
      <Paper variant="outlined">
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    align={column.align || 'left'}
                    sx={{ width: column.width, fontWeight: 600 }}
                  >
                    {column.sortable ? (
                      <TableSortLabel
                        active={orderBy === column.id}
                        direction={orderBy === column.id ? order : 'asc'}
                        onClick={() => handleSort(column.id)}
                      >
                        {column.label}
                      </TableSortLabel>
                    ) : (
                      column.label
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      Keine Geschäfte gefunden
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((business, index) => {
                  const rank = page * rowsPerPage + index + 1;
                  const isTopThree = rank <= 3;

                  return (
                    <TableRow key={business.businessId} hover>
                      {/* Rank */}
                      <TableCell>
                        <Chip
                          label={rank}
                          size="small"
                          sx={{
                            minWidth: 28,
                            bgcolor: isTopThree
                              ? rank === 1 ? '#ffd700' : rank === 2 ? '#c0c0c0' : '#cd7f32'
                              : 'grey.200',
                            color: isTopThree ? 'white' : 'text.primary',
                            fontWeight: 600
                          }}
                        />
                      </TableCell>

                      {/* Business Name */}
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {business.businessName}
                          </Typography>
                          <Chip
                            label={business.status}
                            size="small"
                            color={getStatusColor(business.status)}
                            sx={{ height: 18, fontSize: '0.65rem', mt: 0.5 }}
                          />
                        </Box>
                      </TableCell>

                      {/* Type */}
                      <TableCell>
                        <Chip
                          label={getBusinessTypeLabel(business.businessType)}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>

                      {/* Revenue */}
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={600} color="primary">
                          €{business.totalRevenue.toFixed(2)}
                        </Typography>
                      </TableCell>

                      {/* Commission */}
                      <TableCell align="right">
                        <Typography variant="body2" color="success.main">
                          €{business.platformCommission.toFixed(2)}
                        </Typography>
                      </TableCell>

                      {/* Bookings */}
                      <TableCell align="center">
                        <Typography variant="body2" fontWeight={500}>
                          {business.bookingCount}
                        </Typography>
                      </TableCell>

                      {/* Completion Rate */}
                      <TableCell align="center">
                        <Box display="flex" alignItems="center" gap={1}>
                          <LinearProgress
                            variant="determinate"
                            value={business.completionRate}
                            sx={{
                              width: 50,
                              height: 6,
                              borderRadius: 3,
                              bgcolor: 'grey.200'
                            }}
                          />
                          <Typography variant="caption">
                            {business.completionRate.toFixed(0)}%
                          </Typography>
                        </Box>
                      </TableCell>

                      {/* Average Value */}
                      <TableCell align="right">
                        <Typography variant="body2">
                          €{business.averageBookingValue.toFixed(2)}
                        </Typography>
                      </TableCell>

                      {/* Rating */}
                      <TableCell align="center">
                        {business.reviewCount > 0 ? (
                          <Box display="flex" alignItems="center" justifyContent="center" gap={0.5}>
                            <Rating
                              value={business.averageRating}
                              precision={0.1}
                              size="small"
                              readOnly
                            />
                            <Typography variant="caption" color="text.secondary">
                              ({business.reviewCount})
                            </Typography>
                          </Box>
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            Keine
                          </Typography>
                        )}
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
          count={filteredData.length}
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
    </Box>
  );
};

export default BusinessPerformanceTable;

