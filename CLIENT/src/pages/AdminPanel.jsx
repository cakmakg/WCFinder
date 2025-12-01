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

  // Calculate statistics
  const stats = useMemo(() => {
    const paidUsages = usages.filter(
      (u) => u.paymentStatus === "paid" || u.status === "completed"
    );
    const totalRevenue = paidUsages.reduce(
      (sum, u) => sum + (Number(u.totalFee) || 0),
      0
    );

    return {
      totalUsers: users.length,
      totalBusinesses: businesses.length,
      totalUsages: usages.length,
      totalRevenue,
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
            <Grid item xs={6} sm={3}>
              <StatCard
                title="Gesamtumsatz"
                value={`€${stats.totalRevenue.toLocaleString("de-DE", {
                  maximumFractionDigits: 2,
                  minimumFractionDigits: 2,
                })}`}
                icon={AccountBalanceWallet}
                color="#0891b2"
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <StatCard
                title="Neue Kunden"
                value={stats.totalUsers.toLocaleString("de-DE")}
                icon={People}
                color="#16a34a"
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <StatCard
                title="Aktive Kampagnen"
                value={stats.totalBusinesses.toLocaleString("de-DE")}
                icon={Business}
                color="#f59e0b"
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <StatCard
                title="Abgeschlossene Reservierungen"
                value={usages.filter((u) => u.status === "completed").length.toLocaleString("de-DE")}
                icon={Payment}
                color="#dc2626"
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

      {activeTab === 3 && <BusinessManagementForm />}
    </AdminLayout>
  );
};

export default AdminPanel;
