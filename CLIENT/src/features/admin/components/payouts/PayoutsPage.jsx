// features/admin/components/payouts/PayoutsPage.jsx
// Main payout management page with pending payouts and history

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Stack,
  Divider
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import HistoryIcon from '@mui/icons-material/History';
import ReceiptIcon from '@mui/icons-material/Receipt';
import EuroIcon from '@mui/icons-material/Euro';
import BusinessIcon from '@mui/icons-material/Business';
import { payoutService } from '../../services/payoutService';
import { formatCurrency } from '../../utils/exportHelpers';
import { formatDate } from '../../utils/dateHelpers';
import { toastSuccessNotify, toastErrorNotify } from '../../../../helper/ToastNotify';
import PayoutCreateDialog from './PayoutCreateDialog';
import PayoutHistoryTable from './PayoutHistoryTable';

/**
 * PayoutsPage Component
 * Main page for managing business payouts
 * Features: pending payouts list, create payout, complete payout, history
 */
const PayoutsPage = () => {
  const [loading, setLoading] = useState(true);
  const [pendingPayouts, setPendingPayouts] = useState([]);
  const [payoutStats, setPayoutStats] = useState(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Fetch pending payouts
  useEffect(() => {
    fetchPendingPayouts();
  }, [refreshTrigger]);

  const fetchPendingPayouts = async () => {
    try {
      setLoading(true);
      const data = await payoutService.getAllPendingPayouts();

      // Group by business
      const groupedPayouts = groupPayoutsByBusiness(data.pendingPayments || []);
      setPendingPayouts(groupedPayouts);

      // Calculate stats
      const stats = payoutService.calculateTotalPending(data.pendingPayments || []);
      setPayoutStats(stats);
    } catch (error) {
      console.error('Error fetching pending payouts:', error);
      toastErrorNotify('Fehler beim Laden der ausstehenden Auszahlungen');
    } finally {
      setLoading(false);
    }
  };

  // Group payouts by business
  const groupPayoutsByBusiness = (payments) => {
    const grouped = {};

    payments.forEach((payment) => {
      const businessId = payment.business?._id || payment.businessId;
      const businessName = payment.business?.name || 'Unbekanntes Geschäft';

      if (!grouped[businessId]) {
        grouped[businessId] = {
          businessId,
          businessName,
          business: payment.business,
          payments: [],
          totalAmount: 0,
          paymentCount: 0
        };
      }

      grouped[businessId].payments.push(payment);
      grouped[businessId].totalAmount += Number(payment.businessFee) || 0;
      grouped[businessId].paymentCount += 1;
    });

    return Object.values(grouped);
  };

  // Handle create payout dialog
  const handleOpenCreateDialog = (businessData = null) => {
    setSelectedBusiness(businessData);
    setCreateDialogOpen(true);
  };

  const handleCloseCreateDialog = () => {
    setCreateDialogOpen(false);
    setSelectedBusiness(null);
  };

  // Handle payout created
  const handlePayoutCreated = () => {
    toastSuccessNotify('Auszahlung erfolgreich erstellt');
    setRefreshTrigger(prev => prev + 1);
    handleCloseCreateDialog();
  };

  // Handle mark payout as complete
  const handleCompletePayout = async (payoutId) => {
    if (!confirm('Auszahlung als abgeschlossen markieren?')) {
      return;
    }

    try {
      await payoutService.completePayout(payoutId);
      toastSuccessNotify('Auszahlung als abgeschlossen markiert');
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error completing payout:', error);
      toastErrorNotify('Fehler beim Abschließen der Auszahlung');
    }
  };

  // Render loading state
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  // Render main view or history view
  if (showHistory) {
    return (
      <Box>
        <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" fontWeight={600}>
            Auszahlungs-Verlauf
          </Typography>
          <Button
            variant="outlined"
            startIcon={<PendingIcon />}
            onClick={() => setShowHistory(false)}
          >
            Ausstehende Auszahlungen
          </Button>
        </Box>
        <PayoutHistoryTable />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h5" fontWeight={600}>
          Auszahlungsverwaltung
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<HistoryIcon />}
            onClick={() => setShowHistory(true)}
          >
            Verlauf anzeigen
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenCreateDialog()}
          >
            Neue Auszahlung
          </Button>
        </Stack>
      </Box>

      {/* Summary Cards */}
      {payoutStats && (
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  <EuroIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="subtitle2" color="text.secondary">
                    Gesamt Ausstehend
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight={600}>
                  {formatCurrency(payoutStats.totalPending)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  <BusinessIcon color="success" sx={{ mr: 1 }} />
                  <Typography variant="subtitle2" color="text.secondary">
                    Geschäfte
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight={600}>
                  {payoutStats.businessCount}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  <ReceiptIcon color="info" sx={{ mr: 1 }} />
                  <Typography variant="subtitle2" color="text.secondary">
                    Zahlungen
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight={600}>
                  {payoutStats.paymentCount}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  <EuroIcon color="warning" sx={{ mr: 1 }} />
                  <Typography variant="subtitle2" color="text.secondary">
                    Ø pro Geschäft
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight={600}>
                  {formatCurrency(payoutStats.averagePerBusiness)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Pending Payouts by Business */}
      <Paper>
        <Box p={2} bgcolor="grey.50" borderBottom={1} borderColor="divider">
          <Typography variant="h6" fontWeight={600}>
            Ausstehende Auszahlungen nach Geschäft
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gruppierte Ansicht aller ausstehenden Zahlungen
          </Typography>
        </Box>

        {pendingPayouts.length === 0 ? (
          <Box p={4} textAlign="center">
            <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Keine ausstehenden Auszahlungen
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Alle Zahlungen wurden ausgezahlt
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Geschäft</TableCell>
                  <TableCell align="center">Zahlungen</TableCell>
                  <TableCell align="right">Betrag</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell align="center">Aktionen</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pendingPayouts.map((item) => (
                  <TableRow key={item.businessId} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="body1" fontWeight={600}>
                          {item.businessName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ID: {item.businessId}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={`${item.paymentCount} Zahlungen`}
                        size="small"
                        color="info"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body1" fontWeight={600} color="primary">
                        {formatCurrency(item.totalAmount)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        icon={<PendingIcon />}
                        label="Ausstehend"
                        size="small"
                        color="warning"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Auszahlung erstellen">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleOpenCreateDialog(item)}
                        >
                          <AddIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Info Alert */}
      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body2">
          <strong>Hinweis:</strong> Auszahlungen werden automatisch gruppiert nach Geschäft.
          Klicken Sie auf "Neue Auszahlung", um eine Auszahlung für ein Geschäft zu erstellen.
        </Typography>
      </Alert>

      {/* Create Payout Dialog */}
      <PayoutCreateDialog
        open={createDialogOpen}
        onClose={handleCloseCreateDialog}
        onSuccess={handlePayoutCreated}
        businessData={selectedBusiness}
      />
    </Box>
  );
};

export default PayoutsPage;
