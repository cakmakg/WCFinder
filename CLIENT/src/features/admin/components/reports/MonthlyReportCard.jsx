// features/admin/components/reports/MonthlyReportCard.jsx
// Monthly summary report card

import React, { useMemo } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Divider,
  Chip,
  LinearProgress
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  CalendarMonth as CalendarIcon
} from '@mui/icons-material';

/**
 * MonthlyReportCard Component
 * Displays monthly summary statistics
 */
const MonthlyReportCard = ({ year, month, usages = [], payments = [] }) => {
  // Calculate monthly statistics
  const stats = useMemo(() => {
    const monthStart = new Date(year, month - 1, 1);
    const monthEnd = new Date(year, month, 0, 23, 59, 59, 999);

    // Previous month for comparison
    const prevMonthStart = new Date(year, month - 2, 1);
    const prevMonthEnd = new Date(year, month - 1, 0, 23, 59, 59, 999);

    // Filter usages for current month
    const monthUsages = usages.filter(usage => {
      const date = new Date(usage.createdAt || usage.startTime);
      return date >= monthStart && date <= monthEnd;
    });

    // Filter usages for previous month
    const prevMonthUsages = usages.filter(usage => {
      const date = new Date(usage.createdAt || usage.startTime);
      return date >= prevMonthStart && date <= prevMonthEnd;
    });

    // Calculate current month stats
    const paidUsages = monthUsages.filter(
      u => u.paymentStatus === 'paid' || u.status === 'completed'
    );

    const revenue = paidUsages.reduce(
      (sum, u) => sum + (Number(u.totalFee) || 0),
      0
    );

    const commission = paidUsages.reduce(
      (sum, u) => sum + (Number(u.serviceFee) || 0.75),
      0
    );

    // Calculate previous month stats for comparison
    const prevPaidUsages = prevMonthUsages.filter(
      u => u.paymentStatus === 'paid' || u.status === 'completed'
    );

    const prevRevenue = prevPaidUsages.reduce(
      (sum, u) => sum + (Number(u.totalFee) || 0),
      0
    );

    // Calculate growth
    const revenueGrowth = prevRevenue > 0
      ? ((revenue - prevRevenue) / prevRevenue) * 100
      : revenue > 0 ? 100 : 0;

    const bookingsGrowth = prevPaidUsages.length > 0
      ? ((paidUsages.length - prevPaidUsages.length) / prevPaidUsages.length) * 100
      : paidUsages.length > 0 ? 100 : 0;

    return {
      revenue,
      commission,
      businessRevenue: revenue - commission,
      bookings: paidUsages.length,
      totalBookings: monthUsages.length,
      completionRate: monthUsages.length > 0
        ? (paidUsages.length / monthUsages.length) * 100
        : 0,
      revenueGrowth,
      bookingsGrowth,
      averageValue: paidUsages.length > 0 ? revenue / paidUsages.length : 0
    };
  }, [year, month, usages]);

  // Format month name
  const monthName = new Date(year, month - 1).toLocaleDateString('de-DE', {
    month: 'long',
    year: 'numeric'
  });

  // Determine if current month
  const isCurrentMonth = useMemo(() => {
    const now = new Date();
    return now.getFullYear() === year && now.getMonth() + 1 === month;
  }, [year, month]);

  return (
    <Card
      variant="outlined"
      sx={{
        height: '100%',
        borderColor: isCurrentMonth ? 'primary.main' : 'divider',
        borderWidth: isCurrentMonth ? 2 : 1
      }}
    >
      <CardContent>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <CalendarIcon color="primary" fontSize="small" />
            <Typography variant="subtitle1" fontWeight={600}>
              {monthName}
            </Typography>
          </Box>
          {isCurrentMonth && (
            <Chip label="Aktuell" size="small" color="primary" />
          )}
        </Box>

        {/* Revenue */}
        <Box mb={2}>
          <Typography variant="caption" color="text.secondary">
            Umsatz
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="h5" fontWeight={700} color="primary">
              €{stats.revenue.toFixed(2)}
            </Typography>
            <GrowthIndicator value={stats.revenueGrowth} />
          </Box>
        </Box>

        <Divider sx={{ my: 1.5 }} />

        {/* Stats Grid */}
        <Box display="grid" gridTemplateColumns="1fr 1fr" gap={1.5}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Kommission
            </Typography>
            <Typography variant="body2" fontWeight={600} color="success.main">
              €{stats.commission.toFixed(2)}
            </Typography>
          </Box>

          <Box>
            <Typography variant="caption" color="text.secondary">
              Buchungen
            </Typography>
            <Box display="flex" alignItems="center" gap={0.5}>
              <Typography variant="body2" fontWeight={600}>
                {stats.bookings}
              </Typography>
              <GrowthIndicator value={stats.bookingsGrowth} small />
            </Box>
          </Box>

          <Box>
            <Typography variant="caption" color="text.secondary">
              Ø Buchungswert
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              €{stats.averageValue.toFixed(2)}
            </Typography>
          </Box>

          <Box>
            <Typography variant="caption" color="text.secondary">
              Abschlussrate
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {stats.completionRate.toFixed(0)}%
            </Typography>
          </Box>
        </Box>

        {/* Completion Rate Progress */}
        <Box mt={2}>
          <Box display="flex" justifyContent="space-between" mb={0.5}>
            <Typography variant="caption" color="text.secondary">
              Abgeschlossen
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {stats.bookings}/{stats.totalBookings}
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={stats.completionRate}
            sx={{
              height: 6,
              borderRadius: 3,
              bgcolor: 'grey.200',
              '& .MuiLinearProgress-bar': {
                borderRadius: 3
              }
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
};

// Growth indicator component
const GrowthIndicator = ({ value, small = false }) => {
  if (value === 0) return null;

  const isPositive = value > 0;
  const Icon = isPositive ? TrendingUpIcon : TrendingDownIcon;
  const color = isPositive ? 'success.main' : 'error.main';

  return (
    <Box
      display="flex"
      alignItems="center"
      sx={{
        color,
        fontSize: small ? '0.7rem' : '0.75rem'
      }}
    >
      <Icon sx={{ fontSize: small ? 14 : 16 }} />
      <Typography
        variant="caption"
        sx={{ fontWeight: 600, color, fontSize: 'inherit' }}
      >
        {isPositive ? '+' : ''}{value.toFixed(1)}%
      </Typography>
    </Box>
  );
};

export default MonthlyReportCard;

