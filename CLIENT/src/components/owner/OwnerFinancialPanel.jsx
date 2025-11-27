// components/owner/OwnerFinancialPanel.jsx
import React, { useState, useEffect } from 'react';
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
  Button,
  CircularProgress,
  Alert,
  Divider,
  Tabs,
  Tab,
} from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import EuroIcon from '@mui/icons-material/Euro';
import PaymentIcon from '@mui/icons-material/Payment';
import HistoryIcon from '@mui/icons-material/History';
import useApiCall from '../../hook/useApiCall';

/**
 * OwnerFinancialPanel Component
 * Owner'ın finansal bilgilerini gösteren panel (bekleyen ödeme, toplam kazanç, ödeme geçmişi)
 */
export const OwnerFinancialPanel = () => {
  const { t } = useTranslation();
  const apiCall = useApiCall();
  
  const [financialData, setFinancialData] = useState(null);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [payoutHistory, setPayoutHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    fetchFinancialData();
  }, []);

  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Finansal özet
      const summary = await apiCall({
        url: '/business-payouts/my-summary',
        method: 'get',
      });

      // Bekleyen ödemeler
      const pending = await apiCall({
        url: '/business-payouts/my-pending',
        method: 'get',
      });

      // Ödeme geçmişi
      const history = await apiCall({
        url: '/business-payouts/my-history',
        method: 'get',
      });

      setFinancialData(summary?.result);
      setPendingPayments(pending?.result?.pendingPayments || []);
      setPayoutHistory(history?.result || []);

    } catch (err) {
      console.error('Error fetching financial data:', err);
      setError(err.message || t('myBookings.loadError'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  const business = financialData?.business || {};
  const summary = financialData?.summary || {};

  return (
    <Box>
      {/* Finansal Özet Kartları */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
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
                  <AccountBalanceWalletIcon sx={{ color: "#f59e0b", fontSize: "2rem" }} />
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
                    €{business.pendingBalance?.toFixed(2) || '0.00'}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontWeight: 500 }}
                  >
                    {t('myBookings.pendingBalance')}
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
                    €{business.totalEarnings?.toFixed(2) || '0.00'}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontWeight: 500 }}
                  >
                    {t('myBookings.totalEarnings')}
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
                  <PaymentIcon sx={{ color: "#0891b2", fontSize: "2rem" }} />
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
                    €{business.totalPaidOut?.toFixed(2) || '0.00'}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontWeight: 500 }}
                  >
                    {t('myBookings.totalPaidOut')}
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
                bgcolor: "#7c3aed",
                opacity: 0.1,
              }}
            />
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: "#f3e8ff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <EuroIcon sx={{ color: "#7c3aed", fontSize: "2rem" }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      color: "#7c3aed",
                      mb: 0.5,
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    {summary.paymentCount || 0}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontWeight: 500 }}
                  >
                    {t('myBookings.totalPayments')}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs: Bekleyen Ödemeler ve Ödeme Geçmişi */}
      <Paper sx={{ 
        p: 3, 
        borderRadius: 3, 
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        border: 'none',
        "&:hover": {
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        },
        transition: "all 0.3s ease",
      }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{ mb: 3, borderBottom: '1px solid #e2e8f0' }}
        >
          <Tab
            icon={<PaymentIcon />}
            iconPosition="start"
            label={t('myBookings.pendingPayments')}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          />
          <Tab
            icon={<HistoryIcon />}
            iconPosition="start"
            label={t('myBookings.payoutHistory')}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          />
        </Tabs>

        {/* Bekleyen Ödemeler Tab */}
        {activeTab === 0 && (
          <Box>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              {t('myBookings.pendingPayments')} ({pendingPayments.length})
            </Typography>
            {pendingPayments.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f8fafc' }}>
                      <TableCell sx={{ fontWeight: 700 }}>{t('myBookings.date')}</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{t('myBookings.customer')}</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{t('myBookings.amount')}</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{t('myBookings.businessFee')}</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{t('myBookings.status')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pendingPayments.map((payment) => (
                      <TableRow 
                        key={payment._id} 
                        sx={{ 
                          '&:hover': { 
                            bgcolor: '#f8fafc',
                            transform: 'scale(1.01)',
                          },
                          transition: "all 0.2s ease",
                        }}
                      >
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(payment.createdAt).toLocaleDateString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={500}>
                            {payment.userId?.username || payment.userId?.email || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600} color="#0891b2">
                            €{payment.amount?.toFixed(2)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600} color="#16a34a">
                            €{payment.businessFee?.toFixed(2)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={t(`myBookings.paymentStatusLabels.${payment.payoutStatus}`)}
                            color="warning"
                            size="small"
                            sx={{ fontWeight: 500 }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                {t('myBookings.noPendingPayments')}
              </Typography>
            )}
          </Box>
        )}

        {/* Ödeme Geçmişi Tab */}
        {activeTab === 1 && (
          <Box>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              {t('myBookings.payoutHistory')} ({payoutHistory.length})
            </Typography>
            {payoutHistory.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f8fafc' }}>
                      <TableCell sx={{ fontWeight: 700 }}>{t('myBookings.date')}</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{t('myBookings.amount')}</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{t('myBookings.paymentMethod')}</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{t('myBookings.status')}</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{t('myBookings.period')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {payoutHistory.map((payout) => (
                      <TableRow 
                        key={payout._id} 
                        sx={{ 
                          '&:hover': { 
                            bgcolor: '#f8fafc',
                            transform: 'scale(1.01)',
                          },
                          transition: "all 0.2s ease",
                        }}
                      >
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(payout.createdAt).toLocaleDateString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600} color="#0891b2">
                            €{payout.amount?.toFixed(2)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {payout.paymentMethod || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={t(`myBookings.payoutStatusLabels.${payout.status}`)}
                            color={
                              payout.status === 'completed' ? 'success' :
                              payout.status === 'processing' ? 'warning' :
                              payout.status === 'failed' ? 'error' : 'default'
                            }
                            size="small"
                            sx={{ fontWeight: 500 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {payout.period?.startDate && payout.period?.endDate
                              ? `${new Date(payout.period.startDate).toLocaleDateString()} - ${new Date(payout.period.endDate).toLocaleDateString()}`
                              : '-'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                {t('myBookings.noPayoutHistory')}
              </Typography>
            )}
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default OwnerFinancialPanel;

