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
// eslint-disable-next-line no-unused-vars
import { motion, useReducedMotion } from "framer-motion";
import { adminService } from "../../services/adminService";
import useAxios from "../../../../hook/useAxios";
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

const ToiletsPage = () => {
  const reduceMotion = useReducedMotion();
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
      setError("Fehler beim Laden der Daten.");
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
        setSuccess("Toilette erfolgreich aktualisiert!");
      } else {
        // Create new
        await axiosWithToken.post("/toilets", formData);
        setSuccess("Toilette erfolgreich erstellt!");
      }

      setEditDialogOpen(false);
      await fetchData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error("Error saving toilet:", error);
      setError(error.response?.data?.message || "Fehler beim Speichern.");
    }
  };

  const confirmDelete = async () => {
    if (!selectedToilet) return;
    try {
      await adminService.deleteToilet(selectedToilet._id);
      setDeleteDialogOpen(false);
      setSelectedToilet(null);
      await fetchData();
      setSuccess("Toilette erfolgreich gelöscht!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error("Error deleting toilet:", error);
      setError("Fehler beim Löschen.");
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
        return { bg: "#ecfdf5", color: "#059669", label: "Verfügbar" };
      case "in_use":
        return { bg: "#f0f9ff", color: "#0891b2", label: "In Benutzung" };
      case "out_of_order":
        return { bg: "#fef2f2", color: "#dc2626", label: "Außer Betrieb" };
      default:
        return { bg: "#f1f5f9", color: "#64748b", label: status };
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

  const statCards = [
    { label: "Gesamt", value: stats.total, color: COLORS.textHeading },
    { label: "Verfügbar", value: stats.available, color: "#059669" },
    { label: "In Benutzung", value: stats.inUse, color: COLORS.primary },
    { label: "Außer Betrieb", value: stats.outOfOrder, color: "#dc2626" },
    { label: "Barrierefrei", value: stats.accessible, color: COLORS.textHeading },
    { label: "Wickelstation", value: stats.withBabyStation, color: COLORS.textHeading },
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
            Toilettenverwaltung
          </Typography>
          <Typography variant="body2" sx={{ color: COLORS.textSecondary }}>
            Alle Toiletten anzeigen, bearbeiten und verwalten
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchData}
            disabled={loading}
            sx={OUTLINED_BUTTON_SX}
          >
            Aktualisieren
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreate}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              borderRadius: RADII.button,
              background: COLORS.primaryGradient,
              boxShadow: SHADOWS.brand,
              "&:hover": { background: COLORS.primaryGradientHover },
            }}
          >
            Neue Toilette
          </Button>
        </Box>
      </Box>

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: RADII.input }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2, borderRadius: RADII.input }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {statCards.map((card) => (
          <Grid item xs={6} sm={4} md={2} key={card.label}>
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
              placeholder="Suchen (Toilettenname, Geschäft, ID)..."
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
            <FormControl fullWidth sx={INPUT_SX}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">Alle</MenuItem>
                <MenuItem value="available">Verfügbar</MenuItem>
                <MenuItem value="in_use">In Benutzung</MenuItem>
                <MenuItem value="out_of_order">Außer Betrieb</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={5}>
            <FormControl fullWidth sx={INPUT_SX}>
              <InputLabel>Geschäft</InputLabel>
              <Select
                value={businessFilter}
                label="Geschäft"
                onChange={(e) => setBusinessFilter(e.target.value)}
              >
                <MenuItem value="all">Alle</MenuItem>
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
      <Paper elevation={0} sx={{ ...PANEL_SX, overflow: "hidden" }}>
        <TableContainer>
          <Table sx={{ "& .MuiTableCell-root": { borderColor: COLORS.border } }}>
            <TableHead sx={TABLE_HEAD_SX}>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === "name"}
                    direction={orderBy === "name" ? order : "asc"}
                    onClick={() => handleRequestSort("name")}
                  >
                    Toilettenname
                  </TableSortLabel>
                </TableCell>
                <TableCell>Geschäft</TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={orderBy === "fee"}
                    direction={orderBy === "fee" ? order : "asc"}
                    onClick={() => handleRequestSort("fee")}
                  >
                    Gebühr
                  </TableSortLabel>
                </TableCell>
                <TableCell>Eigenschaften</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === "createdAt"}
                    direction={orderBy === "createdAt" ? order : "asc"}
                    onClick={() => handleRequestSort("createdAt")}
                  >
                    Erstellt am
                  </TableSortLabel>
                </TableCell>
                <TableCell align="center">Aktionen</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography sx={{ color: COLORS.textSecondary }}>Keine Einträge gefunden</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((toilet) => {
                  const statusInfo = getStatusColor(toilet.status);
                  return (
                    <TableRow
                      key={toilet._id}
                      hover
                      sx={{ "&:hover": { bgcolor: COLORS.backgroundLight } }}
                    >
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <WcIcon sx={{ color: COLORS.primary }} />
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
                            <Chip
                              label="Barrierefrei"
                              size="small"
                              sx={{ bgcolor: "#f0f9ff", color: "#0891b2", fontWeight: 600, borderRadius: "999px" }}
                            />
                          )}
                          {toilet.features?.hasBabyChangingStation && (
                            <Chip
                              label="Wickelstation"
                              size="small"
                              sx={{ bgcolor: "#ecfdf5", color: "#059669", fontWeight: 600, borderRadius: "999px" }}
                            />
                          )}
                          {(!toilet.features?.isAccessible && !toilet.features?.hasBabyChangingStation) && (
                            <Typography variant="caption" sx={{ color: COLORS.textSecondary }}>—</Typography>
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
                            fontWeight: 600,
                            borderRadius: "999px",
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
          Toilettendetails
        </DialogTitle>
        <DialogContent>
          {selectedToilet && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" sx={{ color: COLORS.textSecondary }}>
                  Toiletten-ID
                </Typography>
                <Typography variant="body1" sx={{ fontFamily: "monospace", fontSize: "0.85rem" }}>
                  {selectedToilet._id}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" sx={{ color: COLORS.textSecondary }}>
                  Toilettenname
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {selectedToilet.name}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" sx={{ color: COLORS.textSecondary }}>
                  Geschäft
                </Typography>
                <Typography variant="body1">
                  {selectedToilet.business?.businessName || "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" sx={{ color: COLORS.textSecondary }}>
                  Gebühr
                </Typography>
                <Typography variant="body1" fontWeight={600} sx={{ color: COLORS.primary }}>
                  {formatCurrency(selectedToilet.fee)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" sx={{ color: COLORS.textSecondary }}>
                  Status
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  <Chip
                    label={getStatusColor(selectedToilet.status).label}
                    size="small"
                    sx={{
                      bgcolor: getStatusColor(selectedToilet.status).bg,
                      color: getStatusColor(selectedToilet.status).color,
                      fontWeight: 600,
                      borderRadius: "999px",
                    }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="caption" sx={{ color: COLORS.textSecondary }}>
                  Eigenschaften
                </Typography>
                <Box sx={{ mt: 1, display: "flex", gap: 1 }}>
                  <Chip
                    label="Barrierefrei"
                    size="small"
                    sx={{
                      borderRadius: "999px",
                      fontWeight: 600,
                      ...(selectedToilet.features?.isAccessible
                        ? { bgcolor: "#f0f9ff", color: "#0891b2" }
                        : { bgcolor: "#f1f5f9", color: "#64748b" }),
                    }}
                  />
                  <Chip
                    label="Wickelstation"
                    size="small"
                    sx={{
                      borderRadius: "999px",
                      fontWeight: 600,
                      ...(selectedToilet.features?.hasBabyChangingStation
                        ? { bgcolor: "#ecfdf5", color: "#059669" }
                        : { bgcolor: "#f1f5f9", color: "#64748b" }),
                    }}
                  />
                </Box>
              </Grid>
              {selectedToilet.averageRatings && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" sx={{ color: COLORS.textSecondary }}>
                    Durchschnittliche Bewertung
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
          <Button
            onClick={() => setViewDialogOpen(false)}
            sx={{ textTransform: "none", fontWeight: 600, borderRadius: RADII.button, color: COLORS.textSecondary }}
          >
            Schließen
          </Button>
          <Button
            onClick={() => { setViewDialogOpen(false); handleEdit(selectedToilet); }}
            variant="contained"
            sx={{
              textTransform: "none",
              fontWeight: 600,
              borderRadius: RADII.button,
              background: COLORS.primaryGradient,
              "&:hover": { background: COLORS.primaryGradientHover },
            }}
          >
            Bearbeiten
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit/Create Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: RADII.panel } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: COLORS.textHeading }}>
          {selectedToilet ? "Toilette bearbeiten" : "Neue Toilette hinzufügen"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Toilettenname"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                sx={INPUT_SX}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth sx={INPUT_SX}>
                <InputLabel>Geschäft</InputLabel>
                <Select
                  value={formData.business}
                  label="Geschäft"
                  onChange={(e) => setFormData({ ...formData, business: e.target.value })}
                  required
                >
                  <MenuItem value="">Bitte wählen</MenuItem>
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
                label="Gebühr (EUR)"
                type="number"
                value={formData.fee}
                onChange={(e) => setFormData({ ...formData, fee: parseFloat(e.target.value) || 0 })}
                inputProps={{ min: 0, step: 0.01 }}
                required
                sx={INPUT_SX}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth sx={INPUT_SX}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  label="Status"
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <MenuItem value="available">Verfügbar</MenuItem>
                  <MenuItem value="in_use">In Benutzung</MenuItem>
                  <MenuItem value="out_of_order">Außer Betrieb</MenuItem>
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
                label="Barrierefrei"
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
                label="Wickelstation"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setEditDialogOpen(false)}
            sx={{ textTransform: "none", fontWeight: 600, borderRadius: RADII.button, color: COLORS.textSecondary }}
          >
            Abbrechen
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={!formData.name || !formData.business}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              borderRadius: RADII.button,
              background: COLORS.primaryGradient,
              "&:hover": { background: COLORS.primaryGradientHover },
            }}
          >
            Speichern
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
          Toilette löschen
        </DialogTitle>
        <DialogContent>
          <Typography>
            Sind Sie sicher, dass Sie diese Toilette löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.
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

export default ToiletsPage;
