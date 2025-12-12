// features/admin/components/finanz/FinanzmanagementPage.jsx
// Unified Financial Management - Workflow + Rechnungen + Auszahlungen
// DOĞRU AKIŞ: MonthlyReport → Rechnung → Zahlung → Payout

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  IconButton,
  Tooltip,
  LinearProgress,
  Divider,
  Stack,
  Alert,
  CircularProgress,
  Badge
} from '@mui/material';
import {
  TrendingUp as WorkflowIcon,
  Receipt as InvoiceIcon,
  AccountBalance as PayoutIcon,
  Assessment as ReportIcon,
  ArrowForward as ArrowIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Schedule as PendingIcon,
  Euro as EuroIcon,
  Business as BusinessIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { invoiceService } from '../../services/invoiceService';
import { payoutService } from '../../services/payoutService';
import { monthlyReportService } from '../../services/monthlyReportService';
import { formatCurrency } from '../../utils/exportHelpers';
import { toastErrorNotify } from '../../../../helper/ToastNotify';

// Sub-components
import WorkflowOverview from './WorkflowOverview';
import RechnungenTab from './RechnungenTab';
import AuszahlungenTab from './AuszahlungenTab';

/**
 * FinanzmanagementPage Component
 * Unified view for financial management workflow
 */
const FinanzmanagementPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Data
  const [invoices, setInvoices] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [reports, setReports] = useState([]);

  // Fetch all data
  useEffect(() => {
    fetchAllData();
  }, [refreshTrigger]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      // Fetch invoices
      const invoiceResponse = await invoiceService.getInvoices();
      setInvoices(invoiceResponse?.result || []);
      
      // Fetch payouts - try to get payout history
      try {
        const payoutResponse = await payoutService.getBusinessesWithPayouts();
        const allPayouts = [];
        if (payoutResponse?.businesses) {
          payoutResponse.businesses.forEach(business => {
            business.payouts?.forEach(payout => {
              allPayouts.push({
                ...payout,
                businessName: business.name,
                businessId: business._id
              });
            });
          });
        }
        setPayouts(allPayouts);
      } catch (e) {
        console.log('Payouts fetch skipped:', e);
        setPayouts([]);
      }
      
      // Fetch reports
      try {
        const reportResponse = await monthlyReportService.getReports({ limit: 100 });
        setReports(reportResponse?.result || []);
      } catch (e) {
        console.log('Reports fetch skipped:', e);
        setReports([]);
      }
      
    } catch (error) {
      console.error('Error fetching financial data:', error);
      toastErrorNotify('Fehler beim Laden der Finanzdaten');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Calculate statistics
  const stats = useMemo(() => {
    // Invoices by status
    const invoiceStats = {
      total: invoices.length,
      entwurf: invoices.filter(i => i.status === 'entwurf').length,
      versendet: invoices.filter(i => i.status === 'versendet').length,
      bezahlt: invoices.filter(i => i.status === 'bezahlt').length,
      ueberfaellig: invoices.filter(i => i.status === 'ueberfaellig').length,
      teilbezahlt: invoices.filter(i => i.status === 'teilbezahlt').length,
      waitingPayment: invoices.filter(i => ['versendet', 'ueberfaellig', 'teilbezahlt'].includes(i.status)).length,
      totalAmount: invoices.reduce((sum, i) => sum + (i.summen?.bruttobetrag || 0), 0),
      paidAmount: invoices.filter(i => i.status === 'bezahlt').reduce((sum, i) => sum + (i.summen?.bruttobetrag || 0), 0),
      openAmount: invoices.filter(i => !['bezahlt', 'storniert'].includes(i.status)).reduce((sum, i) => sum + (i.summen?.bruttobetrag || 0), 0)
    };

    // Payouts
    const payoutStats = {
      total: payouts.length,
      completed: payouts.filter(p => p.status === 'completed').length,
      pending: payouts.filter(p => p.status === 'pending').length,
      totalAmount: payouts.reduce((sum, p) => sum + (p.amount || 0), 0)
    };

    // Reports
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const reportStats = {
      total: reports.length,
      currentMonth: reports.filter(r => r.month === currentMonth && r.year === currentYear).length,
      withInvoice: reports.filter(r => invoices.some(i => i.monthlyReportId === r._id)).length,
      withoutInvoice: reports.filter(r => !invoices.some(i => i.monthlyReportId === r._id)).length
    };

    return { invoiceStats, payoutStats, reportStats };
  }, [invoices, payouts, reports]);

  // Tab labels with badges
  const getTabLabel = (label, count, color = 'default') => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {label}
      {count > 0 && (
        <Chip 
          label={count} 
          size="small" 
          color={color}
          sx={{ height: 20, minWidth: 24, fontSize: '0.75rem' }}
        />
      )}
    </Box>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box mb={3} display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h5" fontWeight={600} gutterBottom>
            💰 Finanzmanagement
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Doğru Akış: Monatsbericht → Rechnung → Zahlung → Auszahlung
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
        >
          Aktualisieren
        </Button>
      </Box>

      {/* Quick Stats */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={6} sm={3}>
          <Card variant="outlined" sx={{ borderLeft: 4, borderLeftColor: 'info.main' }}>
            <CardContent sx={{ py: 2 }}>
              <Box display="flex" alignItems="center" gap={1}>
                <ReportIcon color="info" fontSize="small" />
                <Typography variant="caption" color="text.secondary">Berichte</Typography>
              </Box>
              <Typography variant="h5" fontWeight={600}>{stats.reportStats.total}</Typography>
              <Typography variant="caption" color="warning.main">
                {stats.reportStats.withoutInvoice} ohne Rechnung
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card variant="outlined" sx={{ borderLeft: 4, borderLeftColor: 'primary.main' }}>
            <CardContent sx={{ py: 2 }}>
              <Box display="flex" alignItems="center" gap={1}>
                <InvoiceIcon color="primary" fontSize="small" />
                <Typography variant="caption" color="text.secondary">Rechnungen</Typography>
              </Box>
              <Typography variant="h5" fontWeight={600}>{stats.invoiceStats.total}</Typography>
              <Typography variant="caption" color="warning.main">
                {stats.invoiceStats.waitingPayment} warten auf Zahlung
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card variant="outlined" sx={{ borderLeft: 4, borderLeftColor: 'warning.main' }}>
            <CardContent sx={{ py: 2 }}>
              <Box display="flex" alignItems="center" gap={1}>
                <EuroIcon color="warning" fontSize="small" />
                <Typography variant="caption" color="text.secondary">Offener Betrag</Typography>
              </Box>
              <Typography variant="h5" fontWeight={600} color="warning.main">
                {formatCurrency(stats.invoiceStats.openAmount)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card variant="outlined" sx={{ borderLeft: 4, borderLeftColor: 'success.main' }}>
            <CardContent sx={{ py: 2 }}>
              <Box display="flex" alignItems="center" gap={1}>
                <PayoutIcon color="success" fontSize="small" />
                <Typography variant="caption" color="text.secondary">Auszahlungen</Typography>
              </Box>
              <Typography variant="h5" fontWeight={600} color="success.main">
                {formatCurrency(stats.payoutStats.totalAmount)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {stats.payoutStats.completed} abgeschlossen
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': {
              py: 2,
              fontWeight: 500
            }
          }}
        >
          <Tab 
            icon={<WorkflowIcon />} 
            iconPosition="start"
            label={getTabLabel('Workflow', stats.reportStats.withoutInvoice, 'warning')}
          />
          <Tab 
            icon={<InvoiceIcon />} 
            iconPosition="start"
            label={getTabLabel('Rechnungen', stats.invoiceStats.waitingPayment, 'info')}
          />
          <Tab 
            icon={<PayoutIcon />} 
            iconPosition="start"
            label={getTabLabel('Auszahlungen', stats.payoutStats.completed, 'success')}
          />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <Box>
        {activeTab === 0 && (
          <WorkflowOverview 
            reports={reports}
            invoices={invoices}
            payouts={payouts}
            stats={stats}
            onRefresh={handleRefresh}
          />
        )}
        {activeTab === 1 && (
          <RechnungenTab 
            invoices={invoices}
            onRefresh={handleRefresh}
          />
        )}
        {activeTab === 2 && (
          <AuszahlungenTab 
            payouts={payouts}
            invoices={invoices}
            onRefresh={handleRefresh}
          />
        )}
      </Box>
    </Box>
  );
};

export default FinanzmanagementPage;

