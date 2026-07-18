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
import { COLORS, RADII, SHADOWS } from '../../../../theme/designTokens';

// Admin-Designsprache: Zahlen mit tabular-nums
const moneySx = { fontVariantNumeric: 'tabular-nums' };

/**
 * MonthlyReportCard Component
 * Displays monthly summary statistics
 */
const MonthlyReportCard = ({ year, month, usages = [], _payments = [] }) => {
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
      elevation={0}
      sx={{
        height: '100%',
        backgroundColor: 'white',
        borderRadius: RADII.card,
        boxShadow: SHADOWS.subtle,
        border: isCurrentMonth ? `2px solid ${COLORS.primary}` : `1px solid ${COLORS.border}`
      }}
    >
      <CardContent>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <CalendarIcon sx={{ color: COLORS.primary }} fontSize="small" />
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 800, color: COLORS.textHeading, letterSpacing: '-0.02em' }}
            >
              {monthName}
            </Typography>
          </Box>
          {isCurrentMonth && (
            <Chip
              label="Aktuell"
              size="small"
              sx={{
                borderRadius: '999px',
                fontWeight: 600,
                backgroundColor: COLORS.accentBoxBg,
                color: COLORS.primaryDark
              }}
            />
          )}
        </Box>

        {/* Revenue */}
        <Box mb={2}>
          <Typography variant="caption" sx={{ color: COLORS.textSecondary, fontWeight: 600 }}>
            Umsatz
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="h5" sx={{ ...moneySx, fontWeight: 800, color: COLORS.primary }}>
              €{stats.revenue.toFixed(2)}
            </Typography>
            <GrowthIndicator value={stats.revenueGrowth} />
          </Box>
        </Box>

        <Divider sx={{ my: 1.5, borderColor: COLORS.border }} />

        {/* Stats Grid */}
        <Box display="grid" gridTemplateColumns="1fr 1fr" gap={1.5}>
          <Box>
            <Typography variant="caption" sx={{ color: COLORS.textSecondary }}>
              Kommission
            </Typography>
            <Typography variant="body2" sx={{ ...moneySx, fontWeight: 700, color: '#059669' }}>
              €{stats.commission.toFixed(2)}
            </Typography>
          </Box>

          <Box>
            <Typography variant="caption" sx={{ color: COLORS.textSecondary }}>
              Buchungen
            </Typography>
            <Box display="flex" alignItems="center" gap={0.5}>
              <Typography variant="body2" sx={{ ...moneySx, fontWeight: 700, color: COLORS.textHeading }}>
                {stats.bookings}
              </Typography>
              <GrowthIndicator value={stats.bookingsGrowth} small />
            </Box>
          </Box>

          <Box>
            <Typography variant="caption" sx={{ color: COLORS.textSecondary }}>
              Ø Buchungswert
            </Typography>
            <Typography variant="body2" sx={{ ...moneySx, fontWeight: 700, color: COLORS.textHeading }}>
              €{stats.averageValue.toFixed(2)}
            </Typography>
          </Box>

          <Box>
            <Typography variant="caption" sx={{ color: COLORS.textSecondary }}>
              Abschlussrate
            </Typography>
            <Typography variant="body2" sx={{ ...moneySx, fontWeight: 700, color: COLORS.textHeading }}>
              {stats.completionRate.toFixed(0)}%
            </Typography>
          </Box>
        </Box>

        {/* Completion Rate Progress */}
        <Box mt={2}>
          <Box display="flex" justifyContent="space-between" mb={0.5}>
            <Typography variant="caption" sx={{ color: COLORS.textSecondary }}>
              Abgeschlossen
            </Typography>
            <Typography variant="caption" sx={{ ...moneySx, color: COLORS.textSecondary }}>
              {stats.bookings}/{stats.totalBookings}
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={stats.completionRate}
            sx={{
              height: 6,
              borderRadius: 3,
              backgroundColor: COLORS.border,
              '& .MuiLinearProgress-bar': {
                borderRadius: 3,
                backgroundColor: COLORS.primary
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
  const color = isPositive ? '#059669' : '#dc2626';

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
        sx={{ fontWeight: 600, color, fontSize: 'inherit', fontVariantNumeric: 'tabular-nums' }}
      >
        {isPositive ? '+' : ''}{value.toFixed(1)}%
      </Typography>
    </Box>
  );
};

export default MonthlyReportCard;
