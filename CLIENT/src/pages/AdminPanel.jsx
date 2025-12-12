// pages/AdminPanel.jsx
// Admin Panel with Dashboard, Charts, Table and Activities

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
  styled,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Chip,
} from "@mui/material";
import {
  AccountBalanceWallet,
  People,
  Business,
  Payment,
  PersonAdd,
  TrendingUp,
  Refresh as RefreshIcon,
  ShowChart,
} from "@mui/icons-material";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import AdminLayout from "../features/admin/components/AdminLayout";
import StatCard from "../features/admin/components/dashboard/StatCard";
import RevenueChart from "../features/admin/components/dashboard/RevenueChart";
import ChannelDistributionChart from "../features/admin/components/dashboard/ChannelDistributionChart";
import BusinessTable from "../features/admin/components/dashboard/BusinessTable";
import RecentActivities from "../features/admin/components/dashboard/RecentActivities";
import UsersTable from "../features/admin/components/dashboard/UsersTable";
import BusinessesTab from "../features/admin/components/BusinessesTab";
import BusinessManagementForm from "../features/admin/components/BusinessManagementForm";
import BookingsPage from "../features/admin/components/bookings/BookingsPage";
import PaymentsPage from "../features/admin/components/payments/PaymentsPage";
import { FinanzmanagementPage } from "../features/admin/components/finanz";
import ToiletsPage from "../features/admin/components/toilets/ToiletsPage";
import ReportsPage from "../features/admin/components/reports/ReportsPage";
import { ExportButton } from "../features/admin/components/shared";
import { adminService } from "../features/admin/services/adminService";
import {
  calculateBusinessSales,
  generateMonthlyTrend,
  generateRecentActivity,
  generatePieChartData,
} from "../features/admin/utils/dashboardUtils";

// Pie Chart renkleri
const PIE_COLORS = ["#16a34a", "#3b82f6", "#8b5cf6", "#f59e0b", "#dc2626", "#6b7280"];

// Styled Card Component
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
  border: '1px solid #e5e7eb',
  backgroundColor: 'white',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
  },
}));

