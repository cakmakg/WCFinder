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
} from "@mui/material";
import {
  AccountBalanceWallet,
  People,
  Business,
  Payment,
  PersonAdd,
  TrendingUp,
} from "@mui/icons-material";
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
import ToiletsPage from "../features/admin/components/toilets/ToiletsPage";
import AnalyticsPage from "../features/admin/components/analytics/AnalyticsPage";
import { adminService } from "../features/admin/services/adminService";
import {
  calculateBusinessSales,
  generateMonthlyTrend,
  generateRecentActivity,
  generatePieChartData,
} from "../features/admin/utils/dashboardUtils";

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
  const { currentUser } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Data states
  const [users, setUsers] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [usages, setUsages] = useState([]);
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    if (!currentUser || currentUser.role !== "admin") {
      navigate("/home");
      return;
    }
    fetchData();
  }, [currentUser, navigate]);

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

          {/* Additional Stats */}
          <Grid container spacing={2} sx={{ width: "100%", maxWidth: "100%", m: 0, mt: 2 }}>
            <Grid item xs={6} sm={3}>
              <StatCard
                title="Bekleyen Rezervasyonlar"
                value={stats.pendingBookings.toLocaleString("de-DE")}
                icon={Payment}
                color="#f59e0b"
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <StatCard
                title="Onay Bekleyen İşletmeler"
                value={stats.pendingBusinesses.toLocaleString("de-DE")}
                icon={Business}
                color="#f59e0b"
              />
            </Grid>
          </Grid>

          {/* Charts Row - CSS Grid */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: '2.5fr 1fr' },
              gap: 3,
              width: '100%',
            }}
          >
            <StyledCard>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a2e' }}>
                    Umsatzkurve
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>
                    Letzte 12 Monate
                  </Typography>
                </Box>
                <RevenueChart data={lineChartData} loading={loading} />
              </CardContent>
            </StyledCard>

            <StyledCard sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a2e' }}>
                    Kanalverteilung
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>
                    Dieses Quartal
                  </Typography>
                </Box>
                <ChannelDistributionChart data={pieChartData} loading={loading} />
              </CardContent>
            </StyledCard>
          </Box>

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

      {activeTab === 5 && <ToiletsPage />}

      {activeTab === 6 && <AnalyticsPage />}

      {activeTab === 7 && <BusinessManagementForm />}

      {activeTab === 8 && (
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
