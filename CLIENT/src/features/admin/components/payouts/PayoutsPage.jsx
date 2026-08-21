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
// eslint-disable-next-line no-unused-vars
import { motion, useReducedMotion } from 'framer-motion';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import HistoryIcon from '@mui/icons-material/History';
import ReceiptIcon from '@mui/icons-material/Receipt';
import EuroIcon from '@mui/icons-material/Euro';
import BusinessIcon from '@mui/icons-material/Business';
import { COLORS, RADII, SHADOWS } from '../../../../theme/designTokens';
import { payoutService } from '../../services/payoutService';
import { formatCurrency } from '../../utils/exportHelpers';
import { toastSuccessNotify, toastErrorNotify } from '../../../../helper/ToastNotify';
import PayoutCreateDialog from './PayoutCreateDialog';
import PayoutHistoryTable from './PayoutHistoryTable';

// Admin-Designsprache: Stil-Konstanten
const sectionTitleSx = {
  fontWeight: 800,
  color: COLORS.textHeading,
  letterSpacing: '-0.02em'
};

const panelSx = {
  backgroundColor: 'white',
  border: `1px solid ${COLORS.border}`,
  borderRadius: RADII.panel,
  boxShadow: SHADOWS.subtle,
  overflow: 'hidden'
};

const statCardSx = {
  height: '100%',
  backgroundColor: 'white',
  border: `1px solid ${COLORS.border}`,
  borderRadius: RADII.card,
  boxShadow: SHADOWS.subtle
};

const containedButtonSx = {
  background: COLORS.primaryGradient,
  textTransform: 'none',
  fontWeight: 600,
  borderRadius: RADII.button,
  boxShadow: SHADOWS.brand,
  '&:hover': {
    background: COLORS.primaryGradientHover,
    boxShadow: SHADOWS.brandHover
  }
};