const AdminPanel = () => {
  const { currentUser, loading: authLoading } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState("30"); // Dashboard tarih aralığı

  // Data states
  const [users, setUsers] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [usages, setUsages] = useState([]);
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    // Auth yüklenirken bekle
    if (authLoading) {
      return;
    }
    
    // Token var ama user yoksa, localStorage'dan kontrol et
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (!currentUser && !token) {
      // Hiç login olmamış
      navigate("/login");
      return;
    }
    
    if (!currentUser && token && !storedUser) {
      // Token var ama user yok - login'e yönlendir
      navigate("/login");
      return;
    }
    
    if (currentUser && currentUser.role !== "admin") {
      // Login olmuş ama admin değil
      navigate("/home");
      return;
    }
    
    if (currentUser && currentUser.role === "admin") {
      fetchData();
    }
  }, [currentUser, authLoading, navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [usersData, businessesData, usagesData, paymentsData] = await Promise.all([
        adminService.getAllUsers().catch(() => ({ result: [] })),
        adminService.getAllBusinesses().catch(() => ({ result: [] })),
        adminService.getAllUsages().catch(() => ({ result: [] })),
        adminService.getAllPayments().catch(() => ({ result: [] })),
      ]);

      setUsers(usersData?.result || []);
      setBusinesses(businessesData?.result || []);
      setUsages(usagesData?.result || []);
      setPayments(paymentsData?.result || []);
    } catch (err) {
      console.error("Error fetching admin data:", err);
      setError("Fehler beim Laden der Daten.");
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics with trends
  const stats = useMemo(() => {
    const paidUsages = usages.filter(
      (u) => u.paymentStatus === "paid" || u.status === "completed"
    );
    const totalRevenue = paidUsages.reduce(
      (sum, u) => sum + (Number(u.totalFee) || 0),
      0
    );

    // Calculate trends (comparing last 30 days with previous 30 days)
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    // Revenue trend
    const recentRevenue = paidUsages
      .filter((u) => {
        const date = new Date(u.createdAt || u.startTime);
        return date >= thirtyDaysAgo;
      })
      .reduce((sum, u) => sum + (Number(u.totalFee) || 0), 0);

    const previousRevenue = paidUsages
      .filter((u) => {
        const date = new Date(u.createdAt || u.startTime);
        return date >= sixtyDaysAgo && date < thirtyDaysAgo;
      })
      .reduce((sum, u) => sum + (Number(u.totalFee) || 0), 0);

    const revenueTrend = previousRevenue > 0
      ? ((recentRevenue - previousRevenue) / previousRevenue) * 100
      : 0;

    // User trend
    const recentUsers = users.filter(
      (u) => new Date(u.createdAt) >= thirtyDaysAgo
    ).length;
    const previousUsers = users.filter(
      (u) => {
        const date = new Date(u.createdAt);
        return date >= sixtyDaysAgo && date < thirtyDaysAgo;
      }
    ).length;
    const userTrend = previousUsers > 0
      ? ((recentUsers - previousUsers) / previousUsers) * 100
      : 0;

    // Business trend
    const recentBusinesses = businesses.filter(
      (b) => new Date(b.createdAt) >= thirtyDaysAgo
    ).length;
    const previousBusinesses = businesses.filter(
      (b) => {
        const date = new Date(b.createdAt);
        return date >= sixtyDaysAgo && date < thirtyDaysAgo;
      }
    ).length;
    const businessTrend = previousBusinesses > 0
      ? ((recentBusinesses - previousBusinesses) / previousBusinesses) * 100
      : 0;

    // Usage trend
    const recentUsages = usages.filter(
      (u) => new Date(u.createdAt || u.startTime) >= thirtyDaysAgo
    ).length;
    const previousUsages = usages.filter(
      (u) => {
        const date = new Date(u.createdAt || u.startTime);
        return date >= sixtyDaysAgo && date < thirtyDaysAgo;
      }
    ).length;
    const usageTrend = previousUsages > 0
      ? ((recentUsages - previousUsages) / previousUsages) * 100
      : 0;

    return {
      totalUsers: users.length,
      totalBusinesses: businesses.length,
      totalUsages: usages.length,
      totalRevenue,
      revenueTrend: revenueTrend.toFixed(1),
      userTrend: userTrend.toFixed(1),
      businessTrend: businessTrend.toFixed(1),
      usageTrend: usageTrend.toFixed(1),
      newUsersLast30Days: recentUsers,
      completedBookings: usages.filter((u) => u.status === "completed").length,
      pendingBookings: usages.filter((u) => u.status === "pending").length,
      approvedBusinesses: businesses.filter((b) => b.approvalStatus === "approved").length,
      pendingBusinesses: businesses.filter((b) => b.approvalStatus === "pending").length,
    };
  }, [users, businesses, usages]);

  // Generate chart data
  const lineChartData = useMemo(() => {
    return generateMonthlyTrend(usages, users, businesses);
  }, [usages, users, businesses]);

  const pieChartData = useMemo(() => {
    return generatePieChartData(businesses);
  }, [businesses]);

  // Generate table data
  const tableData = useMemo(() => {
    return businesses.map((business) => calculateBusinessSales(business, usages));
  }, [businesses, usages]);

  // Generate recent activities
  const recentActivities = useMemo(() => {
    return generateRecentActivity(usages, businesses);
  }, [usages, businesses]);

  // ===== YENİ: Analytics için gelişmiş hesaplamalar =====

  // Günlük gelir trendi (tarih aralığına göre)
  const dailyRevenueData = useMemo(() => {
    const days = parseInt(dateRange);
    const data = [];
    const now = new Date();
    
    const paidUsages = usages.filter(
      (u) => u.paymentStatus === "paid" || u.status === "completed" || u.status === "confirmed"
    );
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      const dayPaidUsages = paidUsages.filter((u) => {
        const usageDate = new Date(u.createdAt || u.startTime);
        return usageDate >= dayStart && usageDate <= dayEnd;
      });

      const revenue = dayPaidUsages.reduce((sum, u) => sum + (Number(u.totalFee) || 0), 0);
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
  }, [usages, dateRange]);

  // Top 10 İşletmeler (gelire göre)
  const topBusinesses = useMemo(() => {
    const businessRevenue = {};
    
    const paidUsages = usages.filter(
      (u) => u.paymentStatus === "paid" || u.status === "completed" || u.status === "confirmed"
    );
    
    paidUsages.forEach((usage) => {
      const businessId = usage.businessId?._id?.toString() || usage.businessId?.toString() || usage.businessId;
      if (businessId) {
        businessRevenue[businessId] = (businessRevenue[businessId] || 0) + (Number(usage.totalFee) || 0);
      }
    });

    return Object.entries(businessRevenue)
      .map(([businessId, revenue]) => {
        const business = businesses.find(
          (b) => (b._id?.toString() || b._id) === businessId
        );
        return {
          name: business?.businessName || "Bilinmeyen",
          revenue,
        };
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  }, [usages, businesses]);

  // Rezervasyon Durumu Dağılımı
  const statusData = useMemo(() => {
    const statusCounts = {
      completed: usages.filter((u) => u.status === "completed").length,
      confirmed: usages.filter((u) => u.status === "confirmed").length,
      active: usages.filter((u) => u.status === "active").length,
      pending: usages.filter((u) => u.status === "pending").length,
      cancelled: usages.filter((u) => u.status === "cancelled").length,
      expired: usages.filter((u) => u.status === "expired").length,
    };

    return [
      { name: "Tamamlanan", value: statusCounts.completed, color: "#16a34a" },
      { name: "Onaylanan", value: statusCounts.confirmed, color: "#3b82f6" },
      { name: "Aktif", value: statusCounts.active, color: "#8b5cf6" },
      { name: "Bekleyen", value: statusCounts.pending, color: "#f59e0b" },
      { name: "İptal Edilen", value: statusCounts.cancelled, color: "#dc2626" },
      { name: "Süresi Dolmuş", value: statusCounts.expired, color: "#6b7280" },
    ].filter((item) => item.value > 0);
  }, [usages]);

  // Export için veri hazırlama
  const dashboardExportData = useMemo(() => {
    return dailyRevenueData.map((item) => ({
      'Tarih': item.date,
      'Gelir (€)': item.revenue?.toFixed(2) || '0.00',
      'Rezervasyon': item.bookings || 0,
    }));
  }, [dailyRevenueData]);

  // Para formatı
  const formatCurrency = (value) => {
    return `€${Number(value).toLocaleString("de-DE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Auth yüklenirken veya user yoksa loading göster
  if (authLoading || (!currentUser && localStorage.getItem('token'))) {
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

  // Admin değilse hiçbir şey gösterme (useEffect yönlendirecek)
  if (!currentUser || currentUser.role !== "admin") {
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
    <AdminLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {activeTab === 0 && (
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column", gap: 2.5, width: "100%", maxWidth: "100%", p: 0 }}>
          {/* Header with Date Range & Export */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
            <Box>
              <Typography variant="h5" fontWeight={700} sx={{ color: '#1a1a2e' }}>
                Dashboard
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Platform genel görünümü ve analitik veriler
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 2 }}>
              <FormControl size="small" sx={{ minWidth: 140 }}>
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
                size="small"
              >
                Yenile
              </Button>
              <ExportButton
                data={dashboardExportData}
                filename="dashboard_report"
                title="Dashboard Export"
              />
            </Box>
          </Box>

          {/* Stats Grid */}
          <Grid container spacing={2} sx={{ width: "100%", maxWidth: "100%", m: 0 }}>
            <Grid item xs={6} sm={4} md={3}>
              <StatCard
                title="Toplam Gelir"
                value={`€${stats.totalRevenue.toLocaleString("de-DE", {
                  maximumFractionDigits: 0,
                  minimumFractionDigits: 0,
                })}`}
                icon={AccountBalanceWallet}
                color="#0891b2"
                trend={stats.revenueTrend > 0 ? "up" : stats.revenueTrend < 0 ? "down" : null}
                trendValue={Math.abs(parseFloat(stats.revenueTrend))}
                subtitle="Tüm zamanlar"
              />
            </Grid>
            <Grid item xs={6} sm={4} md={3}>
              <StatCard
                title="Toplam Kullanıcı"
                value={stats.totalUsers.toLocaleString("de-DE")}
                icon={People}
                color="#16a34a"
                trend={stats.userTrend > 0 ? "up" : stats.userTrend < 0 ? "down" : null}
                trendValue={Math.abs(parseFloat(stats.userTrend))}
                subtitle={`Son 30 günde: ${stats.newUsersLast30Days}`}
              />
            </Grid>
            <Grid item xs={6} sm={4} md={3}>
              <StatCard
                title="Toplam İşletme"
                value={stats.totalBusinesses.toLocaleString("de-DE")}
                icon={Business}
                color="#f59e0b"
                trend={stats.businessTrend > 0 ? "up" : stats.businessTrend < 0 ? "down" : null}
                trendValue={Math.abs(parseFloat(stats.businessTrend))}
                subtitle={`Onaylanmış: ${stats.approvedBusinesses}`}
              />
            </Grid>
            <Grid item xs={6} sm={4} md={3}>
              <StatCard
                title="Toplam Rezervasyon"
                value={stats.totalUsages.toLocaleString("de-DE")}
                icon={Payment}
                color="#dc2626"
                trend={stats.usageTrend > 0 ? "up" : stats.usageTrend < 0 ? "down" : null}
                trendValue={Math.abs(parseFloat(stats.usageTrend))}
                subtitle={`Tamamlanan: ${stats.completedBookings}`}
              />
            </Grid>
          </Grid>

          {/* Charts Row 1 - Ana Grafikler */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: '2.5fr 1fr' },
              gap: 2.5,
              width: '100%',
            }}
          >
            <StyledCard>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a2e' }}>
                    Gelir Trendi
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>
                    Son 12 ay
                  </Typography>
                </Box>
                <RevenueChart data={lineChartData} loading={loading} />
              </CardContent>
            </StyledCard>

            <StyledCard sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a2e' }}>
                    İşletme Durumu
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>
                    Tüm zamanlar
                  </Typography>
                </Box>
                <ChannelDistributionChart data={pieChartData} loading={loading} />
              </CardContent>
            </StyledCard>
          </Box>

          {/* Charts Row 2 - Ek Grafikler (Analytics'ten) */}
          <Grid container spacing={2.5}>
            <Grid item xs={12} lg={5}>
              <StyledCard sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a2e' }}>
                      Rezervasyon Durumu
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>
                      Tüm zamanlar
                    </Typography>
                  </Box>
                  {statusData.length > 0 ? (
                    <>
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={statusData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={85}
                            paddingAngle={2}
                            dataKey="value"
                            label={({ percent }) => percent >= 0.05 ? `${(percent * 100).toFixed(0)}%` : ''}
                            labelLine={false}
                          >
                            {statusData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ 
                              background: 'white', 
                              border: 'none', 
                              borderRadius: '12px', 
                              boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                              fontSize: '13px',
                            }}
                            formatter={(value, name) => [`${value} rezervasyon`, name]}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap', mt: 1 }}>
                        {statusData.map((item, index) => (
                          <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: item.color }} />
                            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>
                              {item.name}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </>
                  ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 250 }}>
                      <Typography variant="body2" color="text.secondary">Veri bulunamadı</Typography>
                    </Box>
                  )}
                </CardContent>
              </StyledCard>
            </Grid>
            <Grid item xs={12} lg={7}>
              <StyledCard>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a2e' }}>
                      En Çok Gelir Getiren İşletmeler
                    </Typography>
                    <Chip label="Top 10" size="small" sx={{ bgcolor: '#0891b215', color: '#0891b2', fontWeight: 600, fontSize: '0.7rem' }} />
                  </Box>
                  {topBusinesses.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={topBusinesses} margin={{ top: 10, right: 20, bottom: 60, left: 10 }}>
                        <defs>
                          <linearGradient id="colorBarGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0891b2" stopOpacity={1} />
                            <stop offset="95%" stopColor="#0891b2" stopOpacity={0.6} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                        <XAxis 
                          dataKey="name" 
                          stroke="#94a3b8" 
                          style={{ fontSize: "10px" }} 
                          tick={{ fill: '#64748b' }}
                          angle={-45} 
                          textAnchor="end" 
                          height={60}
                          interval={0}
                        />
                        <YAxis 
                          stroke="#94a3b8" 
                          style={{ fontSize: "11px" }}
                          tick={{ fill: '#64748b' }}
                          tickFormatter={(value) => value >= 1000 ? `€${(value / 1000).toFixed(1)}K` : `€${value}`}
                        />
                        <Tooltip
                          contentStyle={{ background: "white", border: "none", borderRadius: "12px", boxShadow: "0 4px 16px rgba(0,0,0,0.1)", fontSize: '13px' }}
                          formatter={(value) => [formatCurrency(value), 'Gelir']}
                          cursor={{ fill: 'rgba(8, 145, 178, 0.1)' }}
                        />
                        <Bar dataKey="revenue" fill="url(#colorBarGrad)" radius={[4, 4, 0, 0]} maxBarSize={40} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
                      <Typography variant="body2" color="text.secondary">Veri bulunamadı</Typography>
                    </Box>
                  )}
                </CardContent>
              </StyledCard>
            </Grid>
          </Grid>

          {/* Dual-axis Chart: Rezervasyon & Gelir Karşılaştırması */}
          <StyledCard>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a2e' }}>
                  Günlük Rezervasyon & Gelir Trendi
                </Typography>
                <Box sx={{ display: 'flex', gap: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#16a34a' }} />
                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>Rezervasyon</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#0891b2' }} />
                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>Gelir (€)</Typography>
                  </Box>
                </Box>
              </Box>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyRevenueData} margin={{ top: 10, right: 30, bottom: 20, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#94a3b8" 
                    style={{ fontSize: "11px" }}
                    tick={{ fill: '#64748b' }}
                    angle={-45}
                    textAnchor="end"
                    height={50}
                  />
                  <YAxis 
                    yAxisId="left" 
                    stroke="#94a3b8" 
                    style={{ fontSize: "11px" }}
                    tick={{ fill: '#64748b' }}
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right" 
                    stroke="#94a3b8" 
                    style={{ fontSize: "11px" }}
                    tick={{ fill: '#64748b' }}
                    tickFormatter={(value) => value >= 1000 ? `€${(value / 1000).toFixed(1)}K` : `€${value}`}
                  />
                  <Tooltip
                    contentStyle={{ background: "white", border: "none", borderRadius: "12px", boxShadow: "0 4px 16px rgba(0,0,0,0.1)", fontSize: '13px' }}
                    formatter={(value, name) => {
                      if (name === 'bookings') return [value, 'Rezervasyon'];
                      return [formatCurrency(value), 'Gelir'];
                    }}
                  />
                  <Line yAxisId="left" type="monotone" dataKey="bookings" stroke="#16a34a" strokeWidth={2.5} dot={{ fill: '#16a34a', r: 3 }} activeDot={{ r: 5 }} />
                  <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#0891b2" strokeWidth={2.5} dot={{ fill: '#0891b2', r: 3 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </StyledCard>

          {/* Table and Activities Row */}
          <Grid container spacing={2.5} sx={{ flex: 1, minHeight: 0 }}>
            <Grid item xs={12} lg={8}>
              <BusinessTable data={tableData} loading={loading} />
            </Grid>
            <Grid item xs={12} lg={4}>
              <RecentActivities activities={recentActivities} />
            </Grid>
          </Grid>
        </Box>
      )}

      {activeTab === 1 && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          {/* User Statistics Cards */}
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <StatCard
                title="Toplam Kullanıcılar"
                value={users.length.toLocaleString("de-DE")}
                icon={People}
                color="#0891b2"
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <StatCard
                title="Yeni Kullanıcılar"
                value={users.filter((u) => {
                  const userDate = new Date(u.createdAt);
                  const thirtyDaysAgo = new Date();
                  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                  return userDate >= thirtyDaysAgo;
                }).length.toLocaleString("de-DE")}
                icon={PersonAdd}
                color="#16a34a"
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <StatCard
                title="Aktif Kullanıcılar"
                value={users.filter((u) => u.isActive !== false).length.toLocaleString("de-DE")}
                icon={TrendingUp}
                color="#f59e0b"
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <StatCard
                title="Toplam Ödemeler"
                value={payments.filter(
                  (p) => p.status === "succeeded" || p.status === "paid"
                ).length.toLocaleString("de-DE")}
                icon={Payment}
                color="#dc2626"
              />
            </Grid>
          </Grid>

          {/* Users Table */}
          <UsersTable
            users={users}
            usages={usages}
            payments={payments}
            loading={loading}
          />
        </Box>
      )}

      {activeTab === 2 && <BusinessesTab />}

      {activeTab === 3 && <BookingsPage />}

      {activeTab === 4 && <PaymentsPage />}

      {activeTab === 5 && <FinanzmanagementPage />}

      {activeTab === 6 && <ToiletsPage />}

      {activeTab === 7 && <ReportsPage />}

      {activeTab === 8 && <BusinessManagementForm />}

      {activeTab === 9 && (
        <Box sx={{ p: 3 }}>
          <Typography variant="h4" fontWeight={700} sx={{ mb: 2 }}>
            Ayarlar
          </Typography>
          <Typography color="text.secondary">
            Ayarlar özelliği yakında eklenecek.
          </Typography>
        </Box>
      )}
    </AdminLayout>
  );
};

export default AdminPanel;
