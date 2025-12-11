// features/admin/components/analytics/AnalyticsPage.jsx
// Advanced Analytics Page with detailed charts and reports

import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  TextField,
  Button,
  Chip,
} from "@mui/material";
import {
  TrendingUp,
  People,
  Business,
  AccountBalanceWallet,
  EventNote,
  Refresh as RefreshIcon,
  GetApp as ExportIcon,
} from "@mui/icons-material";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { adminService } from "../../services/adminService";

const AnalyticsPage = () => {
  const [users, setUsers] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [usages, setUsages] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("30"); // days
  const [chartType, setChartType] = useState("revenue");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersData, businessesData, usagesData, paymentsData] = await Promise.all([
        adminService.getAllUsers().catch(() => ({ result: [] })),
        adminService.getAllBusinesses().catch(() => ({ result: [] })),
        adminService.getAllUsages().catch(() => ({ result: [] })),
        adminService.getAllPayments().catch(() => ({ result: [] })),
      ]);

      setUsers(usersData.result || []);
      setBusinesses(businessesData.result || []);
      setUsages(usagesData.result || []);
      setPayments(paymentsData.result || []);
    } catch (error) {
      console.error("Error fetching analytics data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Revenue over time
  const revenueData = useMemo(() => {
    const days = parseInt(dateRange);
    const data = [];
    const now = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      const dayPayments = payments.filter((p) => {
        const paymentDate = new Date(p.createdAt);
        return paymentDate >= dayStart && paymentDate <= dayEnd && (p.status === "succeeded" || p.status === "paid");
      });

      const revenue = dayPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
      const bookings = usages.filter((u) => {
        const usageDate = new Date(u.createdAt || u.startTime);
        return usageDate >= dayStart && usageDate <= dayEnd;
      }).length;

      data.push({
        date: date.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" }),
        revenue,
        bookings,
      });
    }

    return data;
  }, [payments, usages, dateRange]);

  // Business type distribution
  const businessTypeData = useMemo(() => {
    const typeCounts = {};
    businesses.forEach((business) => {
      const type = business.businessType || "Other";
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });

    const colors = ["#0891b2", "#16a34a", "#f59e0b", "#dc2626", "#8b5cf6", "#ec4899"];
    return Object.entries(typeCounts).map(([name, value], index) => ({
      name,
      value,
      color: colors[index % colors.length],
    }));
  }, [businesses]);

  // Status distribution
  const statusData = useMemo(() => {
    const statusCounts = {
      completed: usages.filter((u) => u.status === "completed").length,
      pending: usages.filter((u) => u.status === "pending").length,
      cancelled: usages.filter((u) => u.status === "cancelled").length,
    };

    return [
      { name: "Tamamlanan", value: statusCounts.completed, color: "#16a34a" },
      { name: "Bekleyen", value: statusCounts.pending, color: "#f59e0b" },
      { name: "İptal Edilen", value: statusCounts.cancelled, color: "#dc2626" },
    ].filter((item) => item.value > 0);
  }, [usages]);

  // Top businesses by revenue
  const topBusinesses = useMemo(() => {
    const businessRevenue = {};
    
    payments
      .filter((p) => p.status === "succeeded" || p.status === "paid")
      .forEach((payment) => {
        const businessId = payment.businessId?._id || payment.businessId;
        if (businessId) {
          businessRevenue[businessId] = (businessRevenue[businessId] || 0) + (Number(payment.amount) || 0);
        }
      });

    return Object.entries(businessRevenue)
      .map(([businessId, revenue]) => {
        const business = businesses.find(
          (b) => (b._id?.toString() || b._id) === businessId
        );
        return {
          name: business?.businessName || "Unknown",
          revenue,
        };
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  }, [payments, businesses]);

  // User growth
  const userGrowthData = useMemo(() => {
    const days = parseInt(dateRange);
    const data = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      const newUsers = users.filter((u) => {
        const userDate = new Date(u.createdAt);
        return userDate >= dayStart && userDate <= dayEnd;
      }).length;

      data.push({
        date: date.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" }),
        users: newUsers,
      });
    }

    return data;
  }, [users, dateRange]);

  // Key Metrics
  const metrics = useMemo(() => {
    const totalRevenue = payments
      .filter((p) => p.status === "succeeded" || p.status === "paid")
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

    const totalBookings = usages.length;
    const completedBookings = usages.filter((u) => u.status === "completed").length;
    const conversionRate = totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 0;

    const avgRevenuePerBooking = completedBookings > 0 ? totalRevenue / completedBookings : 0;

    return {
      totalRevenue,
      totalBookings,
      completedBookings,
      conversionRate,
      avgRevenuePerBooking,
    };
  }, [payments, usages]);

  const formatCurrency = (value) => {
    return `€${Number(value).toLocaleString("de-DE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "400px" }}>
        <Typography>Yükleniyor...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
            Analytics & Raporlar
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Platform performansını detaylı olarak analiz edin
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Tarih Aralığı</InputLabel>
            <Select
              value={dateRange}
              label="Tarih Aralığı"
              onChange={(e) => setDateRange(e.target.value)}
            >
              <MenuItem value="7">Son 7 Gün</MenuItem>
              <MenuItem value="30">Son 30 Gün</MenuItem>
              <MenuItem value="90">Son 90 Gün</MenuItem>
              <MenuItem value="365">Son 1 Yıl</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchData}
          >
            Yenile
          </Button>
          <Button
            variant="outlined"
            startIcon={<ExportIcon />}
            onClick={() => alert("Export özelliği yakında eklenecek")}
          >
            Dışa Aktar
          </Button>
        </Box>
      </Box>

      {/* Key Metrics */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={4} md={2.4}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <AccountBalanceWallet sx={{ color: "#0891b2" }} />
                <Typography variant="caption" color="text.secondary">
                  Toplam Gelir
                </Typography>
              </Box>
              <Typography variant="h5" fontWeight={700}>
                {formatCurrency(metrics.totalRevenue)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={4} md={2.4}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <EventNote sx={{ color: "#16a34a" }} />
                <Typography variant="caption" color="text.secondary">
                  Toplam Rezervasyon
                </Typography>
              </Box>
              <Typography variant="h5" fontWeight={700}>
                {metrics.totalBookings}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={4} md={2.4}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <TrendingUp sx={{ color: "#f59e0b" }} />
                <Typography variant="caption" color="text.secondary">
                  Tamamlanma Oranı
                </Typography>
              </Box>
              <Typography variant="h5" fontWeight={700}>
                {metrics.conversionRate.toFixed(1)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={4} md={2.4}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <People sx={{ color: "#dc2626" }} />
                <Typography variant="caption" color="text.secondary">
                  Ortalama Gelir/Rezervasyon
                </Typography>
              </Box>
              <Typography variant="h5" fontWeight={700}>
                {formatCurrency(metrics.avgRevenuePerBooking)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={4} md={2.4}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <Business sx={{ color: "#8b5cf6" }} />
                <Typography variant="caption" color="text.secondary">
                  Toplam İşletme
                </Typography>
              </Box>
              <Typography variant="h5" fontWeight={700}>
                {businesses.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Row 1 */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3, borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
              Gelir Trendi
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#94a3b8" style={{ fontSize: "12px" }} />
                <YAxis stroke="#94a3b8" style={{ fontSize: "12px" }} />
                <Tooltip
                  contentStyle={{
                    background: "white",
                    border: "none",
                    borderRadius: "12px",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
                  }}
                  formatter={(value) => formatCurrency(value)}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#0891b2"
                  fill="#0891b2"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3, borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
              İşletme Tipi Dağılımı
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={businessTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {businessTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Charts Row 2 */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3, borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
              Rezervasyon Durumu
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3, borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
              En Çok Gelir Getiren İşletmeler (Top 10)
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topBusinesses.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#94a3b8" style={{ fontSize: "11px" }} angle={-45} textAnchor="end" height={100} />
                <YAxis stroke="#94a3b8" style={{ fontSize: "12px" }} />
                <Tooltip
                  contentStyle={{
                    background: "white",
                    border: "none",
                    borderRadius: "12px",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
                  }}
                  formatter={(value) => formatCurrency(value)}
                />
                <Bar dataKey="revenue" fill="#0891b2" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Charts Row 3 */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3, borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
              Kullanıcı Büyümesi & Rezervasyon Sayısı
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#94a3b8" style={{ fontSize: "12px" }} />
                <YAxis yAxisId="left" stroke="#94a3b8" style={{ fontSize: "12px" }} />
                <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" style={{ fontSize: "12px" }} />
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
                  yAxisId="left"
                  type="monotone"
                  dataKey="bookings"
                  stroke="#16a34a"
                  strokeWidth={2}
                  name="Rezervasyon Sayısı"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#0891b2"
                  strokeWidth={2}
                  name="Gelir (€)"
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AnalyticsPage;

