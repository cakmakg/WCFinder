// features/admin/components/bookings/BookingsPage.jsx
// Advanced Bookings Management Page

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
  Collapse,
} from "@mui/material";
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
// eslint-disable-next-line no-unused-vars
import { motion, useReducedMotion } from "framer-motion";
import { adminService } from "../../services/adminService";
import { DateRangePicker, ExportButton } from "../shared";
import { COLORS, RADII, SHADOWS } from "../../../../theme/designTokens";

const PANEL_SX = {
  bgcolor: COLORS.backgroundWhite,
  border: `1px solid ${COLORS.border}`,
  borderRadius: RADII.card,
  boxShadow: SHADOWS.subtle,
};

const INPUT_SX = {
  "& .MuiOutlinedInput-root": {
    borderRadius: RADII.input,
    backgroundColor: COLORS.backgroundLight,
    "& fieldset": { borderColor: COLORS.border },
    "&:hover fieldset": { borderColor: COLORS.primary },
    "&.Mui-focused fieldset": { borderColor: COLORS.primary },
  },
  "& .MuiInputLabel-root.Mui-focused": { color: COLORS.primary },
};

const OUTLINED_BUTTON_SX = {
  textTransform: "none",
  fontWeight: 600,
  borderRadius: RADII.button,
  borderColor: COLORS.border,
  color: COLORS.primary,
  "&:hover": { borderColor: COLORS.primary, bgcolor: COLORS.accentBoxBg },
};

const TABLE_HEAD_SX = {
  "& .MuiTableCell-head": {
    bgcolor: COLORS.backgroundLight,
    fontWeight: 600,
    color: COLORS.textSecondary,
    borderBottom: `1px solid ${COLORS.border}`,
  },
};

