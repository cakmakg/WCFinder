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
import { reportService } from '../../services/reportService';
import { ExportButton } from '../shared';

const COLORS = ['#0891b2', '#16a34a', '#f59e0b', '#dc2626', '#8b5cf6', '#ec4899'];

/**
 * CommissionReport Component
 * Displays commission statistics and breakdown
 */
const CommissionReport = ({ payments = [], dateRange }) => {
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
          <Card variant="outlined">
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <EuroIcon color="primary" fontSize="small" />
                <Typography variant="caption" color="text.secondary">
                  Gesamtumsatz
                </Typography>
              </Box>
              <Typography variant="h5" fontWeight={700}>
                €{commissionStats.totalRevenue.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined">
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <CommissionIcon color="success" fontSize="small" />
                <Typography variant="caption" color="text.secondary">
                  Plattform Kommission
                </Typography>
              </Box>
              <Typography variant="h5" fontWeight={700} color="success.main">
                €{commissionStats.platformCommission.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined">
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <BusinessIcon color="warning" fontSize="small" />
                <Typography variant="caption" color="text.secondary">
                  Geschäft Einnahmen
                </Typography>
              </Box>
              <Typography variant="h5" fontWeight={700} color="warning.main">
                €{commissionStats.businessRevenue.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined">
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <TrendingUpIcon color="info" fontSize="small" />
                <Typography variant="caption" color="text.secondary">
                  Kommissionsrate
                </Typography>
              </Box>
              <Typography variant="h5" fontWeight={700} color="info.main">
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
          <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
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
                      <Cell key={`cell-${index}`} fill={COLORS[index]} />
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
          <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Top 10 Geschäfte nach Umsatz
            </Typography>
            <Box height={250}>
              <ResponsiveContainer>
                <BarChart data={topBusinessesData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tickFormatter={(v) => `€${v}`} />
                  <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(value, name) => [`€${Number(value).toFixed(2)}`, name]}
                    labelFormatter={(label, payload) => payload?.[0]?.payload?.fullName || label}
                  />
                  <Legend />
                  <Bar dataKey="Umsatz" fill="#0891b2" />
                  <Bar dataKey="Kommission" fill="#16a34a" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Commission by Business Table */}
      <Paper variant="outlined">
        <Box p={2} display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle1" fontWeight={600}>
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
              <TableRow sx={{ bgcolor: 'grey.50' }}>
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
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                    <Typography color="text.secondary">
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
                    <TableRow key={business.businessId} hover>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Chip
                            label={index + 1}
                            size="small"
                            sx={{
                              minWidth: 28,
                              bgcolor: index < 3 ? COLORS[index] : 'grey.300',
                              color: index < 3 ? 'white' : 'text.primary'
                            }}
                          />
                          <Typography variant="body2" fontWeight={500}>
                            {business.businessName}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={600}>
                          €{business.totalRevenue.toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" color="success.main" fontWeight={600}>
                          €{business.platformCommission.toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          €{business.businessRevenue.toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={business.transactionCount}
                          size="small"
                          variant="outlined"
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
                              bgcolor: 'grey.200'
                            }}
                          />
                          <Typography variant="caption" sx={{ minWidth: 40 }}>
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

