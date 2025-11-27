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
              position: "relative",
              overflow: "hidden",
              borderRadius: 3,
              border: "none",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              "&:hover": {
                boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                transform: "translateY(-4px)",
              },
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                top: -20,
                right: -20,
                width: 100,
                height: 100,
                borderRadius: "50%",
                bgcolor: "#0891b2",
                opacity: 0.1,
              }}
            />
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: "#cffafe",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <WcIcon sx={{ color: "#0891b2", fontSize: "2rem" }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      color: "#0891b2",
                      mb: 0.5,
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    {ownerStats.toilets?.total || 0}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontWeight: 500 }}
                  >
                    Gesamt Toiletten
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              position: "relative",
              overflow: "hidden",
              borderRadius: 3,
              border: "none",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              "&:hover": {
                boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                transform: "translateY(-4px)",
              },
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                top: -20,
                right: -20,
                width: 100,
                height: 100,
                borderRadius: "50%",
                bgcolor: "#16a34a",
                opacity: 0.1,
              }}
            />
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: "#dcfce7",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <TrendingUpIcon sx={{ color: "#16a34a", fontSize: "2rem" }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      color: "#16a34a",
                      mb: 0.5,
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    {ownerStats.usage?.total || 0}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontWeight: 500 }}
                  >
                    Gesamt Reservierungen
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              position: "relative",
              overflow: "hidden",
              borderRadius: 3,
              border: "none",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              "&:hover": {
                boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                transform: "translateY(-4px)",
              },
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                top: -20,
                right: -20,
                width: 100,
                height: 100,
                borderRadius: "50%",
                bgcolor: "#f59e0b",
                opacity: 0.1,
              }}
            />
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: "#fef3c7",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <EuroIcon sx={{ color: "#f59e0b", fontSize: "2rem" }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      color: "#f59e0b",
                      mb: 0.5,
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    €{ownerStats.revenue?.total?.toFixed(2) || '0.00'}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontWeight: 500 }}
                  >
                    Gesamtumsatz
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              position: "relative",
              overflow: "hidden",
              borderRadius: 3,
              border: "none",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              "&:hover": {
                boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                transform: "translateY(-4px)",
              },
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                top: -20,
                right: -20,
                width: 100,
                height: 100,
                borderRadius: "50%",
                bgcolor: "#16a34a",
                opacity: 0.1,
              }}
            />
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: "#dcfce7",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <PeopleIcon sx={{ color: "#16a34a", fontSize: "2rem" }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      color: "#16a34a",
                      mb: 0.5,
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    {ownerStats.ratings?.average?.toFixed(1) || '0.0'}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontWeight: 500 }}
                  >
                    Durchschnittliche Bewertung
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Toiletten Liste */}
        <Grid item xs={12}>
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
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#1e293b' }}>
              Toiletten Übersicht
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f8fafc' }}>
                    <TableCell sx={{ fontWeight: 700 }}><strong>Name</strong></TableCell>
                    <TableCell sx={{ fontWeight: 700 }}><strong>Gebühr</strong></TableCell>
                    <TableCell sx={{ fontWeight: 700 }}><strong>Status</strong></TableCell>
                    <TableCell sx={{ fontWeight: 700 }}><strong>Bewertung</strong></TableCell>
                    <TableCell sx={{ fontWeight: 700 }}><strong>Bewertungen</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {ownerStats.toilets?.list && ownerStats.toilets.list.length > 0 ? (
                    ownerStats.toilets.list.map((toilet) => (
                      <TableRow 
                        key={toilet.id}
                        sx={{ 
                          '&:hover': { 
                            bgcolor: '#f8fafc',
                            transform: 'scale(1.01)',
                          },
                          transition: "all 0.2s ease",
                        }}
                      >
                        <TableCell sx={{ fontWeight: 500 }}>{toilet.name}</TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600} color="#0891b2">
                            €{toilet.fee?.toFixed(2) || '0.00'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={
                              toilet.status === 'available' 
                                ? "Verfügbar" 
                                : toilet.status === 'in_use' 
                                ? "In Benutzung" 
                                : "Außer Betrieb"
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
                            <PeopleIcon fontSize="small" color="primary" />
                            <Typography variant="body2" fontWeight={600}>
                              {toilet.averageRating?.toFixed(1) || '0.0'}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={500}>
                            {toilet.reviewCount || 0}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">
                          Keine Daten verfügbar
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

