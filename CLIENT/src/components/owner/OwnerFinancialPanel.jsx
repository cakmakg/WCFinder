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
                <AccountBalanceWalletIcon sx={{ color: '#d97706', fontSize: '2rem' }} />
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#d97706' }}>
                  € {business.pendingBalance?.toFixed(2) || '0.00'}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                {t('myBookings.pendingBalance')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              bgcolor: '#dcfce7',
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
                  € {business.totalEarnings?.toFixed(2) || '0.00'}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                {t('myBookings.totalEarnings')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              bgcolor: '#dbeafe',
              border: '1px solid #93c5fd',
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
                <PaymentIcon sx={{ color: '#2563eb', fontSize: '2rem' }} />
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#2563eb' }}>
                  € {business.totalPaidOut?.toFixed(2) || '0.00'}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                {t('myBookings.totalPaidOut')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              bgcolor: '#f3e8ff',
              border: '1px solid #c4b5fd',
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
                <EuroIcon sx={{ color: '#7c3aed', fontSize: '2rem' }} />
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#7c3aed' }}>
                  {summary.paymentCount || 0}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                {t('myBookings.totalPayments')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs: Bekleyen Ödemeler ve Ödeme Geçmişi */}
      <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 2px 10px rgba(0,0,0,0.08)' }}>
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
                      <TableRow key={payment._id} sx={{ '&:hover': { bgcolor: '#f8fafc' } }}>
                        <TableCell>
                          {new Date(payment.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {payment.userId?.username || payment.userId?.email || '-'}
                        </TableCell>
                        <TableCell>€ {payment.amount?.toFixed(2)}</TableCell>
                        <TableCell>€ {payment.businessFee?.toFixed(2)}</TableCell>
                        <TableCell>
                          <Chip
                            label={t(`myBookings.paymentStatusLabels.${payment.payoutStatus}`)}
                            color="warning"
                            size="small"
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
                      <TableRow key={payout._id} sx={{ '&:hover': { bgcolor: '#f8fafc' } }}>
                        <TableCell>
                          {new Date(payout.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>€ {payout.amount?.toFixed(2)}</TableCell>
                        <TableCell>{payout.paymentMethod || '-'}</TableCell>
                        <TableCell>
                          <Chip
                            label={t(`myBookings.payoutStatusLabels.${payout.status}`)}
                            color={
                              payout.status === 'completed' ? 'success' :
                              payout.status === 'processing' ? 'warning' :
                              payout.status === 'failed' ? 'error' : 'default'
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {payout.period?.startDate && payout.period?.endDate
                            ? `${new Date(payout.period.startDate).toLocaleDateString()} - ${new Date(payout.period.endDate).toLocaleDateString()}`
                            : '-'}
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

