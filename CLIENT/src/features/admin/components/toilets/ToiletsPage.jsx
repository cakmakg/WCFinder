// features/admin/components/toilets/ToiletsPage.jsx
// Advanced Toilets Management Page with CRUD operations

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
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Refresh as RefreshIcon,
  Wc as WcIcon,
} from "@mui/icons-material";
import { adminService } from "../../services/adminService";
import useAxios from "../../../../hook/useAxios";

const ToiletsPage = () => {
  const { axiosWithToken } = useAxios();
  const [toilets, setToilets] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [businessFilter, setBusinessFilter] = useState("all");
  const [orderBy, setOrderBy] = useState("createdAt");
  const [order, setOrder] = useState("desc");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [selectedToilet, setSelectedToilet] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Form state for create/edit
  const [formData, setFormData] = useState({
    name: "",
    fee: 1.0,
    business: "",
    features: {
      isAccessible: false,
      hasBabyChangingStation: false,
    },
    status: "available",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [toiletsData, businessesData] = await Promise.all([
        adminService.getAllToilets().catch(() => ({ result: [] })),
        adminService.getAllBusinesses().catch(() => ({ result: [] })),
      ]);
      setToilets(toiletsData.result || []);
      setBusinesses(businessesData.result || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Veriler yüklenirken hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedData = useMemo(() => {
    let filtered = toilets;

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (toilet) =>
          (toilet.name || "").toLowerCase().includes(searchLower) ||
          (toilet.business?.businessName || "").toLowerCase().includes(searchLower) ||
          (toilet._id || "").toLowerCase().includes(searchLower)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((toilet) => toilet.status === statusFilter);
    }

    // Business filter
    if (businessFilter !== "all") {
      const businessId = businessFilter;
      filtered = filtered.filter((toilet) => {
        const toiletBusinessId = toilet.business?._id || toilet.business?.toString() || toilet.business;
        return toiletBusinessId === businessId;
      });
    }

    // Sort
    return [...filtered].sort((a, b) => {
      let aValue = a[orderBy];
      let bValue = b[orderBy];

      if (orderBy === "createdAt" || orderBy === "fee") {
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
  }, [toilets, searchTerm, statusFilter, businessFilter, orderBy, order]);

  const paginatedData = useMemo(() => {
    return filteredAndSortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredAndSortedData, page, rowsPerPage]);

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleView = (toilet) => {
    setSelectedToilet(toilet);
    setViewDialogOpen(true);
  };

  const handleEdit = (toilet) => {
    setSelectedToilet(toilet);
    setFormData({
      name: toilet.name || "",
      fee: toilet.fee || 1.0,
      business: toilet.business?._id || toilet.business || "",
      features: {
        isAccessible: toilet.features?.isAccessible || false,
        hasBabyChangingStation: toilet.features?.hasBabyChangingStation || false,
      },
      status: toilet.status || "available",
    });
    setEditDialogOpen(true);
  };

  const handleDelete = (toilet) => {
    setSelectedToilet(toilet);
    setDeleteDialogOpen(true);
  };

  const handleCreate = () => {
    setSelectedToilet(null);
    setFormData({
      name: "",
      fee: 1.0,
      business: "",
      features: {
        isAccessible: false,
        hasBabyChangingStation: false,
      },
      status: "available",
    });
    setEditDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      setError(null);
      setSuccess(null);

      if (selectedToilet) {
        // Update existing
        await adminService.updateToilet(selectedToilet._id, formData);
        setSuccess("Tuvalet başarıyla güncellendi!");
      } else {
        // Create new
        await axiosWithToken.post("/toilets", formData);
        setSuccess("Tuvalet başarıyla oluşturuldu!");
      }

      setEditDialogOpen(false);
      await fetchData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error("Error saving toilet:", error);
      setError(error.response?.data?.message || "Kaydetme hatası oluştu.");
    }
  };

  const confirmDelete = async () => {
    if (!selectedToilet) return;
    try {
      await adminService.deleteToilet(selectedToilet._id);
      setDeleteDialogOpen(false);
      setSelectedToilet(null);
      await fetchData();
      setSuccess("Tuvalet başarıyla silindi!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error("Error deleting toilet:", error);
      setError("Silme hatası oluştu.");
    }
  };

  const formatCurrency = (value) => {
    return `€${Number(value || 0).toFixed(2)}`;
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("de-DE", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "available":
        return { bg: "#16a34a15", color: "#16a34a", label: "Müsait" };
      case "in_use":
        return { bg: "#0891b215", color: "#0891b2", label: "Kullanımda" };
      case "out_of_order":
        return { bg: "#dc262615", color: "#dc2626", label: "Arızalı" };
      default:
        return { bg: "#6b728015", color: "#6b7280", label: status };
    }
  };

  // Statistics
  const stats = useMemo(() => {
    const total = toilets.length;
    const available = toilets.filter((t) => t.status === "available").length;
    const inUse = toilets.filter((t) => t.status === "in_use").length;
    const outOfOrder = toilets.filter((t) => t.status === "out_of_order").length;
    const accessible = toilets.filter((t) => t.features?.isAccessible).length;
    const withBabyStation = toilets.filter((t) => t.features?.hasBabyChangingStation).length;

    return { total, available, inUse, outOfOrder, accessible, withBabyStation };
  }, [toilets]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "400px" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box>
          <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
            Tuvalet Yönetimi
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Tüm tuvaletleri görüntüleyin, düzenleyin ve yönetin
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchData}
            disabled={loading}
          >
            Yenile
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreate}
            sx={{ bgcolor: "#0891b2", "&:hover": { bgcolor: "#06b6d4" } }}
          >
            Yeni Tuvalet
          </Button>
        </Box>
      </Box>

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={4} md={2}>
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
        <Grid item xs={6} sm={4} md={2}>
          <Card>
            <CardContent>
              <Typography variant="caption" color="text.secondary">
                Müsait
              </Typography>
              <Typography variant="h5" fontWeight={700} sx={{ color: "#16a34a" }}>
                {stats.available}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <Card>
            <CardContent>
              <Typography variant="caption" color="text.secondary">
                Kullanımda
              </Typography>
              <Typography variant="h5" fontWeight={700} sx={{ color: "#0891b2" }}>
                {stats.inUse}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <Card>
            <CardContent>
              <Typography variant="caption" color="text.secondary">
                Arızalı
              </Typography>
              <Typography variant="h5" fontWeight={700} sx={{ color: "#dc2626" }}>
                {stats.outOfOrder}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <Card>
            <CardContent>
              <Typography variant="caption" color="text.secondary">
                Engelli Erişimli
              </Typography>
              <Typography variant="h5" fontWeight={700}>
                {stats.accessible}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <Card>
            <CardContent>
              <Typography variant="caption" color="text.secondary">
                Bebek İstasyonu
              </Typography>
              <Typography variant="h5" fontWeight={700}>
                {stats.withBabyStation}
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
              placeholder="Ara (Tuvalet adı, İşletme, ID)..."
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
            <FormControl fullWidth>
              <InputLabel>Durum</InputLabel>
              <Select
                value={statusFilter}
                label="Durum"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">Tümü</MenuItem>
                <MenuItem value="available">Müsait</MenuItem>
                <MenuItem value="in_use">Kullanımda</MenuItem>
                <MenuItem value="out_of_order">Arızalı</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={5}>
            <FormControl fullWidth>
              <InputLabel>İşletme</InputLabel>
              <Select
                value={businessFilter}
                label="İşletme"
                onChange={(e) => setBusinessFilter(e.target.value)}
              >
                <MenuItem value="all">Tümü</MenuItem>
                {businesses.map((business) => (
                  <MenuItem key={business._id} value={business._id}>
                    {business.businessName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
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
                    active={orderBy === "name"}
                    direction={orderBy === "name" ? order : "asc"}
                    onClick={() => handleRequestSort("name")}
                  >
                    Tuvalet Adı
                  </TableSortLabel>
                </TableCell>
                <TableCell>İşletme</TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={orderBy === "fee"}
                    direction={orderBy === "fee" ? order : "asc"}
                    onClick={() => handleRequestSort("fee")}
                  >
                    Ücret
                  </TableSortLabel>
                </TableCell>
                <TableCell>Özellikler</TableCell>
                <TableCell>Durum</TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === "createdAt"}
                    direction={orderBy === "createdAt" ? order : "asc"}
                    onClick={() => handleRequestSort("createdAt")}
                  >
                    Oluşturulma
                  </TableSortLabel>
                </TableCell>
                <TableCell align="center">İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography color="text.secondary">Kayıt bulunamadı</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((toilet) => {
                  const statusInfo = getStatusColor(toilet.status);
                  return (
                    <TableRow key={toilet._id} hover>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <WcIcon sx={{ color: "#0891b2" }} />
                          <Typography fontWeight={500}>{toilet.name}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {toilet.business?.businessName || "N/A"}
                      </TableCell>
                      <TableCell align="right">
                        <Typography fontWeight={600}>
                          {formatCurrency(toilet.fee)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                          {toilet.features?.isAccessible && (
                            <Chip label="Engelli Erişimli" size="small" color="primary" />
                          )}
                          {toilet.features?.hasBabyChangingStation && (
                            <Chip label="Bebek İstasyonu" size="small" color="secondary" />
                          )}
                          {(!toilet.features?.isAccessible && !toilet.features?.hasBabyChangingStation) && (
                            <Typography variant="caption" color="text.secondary">—</Typography>
                          )}
                        </Box>
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
                        <Typography variant="body2" fontSize="0.8rem">
                          {formatDate(toilet.createdAt)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton size="small" onClick={() => handleView(toilet)}>
                          <ViewIcon />
                        </IconButton>
                        <IconButton size="small" color="primary" onClick={() => handleEdit(toilet)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(toilet)}
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
        <DialogTitle>Tuvalet Detayları</DialogTitle>
        <DialogContent>
          {selectedToilet && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  Tuvalet ID
                </Typography>
                <Typography variant="body1" sx={{ fontFamily: "monospace", fontSize: "0.85rem" }}>
                  {selectedToilet._id}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  Tuvalet Adı
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {selectedToilet.name}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  İşletme
                </Typography>
                <Typography variant="body1">
                  {selectedToilet.business?.businessName || "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  Ücret
                </Typography>
                <Typography variant="body1" fontWeight={600} sx={{ color: "#0891b2" }}>
                  {formatCurrency(selectedToilet.fee)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  Durum
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  <Chip
                    label={getStatusColor(selectedToilet.status).label}
                    size="small"
                    sx={{
                      bgcolor: getStatusColor(selectedToilet.status).bg,
                      color: getStatusColor(selectedToilet.status).color,
                    }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">
                  Özellikler
                </Typography>
                <Box sx={{ mt: 1, display: "flex", gap: 1 }}>
                  <Chip
                    label="Engelli Erişimli"
                    size="small"
                    color={selectedToilet.features?.isAccessible ? "primary" : "default"}
                    variant={selectedToilet.features?.isAccessible ? "filled" : "outlined"}
                  />
                  <Chip
                    label="Bebek Bakım İstasyonu"
                    size="small"
                    color={selectedToilet.features?.hasBabyChangingStation ? "secondary" : "default"}
                    variant={selectedToilet.features?.hasBabyChangingStation ? "filled" : "outlined"}
                  />
                </Box>
              </Grid>
              {selectedToilet.averageRatings && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    Ortalama Puan
                  </Typography>
                  <Typography variant="body1">
                    {selectedToilet.averageRatings.overall?.toFixed(1) || "N/A"} / 5.0
                  </Typography>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Kapat</Button>
          <Button onClick={() => { setViewDialogOpen(false); handleEdit(selectedToilet); }} variant="contained">
            Düzenle
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit/Create Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedToilet ? "Tuvalet Düzenle" : "Yeni Tuvalet Ekle"}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tuvalet Adı"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>İşletme</InputLabel>
                <Select
                  value={formData.business}
                  label="İşletme"
                  onChange={(e) => setFormData({ ...formData, business: e.target.value })}
                  required
                >
                  <MenuItem value="">Seçiniz</MenuItem>
                  {businesses.map((business) => (
                    <MenuItem key={business._id} value={business._id}>
                      {business.businessName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Ücret (EUR)"
                type="number"
                value={formData.fee}
                onChange={(e) => setFormData({ ...formData, fee: parseFloat(e.target.value) || 0 })}
                inputProps={{ min: 0, step: 0.01 }}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Durum</InputLabel>
                <Select
                  value={formData.status}
                  label="Durum"
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <MenuItem value="available">Müsait</MenuItem>
                  <MenuItem value="in_use">Kullanımda</MenuItem>
                  <MenuItem value="out_of_order">Arızalı</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.features.isAccessible}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        features: { ...formData.features, isAccessible: e.target.checked },
                      })
                    }
                  />
                }
                label="Engelli Erişimli"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.features.hasBabyChangingStation}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        features: { ...formData.features, hasBabyChangingStation: e.target.checked },
                      })
                    }
                  />
                }
                label="Bebek Bakım İstasyonu"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>İptal</Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={!formData.name || !formData.business}
          >
            Kaydet
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Tuvaleti Sil</DialogTitle>
        <DialogContent>
          <Typography>
            Bu tuvaleti silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
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

export default ToiletsPage;

