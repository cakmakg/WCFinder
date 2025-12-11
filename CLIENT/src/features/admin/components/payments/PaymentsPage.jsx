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
} from "@mui/material";
import {
  Search as SearchIcon,
  GetApp as ExportIcon,
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
  AccountBalanceWallet,
} from "@mui/icons-material";
import { adminService } from "../../services/adminService";

const PaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
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

    // Date filter
    if (dateFilter !== "all") {
      const now = new Date();
      let startDate;
      if (dateFilter === "today") {
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      } else if (dateFilter === "week") {
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      } else if (dateFilter === "month") {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      }
      filtered = filtered.filter((payment) => {
        const paymentDate = new Date(payment.createdAt);
        return paymentDate >= startDate;
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
  }, [payments, searchTerm, statusFilter, dateFilter, orderBy, order]);

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
        return { bg: "#16a34a15", color: "#16a34a", label: "Başarılı" };
      case "pending":
        return { bg: "#f59e0b15", color: "#f59e0b", label: "Bekliyor" };
      case "failed":
        return { bg: "#dc262615", color: "#dc2626", label: "Başarısız" };
      case "refunded":
        return { bg: "#6b728015", color: "#6b7280", label: "İade Edildi" };
      default:
        return { bg: "#6b728015", color: "#6b7280", label: status };
    }
  };

  // Statistics
  const stats = useMemo(() => {
    const total = payments.length;
    const succeeded = payments.filter(
      (p) => p.status === "succeeded" || p.status === "paid"
    ).length;
    const pending = payments.filter((p) => p.status === "pending").length;
    const failed = payments.filter((p) => p.status === "failed").length;
    const totalRevenue = payments
      .filter((p) => p.status === "succeeded" || p.status === "paid")
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    const averagePayment = succeeded > 0 ? totalRevenue / succeeded : 0;

    return { total, succeeded, pending, failed, totalRevenue, averagePayment };
  }, [payments]);

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box>
          <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
            Ödeme Yönetimi
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Tüm ödemeleri görüntüleyin ve yönetin
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchPayments}
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
                Toplam Ödeme
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
                Başarılı
              </Typography>
              <Typography variant="h5" fontWeight={700} sx={{ color: "#16a34a" }}>
                {stats.succeeded}
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
                Toplam Gelir
              </Typography>
              <Typography variant="h5" fontWeight={700} sx={{ color: "#0891b2" }}>
                {formatCurrency(stats.totalRevenue)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={4} md={2.4}>
          <Card>
            <CardContent>
              <Typography variant="caption" color="text.secondary">
                Ortalama
              </Typography>
              <Typography variant="h5" fontWeight={700}>
                {formatCurrency(stats.averagePayment)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              placeholder="Ara (Kullanıcı, ID, Payment Intent ID)..."
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
          <Grid item xs={12} sm={6} md={2.5}>
            <FormControl fullWidth>
              <InputLabel>Durum</InputLabel>
              <Select
                value={statusFilter}
                label="Durum"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">Tümü</MenuItem>
                <MenuItem value="succeeded">Başarılı</MenuItem>
                <MenuItem value="paid">Ödendi</MenuItem>
                <MenuItem value="pending">Bekleyen</MenuItem>
                <MenuItem value="failed">Başarısız</MenuItem>
                <MenuItem value="refunded">İade Edildi</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2.5}>
            <FormControl fullWidth>
              <InputLabel>Tarih</InputLabel>
              <Select
                value={dateFilter}
                label="Tarih"
                onChange={(e) => setDateFilter(e.target.value)}
              >
                <MenuItem value="all">Tümü</MenuItem>
                <MenuItem value="today">Bugün</MenuItem>
                <MenuItem value="week">Son 7 Gün</MenuItem>
                <MenuItem value="month">Bu Ay</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<ExportIcon />}
              onClick={() => {
                alert("Export özelliği yakında eklenecek");
              }}
            >
              Dışa Aktar
            </Button>
          </Grid>
        </Grid>
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
                <TableCell>Kullanıcı</TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={orderBy === "amount"}
                    direction={orderBy === "amount" ? order : "asc"}
                    onClick={() => handleRequestSort("amount")}
                  >
                    Tutar
                  </TableSortLabel>
                </TableCell>
                <TableCell>Ödeme Yöntemi</TableCell>
                <TableCell>Durum</TableCell>
                <TableCell>Payment Intent ID</TableCell>
                <TableCell align="center">İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography>Yükleniyor...</Typography>
                  </TableCell>
                </TableRow>
              ) : paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography color="text.secondary">Kayıt bulunamadı</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((payment) => {
                  const statusInfo = getStatusColor(payment.status);
                  return (
                    <TableRow key={payment._id} hover>
                      <TableCell>{formatDate(payment.createdAt)}</TableCell>
                      <TableCell>
                        {payment.userId?.username || payment.userId?.email || "N/A"}
                      </TableCell>
                      <TableCell align="right">
                        <Typography fontWeight={600}>
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
                            bgcolor: statusInfo.bg,
                            color: statusInfo.color,
                            fontWeight: 500,
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
          labelRowsPerPage="Sayfa başına:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
        />
      </Paper>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Ödeme Detayları</DialogTitle>
        <DialogContent>
          {selectedPayment && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  Ödeme ID
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
                  Kullanıcı
                </Typography>
                <Typography variant="body1">
                  {selectedPayment.userId?.username || selectedPayment.userId?.email || "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  Tutar
                </Typography>
                <Typography variant="body1" fontWeight={600} sx={{ fontSize: "1.2rem", color: "#0891b2" }}>
                  {formatCurrency(selectedPayment.amount)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  Durum
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  <Chip
                    label={getStatusColor(selectedPayment.status).label}
                    size="small"
                    sx={{
                      bgcolor: getStatusColor(selectedPayment.status).bg,
                      color: getStatusColor(selectedPayment.status).color,
                    }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  Ödeme Yöntemi
                </Typography>
                <Typography variant="body1">
                  {selectedPayment.paymentMethod || "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">
                  Oluşturulma Tarihi
                </Typography>
                <Typography variant="body1">
                  {formatDate(selectedPayment.createdAt)}
                </Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Kapat</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PaymentsPage;

