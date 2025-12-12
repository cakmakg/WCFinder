// features/admin/components/reports/ReportsPage.jsx
// Main reports page with tabs for different report types

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Divider
} from '@mui/material';
import {
  Assessment as ReportIcon,
  TrendingUp as TrendingUpIcon,
  AccountBalance as CommissionIcon,
  Business as BusinessIcon,
  Euro as EuroIcon
} from '@mui/icons-material';
import { adminService } from '../../services/adminService';
import { reportService } from '../../services/reportService';
import { DateRangePicker, ExportButton } from '../shared';
import MonthlyReportCard from './MonthlyReportCard';
import CommissionReport from './CommissionReport';
import BusinessPerformanceTable from './BusinessPerformanceTable';
import MonthlyReportsPage from './MonthlyReportsPage';
import StatCard from '../dashboard/StatCard';

/**
 * ReportsPage Component
 * Main page for viewing and exporting reports
 */
const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Data
  const [usages, setUsages] = useState([]);
  const [payments, setPayments] = useState([]);
  const [businesses, setBusinesses] = useState([]);

  // Date range
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
    endDate: new Date()
  });

  // Fetch data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [usagesData, paymentsData, businessesData] = await Promise.all([
        adminService.getAllUsages().catch(() => ({ result: [] })),
        adminService.getAllPayments().catch(() => ({ result: [] })),
        adminService.getAllBusinesses().catch(() => ({ result: [] }))
      ]);

      setUsages(usagesData?.result || []);
      setPayments(paymentsData?.result || []);
      setBusinesses(businessesData?.result || []);
    } catch (err) {
      console.error('Error fetching report data:', err);
      setError('Fehler beim Laden der Berichtsdaten');
    } finally {
      setLoading(false);
    }
  };

  // Filter data by date range
  const filteredUsages = useMemo(() => {
    if (!dateRange.startDate || !dateRange.endDate) return usages;

    return usages.filter(usage => {
      const usageDate = new Date(usage.createdAt || usage.startTime);
      return usageDate >= dateRange.startDate && usageDate <= dateRange.endDate;
    });
  }, [usages, dateRange]);

  const filteredPayments = useMemo(() => {
    if (!dateRange.startDate || !dateRange.endDate) return payments;

    return payments.filter(payment => {
      const paymentDate = new Date(payment.createdAt);
      return paymentDate >= dateRange.startDate && paymentDate <= dateRange.endDate;
    });
  }, [payments, dateRange]);

  // Calculate statistics
  const profitLossStats = useMemo(() => {
    return reportService.calculateProfitLoss(filteredUsages);
  }, [filteredUsages]);

  const commissionStats = useMemo(() => {
    return reportService.calculateCommissionStats(filteredPayments);
  }, [filteredPayments]);

  const businessPerformance = useMemo(() => {
    return reportService.calculateBusinessPerformance(businesses, usages, dateRange);
  }, [businesses, usages, dateRange]);

  // Revenue trend
  const revenueTrend = useMemo(() => {
    return reportService.calculateRevenueTrend(usages, 'daily', 30);
  }, [usages]);

  // Handle date range change
  const handleDateRangeChange = (newRange) => {
    setDateRange({
      startDate: newRange.startDate,
      endDate: newRange.endDate
    });
  };

  // Tab panels
  const tabs = [
    { label: 'Übersicht', icon: <ReportIcon /> },
    { label: 'Monatliche Berichte', icon: <ReportIcon /> },
    { label: 'Kommission', icon: <CommissionIcon /> },
    { label: 'Geschäfte', icon: <BusinessIcon /> },
    { label: 'Gewinn/Verlust', icon: <TrendingUpIcon /> }
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box mb={3} display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h5" fontWeight={600} gutterBottom>
            Berichte & Analysen
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Detaillierte Finanzberichte und Geschäftsanalysen
          </Typography>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Date Range Picker */}
      <Box mb={3}>
        <DateRangePicker
          defaultPreset="last30days"
          enableComparison={false}
          onChange={handleDateRangeChange}
        />
      </Box>

      {/* Summary Stats */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Gesamtumsatz"
            value={`€${profitLossStats.totalRevenue.toLocaleString('de-DE', { minimumFractionDigits: 2 })}`}
            icon={EuroIcon}
            color="#0891b2"
            subtitle="Im gewählten Zeitraum"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Plattform Kommission"
            value={`€${profitLossStats.platformCommission.toLocaleString('de-DE', { minimumFractionDigits: 2 })}`}
            icon={CommissionIcon}
            color="#16a34a"
            subtitle={`${profitLossStats.profitMargin.toFixed(1)}% Marge`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Geschäft Einnahmen"
            value={`€${profitLossStats.businessPayouts.toLocaleString('de-DE', { minimumFractionDigits: 2 })}`}
            icon={BusinessIcon}
            color="#f59e0b"
            subtitle="Nach Kommission"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Transaktionen"
            value={commissionStats.transactionCount.toLocaleString('de-DE')}
            icon={TrendingUpIcon}
            color="#dc2626"
            subtitle={`Ø €${commissionStats.averageTransaction.toFixed(2)}`}
          />
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': {
              minHeight: 64,
              textTransform: 'none',
              fontWeight: 500
            }
          }}
        >
          {tabs.map((tab, index) => (
            <Tab
              key={index}
              label={tab.label}
              icon={tab.icon}
              iconPosition="start"
            />
          ))}
        </Tabs>

        <Box p={3}>
          {/* Overview Tab */}
          {activeTab === 0 && (
            <Box>
              <Grid container spacing={3}>
                {/* Monthly Reports */}
                <Grid item xs={12}>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Monatliche Übersicht
                  </Typography>
                  <Grid container spacing={2}>
                    {getLastMonths(6).map((month, index) => (
                      <Grid item xs={12} sm={6} md={4} key={index}>
                        <MonthlyReportCard
                          year={month.year}
                          month={month.month}
                          usages={usages}
                          payments={payments}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Monthly Reports Tab - Saved Reports */}
          {activeTab === 1 && (
            <MonthlyReportsPage />
          )}

          {/* Commission Tab */}
          {activeTab === 2 && (
            <CommissionReport
              payments={filteredPayments}
              dateRange={dateRange}
            />
          )}

          {/* Business Performance Tab */}
          {activeTab === 3 && (
            <BusinessPerformanceTable
              data={businessPerformance}
              dateRange={dateRange}
            />
          )}

          {/* Profit/Loss Tab */}
          {activeTab === 4 && (
            <Box>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Gewinn & Verlust Analyse
              </Typography>

              <Grid container spacing={3}>
                {/* Profit/Loss Summary */}
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                        Einnahmen
                      </Typography>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography color="text.secondary">Gesamtumsatz:</Typography>
                        <Typography fontWeight={600}>
                          €{profitLossStats.totalRevenue.toFixed(2)}
                        </Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography color="text.secondary">Abgeschlossen:</Typography>
                        <Typography fontWeight={500} color="success.main">
                          €{profitLossStats.completedRevenue.toFixed(2)}
                        </Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between">
                        <Typography color="text.secondary">Ausstehend:</Typography>
                        <Typography fontWeight={500} color="warning.main">
                          €{profitLossStats.pendingRevenue.toFixed(2)}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                        Ausgaben & Gewinn
                      </Typography>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography color="text.secondary">Geschäft Auszahlungen:</Typography>
                        <Typography fontWeight={500} color="error.main">
                          -€{profitLossStats.businessPayouts.toFixed(2)}
                        </Typography>
                      </Box>
                      <Divider sx={{ my: 1 }} />
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography fontWeight={600}>Nettogewinn (Kommission):</Typography>
                        <Typography fontWeight={700} color="success.main">
                          €{profitLossStats.netProfit.toFixed(2)}
                        </Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between">
                        <Typography color="text.secondary">Gewinnmarge:</Typography>
                        <Typography fontWeight={600} color="primary">
                          {profitLossStats.profitMargin.toFixed(2)}%
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Export Button */}
                <Grid item xs={12}>
                  <Box display="flex" justifyContent="flex-end">
                    <ExportButton
                      data={[{
                        'Gesamtumsatz': `€${profitLossStats.totalRevenue.toFixed(2)}`,
                        'Plattform Kommission': `€${profitLossStats.platformCommission.toFixed(2)}`,
                        'Geschäft Auszahlungen': `€${profitLossStats.businessPayouts.toFixed(2)}`,
                        'Nettogewinn': `€${profitLossStats.netProfit.toFixed(2)}`,
                        'Gewinnmarge': `${profitLossStats.profitMargin.toFixed(2)}%`
                      }]}
                      filename="gewinn_verlust_bericht"
                      title="Gewinn/Verlust Export"
                    />
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

// Helper function to get last N months
function getLastMonths(count) {
  const months = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      year: date.getFullYear(),
      month: date.getMonth() + 1
    });
  }

  return months;
}

export default ReportsPage;

