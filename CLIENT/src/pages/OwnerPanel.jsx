// pages/OwnerPanel.jsx
// Owner Panel with Dashboard, Statistics, Daily/Monthly Tables, and Financial Data

import React, { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Tabs,
  Tab,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  BarChart as BarChartIcon,
  CalendarToday as CalendarIcon,
  AccountBalanceWallet as WalletIcon,
} from "@mui/icons-material";
import businessService from "../services/businessService";
import { OwnerStatsPanel } from "../components/owner/OwnerStatsPanel";
import { OwnerDailyMonthlyTable } from "../components/owner/OwnerDailyMonthlyTable";
import { OwnerFinancialPanel } from "../components/owner/OwnerFinancialPanel";
import { OwnerProfileForm } from "../components/owner/OwnerProfileForm";
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

const OwnerPanel = () => {
  const { currentUser } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Data states
  const [ownerBusiness, setOwnerBusiness] = useState(null);
  const [ownerStats, setOwnerStats] = useState(null);
  const [financialData, setFinancialData] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState("daily"); // 'daily' or 'monthly'

  useEffect(() => {
    if (!currentUser || (currentUser.role !== "owner" && currentUser.role !== "admin")) {
      navigate("/home");
      return;
    }
    fetchOwnerData();
  }, [currentUser, navigate]);

  const fetchOwnerData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [businessResponse, statsResponse] = await Promise.all([
        businessService.getMyBusiness().catch(() => ({ result: null })),
        businessService.getOwnerStats().catch(() => ({ result: null })),
      ]);

      setOwnerBusiness(businessResponse?.result || null);
      setOwnerStats(statsResponse?.result || null);

      // Financial data için ayrı bir call yap (eğer endpoint varsa)
      try {
        const baseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:8000";
        const baseURL = baseUrl.endsWith("/api") ? baseUrl : `${baseUrl}/api`;
        const token = localStorage.getItem("token");

        const financialSummary = await fetch(`${baseURL}/business-payouts/my-summary`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }).then((res) => res.json()).catch(() => null);

        setFinancialData(financialSummary?.result || null);
      } catch (financialErr) {
        console.warn("Financial data fetch failed:", financialErr);
        setFinancialData(null);
      }
    } catch (err) {
      console.error("Error fetching owner data:", err);
      setError("Fehler beim Laden der Daten.");
    } finally {
      setLoading(false);
    }
  };

  // Calculate daily and monthly statistics
  const dailyStats = useMemo(() => {
    if (!ownerStats?.usage?.byDay) return null;

    const selectedDateStart = new Date(selectedDate);
    selectedDateStart.setHours(0, 0, 0, 0);
    const selectedDateEnd = new Date(selectedDate);
    selectedDateEnd.setHours(23, 59, 59, 999);

    const dayData = ownerStats.usage.byDay.find((day) => {
      const dayDate = new Date(day._id);
      return dayDate >= selectedDateStart && dayDate <= selectedDateEnd;
    });

    return {
      date: selectedDate.toLocaleDateString("de-DE"),
      usageCount: dayData?.count || 0,
      revenue: dayData?.revenue || 0,
      customers: dayData?.count || 0, // Unique customers would need separate calculation
    };
  }, [ownerStats, selectedDate]);

  const monthlyStats = useMemo(() => {
    if (!ownerStats?.usage?.byDay) return null;

    const monthStart = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    const monthEnd = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0, 23, 59, 59);

    const monthData = ownerStats.usage.byDay.filter((day) => {
      const dayDate = new Date(day._id);
      return dayDate >= monthStart && dayDate <= monthEnd;
    });

    const totalUsage = monthData.reduce((sum, day) => sum + (day.count || 0), 0);
    const totalRevenue = monthData.reduce((sum, day) => sum + (day.revenue || 0), 0);

    return {
      month: selectedDate.toLocaleDateString("de-DE", { month: "long", year: "numeric" }),
      usageCount: totalUsage,
      revenue: totalRevenue,
      days: monthData.length,
    };
  }, [ownerStats, selectedDate]);

  // Generate chart data for daily trend (last 30 days)
  const dailyTrendData = useMemo(() => {
    if (!ownerStats?.usage?.byDay) return [];

    return ownerStats.usage.byDay
      .slice(-30)
      .map((day) => ({
        date: new Date(day._id).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" }),
        revenue: day.revenue || 0,
        usage: day.count || 0,
      }));
  }, [ownerStats]);

  // Generate chart data for monthly trend (last 12 months)
  const monthlyTrendData = useMemo(() => {
    if (!ownerStats?.usage?.byDay) return [];

    const monthlyData = {};
    ownerStats.usage.byDay.forEach((day) => {
      const date = new Date(day._id);
      const monthKey = date.toLocaleDateString("de-DE", { month: "short", year: "numeric" });
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { month: monthKey, revenue: 0, usage: 0 };
      }
      monthlyData[monthKey].revenue += day.revenue || 0;
      monthlyData[monthKey].usage += day.count || 0;
    });

    return Object.values(monthlyData).slice(-12);
  }, [ownerStats]);

  const formatCurrency = (value) => {
    return `€${Number(value).toLocaleString("de-DE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  if (!currentUser || (currentUser.role !== "owner" && currentUser.role !== "admin")) {
    return null;
  }

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f7fa", py: 3 }}>
      <Box sx={{ maxWidth: "1400px", mx: "auto", px: 3 }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 700, color: "#1a1a2e" }}>
          Geschäftspanel
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{
            mb: 3,
            borderBottom: "1px solid #e2e8f0",
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 600,
              minHeight: 64,
            },
          }}
        >
          <Tab
            icon={<DashboardIcon />}
            iconPosition="start"
            label="Dashboard"
          />
          <Tab
            icon={<BarChartIcon />}
            iconPosition="start"
            label="Statistiken"
          />
          <Tab
            icon={<CalendarIcon />}
            iconPosition="start"
            label="Tages-/Monatsübersicht"
          />
          <Tab
            icon={<WalletIcon />}
            iconPosition="start"
            label="Finanzen"
          />
          <Tab label="Profil" />
        </Tabs>

        {/* Tab 0: Dashboard */}
        {activeTab === 0 && (
          <Box>
            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                      <WalletIcon sx={{ color: "#0891b2" }} />
                      <Typography variant="body2" color="text.secondary">
                        Gesamtumsatz
                      </Typography>
                    </Box>
                    <Typography variant="h5" fontWeight={700}>
                      {formatCurrency(ownerStats?.revenue?.total || 0)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                      <CalendarIcon sx={{ color: "#16a34a" }} />
                      <Typography variant="body2" color="text.secondary">
                        Gesamt Reservierungen
                      </Typography>
                    </Box>
                    <Typography variant="h5" fontWeight={700}>
                      {ownerStats?.usage?.total || 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                      <BarChartIcon sx={{ color: "#f59e0b" }} />
                      <Typography variant="body2" color="text.secondary">
                        Abgeschlossene Reservierungen
                      </Typography>
                    </Box>
                    <Typography variant="h5" fontWeight={700}>
                      {ownerStats?.usage?.completed || 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                      <DashboardIcon sx={{ color: "#dc2626" }} />
                      <Typography variant="body2" color="text.secondary">
                        Durchschnittliche Bewertung
                      </Typography>
                    </Box>
                    <Typography variant="h5" fontWeight={700}>
                      {ownerStats?.ratings?.average?.toFixed(1) || "0.0"}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Charts */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} lg={6}>
                <Paper sx={{ p: 3, borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                    Umsatztrend ({viewMode === "daily" ? "Letzte 30 Tage" : "Letzte 12 Monate"})
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart
                      data={viewMode === "daily" ? dailyTrendData : monthlyTrendData}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis
                        dataKey={viewMode === "daily" ? "date" : "month"}
                        stroke="#94a3b8"
                        style={{ fontSize: "12px" }}
                      />
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
                        stroke="#667eea"
                        strokeWidth={3}
                        name="Umsatz (€)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
              <Grid item xs={12} lg={6}>
                <Paper sx={{ p: 3, borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                    Reservierungsanzahl ({viewMode === "daily" ? "Letzte 30 Tage" : "Letzte 12 Monate"})
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={viewMode === "daily" ? dailyTrendData : monthlyTrendData}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis
                        dataKey={viewMode === "daily" ? "date" : "month"}
                        stroke="#94a3b8"
                        style={{ fontSize: "12px" }}
                      />
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
                      <Bar dataKey="usage" fill="#10b981" name="Reservierungen" />
                    </BarChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
            </Grid>

            {/* View Mode Toggle */}
            <Paper sx={{ p: 2, mb: 3, borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
              <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
                <TextField
                  label="Datum auswählen"
                  type="date"
                  value={selectedDate.toISOString().split("T")[0]}
                  onChange={(e) => setSelectedDate(new Date(e.target.value))}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                  sx={{ minWidth: 200 }}
                />
                <FormControl sx={{ minWidth: 150 }} size="small">
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

            {/* Daily/Monthly Stats Cards */}
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                    {viewMode === "daily" ? "Tägliche Statistiken" : "Monatliche Statistiken"}
                  </Typography>
                  {viewMode === "daily" && dailyStats ? (
                    <Box>
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                        <Typography color="text.secondary">Datum:</Typography>
                        <Typography fontWeight={600}>{dailyStats.date}</Typography>
                      </Box>
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                        <Typography color="text.secondary">Reservierungen:</Typography>
                        <Typography fontWeight={600}>{dailyStats.usageCount}</Typography>
                      </Box>
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                        <Typography color="text.secondary">Umsatz:</Typography>
                        <Typography fontWeight={600}>{formatCurrency(dailyStats.revenue)}</Typography>
                      </Box>
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography color="text.secondary">Kunden:</Typography>
                        <Typography fontWeight={600}>{dailyStats.customers}</Typography>
                      </Box>
                    </Box>
                  ) : viewMode === "monthly" && monthlyStats ? (
                    <Box>
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                        <Typography color="text.secondary">Monat:</Typography>
                        <Typography fontWeight={600}>{monthlyStats.month}</Typography>
                      </Box>
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                        <Typography color="text.secondary">Reservierungen:</Typography>
                        <Typography fontWeight={600}>{monthlyStats.usageCount}</Typography>
                      </Box>
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                        <Typography color="text.secondary">Umsatz:</Typography>
                        <Typography fontWeight={600}>{formatCurrency(monthlyStats.revenue)}</Typography>
                      </Box>
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography color="text.secondary">Tage mit Aktivität:</Typography>
                        <Typography fontWeight={600}>{monthlyStats.days}</Typography>
                      </Box>
                    </Box>
                  ) : (
                    <Typography color="text.secondary">Keine Daten verfügbar</Typography>
                  )}
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                    Übersicht
                  </Typography>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        Gesamt Toiletten
                      </Typography>
                      <Typography variant="h6" fontWeight={700} color="#0891b2">
                        {ownerStats?.toilets?.total || 0}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        Verfügbare Toiletten
                      </Typography>
                      <Typography variant="h6" fontWeight={700} color="#16a34a">
                        {ownerStats?.toilets?.available || 0}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        Abgeschlossene Reservierungen
                      </Typography>
                      <Typography variant="h6" fontWeight={700} color="#f59e0b">
                        {ownerStats?.usage?.completed || 0}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        Gesamt Bewertungen
                      </Typography>
                      <Typography variant="h6" fontWeight={700} color="#7c3aed">
                        {ownerStats?.ratings?.totalReviews || 0}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Tab 1: Statistiken */}
        {activeTab === 1 && <OwnerStatsPanel ownerStats={ownerStats} />}

        {/* Tab 2: Tages-/Monatsübersicht */}
        {activeTab === 2 && (
          <Box>
            <Paper sx={{ p: 2, mb: 3, borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
              <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
                <TextField
                  label="Datum auswählen"
                  type="date"
                  value={selectedDate.toISOString().split("T")[0]}
                  onChange={(e) => setSelectedDate(new Date(e.target.value))}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                  sx={{ minWidth: 200 }}
                />
                <FormControl sx={{ minWidth: 150 }} size="small">
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
            <OwnerDailyMonthlyTable ownerStats={ownerStats} viewMode={viewMode} selectedDate={selectedDate} />
          </Box>
        )}

        {/* Tab 3: Finanzen */}
        {activeTab === 3 && <OwnerFinancialPanel />}

        {/* Tab 4: Profil */}
        {activeTab === 4 && (
          <OwnerProfileForm ownerUser={currentUser} ownerBusiness={ownerBusiness} />
        )}
      </Box>
    </Box>
  );
};

export default OwnerPanel;

