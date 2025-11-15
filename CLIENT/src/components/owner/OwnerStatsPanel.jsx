// components/owner/OwnerStatsPanel.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Grid,
  Card,
  CardContent,
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import WcIcon from '@mui/icons-material/Wc';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import EuroIcon from '@mui/icons-material/Euro';
import PeopleIcon from '@mui/icons-material/People';

/**
 * OwnerStatsPanel Component
 * Owner'ın istatistiklerini gösteren panel component'i
 * 
 * @param {Object} ownerStats - Owner istatistik verileri
 */
export const OwnerStatsPanel = ({ ownerStats }) => {
  const { t } = useTranslation();

  if (!ownerStats) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          {t('myBookings.loading')}
        </Typography>
      </Paper>
    );
  }

  return (
    <Grid container spacing={3}>
        {/* İstatistik Kartları */}
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              bgcolor: '#f0f9ff', 
              border: '1px solid #bae6fd',
              borderRadius: 3,
              boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
              }
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                <WcIcon sx={{ color: '#0891b2', fontSize: '2rem' }} />
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#0891b2' }}>
                  {ownerStats.toilets?.total || 0}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                {t('myBookings.totalToilets')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              bgcolor: '#f0fdf4', 
              border: '1px solid #86efac',
              borderRadius: 3,
              boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
              }
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                <TrendingUpIcon sx={{ color: '#16a34a', fontSize: '2rem' }} />
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#16a34a' }}>
                  {ownerStats.usage?.total || 0}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                {t('myBookings.totalUsages')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              bgcolor: '#fef3c7', 
              border: '1px solid #fde047',
              borderRadius: 3,
              boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
              }
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                <EuroIcon sx={{ color: '#d97706', fontSize: '2rem' }} />
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#d97706' }}>
                  € {ownerStats.revenue?.total?.toFixed(2) || '0.00'}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                {t('myBookings.totalRevenue')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              bgcolor: '#fce7f3', 
              border: '1px solid #f9a8d4',
              borderRadius: 3,
              boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
              }
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                <PeopleIcon sx={{ color: '#be185d', fontSize: '2rem' }} />
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#be185d' }}>
                  {ownerStats.ratings?.average?.toFixed(1) || '0.0'}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                {t('myBookings.averageRating')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Toiletten Liste */}
        <Grid item xs={12}>
          <Paper 
            sx={{ 
              p: 3, 
              borderRadius: 3,
              boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
              border: '1px solid #e2e8f0'
            }}
          >
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#1e293b' }}>
              {t('myBookings.toiletOverview')}
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f8fafc' }}>
                    <TableCell sx={{ fontWeight: 700 }}><strong>{t('myBookings.name')}</strong></TableCell>
                    <TableCell sx={{ fontWeight: 700 }}><strong>{t('myBookings.fee')}</strong></TableCell>
                    <TableCell sx={{ fontWeight: 700 }}><strong>{t('myBookings.status')}</strong></TableCell>
                    <TableCell sx={{ fontWeight: 700 }}><strong>{t('myBookings.rating')}</strong></TableCell>
                    <TableCell sx={{ fontWeight: 700 }}><strong>{t('myBookings.reviews')}</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {ownerStats.toilets?.list && ownerStats.toilets.list.length > 0 ? (
                    ownerStats.toilets.list.map((toilet) => (
                      <TableRow 
                        key={toilet.id}
                        sx={{ 
                          '&:hover': { 
                            bgcolor: '#f8fafc' 
                          } 
                        }}
                      >
                        <TableCell sx={{ fontWeight: 500 }}>{toilet.name}</TableCell>
                        <TableCell>€ {toilet.fee?.toFixed(2) || '0.00'}</TableCell>
                        <TableCell>
                          <Chip
                            label={
                              toilet.status === 'available' 
                                ? t('myBookings.available') 
                                : toilet.status === 'in_use' 
                                ? t('myBookings.inUse') 
                                : t('myBookings.outOfOrder')
                            }
                            color={
                              toilet.status === 'available' 
                                ? 'success' 
                                : toilet.status === 'in_use' 
                                ? 'warning' 
                                : 'error'
                            }
                            size="small"
                            sx={{ fontWeight: 500 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <PeopleIcon fontSize="small" color="action" />
                            {toilet.averageRating?.toFixed(1) || '0.0'}
                          </Box>
                        </TableCell>
                        <TableCell>{toilet.reviewCount || 0}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">
                          {t('myBookings.noData')}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
  );
};

export default OwnerStatsPanel;