const BookingsPage = () => {
  const reduceMotion = useReducedMotion();
  const [usages, setUsages] = useState([]);
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
  const [selectedUsage, setSelectedUsage] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllUsages();
      setUsages(response.result || []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedData = useMemo(() => {
    let filtered = usages;

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (usage) =>
          (usage.businessId?.businessName || "").toLowerCase().includes(searchLower) ||
          (usage.userId?.username || "").toLowerCase().includes(searchLower) ||
          (usage.userId?.email || "").toLowerCase().includes(searchLower) ||
          (usage._id || "").toLowerCase().includes(searchLower)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((usage) => usage.status === statusFilter);
    }

    // Date range filter
    if (dateRange.startDate && dateRange.endDate) {
      filtered = filtered.filter((usage) => {
        const usageDate = new Date(usage.createdAt || usage.startTime);
        return usageDate >= dateRange.startDate && usageDate <= dateRange.endDate;
      });
    }

    // Sort
    return [...filtered].sort((a, b) => {
      let aValue = a[orderBy];
      let bValue = b[orderBy];

      if (orderBy === "createdAt" || orderBy === "startTime") {
        aValue = new Date(aValue || 0).getTime();
        bValue = new Date(bValue || 0).getTime();
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
  }, [usages, searchTerm, statusFilter, dateRange, orderBy, order]);

  const paginatedData = useMemo(() => {
    return filteredAndSortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredAndSortedData, page, rowsPerPage]);

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleView = (usage) => {
    setSelectedUsage(usage);
    setViewDialogOpen(true);
  };

  const handleDelete = (usage) => {
    setSelectedUsage(usage);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedUsage) return;
    try {
      await adminService.deleteUsage(selectedUsage._id);
      await fetchBookings();
      setDeleteDialogOpen(false);
      setSelectedUsage(null);
    } catch (error) {
      console.error("Error deleting booking:", error);
    }
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
      case "completed":
        return { bg: "#ecfdf5", color: "#059669", label: "Abgeschlossen" };
      case "pending":
        return { bg: "#fffbeb", color: "#b45309", label: "Ausstehend" };
      case "confirmed":
        return { bg: "#f0f9ff", color: "#0891b2", label: "Bestätigt" };
      case "cancelled":
        return { bg: "#fef2f2", color: "#dc2626", label: "Storniert" };
      default:
        return { bg: "#f1f5f9", color: "#64748b", label: status };
    }
  };

  // Statistics (filtered)
  const stats = useMemo(() => {
    const data = filteredAndSortedData;
    const total = data.length;
    const completed = data.filter((u) => u.status === "completed").length;
    const pending = data.filter((u) => u.status === "pending").length;
    const cancelled = data.filter((u) => u.status === "cancelled").length;
    const totalRevenue = data
      .filter((u) => u.status === "completed" || u.paymentStatus === "paid")
      .reduce((sum, u) => sum + (Number(u.totalFee) || 0), 0);

    return { total, completed, pending, cancelled, totalRevenue };
  }, [filteredAndSortedData]);

  // Export data
  const exportData = useMemo(() => {
    return filteredAndSortedData.map((usage) => ({
      'Datum': formatDate(usage.createdAt || usage.startTime),
      'Geschäft': usage.businessId?.businessName || 'N/A',
      'Benutzer': usage.userId?.username || usage.userId?.email || 'N/A',
      'Betrag (€)': Number(usage.totalFee || 0).toFixed(2),
      'Status': getStatusColor(usage.status).label,
      'Zahlungsstatus': usage.paymentStatus || 'N/A'
    }));
  }, [filteredAndSortedData]);

  // Handle date range change
  const handleDateRangeChange = (newRange) => {
    setDateRange({
      startDate: newRange.startDate,
      endDate: newRange.endDate
    });
  };

  const statCards = [
    { label: "Gesamt", value: stats.total, color: COLORS.textHeading },
    { label: "Abgeschlossen", value: stats.completed, color: "#059669" },
    { label: "Ausstehend", value: stats.pending, color: "#b45309" },
    { label: "Storniert", value: stats.cancelled, color: "#dc2626" },
    { label: "Gesamtumsatz", value: formatCurrency(stats.totalRevenue), color: COLORS.primary },
  ];

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box>
          <Typography
            variant="h4"
            sx={{ mb: 1, fontWeight: 800, color: COLORS.textHeading, letterSpacing: "-0.02em" }}
          >
            Buchungsverwaltung
          </Typography>
          <Typography variant="body2" sx={{ color: COLORS.textSecondary }}>
            Alle Buchungen anzeigen und verwalten
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchBookings}
          disabled={loading}
          sx={OUTLINED_BUTTON_SX}
        >
          Aktualisieren
        </Button>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {statCards.map((card) => (
          <Grid item xs={6} sm={4} md={2.4} key={card.label}>
            <Card elevation={0} sx={PANEL_SX}>
              <CardContent>
                <Typography variant="caption" sx={{ color: COLORS.textSecondary, fontWeight: 600 }}>
                  {card.label}
                </Typography>
                <Typography variant="h5" fontWeight={700} sx={{ color: card.color }}>
                  {card.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Filters */}
      <Paper elevation={0} sx={{ ...PANEL_SX, p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Suchen (Betrieb, Benutzer, ID)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={INPUT_SX}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: COLORS.textSecondary }} />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small" sx={INPUT_SX}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">Alle</MenuItem>
                <MenuItem value="pending">Ausstehend</MenuItem>
                <MenuItem value="confirmed">Bestätigt</MenuItem>
                <MenuItem value="completed">Abgeschlossen</MenuItem>
                <MenuItem value="cancelled">Storniert</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} sm={3} md={2.5}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FilterListIcon />}
              onClick={() => setShowDatePicker(!showDatePicker)}
              sx={OUTLINED_BUTTON_SX}
            >
              Zeitraum
            </Button>
          </Grid>
          <Grid item xs={6} sm={3} md={2.5}>
            <ExportButton
              data={exportData}
              filename="buchungen"
              title="Buchungen Export"
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
      <Paper elevation={0} sx={{ ...PANEL_SX, overflow: "hidden" }}>
        <TableContainer>
          <Table sx={{ "& .MuiTableCell-root": { borderColor: COLORS.border } }}>
            <TableHead sx={TABLE_HEAD_SX}>
              <TableRow>
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
                    active={orderBy === "totalFee"}
                    direction={orderBy === "totalFee" ? order : "asc"}
                    onClick={() => handleRequestSort("totalFee")}
                  >
                    Betrag
                  </TableSortLabel>
                </TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Aktionen</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography>Laden...</Typography>
                  </TableCell>
                </TableRow>
              ) : paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography sx={{ color: COLORS.textSecondary }}>Keine Einträge gefunden</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((usage) => {
                  const statusInfo = getStatusColor(usage.status);
                  return (
                    <TableRow
                      key={usage._id}
                      hover
                      sx={{ "&:hover": { bgcolor: COLORS.backgroundLight } }}
                    >
                      <TableCell>{formatDate(usage.createdAt || usage.startTime)}</TableCell>
                      <TableCell>
                        {usage.businessId?.businessName || usage.businessName || "N/A"}
                      </TableCell>
                      <TableCell>
                        {usage.userId?.username || usage.userId?.email || "N/A"}
                      </TableCell>
                      <TableCell align="right">
                        <Typography fontWeight={600}>
                          {formatCurrency(usage.totalFee)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={statusInfo.label}
                          size="small"
                          sx={{
                            bgcolor: statusInfo.bg,
                            color: statusInfo.color,
                            fontWeight: 600,
                            borderRadius: "999px",
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton size="small" onClick={() => handleView(usage)}>
                          <ViewIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(usage)}
                        >
                          <DeleteIcon />
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
          labelRowsPerPage="Einträge pro Seite:"
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
        <DialogTitle sx={{ fontWeight: 800, color: COLORS.textHeading }}>
          Buchungsdetails
        </DialogTitle>
        <DialogContent>
          {selectedUsage && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" sx={{ color: COLORS.textSecondary }}>
                  Buchungs-ID
                </Typography>
                <Typography variant="body1">{selectedUsage._id}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" sx={{ color: COLORS.textSecondary }}>
                  Betrieb
                </Typography>
                <Typography variant="body1">
                  {selectedUsage.businessId?.businessName || "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" sx={{ color: COLORS.textSecondary }}>
                  Benutzer
                </Typography>
                <Typography variant="body1">
                  {selectedUsage.userId?.username || selectedUsage.userId?.email || "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" sx={{ color: COLORS.textSecondary }}>
                  Betrag
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {formatCurrency(selectedUsage.totalFee)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" sx={{ color: COLORS.textSecondary }}>
                  Status
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  <Chip
                    label={getStatusColor(selectedUsage.status).label}
                    size="small"
                    sx={{
                      bgcolor: getStatusColor(selectedUsage.status).bg,
                      color: getStatusColor(selectedUsage.status).color,
                      fontWeight: 600,
                      borderRadius: "999px",
                    }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" sx={{ color: COLORS.textSecondary }}>
                  Erstellungsdatum
                </Typography>
                <Typography variant="body1">
                  {formatDate(selectedUsage.createdAt)}
                </Typography>
              </Grid>
              {selectedUsage.startTime && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" sx={{ color: COLORS.textSecondary }}>
                    Startzeit
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(selectedUsage.startTime)}
                  </Typography>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setViewDialogOpen(false)}
            sx={{ textTransform: "none", fontWeight: 600, borderRadius: RADII.button }}
          >
            Schließen
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{ sx: { borderRadius: RADII.panel } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: COLORS.textHeading }}>
          Buchung löschen
        </DialogTitle>
        <DialogContent>
          <Typography>
            Sind Sie sicher, dass Sie diese Buchung löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            sx={{ textTransform: "none", fontWeight: 600, borderRadius: RADII.button, color: COLORS.textSecondary }}
          >
            Abbrechen
          </Button>
          <Button
            onClick={confirmDelete}
            variant="outlined"
            sx={{
              textTransform: "none",
              fontWeight: 600,
              borderRadius: RADII.button,
              color: "#dc2626",
              borderColor: "#dc2626",
              "&:hover": { borderColor: "#b91c1c", bgcolor: "#fef2f2" },
            }}
          >
            Löschen
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
    </motion.div>
  );
};

export default BookingsPage;
