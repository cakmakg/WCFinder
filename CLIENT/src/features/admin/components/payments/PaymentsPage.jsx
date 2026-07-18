// features/admin/components/payments/PaymentsPage.jsx
// Advanced Payments Management Page

import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  MenuItem,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  Alert,
  Collapse,
} from "@mui/material";
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
  AccountBalanceWallet,
  FilterList as FilterIcon,
} from "@mui/icons-material";
import { motion, useReducedMotion } from "framer-motion";
import { COLORS, RADII, SHADOWS } from "../../../../theme/designTokens";
import { adminService } from "../../services/adminService";
import { DateRangePicker, ExportButton } from "../shared";

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: RADII.input,
    backgroundColor: COLORS.backgroundLight,
    "&:hover fieldset": { borderColor: COLORS.primary },
    "&.Mui-focused fieldset": { borderColor: COLORS.primary },
  },
  "& .MuiInputLabel-root.Mui-focused": { color: COLORS.primary },
};

const outlineButtonSx = {
  textTransform: "none",
  fontWeight: 600,
  borderRadius: RADII.button,
  borderColor: COLORS.border,
  color: COLORS.primary,
  "&:hover": { borderColor: COLORS.primary, backgroundColor: COLORS.accentBoxBg },
};

const panelSx = {
  backgroundColor: "white",
  border: `1px solid ${COLORS.border}`,
  borderRadius: RADII.card,
  boxShadow: SHADOWS.subtle,
};