const outlinedButtonSx = {
  textTransform: 'none',
  fontWeight: 600,
  borderRadius: RADII.button
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

const moneySx = {
  fontVariantNumeric: 'tabular-nums'
};

/**
 * PayoutsPage Component
 * Main page for managing business payouts
 * Features: pending payouts list, create payout, complete payout, history
 */
const PayoutsPage = () => {
  const reduce = useReducedMotion();
  const [loading, setLoading] = useState(true);
  const [pendingPayouts, setPendingPayouts] = useState([]);
  const [payoutStats, setPayoutStats] = useState(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Einmaliges Einblenden pro Seite (mit Reduced-Motion-Guard)
  const pageFade = {
    initial: reduce ? false : { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
  };

  // Fetch pending payouts
  useEffect(() => {
    fetchPendingPayouts();
  }, [refreshTrigger]);

  const fetchPendingPayouts = async () => {
    try {
      setLoading(true);
      const data = await payoutService.getAllPendingPayouts();

      // Server liefert { error, result: { businesses, totalPending, businessCount } }
      // und gruppiert bereits nach Geschäft — direkt auf die Tabellen-Form mappen.
      const result = data?.result || {};
      const businesses = Array.isArray(result.businesses) ? result.businesses : [];

      const mapped = businesses.map((b) => ({
        businessId: b.businessId,
        businessName: b.businessName || 'Unbekanntes Geschäft',
        payments: b.payments || [],
        totalAmount: Number(b.totalPending) || 0,
        paymentCount: Number(b.paymentCount) || 0,
      }));
      setPendingPayouts(mapped);

      const totalPending = Number(result.totalPending) || 0;
      const businessCount = result.businessCount ?? businesses.length;
      const paymentCount = businesses.reduce(
        (sum, b) => sum + (Number(b.paymentCount) || 0),
        0
      );
      setPayoutStats({
        totalPending,
        businessCount,
        paymentCount,
        averagePerBusiness: businessCount > 0 ? totalPending / businessCount : 0,
      });
    } catch (error) {
      console.error('Error fetching pending payouts:', error);
      toastErrorNotify('Fehler beim Laden der ausstehenden Auszahlungen');
    } finally {
      setLoading(false);
    }
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
  const _handleCompletePayout = async (payoutId) => {
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
        <CircularProgress sx={{ color: COLORS.primary }} />
      </Box>
    );
  }

  // Render main view or history view
  if (showHistory) {
    return (
      <motion.div {...pageFade}>
        <Box>
          <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h5" sx={sectionTitleSx}>
              Auszahlungs-Verlauf
            </Typography>
            <Button
              variant="outlined"
              startIcon={<PendingIcon />}
              onClick={() => setShowHistory(false)}
              sx={outlinedButtonSx}
            >
              Ausstehende Auszahlungen
            </Button>
          </Box>
          <PayoutHistoryTable />
        </Box>
      </motion.div>
    );
  }

  return (
    <motion.div {...pageFade}>
    <Box>
      {/* Header */}
      <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h5" sx={sectionTitleSx}>
          Auszahlungsverwaltung
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<HistoryIcon />}
            onClick={() => setShowHistory(true)}
            sx={outlinedButtonSx}
          >
            Verlauf anzeigen
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenCreateDialog()}
            sx={containedButtonSx}
          >
            Neue Auszahlung
          </Button>
        </Stack>
      </Box>

      {/* Summary Cards */}
      {payoutStats && (
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={0} sx={statCardSx}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  <EuroIcon sx={{ mr: 1, color: COLORS.primary }} />
                  <Typography variant="subtitle2" sx={{ color: COLORS.textSecondary, fontWeight: 600 }}>
                    Gesamt Ausstehend
                  </Typography>
                </Box>
                <Typography variant="h4" sx={{ ...moneySx, fontWeight: 800, color: COLORS.textHeading }}>
                  {formatCurrency(payoutStats.totalPending)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={0} sx={statCardSx}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  <BusinessIcon sx={{ mr: 1, color: COLORS.primaryDark }} />
                  <Typography variant="subtitle2" sx={{ color: COLORS.textSecondary, fontWeight: 600 }}>
                    Geschäfte
                  </Typography>
                </Box>
                <Typography variant="h4" sx={{ ...moneySx, fontWeight: 800, color: COLORS.textHeading }}>
                  {payoutStats.businessCount}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={0} sx={statCardSx}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  <ReceiptIcon sx={{ mr: 1, color: '#06b6d4' }} />
                  <Typography variant="subtitle2" sx={{ color: COLORS.textSecondary, fontWeight: 600 }}>
                    Zahlungen
                  </Typography>
                </Box>
                <Typography variant="h4" sx={{ ...moneySx, fontWeight: 800, color: COLORS.textHeading }}>
                  {payoutStats.paymentCount}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={0} sx={statCardSx}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  <EuroIcon sx={{ mr: 1, color: COLORS.warning }} />
                  <Typography variant="subtitle2" sx={{ color: COLORS.textSecondary, fontWeight: 600 }}>
                    Ø pro Geschäft
                  </Typography>
                </Box>
                <Typography variant="h4" sx={{ ...moneySx, fontWeight: 800, color: COLORS.textHeading }}>
                  {formatCurrency(payoutStats.averagePerBusiness)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Pending Payouts by Business */}
      <Paper elevation={0} sx={panelSx}>
        <Box p={2} sx={{ backgroundColor: COLORS.backgroundLight, borderBottom: `1px solid ${COLORS.border}` }}>
          <Typography variant="h6" sx={sectionTitleSx}>
            Ausstehende Auszahlungen nach Geschäft
          </Typography>
          <Typography variant="body2" sx={{ color: COLORS.textSecondary }}>
            Gruppierte Ansicht aller ausstehenden Zahlungen
          </Typography>
        </Box>

        {pendingPayouts.length === 0 ? (
          <Box p={4} textAlign="center">
            <CheckCircleIcon sx={{ fontSize: 64, color: COLORS.success, mb: 2 }} />
            <Typography variant="h6" sx={{ color: COLORS.textSecondary, fontWeight: 600 }}>
              Keine ausstehenden Auszahlungen
            </Typography>
            <Typography variant="body2" sx={{ color: COLORS.textSecondary }}>
              Alle Zahlungen wurden ausgezahlt
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={tableHeadRowSx}>
                  <TableCell>Geschäft</TableCell>
                  <TableCell align="center">Zahlungen</TableCell>
                  <TableCell align="right">Betrag</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell align="center">Aktionen</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pendingPayouts.map((item) => (
                  <TableRow key={item.businessId} sx={tableBodyRowSx}>
                    <TableCell>
                      <Box>
                        <Typography variant="body1" fontWeight={600} sx={{ color: COLORS.textPrimary }}>
                          {item.businessName}
                        </Typography>
                        <Typography variant="caption" sx={{ color: COLORS.textSecondary }}>
                          ID: {item.businessId}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={`${item.paymentCount} Zahlungen`}
                        size="small"
                        sx={{
                          borderRadius: '999px',
                          fontWeight: 600,
                          backgroundColor: '#f1f5f9',
                          color: COLORS.textSecondary
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body1" sx={{ ...moneySx, fontWeight: 700, color: COLORS.primary }}>
                        {formatCurrency(item.totalAmount)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        icon={<PendingIcon />}
                        label="Ausstehend"
                        size="small"
                        sx={{
                          borderRadius: '999px',
                          fontWeight: 600,
                          backgroundColor: '#fffbeb',
                          color: '#d97706',
                          '& .MuiChip-icon': { color: '#d97706' }
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Auszahlung erstellen">
                        <IconButton
                          size="small"
                          sx={{ color: COLORS.primary }}
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
      <Box
        sx={{
          mt: 3,
          p: 2,
          backgroundColor: COLORS.accentBoxBg,
          borderLeft: `3px solid ${COLORS.primary}`,
          borderRadius: RADII.input
        }}
      >
        <Typography variant="body2" sx={{ color: COLORS.textPrimary }}>
          <strong>Hinweis:</strong> Auszahlungen werden automatisch gruppiert nach Geschäft.
          Klicken Sie auf "Neue Auszahlung", um eine Auszahlung für ein Geschäft zu erstellen.
        </Typography>
      </Box>

      {/* Create Payout Dialog */}
      <PayoutCreateDialog
        open={createDialogOpen}
        onClose={handleCloseCreateDialog}
        onSuccess={handlePayoutCreated}
        businessData={selectedBusiness}
      />
    </Box>
    </motion.div>
  );
};

export default PayoutsPage;
