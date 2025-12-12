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
import { adminService } from "../../services/adminService";
import { DateRangePicker, ExportButton } from "../shared";

const BookingsPage = () => {
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
        return { bg: "#16a34a15", color: "#16a34a", label: "Tamamlandı" };
      case "pending":
        return { bg: "#f59e0b15", color: "#f59e0b", label: "Bekliyor" };
      case "confirmed":
        return { bg: "#0891b215", color: "#0891b2", label: "Onaylandı" };
      case "cancelled":
        return { bg: "#dc262615", color: "#dc2626", label: "İptal Edildi" };
      default:
        return { bg: "#6b728015", color: "#6b7280", label: status };
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

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box>
          <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
            Rezervasyon Yönetimi
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Tüm rezervasyonları görüntüleyin ve yönetin
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchBookings}
          disabled={loading}
        >
          Yenile
        </Button>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={4} md={2.4}>
          <Card>
            <CardContent>
              <Typography variant="caption" color="text.secondary">
                Toplam
              </Typography>
              <Typography variant="h5" fontWeight={700}>
                {stats.total}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={4} md={2.4}>
          <Card>
            <CardContent>
              <Typography variant="caption" color="text.secondary">
                Tamamlanan
              </Typography>
              <Typography variant="h5" fontWeight={700} sx={{ color: "#16a34a" }}>
                {stats.completed}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={4} md={2.4}>
          <Card>
            <CardContent>
              <Typography variant="caption" color="text.secondary">
                Bekleyen
              </Typography>
              <Typography variant="h5" fontWeight={700} sx={{ color: "#f59e0b" }}>
                {stats.pending}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={4} md={2.4}>
          <Card>
            <CardContent>
              <Typography variant="caption" color="text.secondary">
                İptal Edilen
              </Typography>
              <Typography variant="h5" fontWeight={700} sx={{ color: "#dc2626" }}>
                {stats.cancelled}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={4} md={2.4}>
          <Card>
            <CardContent>
              <Typography variant="caption" color="text.secondary">
                Toplam Gelir
              </Typography>
              <Typography variant="h5" fontWeight={700} sx={{ color: "#0891b2" }}>
                {formatCurrency(stats.totalRevenue)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Ara (İşletme, Kullanıcı, ID)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
            <FormControl fullWidth size="small">
              <InputLabel>Durum</InputLabel>
              <Select
                value={statusFilter}
                label="Durum"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">Tümü</MenuItem>
                <MenuItem value="pending">Bekleyen</MenuItem>
                <MenuItem value="confirmed">Onaylandı</MenuItem>
                <MenuItem value="completed">Tamamlandı</MenuItem>
                <MenuItem value="cancelled">İptal Edildi</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} sm={3} md={2.5}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FilterListIcon />}
              onClick={() => setShowDatePicker(!showDatePicker)}
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
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === "createdAt"}
                    direction={orderBy === "createdAt" ? order : "asc"}
                    onClick={() => handleRequestSort("createdAt")}
                  >
                    Tarih
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === "businessId"}
                    direction={orderBy === "businessId" ? order : "asc"}
                    onClick={() => handleRequestSort("businessId")}
                  >
                    İşletme
                  </TableSortLabel>
                </TableCell>
                <TableCell>Kullanıcı</TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={orderBy === "totalFee"}
                    direction={orderBy === "totalFee" ? order : "asc"}
                    onClick={() => handleRequestSort("totalFee")}
                  >
                    Tutar
                  </TableSortLabel>
                </TableCell>
                <TableCell>Durum</TableCell>
                <TableCell align="center">İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography>Yükleniyor...</Typography>
                  </TableCell>
                </TableRow>
              ) : paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography color="text.secondary">Kayıt bulunamadı</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((usage) => {
                  const statusInfo = getStatusColor(usage.status);
                  return (
                    <TableRow key={usage._id} hover>
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
                            fontWeight: 500,
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
          labelRowsPerPage="Sayfa başına:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
        />
      </Paper>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Rezervasyon Detayları</DialogTitle>
        <DialogContent>
          {selectedUsage && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  Rezervasyon ID
                </Typography>
                <Typography variant="body1">{selectedUsage._id}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  İşletme
                </Typography>
                <Typography variant="body1">
                  {selectedUsage.businessId?.businessName || "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  Kullanıcı
                </Typography>
                <Typography variant="body1">
                  {selectedUsage.userId?.username || selectedUsage.userId?.email || "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  Tutar
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {formatCurrency(selectedUsage.totalFee)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  Durum
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  <Chip
                    label={getStatusColor(selectedUsage.status).label}
                    size="small"
                    sx={{
                      bgcolor: getStatusColor(selectedUsage.status).bg,
                      color: getStatusColor(selectedUsage.status).color,
                    }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  Oluşturulma Tarihi
                </Typography>
                <Typography variant="body1">
                  {formatDate(selectedUsage.createdAt)}
                </Typography>
              </Grid>
              {selectedUsage.startTime && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    Başlangıç
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
          <Button onClick={() => setViewDialogOpen(false)}>Kapat</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Rezervasyonu Sil</DialogTitle>
        <DialogContent>
          <Typography>
            Bu rezervasyonu silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>İptal</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Sil
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BookingsPage;

