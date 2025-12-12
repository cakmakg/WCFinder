// features/admin/components/finanz/AuszahlungenTab.jsx
// Split View Auszahlungen Tab - List on left, Detail on right

import React, { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Chip,
  IconButton,
  Tooltip,
  TextField,
  MenuItem,
  InputAdornment,
  Divider,
  Button,
  Stack,
  Card,
  CardContent,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Alert
} from '@mui/material';
import {
  Search as SearchIcon,
  CheckCircle as CompletedIcon,
  Schedule as PendingIcon,
  Error as FailedIcon,
  AccountBalance as PayoutIcon,
  Business as BusinessIcon,
  Euro as EuroIcon,
  CalendarMonth as CalendarIcon,
  Receipt as InvoiceIcon,
  Payment as PaymentIcon,
  Link as LinkIcon
} from '@mui/icons-material';
import { formatCurrency } from '../../utils/exportHelpers';
import { formatDate } from '../../utils/dateHelpers';

/**
 * AuszahlungenTab Component
 * Split view: Payout list on left, detail on right
 */
const AuszahlungenTab = ({ payouts, invoices, onRefresh }) => {
  const [selectedPayout, setSelectedPayout] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Filter payouts
  const filteredPayouts = useMemo(() => {
    let result = [...payouts];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(payout => 
        payout.businessName?.toLowerCase().includes(term) ||
        payout.rechnungsnummer?.toLowerCase().includes(term) ||
        payout.transactionReference?.toLowerCase().includes(term)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(payout => payout.status === statusFilter);
    }

    // Sort by date descending
    result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return result;
  }, [payouts, searchTerm, statusFilter]);

  // Get status info
  const getStatusInfo = (status) => {
    const statusMap = {
      completed: { label: 'Abgeschlossen', color: 'success', icon: CompletedIcon },
      pending: { label: 'Ausstehend', color: 'warning', icon: PendingIcon },
      processing: { label: 'In Bearbeitung', color: 'info', icon: PendingIcon },
      failed: { label: 'Fehlgeschlagen', color: 'error', icon: FailedIcon },
      cancelled: { label: 'Abgebrochen', color: 'default', icon: FailedIcon }
    };
    return statusMap[status] || { label: status, color: 'default', icon: PayoutIcon };
  };

  // Get payment method label
  const getPaymentMethodLabel = (method) => {
    const labels = {
      bank_transfer: 'Banküberweisung',
      paypal: 'PayPal',
      stripe: 'Stripe',
      stripe_connect: 'Stripe Connect',
      manual: 'Manuell',
      cash: 'Bargeld'
    };
    return labels[method] || method;
  };

  // Find linked invoice
  const getLinkedInvoice = (payout) => {
    if (payout.rechnungId) {
      return invoices.find(i => i._id === payout.rechnungId);
    }
    return null;
  };

  // Calculate stats
  const stats = useMemo(() => {
    const completed = filteredPayouts.filter(p => p.status === 'completed');
    const pending = filteredPayouts.filter(p => p.status === 'pending');
    
    return {
      totalAmount: filteredPayouts.reduce((sum, p) => sum + (p.amount || 0), 0),
      completedAmount: completed.reduce((sum, p) => sum + (p.amount || 0), 0),
      pendingAmount: pending.reduce((sum, p) => sum + (p.amount || 0), 0),
      count: filteredPayouts.length,
      completedCount: completed.length,
      pendingCount: pending.length
    };
  }, [filteredPayouts]);

  return (
    <Box>
      {/* Stats */}
      <Grid container spacing={2} mb={2}>
        <Grid item xs={4}>
          <Card variant="outlined" sx={{ bgcolor: 'success.50' }}>
            <CardContent sx={{ py: 1.5 }}>
              <Typography variant="caption" color="text.secondary">Abgeschlossen</Typography>
              <Typography variant="h6" fontWeight={600} color="success.main">
                {formatCurrency(stats.completedAmount)}
              </Typography>
              <Typography variant="caption">{stats.completedCount} Auszahlungen</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={4}>
          <Card variant="outlined" sx={{ bgcolor: 'warning.50' }}>
            <CardContent sx={{ py: 1.5 }}>
              <Typography variant="caption" color="text.secondary">Ausstehend</Typography>
              <Typography variant="h6" fontWeight={600} color="warning.main">
                {formatCurrency(stats.pendingAmount)}
              </Typography>
              <Typography variant="caption">{stats.pendingCount} Auszahlungen</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={4}>
          <Card variant="outlined">
            <CardContent sx={{ py: 1.5 }}>
              <Typography variant="caption" color="text.secondary">Gesamt</Typography>
              <Typography variant="h6" fontWeight={600}>
                {formatCurrency(stats.totalAmount)}
              </Typography>
              <Typography variant="caption">{stats.count} Auszahlungen</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        {/* Left Panel - Payout List */}
        <Grid item xs={12} md={5} lg={4}>
          <Paper sx={{ height: 'calc(100vh - 480px)', display: 'flex', flexDirection: 'column' }}>
            {/* Filters */}
            <Box p={2} borderBottom={1} borderColor="divider">
              <TextField
                fullWidth
                size="small"
                placeholder="Suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  )
                }}
                sx={{ mb: 1 }}
              />
              <TextField
                fullWidth
                size="small"
                select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">Alle Status</MenuItem>
                <MenuItem value="completed">Abgeschlossen</MenuItem>
                <MenuItem value="pending">Ausstehend</MenuItem>
                <MenuItem value="processing">In Bearbeitung</MenuItem>
                <MenuItem value="failed">Fehlgeschlagen</MenuItem>
              </TextField>
            </Box>

            {/* Payout List */}
            <Box sx={{ flex: 1, overflow: 'auto' }}>
              <List dense disablePadding>
                {filteredPayouts.length === 0 ? (
                  <Box p={4} textAlign="center">
                    <Typography color="text.secondary">
                      Keine Auszahlungen gefunden
                    </Typography>
                  </Box>
                ) : (
                  filteredPayouts.map((payout) => {
                    const statusInfo = getStatusInfo(payout.status);
                    const StatusIcon = statusInfo.icon;
                    const isSelected = selectedPayout?._id === payout._id;

                    return (
                      <ListItem 
                        key={payout._id} 
                        disablePadding
                        sx={{
                          borderBottom: 1,
                          borderColor: 'divider',
                          bgcolor: isSelected ? 'success.50' : 'transparent'
                        }}
                      >
                        <ListItemButton 
                          onClick={() => setSelectedPayout(payout)}
                          selected={isSelected}
                        >
                          <Box sx={{ width: '100%' }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                              <Typography variant="body2" fontWeight={600}>
                                {payout.businessName}
                              </Typography>
                              <Chip
                                icon={<StatusIcon sx={{ fontSize: 14 }} />}
                                label={statusInfo.label}
                                size="small"
                                color={statusInfo.color}
                                sx={{ height: 20, fontSize: '0.7rem' }}
                              />
                            </Box>
                            {payout.rechnungsnummer && (
                              <Box display="flex" alignItems="center" gap={0.5}>
                                <InvoiceIcon sx={{ fontSize: 12, color: 'info.main' }} />
                                <Typography variant="caption" color="info.main">
                                  {payout.rechnungsnummer}
                                </Typography>
                              </Box>
                            )}
                            <Box display="flex" justifyContent="space-between" alignItems="center" mt={0.5}>
                              <Typography variant="caption" color="text.secondary">
                                {formatDate(payout.createdAt)}
                              </Typography>
                              <Typography variant="body2" fontWeight={600} color="success.main">
                                {formatCurrency(payout.amount)}
                              </Typography>
                            </Box>
                          </Box>
                        </ListItemButton>
                      </ListItem>
                    );
                  })
                )}
              </List>
            </Box>

            {/* List Footer */}
            <Box p={1} borderTop={1} borderColor="divider" bgcolor="grey.50">
              <Typography variant="caption" color="text.secondary">
                {filteredPayouts.length} von {payouts.length} Auszahlungen
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Right Panel - Payout Detail */}
        <Grid item xs={12} md={7} lg={8}>
          <Paper sx={{ height: 'calc(100vh - 480px)', overflow: 'auto' }}>
            {!selectedPayout ? (
              <Box 
                display="flex" 
                flexDirection="column"
                alignItems="center" 
                justifyContent="center" 
                height="100%"
                color="text.secondary"
              >
                <PayoutIcon sx={{ fontSize: 64, mb: 2, opacity: 0.3 }} />
                <Typography variant="h6">
                  Wählen Sie eine Auszahlung
                </Typography>
                <Typography variant="body2">
                  Klicken Sie auf eine Auszahlung in der Liste
                </Typography>
              </Box>
            ) : (
              <Box p={3}>
                {/* Header */}
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
                  <Box>
                    <Typography variant="h5" fontWeight={700}>
                      {selectedPayout.businessName}
                    </Typography>
                    <Chip
                      icon={React.createElement(getStatusInfo(selectedPayout.status).icon, { fontSize: 'small' })}
                      label={getStatusInfo(selectedPayout.status).label}
                      color={getStatusInfo(selectedPayout.status).color}
                      sx={{ mt: 1 }}
                    />
                  </Box>
                  <Typography variant="h4" fontWeight={700} color="success.main">
                    {formatCurrency(selectedPayout.amount)}
                  </Typography>
                </Box>

                <Grid container spacing={3}>
                  {/* Payout Info */}
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box display="flex" alignItems="center" gap={1} mb={2}>
                          <PayoutIcon color="success" />
                          <Typography variant="subtitle1" fontWeight={600}>
                            Auszahlungsdetails
                          </Typography>
                        </Box>
                        <Table size="small">
                          <TableBody>
                            <TableRow>
                              <TableCell sx={{ border: 0, pl: 0 }}>Datum:</TableCell>
                              <TableCell sx={{ border: 0, fontWeight: 600 }}>
                                {formatDate(selectedPayout.createdAt)}
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell sx={{ border: 0, pl: 0 }}>Methode:</TableCell>
                              <TableCell sx={{ border: 0, fontWeight: 600 }}>
                                {getPaymentMethodLabel(selectedPayout.paymentMethod)}
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell sx={{ border: 0, pl: 0 }}>Währung:</TableCell>
                              <TableCell sx={{ border: 0, fontWeight: 600 }}>
                                {selectedPayout.currency || 'EUR'}
                              </TableCell>
                            </TableRow>
                            {selectedPayout.transactionReference && (
                              <TableRow>
                                <TableCell sx={{ border: 0, pl: 0 }}>Referenz:</TableCell>
                                <TableCell sx={{ border: 0, fontWeight: 600 }}>
                                  {selectedPayout.transactionReference}
                                </TableCell>
                              </TableRow>
                            )}
                            {selectedPayout.completedAt && (
                              <TableRow>
                                <TableCell sx={{ border: 0, pl: 0 }}>Abgeschlossen:</TableCell>
                                <TableCell sx={{ border: 0, fontWeight: 600 }}>
                                  {formatDate(selectedPayout.completedAt)}
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Period Info */}
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box display="flex" alignItems="center" gap={1} mb={2}>
                          <CalendarIcon color="primary" />
                          <Typography variant="subtitle1" fontWeight={600}>
                            Abrechnungszeitraum
                          </Typography>
                        </Box>
                        <Table size="small">
                          <TableBody>
                            <TableRow>
                              <TableCell sx={{ border: 0, pl: 0 }}>Von:</TableCell>
                              <TableCell sx={{ border: 0, fontWeight: 600 }}>
                                {formatDate(selectedPayout.period?.startDate)}
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell sx={{ border: 0, pl: 0 }}>Bis:</TableCell>
                              <TableCell sx={{ border: 0, fontWeight: 600 }}>
                                {formatDate(selectedPayout.period?.endDate)}
                              </TableCell>
                            </TableRow>
                            {selectedPayout.paymentCount && (
                              <TableRow>
                                <TableCell sx={{ border: 0, pl: 0 }}>Zahlungen:</TableCell>
                                <TableCell sx={{ border: 0, fontWeight: 600 }}>
                                  {selectedPayout.paymentCount}
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Linked Invoice */}
                  {selectedPayout.rechnungsnummer && (
                    <Grid item xs={12}>
                      <Card variant="outlined" sx={{ bgcolor: 'info.50', borderColor: 'info.main' }}>
                        <CardContent>
                          <Box display="flex" alignItems="center" gap={1} mb={2}>
                            <LinkIcon color="info" />
                            <Typography variant="subtitle1" fontWeight={600}>
                              Verknüpfte Rechnung
                            </Typography>
                          </Box>
                          <Box display="flex" alignItems="center" gap={2}>
                            <Chip
                              icon={<InvoiceIcon />}
                              label={selectedPayout.rechnungsnummer}
                              color="info"
                              variant="outlined"
                            />
                            <Typography variant="body2" color="text.secondary">
                              Diese Auszahlung wurde durch die Bezahlung der Rechnung automatisch erstellt.
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  )}

                  {/* Notes */}
                  {selectedPayout.notes && (
                    <Grid item xs={12}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                            Notizen
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {selectedPayout.notes}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  )}
                </Grid>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Info */}
      <Alert severity="info" sx={{ mt: 2 }}>
        <Typography variant="body2">
          <strong>Automatische Auszahlungen:</strong> Auszahlungen werden automatisch erstellt, wenn eine Rechnung vollständig bezahlt wird.
          Der Workflow: Monatsbericht → Rechnung → Zahlung erfassen → Auszahlung wird erstellt.
        </Typography>
      </Alert>
    </Box>
  );
};

export default AuszahlungenTab;

