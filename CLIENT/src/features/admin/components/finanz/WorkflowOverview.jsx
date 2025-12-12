// features/admin/components/finanz/WorkflowOverview.jsx
// Workflow Overview - Visual representation of the financial workflow

import React from 'react';
import {
  Box,
  Paper,
  Typography,
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
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import {
  Assessment as ReportIcon,
  Receipt as InvoiceIcon,
  AccountBalance as PayoutIcon,
  Payment as PaymentIcon,
  ArrowForward as ArrowIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Schedule as PendingIcon,
  Add as AddIcon,
  Visibility as ViewIcon,
  ArrowDownward as StepIcon
} from '@mui/icons-material';
import { formatCurrency } from '../../utils/exportHelpers';
import { monthlyReportService } from '../../services/monthlyReportService';

/**
 * WorkflowOverview Component
 * Shows the 4-step workflow: Report → Invoice → Payment → Payout
 */
const WorkflowOverview = ({ reports, invoices, payouts, stats, onRefresh }) => {
  // Find reports without invoice
  const reportsWithoutInvoice = reports.filter(r => 
    !invoices.some(i => i.monthlyReportId === r._id)
  );

  // Find invoices waiting for payment
  const invoicesWaitingPayment = invoices.filter(i => 
    ['versendet', 'ueberfaellig', 'teilbezahlt'].includes(i.status)
  );

  // Find invoices ready for payout (bezahlt but no payout)
  const invoicesReadyForPayout = invoices.filter(i => 
    i.status === 'bezahlt' && !i.payoutId
  );

  // Workflow step component
  const WorkflowStep = ({ 
    number, 
    title, 
    description, 
    icon: Icon, 
    color, 
    items, 
    itemsLabel,
    action,
    actionLabel 
  }) => (
    <Card 
      variant="outlined" 
      sx={{ 
        height: '100%',
        borderTop: 4,
        borderTopColor: `${color}.main`,
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 3
        }
      }}
    >
      <CardContent>
        {/* Step Header */}
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              bgcolor: `${color}.main`,
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.875rem'
            }}
          >
            {number}
          </Box>
          <Box flex={1}>
            <Typography variant="subtitle1" fontWeight={600}>
              {title}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {description}
            </Typography>
          </Box>
          <Icon color={color} />
        </Box>

        {/* Items Count */}
        <Box 
          sx={{ 
            bgcolor: `${color}.50`, 
            p: 2, 
            borderRadius: 2,
            textAlign: 'center',
            mb: 2
          }}
        >
          <Typography variant="h3" fontWeight={700} color={`${color}.main`}>
            {items}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {itemsLabel}
          </Typography>
        </Box>

        {/* Action Button */}
        {action && items > 0 && (
          <Button
            fullWidth
            variant="contained"
            color={color}
            size="small"
            onClick={action}
          >
            {actionLabel}
          </Button>
        )}
        
        {items === 0 && (
          <Box textAlign="center">
            <CheckIcon color="success" />
            <Typography variant="body2" color="success.main">
              Alle erledigt!
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Box>
      {/* Workflow Steps */}
      <Grid container spacing={2} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <WorkflowStep
            number={1}
            title="Monatsbericht"
            description="Berichte ohne Rechnung"
            icon={ReportIcon}
            color="info"
            items={reportsWithoutInvoice.length}
            itemsLabel="Berichte bereit"
          />
        </Grid>
        
        {/* Arrow */}
        <Box 
          sx={{ 
            display: { xs: 'none', md: 'flex' }, 
            alignItems: 'center',
            position: 'absolute',
            left: 'calc(25% - 12px)',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 1
          }}
        >
          <ArrowIcon color="action" sx={{ fontSize: 24 }} />
        </Box>

        <Grid item xs={12} sm={6} md={3}>
          <WorkflowStep
            number={2}
            title="Rechnung"
            description="Warten auf Zahlung"
            icon={InvoiceIcon}
            color="primary"
            items={invoicesWaitingPayment.length}
            itemsLabel="offene Rechnungen"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <WorkflowStep
            number={3}
            title="Zahlung"
            description="Bezahlt, Payout ausstehend"
            icon={PaymentIcon}
            color="warning"
            items={invoicesReadyForPayout.length}
            itemsLabel="bereit für Auszahlung"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <WorkflowStep
            number={4}
            title="Auszahlung"
            description="Abgeschlossen"
            icon={PayoutIcon}
            color="success"
            items={stats.payoutStats.completed}
            itemsLabel="Auszahlungen"
          />
        </Grid>
      </Grid>

      {/* Pending Items Lists */}
      <Grid container spacing={3}>
        {/* Reports without Invoice */}
        {reportsWithoutInvoice.length > 0 && (
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <ReportIcon color="info" />
                <Typography variant="subtitle1" fontWeight={600}>
                  Berichte ohne Rechnung
                </Typography>
                <Chip 
                  label={reportsWithoutInvoice.length} 
                  size="small" 
                  color="info"
                />
              </Box>
              <List dense>
                {reportsWithoutInvoice.slice(0, 5).map((report) => (
                  <ListItem 
                    key={report._id}
                    sx={{ 
                      bgcolor: 'grey.50', 
                      borderRadius: 1, 
                      mb: 1 
                    }}
                  >
                    <ListItemIcon>
                      <ReportIcon fontSize="small" color="info" />
                    </ListItemIcon>
                    <ListItemText
                      primary={report.businessSnapshot?.businessName || 'Unbekannt'}
                      secondary={monthlyReportService.formatPeriodLabel(report.year, report.month)}
                    />
                    <ListItemSecondaryAction>
                      <Typography variant="body2" fontWeight={600} color="primary">
                        {formatCurrency(report.financials?.businessRevenue || 0)}
                      </Typography>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
              {reportsWithoutInvoice.length > 5 && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  + {reportsWithoutInvoice.length - 5} weitere Berichte
                </Typography>
              )}
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  Gehen Sie zu <strong>Berichte → Monatliche Berichte</strong> und klicken Sie auf das 
                  <InvoiceIcon fontSize="small" sx={{ mx: 0.5, verticalAlign: 'middle' }} />
                  Icon, um Rechnungen zu erstellen.
                </Typography>
              </Alert>
            </Paper>
          </Grid>
        )}

        {/* Invoices waiting for payment */}
        {invoicesWaitingPayment.length > 0 && (
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <InvoiceIcon color="primary" />
                <Typography variant="subtitle1" fontWeight={600}>
                  Rechnungen warten auf Zahlung
                </Typography>
                <Chip 
                  label={invoicesWaitingPayment.length} 
                  size="small" 
                  color="primary"
                />
              </Box>
              <List dense>
                {invoicesWaitingPayment.slice(0, 5).map((invoice) => (
                  <ListItem 
                    key={invoice._id}
                    sx={{ 
                      bgcolor: invoice.status === 'ueberfaellig' ? 'error.50' : 'grey.50', 
                      borderRadius: 1, 
                      mb: 1 
                    }}
                  >
                    <ListItemIcon>
                      {invoice.status === 'ueberfaellig' ? (
                        <WarningIcon fontSize="small" color="error" />
                      ) : (
                        <PendingIcon fontSize="small" color="warning" />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="body2" fontWeight={600}>
                            {invoice.rechnungsnummer}
                          </Typography>
                          <Chip 
                            label={invoice.status} 
                            size="small" 
                            color={invoice.status === 'ueberfaellig' ? 'error' : 'warning'}
                            sx={{ height: 18, fontSize: '0.7rem' }}
                          />
                        </Box>
                      }
                      secondary={invoice.rechnungsempfaenger?.firmenname}
                    />
                    <ListItemSecondaryAction>
                      <Typography variant="body2" fontWeight={600} color="primary">
                        {formatCurrency(invoice.summen?.bruttobetrag || 0)}
                      </Typography>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
              {invoicesWaitingPayment.length > 5 && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  + {invoicesWaitingPayment.length - 5} weitere Rechnungen
                </Typography>
              )}
              <Alert severity="warning" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  Wechseln Sie zum <strong>Rechnungen</strong> Tab und klicken Sie auf das
                  <PaymentIcon fontSize="small" sx={{ mx: 0.5, verticalAlign: 'middle' }} />
                  Icon, um Zahlungen zu erfassen.
                </Typography>
              </Alert>
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* All Clear Message */}
      {reportsWithoutInvoice.length === 0 && invoicesWaitingPayment.length === 0 && (
        <Paper 
          variant="outlined" 
          sx={{ 
            p: 4, 
            textAlign: 'center',
            bgcolor: 'success.50',
            borderColor: 'success.main'
          }}
        >
          <CheckIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
          <Typography variant="h6" color="success.main" gutterBottom>
            Alles erledigt! 🎉
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Alle Monatsberichte haben Rechnungen und alle Rechnungen sind bezahlt oder werden bearbeitet.
          </Typography>
        </Paper>
      )}

      {/* Workflow Info */}
      <Alert severity="info" sx={{ mt: 3 }} icon={<StepIcon />}>
        <Typography variant="body2">
          <strong>Korrekter Workflow (§14 UStG / GoBD konform):</strong><br />
          📊 <strong>Schritt 1:</strong> Monatsbericht erstellen (Berichte → Monatliche Berichte)<br />
          📄 <strong>Schritt 2:</strong> Rechnung aus Bericht erstellen (grünes Rechnungs-Icon)<br />
          💰 <strong>Schritt 3:</strong> Zahlung erfassen wenn Bankeingang bestätigt<br />
          🏦 <strong>Schritt 4:</strong> Auszahlung wird automatisch erstellt
        </Typography>
      </Alert>
    </Box>
  );
};

export default WorkflowOverview;

