// components/owner/OwnerDailyMonthlyTable.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

/**
 * OwnerDailyMonthlyTable Component
 * Owner'ın günlük ve aylık kullanım verilerini gösteren tablo component'i
 * 
 * @param {Object} ownerStats - Owner istatistik verileri (usage.byDay içermeli)
 */
export const OwnerDailyMonthlyTable = ({ ownerStats }) => {
  const { t } = useTranslation();

  if (!ownerStats || !ownerStats.usage?.byDay) {
    return (
      <Paper 
        sx={{ 
          p: 4, 
          textAlign: 'center',
          borderRadius: 3,
          boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
          border: '1px solid #e2e8f0'
        }}
      >
        <Typography color="text.secondary">
          {t('myBookings.noData')}
        </Typography>
      </Paper>
    );
  }

  const usageByDay = ownerStats.usage.byDay || [];

  return (
    <Paper 
      sx={{ 
        p: 3, 
        borderRadius: 3,
        boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
        border: '1px solid #e2e8f0'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <CalendarTodayIcon sx={{ color: '#0891b2', fontSize: '2rem' }} />
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b' }}>
          {t('myBookings.dailyMonthlyTitle')}
        </Typography>
      </Box>
      
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f8fafc' }}>
              <TableCell sx={{ fontWeight: 700 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarTodayIcon fontSize="small" />
                  <strong>{t('myBookings.date')}</strong>
                </Box>
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                  <TrendingUpIcon fontSize="small" />
                  <strong>{t('myBookings.usageCount')}</strong>
                </Box>
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                  <strong>{t('myBookings.revenue')}</strong>
                </Box>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {usageByDay.length > 0 ? (
              usageByDay.map((day, index) => (
                <TableRow 
                  key={index}
                  sx={{ 
                    '&:hover': { 
                      bgcolor: '#f8fafc' 
                    } 
                  }}
                >
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {new Date(day._id).toLocaleDateString('de-DE', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#0891b2' }}>
                      {day.count || 0}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#16a34a' }}>
                      € {day.revenue?.toFixed(2) || '0.00'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
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
  );
};

export default OwnerDailyMonthlyTable;

