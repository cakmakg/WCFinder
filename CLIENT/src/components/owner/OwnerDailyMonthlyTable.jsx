// components/owner/OwnerDailyMonthlyTable.jsx
import React, { useMemo } from 'react';
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
import EuroIcon from '@mui/icons-material/Euro';

/**
 * OwnerDailyMonthlyTable Component
 * Owner'ın günlük ve aylık kullanım verilerini gösteren tablo component'i
 * 
 * @param {Object} ownerStats - Owner istatistik verileri (usage.byDay içermeli)
 * @param {string} viewMode - 'daily' or 'monthly'
 * @param {Date} selectedDate - Selected date for filtering
 */
export const OwnerDailyMonthlyTable = ({ ownerStats, viewMode = "daily", selectedDate = new Date() }) => {
  // Process data based on view mode
  const tableData = useMemo(() => {
    if (!ownerStats || !ownerStats.usage?.byDay) return [];

    if (viewMode === "daily") {
      // Show last 30 days
      return ownerStats.usage.byDay
        .slice(-30)
        .map((day) => ({
          date: new Date(day._id).toLocaleDateString("de-DE", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          }),
          usage: day.count || 0,
          revenue: day.revenue || 0,
        }));
    } else {
      // Group by month
      const monthlyData = {};
      ownerStats.usage.byDay.forEach((day) => {
        const date = new Date(day._id);
        const monthKey = date.toLocaleDateString("de-DE", { month: "long", year: "numeric" });
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { month: monthKey, usage: 0, revenue: 0 };
        }
        monthlyData[monthKey].usage += day.count || 0;
        monthlyData[monthKey].revenue += day.revenue || 0;
      });

      return Object.values(monthlyData).slice(-12);
    }
  }, [ownerStats, viewMode]);

  if (!ownerStats || !ownerStats.usage?.byDay || tableData.length === 0) {
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
          Keine Daten verfügbar
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper 
      sx={{ 
        p: 3, 
        borderRadius: 3,
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        border: 'none',
        "&:hover": {
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        },
        transition: "all 0.3s ease",
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <Box
          sx={{
            p: 1.5,
            borderRadius: 2,
            bgcolor: '#cffafe',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CalendarTodayIcon sx={{ color: '#0891b2', fontSize: '2rem' }} />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b' }}>
          {viewMode === "daily" ? "Tägliche Übersicht" : "Monatliche Übersicht"}
        </Typography>
      </Box>
      
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f8fafc' }}>
              <TableCell sx={{ fontWeight: 700 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarTodayIcon fontSize="small" color="primary" />
                  <strong>{viewMode === "daily" ? "Datum" : "Monat"}</strong>
                </Box>
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                  <TrendingUpIcon fontSize="small" color="primary" />
                  <strong>Reservierungen</strong>
                </Box>
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                  <EuroIcon fontSize="small" color="primary" />
                  <strong>Umsatz</strong>
                </Box>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tableData.map((row, index) => (
              <TableRow 
                key={index}
                sx={{ 
                  '&:hover': { 
                    bgcolor: '#f8fafc',
                    transform: 'scale(1.01)',
                  },
                  transition: "all 0.2s ease",
                }}
              >
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {viewMode === "daily" ? row.date : row.month}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#0891b2' }}>
                    {row.usage || 0}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#16a34a' }}>
                    €{Number(row.revenue || 0).toLocaleString("de-DE", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default OwnerDailyMonthlyTable;

