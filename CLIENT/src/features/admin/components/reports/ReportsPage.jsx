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
// eslint-disable-next-line no-unused-vars
import { motion, useReducedMotion } from 'framer-motion';
import {
  Assessment as ReportIcon,
  TrendingUp as TrendingUpIcon,
  AccountBalance as CommissionIcon,
  Business as BusinessIcon,
  Euro as EuroIcon
} from '@mui/icons-material';
import { COLORS, RADII, SHADOWS } from '../../../../theme/designTokens';
import { adminService } from '../../services/adminService';
import { reportService } from '../../services/reportService';
import { DateRangePicker, ExportButton } from '../shared';
import MonthlyReportCard from './MonthlyReportCard';
import CommissionReport from './CommissionReport';
import BusinessPerformanceTable from './BusinessPerformanceTable';
import MonthlyReportsPage from './MonthlyReportsPage';
import StatCard from '../dashboard/StatCard';

// Admin-Designsprache: Stil-Konstanten
const sectionTitleSx = {
  fontWeight: 800,
  color: COLORS.textHeading,
  letterSpacing: '-0.02em'
};

const panelSx = {
  backgroundColor: 'white',
  border: `1px solid ${COLORS.border}`,
  borderRadius: RADII.panel,
  boxShadow: SHADOWS.subtle,
  overflow: 'hidden'
};

const cardSx = {
  height: '100%',
  backgroundColor: 'white',
  border: `1px solid ${COLORS.border}`,
  borderRadius: RADII.card,
  boxShadow: SHADOWS.subtle
};

const moneySx = { fontVariantNumeric: 'tabular-nums', fontWeight: 700 };

/**
 * ReportsPage Component
 * Main page for viewing and exporting reports
 */
const ReportsPage = () => {
  const reduce = useReducedMotion();
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

  // Einmaliges Einblenden pro Seite (mit Reduced-Motion-Guard)
  const pageFade = {
    initial: reduce ? false : { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
  };

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
  const _revenueTrend = useMemo(() => {
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
        <CircularProgress sx={{ color: COLORS.primary }} />
      </Box>
    );
  }

  return (
    <motion.div {...pageFade}>
    <Box>
      {/* Header */}
      <Box mb={3} display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h5" sx={sectionTitleSx} gutterBottom>
            Berichte & Analysen
          </Typography>
          <Typography variant="body2" sx={{ color: COLORS.textSecondary }}>
            Detaillierte Finanzberichte und Geschäftsanalysen
          </Typography>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: RADII.input }}>
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
            color={COLORS.primary}
            subtitle="Im gewählten Zeitraum"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Plattform Kommission"
            value={`€${profitLossStats.platformCommission.toLocaleString('de-DE', { minimumFractionDigits: 2 })}`}
            icon={CommissionIcon}
            color={COLORS.primaryDark}
            subtitle={`${profitLossStats.profitMargin.toFixed(1)}% Marge`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Geschäft Einnahmen"
            value={`€${profitLossStats.businessPayouts.toLocaleString('de-DE', { minimumFractionDigits: 2 })}`}
            icon={BusinessIcon}
            color="#06b6d4"
            subtitle="Nach Kommission"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Transaktionen"
            value={commissionStats.transactionCount.toLocaleString('de-DE')}
            icon={TrendingUpIcon}
            color={COLORS.textSecondary}
            subtitle={`Ø €${commissionStats.averageTransaction.toFixed(2)}`}
          />
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper elevation={0} sx={{ mb: 3, ...panelSx }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            borderBottom: `1px solid ${COLORS.border}`,
            backgroundColor: COLORS.backgroundLight,
            '& .MuiTab-root': {
              minHeight: 64,
              textTransform: 'none',
              fontWeight: 600,
              color: COLORS.textSecondary,
              '&.Mui-selected': { color: COLORS.primary }
            },
            '& .MuiTabs-indicator': { backgroundColor: COLORS.primary }
          }}
        >
          {tabs.map((tab) => (
            <Tab
              key={tab.label}
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
                  <Typography variant="h6" sx={sectionTitleSx} gutterBottom>
                    Monatliche Übersicht
                  </Typography>
                  <Grid container spacing={2}>
                    {getLastMonths(6).map((month) => (
                      <Grid item xs={12} sm={6} md={4} key={`${month.year}-${month.month}`}>
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
              <Typography variant="h6" sx={sectionTitleSx} gutterBottom>
                Gewinn & Verlust Analyse
              </Typography>

              <Grid container spacing={3}>
                {/* Profit/Loss Summary */}
                <Grid item xs={12} md={6}>
                  <Card elevation={0} sx={cardSx}>
                    <CardContent>
                      <Typography variant="subtitle1" sx={sectionTitleSx} gutterBottom>
                        Einnahmen
                      </Typography>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography sx={{ color: COLORS.textSecondary }}>Gesamtumsatz:</Typography>
                        <Typography sx={moneySx}>
                          €{profitLossStats.totalRevenue.toFixed(2)}
                        </Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography sx={{ color: COLORS.textSecondary }}>Abgeschlossen:</Typography>
                        <Typography sx={{ ...moneySx, color: '#059669' }}>
                          €{profitLossStats.completedRevenue.toFixed(2)}
                        </Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between">
                        <Typography sx={{ color: COLORS.textSecondary }}>Ausstehend:</Typography>
                        <Typography sx={{ ...moneySx, color: '#d97706' }}>
                          €{profitLossStats.pendingRevenue.toFixed(2)}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card elevation={0} sx={cardSx}>
                    <CardContent>
                      <Typography variant="subtitle1" sx={sectionTitleSx} gutterBottom>
                        Ausgaben & Gewinn
                      </Typography>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography sx={{ color: COLORS.textSecondary }}>Geschäft Auszahlungen:</Typography>
                        <Typography sx={{ ...moneySx, color: '#dc2626' }}>
                          -€{profitLossStats.businessPayouts.toFixed(2)}
                        </Typography>
                      </Box>
                      <Divider sx={{ my: 1, borderColor: COLORS.border }} />
                      <Box
                        sx={{
                          backgroundColor: COLORS.accentBoxBg,
                          borderLeft: `3px solid ${COLORS.primary}`,
                          borderRadius: RADII.input,
                          p: 1.5
                        }}
                      >
                        <Box display="flex" justifyContent="space-between" mb={0.5}>
                          <Typography fontWeight={600} sx={{ color: COLORS.textHeading }}>
                            Nettogewinn (Kommission):
                          </Typography>
                          <Typography sx={{ ...moneySx, fontWeight: 800, color: '#059669' }}>
                            €{profitLossStats.netProfit.toFixed(2)}
                          </Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between">
                          <Typography sx={{ color: COLORS.textSecondary }}>Gewinnmarge:</Typography>
                          <Typography sx={{ ...moneySx, color: COLORS.primary }}>
                            {profitLossStats.profitMargin.toFixed(2)}%
                          </Typography>
                        </Box>
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
    </motion.div>
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
