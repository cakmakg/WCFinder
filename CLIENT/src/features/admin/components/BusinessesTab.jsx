// features/admin/components/BusinessesTab.jsx
// Business management tab with detailed statistics, charts, and invoice generation

import React, { useState, useEffect, useMemo } from "react";
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
  Button,
  IconButton,
  TextField,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Chip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Tooltip as MuiTooltip,
} from "@mui/material";
import {
  PictureAsPdf as PdfIcon,
  TrendingUp,
  People,
  AccountBalanceWallet,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
// Using native date input for now - can be upgraded to MUI DatePicker if needed
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
// eslint-disable-next-line no-unused-vars
import { motion, useReducedMotion } from "framer-motion";
import { adminService } from "../services/adminService";
import { toastSuccessNotify, toastErrorNotify } from "../../../helper/ToastNotify";
import { COLORS, RADII, SHADOWS } from "../../../theme/designTokens";

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

const TABLE_HEAD_SX = {
  "& .MuiTableCell-head": {
    bgcolor: COLORS.backgroundLight,
    fontWeight: 600,
    color: COLORS.textSecondary,
    borderBottom: `1px solid ${COLORS.border}`,
  },
};

const SECTION_TITLE_SX = {
  fontWeight: 800,
  color: COLORS.textHeading,
  letterSpacing: "-0.02em",
};

const getStatusChipSx = (status) => {
  switch (status) {
    case "Aktiv":
      return { bg: "#ecfdf5", color: "#059669" };
    case "Ausstehend":
      return { bg: "#fffbeb", color: "#d97706" };
    case "Abgelehnt":
      return { bg: "#fef2f2", color: "#dc2626" };
    default:
      return { bg: "#f1f5f9", color: "#64748b" };
  }
};

const BusinessesTab = () => {
  const reduceMotion = useReducedMotion();
  const [businesses, setBusinesses] = useState([]);
  const [usages, setUsages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState("daily"); // 'daily' or 'monthly'
  const [orderBy, _setOrderBy] = useState("totalRevenue");
  const [order, setOrder] = useState("desc");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [businessesData, usagesData] = await Promise.all([
        adminService.getAllBusinesses().catch(() => ({ result: [] })),
        adminService.getAllUsages().catch(() => ({ result: [] })),
      ]);

      setBusinesses(businessesData?.result || []);
      setUsages(usagesData?.result || []);
    } catch (err) {
      console.error("Error fetching business data:", err);
      setError("Fehler beim Laden der Daten.");
    } finally {
      setLoading(false);
    }
  };

  // Calculate business statistics
  const businessStats = useMemo(() => {
    return businesses.map((business) => {
      const businessId = business._id?.toString() || business._id;
      const businessUsages = usages.filter((usage) => {
        const usageBusinessId = usage.businessId?._id?.toString() || usage.businessId?.toString() || usage.businessId;
        return usageBusinessId === businessId;
      });

      const paidUsages = businessUsages.filter(
        (u) => u.paymentStatus === "paid" || u.status === "completed"
      );

      // Selected date calculations
      const selectedDateStart = new Date(selectedDate);
      selectedDateStart.setHours(0, 0, 0, 0);
      const selectedDateEnd = new Date(selectedDate);
      selectedDateEnd.setHours(23, 59, 59, 999);

      // Monthly calculations
      const monthStart = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
      const monthEnd = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0, 23, 59, 59);

      // Daily stats
      const dailyUsages = paidUsages.filter((u) => {
        const usageDate = new Date(u.startTime || u.createdAt);
        return usageDate >= selectedDateStart && usageDate <= selectedDateEnd;
      });
      const dailyRevenue = dailyUsages.reduce((sum, u) => sum + (Number(u.totalFee) || 0), 0);
      const dailyCustomers = new Set(dailyUsages.map((u) => u.userId?.toString() || u.userId)).size;

      // Monthly stats
      const monthlyUsages = paidUsages.filter((u) => {
        const usageDate = new Date(u.startTime || u.createdAt);
        return usageDate >= monthStart && usageDate <= monthEnd;
      });
      const monthlyRevenue = monthlyUsages.reduce((sum, u) => sum + (Number(u.totalFee) || 0), 0);
      const monthlyCustomers = new Set(monthlyUsages.map((u) => u.userId?.toString() || u.userId)).size;

      // Total stats
      const totalRevenue = paidUsages.reduce((sum, u) => sum + (Number(u.totalFee) || 0), 0);
      const totalCustomers = new Set(paidUsages.map((u) => u.userId?.toString() || u.userId)).size;

      // Daily trend data (last 30 days)
      const dailyTrend = [];
      for (let i = 29; i >= 0; i--) {
        const date = new Date(selectedDate);
        date.setDate(date.getDate() - i);
        const dayStart = new Date(date);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(date);
        dayEnd.setHours(23, 59, 59, 999);

        const dayUsages = paidUsages.filter((u) => {
          const usageDate = new Date(u.startTime || u.createdAt);
          return usageDate >= dayStart && usageDate <= dayEnd;
        });
        const dayRevenue = dayUsages.reduce((sum, u) => sum + (Number(u.totalFee) || 0), 0);
        const dayCustomers = new Set(dayUsages.map((u) => u.userId?.toString() || u.userId)).size;

        dailyTrend.push({
          date: date.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" }),
          revenue: dayRevenue,
          customers: dayCustomers,
        });
      }

      // Monthly trend data (last 12 months)
      const monthlyTrend = [];
      for (let i = 11; i >= 0; i--) {
        const monthDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() - i, 1);
        const monthStartDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
        const monthEndDate = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59);

        const monthUsages = paidUsages.filter((u) => {
          const usageDate = new Date(u.startTime || u.createdAt);
          return usageDate >= monthStartDate && usageDate <= monthEndDate;
        });
        const monthRevenue = monthUsages.reduce((sum, u) => sum + (Number(u.totalFee) || 0), 0);
        const monthCustomers = new Set(monthUsages.map((u) => u.userId?.toString() || u.userId)).size;

        monthlyTrend.push({
          month: monthDate.toLocaleDateString("de-DE", { month: "short" }),
          revenue: monthRevenue,
          customers: monthCustomers,
        });
      }

      let ownerName = "Unbekannt";
      if (business.owner) {
        if (typeof business.owner === "object" && business.owner !== null) {
          ownerName = business.owner.username || business.owner.name || business.owner.email || "Unbekannt";
        } else if (typeof business.owner === "string") {
          ownerName = business.owner;
        }
      }

      return {
        id: businessId,
        businessName: business.businessName || "Unbekannt",
        owner: ownerName,
        category: business.businessType || "Andere",
        status: business.approvalStatus === "approved" ? "Aktiv" : business.approvalStatus === "pending" ? "Ausstehend" : "Abgelehnt",
        dailyRevenue,
        dailyCustomers,
        monthlyRevenue,
        monthlyCustomers,
        totalRevenue,
        totalCustomers,
        dailyTrend,
        monthlyTrend,
      };
    });
  }, [businesses, usages, selectedDate]);

  const sortedStats = useMemo(() => {
    return [...businessStats].sort((a, b) => {
      const aValue = viewMode === "daily" ? a.dailyRevenue : a.monthlyRevenue;
      const bValue = viewMode === "daily" ? b.dailyRevenue : b.monthlyRevenue;
      return order === "asc" ? aValue - bValue : bValue - aValue;
    });
  }, [businessStats, viewMode, order]);

  const paginatedStats = useMemo(() => {
    return sortedStats.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [sortedStats, page, rowsPerPage]);

  const handleRequestSort = () => {
    setOrder(order === "asc" ? "desc" : "asc");
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle business approval/rejection
  const handleApproveBusiness = async (businessId) => {
    if (!window.confirm('Möchten Sie dieses Unternehmen wirklich genehmigen?')) {
      return;
    }

    try {
      await adminService.updateBusinessApproval(businessId, 'approve');
      toastSuccessNotify('Unternehmen wurde erfolgreich genehmigt');
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error approving business:', error);
      toastErrorNotify(error.response?.data?.message || 'Fehler beim Genehmigen des Unternehmens');
    }
  };

  const handleRejectBusiness = async (businessId) => {
    if (!window.confirm('Möchten Sie dieses Unternehmen wirklich ablehnen?')) {
      return;
    }

    try {
      await adminService.updateBusinessApproval(businessId, 'reject');
      toastSuccessNotify('Unternehmen wurde abgelehnt');
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error rejecting business:', error);
      toastErrorNotify(error.response?.data?.message || 'Fehler beim Ablehnen des Unternehmens');
    }
  };

  const formatCurrency = (value) => {
    return `€${Number(value).toLocaleString("de-DE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Aggregate chart data from all businesses
  const aggregatedChartData = useMemo(() => {
    if (viewMode === "daily") {
      const aggregated = {};
      businessStats.forEach((business) => {
        business.dailyTrend?.forEach((day) => {
          if (!aggregated[day.date]) {
            aggregated[day.date] = { date: day.date, revenue: 0, customers: 0 };
          }
          aggregated[day.date].revenue += day.revenue;
          aggregated[day.date].customers += day.customers;
        });
      });
      return Object.values(aggregated).sort((a, b) => {
        const [dayA, monthA] = a.date.split(".");
        const [dayB, monthB] = b.date.split(".");
        if (monthA !== monthB) return parseInt(monthA) - parseInt(monthB);
        return parseInt(dayA) - parseInt(dayB);
      });
    } else {
      const aggregated = {};
      businessStats.forEach((business) => {
        business.monthlyTrend?.forEach((month) => {
          if (!aggregated[month.month]) {
            aggregated[month.month] = { month: month.month, revenue: 0, customers: 0 };
          }
          aggregated[month.month].revenue += month.revenue;
          aggregated[month.month].customers += month.customers;
        });
      });
      return Object.values(aggregated);
    }
  }, [businessStats, viewMode]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "400px" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Header Controls */}
      <Paper elevation={0} sx={{ ...PANEL_SX, p: 3 }}>
        <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
          <TextField
            label="Datum auswählen"
            type="date"
            value={selectedDate.toISOString().split("T")[0]}
            onChange={(e) => setSelectedDate(new Date(e.target.value))}
            InputLabelProps={{
              shrink: true,
            }}
            sx={{ minWidth: 200, ...INPUT_SX }}
          />
            <FormControl sx={{ minWidth: 150, ...INPUT_SX }}>
              <InputLabel>Ansichtsmodus</InputLabel>
              <Select
                value={viewMode}
                label="Ansichtsmodus"
                onChange={(e) => setViewMode(e.target.value)}
              >
                <MenuItem value="daily">Täglich</MenuItem>
                <MenuItem value="monthly">Monatlich</MenuItem>
              </Select>
            </FormControl>
        </Box>
      </Paper>

        {/* Statistics Cards */}
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={0} sx={PANEL_SX}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                  <AccountBalanceWallet sx={{ color: COLORS.primary }} />
                  <Typography variant="body2" color="text.secondary">
                    {viewMode === "daily" ? "Täglicher Umsatz" : "Monatlicher Umsatz"}
                  </Typography>
                </Box>
                <Typography variant="h5" fontWeight={700}>
                  {formatCurrency(
                    businessStats.reduce(
                      (sum, b) => sum + (viewMode === "daily" ? b.dailyRevenue : b.monthlyRevenue),
                      0
                    )
                  )}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={0} sx={PANEL_SX}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                  <People sx={{ color: "#16a34a" }} />
                  <Typography variant="body2" color="text.secondary">
                    {viewMode === "daily" ? "Tägliche Kunden" : "Monatliche Kunden"}
                  </Typography>
                </Box>
                <Typography variant="h5" fontWeight={700}>
                  {businessStats.reduce(
                    (sum, b) => sum + (viewMode === "daily" ? b.dailyCustomers : b.monthlyCustomers),
                    0
                  )}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={0} sx={PANEL_SX}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                  <TrendingUp sx={{ color: COLORS.warning }} />
                  <Typography variant="body2" color="text.secondary">
                    Gesamtumsatz
                  </Typography>
                </Box>
                <Typography variant="h5" fontWeight={700}>
                  {formatCurrency(businessStats.reduce((sum, b) => sum + b.totalRevenue, 0))}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={0} sx={PANEL_SX}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                  <People sx={{ color: "#dc2626" }} />
                  <Typography variant="body2" color="text.secondary">
                    Gesamtkunden
                  </Typography>
                </Box>
                <Typography variant="h5" fontWeight={700}>
                  {businessStats.reduce((sum, b) => sum + b.totalCustomers, 0)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Charts */}
        <Grid container spacing={3}>
          <Grid item xs={12} lg={6}>
            <Paper elevation={0} sx={{ ...PANEL_SX, p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, ...SECTION_TITLE_SX }}>
                {viewMode === "daily" ? "Täglicher Umsatztrend (Letzte 30 Tage)" : "Monatlicher Umsatztrend (Letzte 12 Monate)"}
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={aggregatedChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey={viewMode === "daily" ? "date" : "month"} stroke="#94a3b8" style={{ fontSize: "12px" }} />
                  <YAxis stroke="#94a3b8" style={{ fontSize: "12px" }} />
                  <Tooltip
                    contentStyle={{
                      background: "white",
                      border: "none",
                      borderRadius: "12px",
                      boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke={COLORS.primary}
                    strokeWidth={3}
                    name="Umsatz (€)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          <Grid item xs={12} lg={6}>
            <Paper elevation={0} sx={{ ...PANEL_SX, p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, ...SECTION_TITLE_SX }}>
                {viewMode === "daily" ? "Tägliche Kundenzahl (Letzte 30 Tage)" : "Monatliche Kundenzahl (Letzte 12 Monate)"}
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={aggregatedChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey={viewMode === "daily" ? "date" : "month"} stroke="#94a3b8" style={{ fontSize: "12px" }} />
                  <YAxis stroke="#94a3b8" style={{ fontSize: "12px" }} />
                  <Tooltip
                    contentStyle={{
                      background: "white",
                      border: "none",
                      borderRadius: "12px",
                      boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="customers" fill={COLORS.success} name="Kundenzahl" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>

        {/* Business Table */}
        <Paper elevation={0} sx={{ ...PANEL_SX, overflow: "hidden" }}>
          <Box sx={{ p: 3, borderBottom: `1px solid ${COLORS.border}` }}>
            <Typography variant="h6" sx={SECTION_TITLE_SX}>
              Unternehmensdetails
            </Typography>
          </Box>
          <TableContainer>
            <Table sx={{ "& .MuiTableCell-root": { borderColor: COLORS.border } }}>
              <TableHead sx={TABLE_HEAD_SX}>
                <TableRow>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === "businessName"}
                      direction={order === "asc" ? "asc" : "desc"}
                      onClick={handleRequestSort}
                    >
                      Unternehmensname
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>Inhaber</TableCell>
                  <TableCell align="right">
                    {viewMode === "daily" ? "Täglicher Umsatz" : "Monatlicher Umsatz"}
                  </TableCell>
                  <TableCell align="right">
                    {viewMode === "daily" ? "Tägliche Kunden" : "Monatliche Kunden"}
                  </TableCell>
                  <TableCell align="right">Gesamtumsatz</TableCell>
                  <TableCell align="right">Gesamtkunden</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Aktionen</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedStats.map((business) => (
                  <TableRow
                    key={business.id}
                    hover
                    sx={{ "&:hover": { bgcolor: COLORS.backgroundLight } }}
                  >
                    <TableCell>
                      <Typography fontWeight={600}>{business.businessName}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {business.category}
                      </Typography>
                    </TableCell>
                    <TableCell>{business.owner}</TableCell>
                    <TableCell align="right">
                      {formatCurrency(viewMode === "daily" ? business.dailyRevenue : business.monthlyRevenue)}
                    </TableCell>
                    <TableCell align="right">
                      {viewMode === "daily" ? business.dailyCustomers : business.monthlyCustomers}
                    </TableCell>
                    <TableCell align="right">
                      <Typography fontWeight={600}>{formatCurrency(business.totalRevenue)}</Typography>
                    </TableCell>
                    <TableCell align="right">{business.totalCustomers}</TableCell>
                    <TableCell>
                      <Chip
                        label={business.status}
                        size="small"
                        sx={{
                          bgcolor: getStatusChipSx(business.status).bg,
                          color: getStatusChipSx(business.status).color,
                          fontWeight: 600,
                          borderRadius: "999px",
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        {business.status === "Ausstehend" && (
                          <>
                            <MuiTooltip title="Unternehmen genehmigen">
                              <IconButton
                                color="success"
                                size="small"
                                onClick={() => {
                                  const businessObj = businesses.find(b => 
                                    (b._id?.toString() || b._id) === business.id
                                  );
                                  if (businessObj) {
                                    handleApproveBusiness(businessObj._id || businessObj.id);
                                  }
                                }}
                              >
                                <CheckCircleIcon />
                              </IconButton>
                            </MuiTooltip>
                            <MuiTooltip title="Unternehmen ablehnen">
                              <IconButton
                                color="error"
                                size="small"
                                onClick={() => {
                                  const businessObj = businesses.find(b => 
                                    (b._id?.toString() || b._id) === business.id
                                  );
                                  if (businessObj) {
                                    handleRejectBusiness(businessObj._id || businessObj.id);
                                  }
                                }}
                              >
                                <CancelIcon />
                              </IconButton>
                            </MuiTooltip>
                          </>
                        )}
                        {business.status === "Aktiv" && (
                          <MuiTooltip title="Rechnungen über 'Rechnungen' Seite verwalten">
                            <span>
                              <IconButton
                                color="primary"
                                size="small"
                                disabled
                              >
                                <PdfIcon />
                              </IconButton>
                            </span>
                          </MuiTooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={sortedStats.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
            labelRowsPerPage="Zeilen pro Seite:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} von ${count}`}
          />
        </Paper>

    </Box>
    </motion.div>
  );
};

export default BusinessesTab;

