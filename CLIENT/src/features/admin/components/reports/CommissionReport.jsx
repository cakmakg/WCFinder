// features/admin/components/reports/CommissionReport.jsx
// Commission tracking and analysis report

import React, { useMemo } from 'react';
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
  Card,
  CardContent,
  Grid,
  Chip,
  LinearProgress
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import {
  AccountBalance as CommissionIcon,
  Business as BusinessIcon,
  Euro as EuroIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { COLORS, RADII, SHADOWS } from '../../../../theme/designTokens';
import { reportService } from '../../services/reportService';
import { ExportButton } from '../shared';

// Recharts-Farbfamilie der Designsprache
const CHART_COLORS = ['#0891b2', '#0e7490', '#06b6d4', '#67e8f9'];

// Admin-Designsprache: Stil-Konstanten
const sectionTitleSx = {
  fontWeight: 800,
  color: COLORS.textHeading,
  letterSpacing: '-0.02em'
};

const cardSx = {
  height: '100%',
  backgroundColor: 'white',
  border: `1px solid ${COLORS.border}`,
  borderRadius: RADII.card,
  boxShadow: SHADOWS.subtle
};

const panelSx = {
  backgroundColor: 'white',
  border: `1px solid ${COLORS.border}`,
  borderRadius: RADII.panel,
  boxShadow: SHADOWS.subtle,
  overflow: 'hidden'
};

const tableHeadRowSx = {
  backgroundColor: COLORS.backgroundLight,
  '& .MuiTableCell-head': {
    fontWeight: 600,
    color: COLORS.textSecondary,
    borderColor: COLORS.border
  }
};

const tableBodyRowSx = {
  '& .MuiTableCell-root': { borderColor: COLORS.border },
  '&:hover': { backgroundColor: COLORS.backgroundLight }
};

const moneySx = { fontVariantNumeric: 'tabular-nums' };

/**
 * CommissionReport Component
 * Displays commission statistics and breakdown
 */
const CommissionReport = ({ payments = [], _dateRange }) => {
  // Calculate commission statistics
  const commissionStats = useMemo(() => {
    return reportService.calculateCommissionStats(payments);
  }, [payments]);

  // Commission by business
  const commissionByBusiness = useMemo(() => {
    return reportService.calculateCommissionByBusiness(payments);
  }, [payments]);

  // Pie chart data
  const pieData = useMemo(() => {
    return [
      { name: 'Plattform', value: commissionStats.platformCommission },
      { name: 'Geschäfte', value: commissionStats.businessRevenue }
    ];
  }, [commissionStats]);

  // Top businesses bar chart data
  const topBusinessesData = useMemo(() => {
    return commissionByBusiness.slice(0, 10).map(b => ({
      name: b.businessName.length > 15 ? b.businessName.slice(0, 15) + '...' : b.businessName,
      fullName: b.businessName,
      Umsatz: b.totalRevenue,
      Kommission: b.platformCommission
    }));
  }, [commissionByBusiness]);

  // Export data preparation
  const exportData = useMemo(() => {
    return commissionByBusiness.map(b => ({
      'Geschäft': b.businessName,
      'Umsatz (€)': b.totalRevenue.toFixed(2),
      'Kommission (€)': b.platformCommission.toFixed(2),
      'Geschäft Einnahmen (€)': b.businessRevenue.toFixed(2),
      'Transaktionen': b.transactionCount
    }));
  }, [commissionByBusiness]);

  return (
    <Box>
      {/* Summary Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={cardSx}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <EuroIcon sx={{ color: COLORS.primary }} fontSize="small" />
                <Typography variant="caption" sx={{ color: COLORS.textSecondary, fontWeight: 600 }}>
                  Gesamtumsatz
                </Typography>
              </Box>
              <Typography variant="h5" sx={{ ...moneySx, fontWeight: 800, color: COLORS.textHeading }}>
                €{commissionStats.totalRevenue.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={cardSx}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <CommissionIcon sx={{ color: COLORS.primaryDark }} fontSize="small" />
                <Typography variant="caption" sx={{ color: COLORS.textSecondary, fontWeight: 600 }}>
                  Plattform Kommission
                </Typography>
              </Box>
              <Typography variant="h5" sx={{ ...moneySx, fontWeight: 800, color: '#059669' }}>
                €{commissionStats.platformCommission.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={cardSx}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <BusinessIcon sx={{ color: '#06b6d4' }} fontSize="small" />
                <Typography variant="caption" sx={{ color: COLORS.textSecondary, fontWeight: 600 }}>
                  Geschäft Einnahmen
                </Typography>
              </Box>
              <Typography variant="h5" sx={{ ...moneySx, fontWeight: 800, color: '#d97706' }}>
                €{commissionStats.businessRevenue.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={cardSx}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <TrendingUpIcon sx={{ color: COLORS.primary }} fontSize="small" />
                <Typography variant="caption" sx={{ color: COLORS.textSecondary, fontWeight: 600 }}>
                  Kommissionsrate
                </Typography>
              </Box>
              <Typography variant="h5" sx={{ ...moneySx, fontWeight: 800, color: COLORS.primary }}>
                {commissionStats.commissionRate.toFixed(2)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={3} mb={3}>
        {/* Pie Chart - Revenue Split */}
        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ p: 2, height: '100%', ...cardSx }}>
            <Typography variant="subtitle1" sx={sectionTitleSx} gutterBottom>
              Umsatzverteilung
            </Typography>
            <Box height={250}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => `€${Number(value).toFixed(2)}`}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Bar Chart - Top Businesses */}
        <Grid item xs={12} md={8}>
          <Paper elevation={0} sx={{ p: 2, height: '100%', ...cardSx }}>
            <Typography variant="subtitle1" sx={sectionTitleSx} gutterBottom>
              Top 10 Geschäfte nach Umsatz
            </Typography>
            <Box height={250}>
              <ResponsiveContainer>
                <BarChart data={topBusinessesData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
                  <XAxis type="number" tickFormatter={(v) => `€${v}`} stroke={COLORS.textSecondary} />
                  <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11 }} stroke={COLORS.textSecondary} />
                  <Tooltip
                    formatter={(value, name) => [`€${Number(value).toFixed(2)}`, name]}
                    labelFormatter={(label, payload) => payload?.[0]?.payload?.fullName || label}
                  />
                  <Legend />
                  <Bar dataKey="Umsatz" fill={CHART_COLORS[0]} />
                  <Bar dataKey="Kommission" fill={CHART_COLORS[2]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Commission by Business Table */}
      <Paper elevation={0} sx={panelSx}>
        <Box p={2} display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle1" sx={sectionTitleSx}>
            Kommission nach Geschäft
          </Typography>
          <ExportButton
            data={exportData}
            filename="kommission_bericht"
            title="Kommission Export"
          />
        </Box>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={tableHeadRowSx}>
                <TableCell>Geschäft</TableCell>
                <TableCell align="right">Umsatz</TableCell>
                <TableCell align="right">Kommission</TableCell>
                <TableCell align="right">Geschäft Einnahmen</TableCell>
                <TableCell align="center">Transaktionen</TableCell>
                <TableCell>Anteil</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {commissionByBusiness.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3, borderColor: COLORS.border }}>
                    <Typography sx={{ color: COLORS.textSecondary }}>
                      Keine Daten für den gewählten Zeitraum
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                commissionByBusiness.map((business, index) => {
                  const sharePercent = commissionStats.totalRevenue > 0
                    ? (business.totalRevenue / commissionStats.totalRevenue) * 100
                    : 0;

                  return (
                    <TableRow key={business.businessId} sx={tableBodyRowSx}>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Chip
                            label={index + 1}
                            size="small"
                            sx={{
                              minWidth: 28,
                              borderRadius: '999px',
                              fontWeight: 600,
                              fontVariantNumeric: 'tabular-nums',
                              bgcolor: index < 3 ? CHART_COLORS[index] : '#f1f5f9',
                              color: index < 3 ? 'white' : COLORS.textSecondary
                            }}
                          />
                          <Typography variant="body2" fontWeight={500} sx={{ color: COLORS.textPrimary }}>
                            {business.businessName}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ ...moneySx, fontWeight: 700, color: COLORS.textHeading }}>
                          €{business.totalRevenue.toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ ...moneySx, fontWeight: 700, color: '#059669' }}>
                          €{business.platformCommission.toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" sx={moneySx}>
                          €{business.businessRevenue.toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={business.transactionCount}
                          size="small"
                          sx={{
                            borderRadius: '999px',
                            fontWeight: 600,
                            fontVariantNumeric: 'tabular-nums',
                            backgroundColor: '#f1f5f9',
                            color: COLORS.textSecondary
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <LinearProgress
                            variant="determinate"
                            value={sharePercent}
                            sx={{
                              flex: 1,
                              height: 8,
                              borderRadius: 4,
                              backgroundColor: COLORS.border,
                              '& .MuiLinearProgress-bar': {
                                borderRadius: 4,
                                backgroundColor: COLORS.primary
                              }
                            }}
                          />
                          <Typography variant="caption" sx={{ minWidth: 40, ...moneySx, color: COLORS.textSecondary }}>
                            {sharePercent.toFixed(1)}%
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default CommissionReport;