const PaymentsPage = () => {
  const reduceMotion = useReducedMotion();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [orderBy, setOrderBy] = useState("createdAt");
  const [order, setOrder] = useState("desc");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllPayments();
      setPayments(response.result || []);
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedData = useMemo(() => {
    let filtered = payments;

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (payment) =>
          (payment.businessId?.businessName || "").toLowerCase().includes(searchLower) ||
          (payment.userId?.username || "").toLowerCase().includes(searchLower) ||
          (payment.userId?.email || "").toLowerCase().includes(searchLower) ||
          (payment._id || "").toLowerCase().includes(searchLower) ||
          (payment.paymentIntentId || "").toLowerCase().includes(searchLower)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((payment) => payment.status === statusFilter);
    }

    // Date range filter
    if (dateRange.startDate && dateRange.endDate) {
      filtered = filtered.filter((payment) => {
        const paymentDate = new Date(payment.createdAt);
        return paymentDate >= dateRange.startDate && paymentDate <= dateRange.endDate;
      });
    }

    // Sort
    return [...filtered].sort((a, b) => {
      let aValue = a[orderBy];
      let bValue = b[orderBy];

      if (orderBy === "createdAt" || orderBy === "amount") {
        if (orderBy === "createdAt") {
          aValue = new Date(aValue || 0).getTime();
          bValue = new Date(bValue || 0).getTime();
        }
      } else if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (order === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [payments, searchTerm, statusFilter, dateRange, orderBy, order]);

  const paginatedData = useMemo(() => {
    return filteredAndSortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredAndSortedData, page, rowsPerPage]);

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleView = (payment) => {
    setSelectedPayment(payment);
    setViewDialogOpen(true);
  };

  const formatCurrency = (value) => {
    return `€${Number(value || 0).toLocaleString("de-DE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleString("de-DE", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "succeeded":
      case "paid":
        return { bg: "#ecfdf5", color: "#059669", label: "Erfolgreich" };
      case "pending":
        return { bg: "#fffbeb", color: "#d97706", label: "Ausstehend" };
      case "failed":
        return { bg: "#fef2f2", color: "#dc2626", label: "Fehlgeschlagen" };
      case "refunded":
        return { bg: "#f1f5f9", color: "#64748b", label: "Erstattet" };
      default:
        return { bg: "#f1f5f9", color: "#64748b", label: status };
    }
  };

  // Statistics (filtered)
  const stats = useMemo(() => {
    const data = filteredAndSortedData;
    const total = data.length;
    const succeeded = data.filter(
      (p) => p.status === "succeeded" || p.status === "paid"
    ).length;
    const pending = data.filter((p) => p.status === "pending").length;
    const failed = data.filter((p) => p.status === "failed").length;
    const totalRevenue = data
      .filter((p) => p.status === "succeeded" || p.status === "paid")
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    const averagePayment = succeeded > 0 ? totalRevenue / succeeded : 0;

    return { total, succeeded, pending, failed, totalRevenue, averagePayment };
  }, [filteredAndSortedData]);

  // Export data
  const exportData = useMemo(() => {
    return filteredAndSortedData.map((payment) => ({
      'Datum': formatDate(payment.createdAt),
      'Geschäft': payment.businessId?.businessName || 'N/A',
      'Benutzer': payment.userId?.username || payment.userId?.email || 'N/A',
      'Betrag (€)': Number(payment.amount || 0).toFixed(2),
      'Zahlungsmethode': payment.paymentMethod || 'N/A',
      'Status': getStatusColor(payment.status).label,
      'Payment Intent ID': payment.paymentIntentId || 'N/A'
    }));
  }, [filteredAndSortedData]);

  // Handle date range change
  const handleDateRangeChange = (newRange) => {
    setDateRange({
      startDate: newRange.startDate,
      endDate: newRange.endDate
    });
  };

  return (
    <Box
      component={motion.div}
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      {/* Header */}
      <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box>
          <Typography variant="h4" sx={{ mb: 1, fontWeight: 800, color: COLORS.textHeading, letterSpacing: "-0.02em" }}>
            Zahlungsverwaltung
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Alle Zahlungen anzeigen und verwalten
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchPayments}
          disabled={loading}
          sx={outlineButtonSx}
        >
          Aktualisieren
        </Button>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={4} md={2.4}>
          <Card sx={panelSx}>
            <CardContent>
              <Typography variant="caption" color="text.secondary">
                Gesamte Zahlungen
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: COLORS.textHeading, fontVariantNumeric: "tabular-nums" }}>
                {stats.total}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={4} md={2.4}>
          <Card sx={panelSx}>
            <CardContent>
              <Typography variant="caption" color="text.secondary">
                Erfolgreich
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: "#059669", fontVariantNumeric: "tabular-nums" }}>
                {stats.succeeded}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={4} md={2.4}>
          <Card sx={panelSx}>
            <CardContent>
              <Typography variant="caption" color="text.secondary">
                Ausstehend
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: "#d97706", fontVariantNumeric: "tabular-nums" }}>
                {stats.pending}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={4} md={2.4}>
          <Card sx={panelSx}>
            <CardContent>
              <Typography variant="caption" color="text.secondary">
                Gesamtumsatz
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: COLORS.primary, fontVariantNumeric: "tabular-nums" }}>
                {formatCurrency(stats.totalRevenue)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={4} md={2.4}>
          <Card sx={panelSx}>
            <CardContent>
              <Typography variant="caption" color="text.secondary">
                Durchschnitt
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: COLORS.textHeading, fontVariantNumeric: "tabular-nums" }}>
                {formatCurrency(stats.averagePayment)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ ...panelSx, p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              size="small"
              placeholder="Suchen (Betrieb, Benutzer, ID)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={fieldSx}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small" sx={fieldSx}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">Alle</MenuItem>
                <MenuItem value="succeeded">Erfolgreich</MenuItem>
                <MenuItem value="paid">Bezahlt</MenuItem>
                <MenuItem value="pending">Ausstehend</MenuItem>
                <MenuItem value="failed">Fehlgeschlagen</MenuItem>
                <MenuItem value="refunded">Erstattet</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} sm={3} md={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={() => setShowDatePicker(!showDatePicker)}
              sx={outlineButtonSx}
            >
              Zeitraum
            </Button>
          </Grid>
          <Grid item xs={6} sm={3} md={2}>
            <ExportButton
              data={exportData}
              filename="zahlungen"
              title="Zahlungen Export"
            />
          </Grid>
        </Grid>

        {/* Date Range Picker */}
        <Collapse in={showDatePicker}>
          <Box mt={2}>
            <DateRangePicker
              defaultPreset="last30days"
              enableComparison={false}
              onChange={handleDateRangeChange}
            />
          </Box>
        </Collapse>
      </Paper>

      {/* Table */}
      <Paper sx={{ ...panelSx, overflow: "hidden" }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow
                sx={{
                  bgcolor: COLORS.backgroundLight,
                  "& th": { fontWeight: 600, color: COLORS.textSecondary, borderColor: COLORS.border },
                }}
              >
                <TableCell>
                  <TableSortLabel
                    active={orderBy === "createdAt"}
                    direction={orderBy === "createdAt" ? order : "asc"}
                    onClick={() => handleRequestSort("createdAt")}
                  >
                    Datum
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === "businessId"}
                    direction={orderBy === "businessId" ? order : "asc"}
                    onClick={() => handleRequestSort("businessId")}
                  >
                    Betrieb
                  </TableSortLabel>
                </TableCell>
                <TableCell>Benutzer</TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={orderBy === "amount"}
                    direction={orderBy === "amount" ? order : "asc"}
                    onClick={() => handleRequestSort("amount")}
                  >
                    Betrag
                  </TableSortLabel>
                </TableCell>
                <TableCell>Zahlungsmethode</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Payment Intent ID</TableCell>
                <TableCell align="center">Aktionen</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography>Laden...</Typography>
                  </TableCell>
                </TableRow>
              ) : paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography color="text.secondary">Keine Einträge gefunden</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((payment) => {
                  const statusInfo = getStatusColor(payment.status);
                  return (
                    <TableRow
                      key={payment._id}
                      hover
                      sx={{
                        "& td": { borderColor: COLORS.border },
                        "&:hover": { bgcolor: COLORS.backgroundLight },
                      }}
                    >
                      <TableCell>{formatDate(payment.createdAt)}</TableCell>
                      <TableCell>
                        {payment.businessId?.businessName || "N/A"}
                      </TableCell>
                      <TableCell>
                        {payment.userId?.username || payment.userId?.email || "N/A"}
                      </TableCell>
                      <TableCell align="right">
                        <Typography sx={{ fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
                          {formatCurrency(payment.amount)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {payment.paymentMethod || "N/A"}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={statusInfo.label}
                          size="small"
                          sx={{
                            borderRadius: "999px",
                            bgcolor: statusInfo.bg,
                            color: statusInfo.color,
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" sx={{ fontFamily: "monospace" }}>
                          {payment.paymentIntentId?.substring(0, 20) || "N/A"}...
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton size="small" onClick={() => handleView(payment)}>
                          <ViewIcon />
                        </IconButton>
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
          count={filteredAndSortedData.length}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 25, 50, 100]}
          labelRowsPerPage="Zeilen pro Seite:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
        />
      </Paper>

      {/* View Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: RADII.panel } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: COLORS.textHeading, letterSpacing: "-0.02em" }}>
          Zahlungsdetails
        </DialogTitle>
        <DialogContent>
          {selectedPayment && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  Zahlungs-ID
                </Typography>
                <Typography variant="body1" sx={{ fontFamily: "monospace", fontSize: "0.85rem" }}>
                  {selectedPayment._id}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  Payment Intent ID
                </Typography>
                <Typography variant="body1" sx={{ fontFamily: "monospace", fontSize: "0.85rem" }}>
                  {selectedPayment.paymentIntentId || "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  Betrieb
                </Typography>
                <Typography variant="body1">
                  {selectedPayment.businessId?.businessName || "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  Benutzer
                </Typography>
                <Typography variant="body1">
                  {selectedPayment.userId?.username || selectedPayment.userId?.email || "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  Betrag
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 800, fontSize: "1.2rem", color: COLORS.primary, fontVariantNumeric: "tabular-nums" }}>
                  {formatCurrency(selectedPayment.amount)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  Status
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  <Chip
                    label={getStatusColor(selectedPayment.status).label}
                    size="small"
                    sx={{
                      borderRadius: "999px",
                      fontWeight: 600,
                      bgcolor: getStatusColor(selectedPayment.status).bg,
                      color: getStatusColor(selectedPayment.status).color,
                    }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  Zahlungsmethode
                </Typography>
                <Typography variant="body1">
                  {selectedPayment.paymentMethod || "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">
                  Erstellungsdatum
                </Typography>
                <Typography variant="body1">
                  {formatDate(selectedPayment.createdAt)}
                </Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setViewDialogOpen(false)}
            sx={{ textTransform: "none", fontWeight: 600, color: COLORS.textSecondary }}
          >
            Schließen
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PaymentsPage;

