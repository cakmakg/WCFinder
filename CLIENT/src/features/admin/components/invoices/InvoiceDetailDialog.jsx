// features/admin/components/invoices/InvoiceDetailDialog.jsx
// Dialog for viewing and managing invoice details - §14 UStG, XRechnung 3.0 Compliant

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Grid,
  Divider,
  Paper,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  MenuItem,
  Alert,
  CircularProgress,
  Stack,
  IconButton,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  Receipt as ReceiptIcon,
  Download as DownloadIcon,
  Email as EmailIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  Business as BusinessIcon,
  Euro as EuroIcon,
  CalendarMonth as CalendarIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon,
  Code as CodeIcon,
  ExpandMore as ExpandMoreIcon,
  History as HistoryIcon,
  Cancel as CancelIcon,
  Verified as VerifiedIcon,
  ErrorOutline as ErrorOutlineIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { invoiceService } from '../../services/invoiceService';
import { formatCurrency } from '../../utils/exportHelpers';
import { formatDate } from '../../utils/dateHelpers';
import { toastSuccessNotify, toastErrorNotify } from '../../../../helper/ToastNotify';

/**
 * InvoiceDetailDialog Component
 * View and manage invoice details with XRechnung support
 */
const InvoiceDetailDialog = ({ open, onClose, invoice, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [auditLog, setAuditLog] = useState([]);
  const [auditLogLoading, setAuditLogLoading] = useState(false);
  const [xrechnungValidation, setXrechnungValidation] = useState(null);
  const [stornoDialogOpen, setStornoDialogOpen] = useState(false);
  const [stornoGrund, setStornoGrund] = useState('');

  useEffect(() => {
    if (open && invoice?._id) {
      fetchAuditLog();
    }
  }, [open, invoice?._id]);

  if (!invoice) return null;

  const statusInfo = invoiceService.getInvoiceStatusDisplay(invoice.status);
  const daysUntilDue = invoiceService.getDaysUntilDue(invoice);
  const canEdit = invoiceService.canEditInvoice(invoice.status);
  const canCancel = invoiceService.canCancelInvoice(invoice.status);
  const availableStatuses = invoiceService.getAvailableStatuses(invoice.status);

  const fetchAuditLog = async () => {
    try {
      setAuditLogLoading(true);
      const response = await invoiceService.getAuditLog(invoice._id);
      setAuditLog(response.result?.auditLog || []);
    } catch (error) {
      console.error('Error fetching audit log:', error);
    } finally {
      setAuditLogLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      setLoading(true);
      await invoiceService.downloadAndSaveInvoice(
        invoice._id,
        `Rechnung_${invoice.rechnungsnummer || invoice._id}.pdf`
      );
      toastSuccessNotify('PDF wurde heruntergeladen');
    } catch (error) {
      console.error('Error downloading:', error);
      toastErrorNotify('Fehler beim Herunterladen');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadXRechnung = async () => {
    try {
      setLoading(true);
      await invoiceService.downloadAndSaveXRechnung(
        invoice._id,
        `${invoice.rechnungsnummer || invoice._id}_xrechnung.xml`
      );
      toastSuccessNotify('XRechnung XML wurde heruntergeladen');
    } catch (error) {
      console.error('Error downloading XRechnung:', error);
      toastErrorNotify('Fehler beim Herunterladen der XRechnung');
    } finally {
      setLoading(false);
    }
  };

  const handleValidateXRechnung = async () => {
    try {
      setLoading(true);
      const response = await invoiceService.validateXRechnung(invoice._id);
      setXrechnungValidation(response.result);
      if (response.result?.valid) {
        toastSuccessNotify('XRechnung ist gültig');
      } else {
        toastErrorNotify('XRechnung hat Validierungsfehler');
      }
    } catch (error) {
      console.error('Error validating XRechnung:', error);
      toastErrorNotify('Fehler bei der Validierung');
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (!confirm('E-Mail erneut an den Empfänger senden?')) return;

    try {
      setLoading(true);
      await invoiceService.resendInvoiceEmail(invoice._id);
      toastSuccessNotify('E-Mail wurde gesendet');
      fetchAuditLog();
    } catch (error) {
      console.error('Error sending email:', error);
      toastErrorNotify('Fehler beim Senden der E-Mail');
    } finally {
      setLoading(false);
    }
  };

  const handleRegeneratePDF = async () => {
    if (!confirm('PDF neu generieren?')) return;

    try {
      setLoading(true);
      await invoiceService.regenerateInvoicePDF(invoice._id);
      toastSuccessNotify('PDF wurde neu generiert');
      fetchAuditLog();
      onUpdate?.();
    } catch (error) {
      console.error('Error regenerating PDF:', error);
      toastErrorNotify('Fehler beim Regenerieren des PDFs');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateXRechnung = async () => {
    if (!confirm('XRechnung XML neu generieren?')) return;

    try {
      setLoading(true);
      await invoiceService.regenerateXRechnung(invoice._id);
      toastSuccessNotify('XRechnung wurde neu generiert');
      fetchAuditLog();
      onUpdate?.();
    } catch (error) {
      console.error('Error regenerating XRechnung:', error);
      toastErrorNotify('Fehler beim Regenerieren der XRechnung');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async () => {
    if (!newStatus) return;

    try {
      setStatusLoading(true);
      await invoiceService.updateInvoiceStatus(invoice._id, newStatus);
      toastSuccessNotify('Status wurde aktualisiert');
      setNewStatus('');
      fetchAuditLog();
      onUpdate?.();
    } catch (error) {
      console.error('Error updating status:', error);
      toastErrorNotify('Fehler beim Aktualisieren des Status');
    } finally {
      setStatusLoading(false);
    }
  };

  const handleCreateStorno = async () => {
    if (!stornoGrund.trim()) {
      toastErrorNotify('Bitte geben Sie einen Stornogrund an');
      return;
    }

    try {
      setLoading(true);
      await invoiceService.createStorno(invoice._id, stornoGrund);
      toastSuccessNotify('Stornorechnung wurde erstellt');
      setStornoDialogOpen(false);
      setStornoGrund('');
      onUpdate?.();
      onClose();
    } catch (error) {
      console.error('Error creating storno:', error);
      toastErrorNotify('Fehler beim Erstellen der Stornorechnung');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    const icons = {
      entwurf: <ScheduleIcon />,
      versendet: <EmailIcon />,
      bezahlt: <CheckCircleIcon />,
      teilbezahlt: <InfoIcon />,
      ueberfaellig: <WarningIcon />,
      mahnung: <WarningIcon />,
      storniert: <CancelIcon />
    };
    return icons[status] || <ReceiptIcon />;
  };

  const formatAuditDate = (date) => {
    return new Date(date).toLocaleString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box display="flex" alignItems="center" gap={1}>
              <ReceiptIcon color="primary" />
              <Typography variant="h6" fontWeight={600}>
                Rechnung {invoice.rechnungsnummer}
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              {invoice.xrechnung?.xmlGeneriert && (
                <Tooltip title="XRechnung verfügbar">
                  <Chip
                    icon={<CodeIcon />}
                    label="XRechnung"
                    size="small"
                    color="info"
                    variant="outlined"
                  />
                </Tooltip>
              )}
              <Chip
                icon={getStatusIcon(invoice.status)}
                label={statusInfo.label}
                color={statusInfo.color}
              />
            </Box>
          </Box>
        </DialogTitle>

        <DialogContent dividers>
          {/* Kleinunternehmer Alert */}
          {invoice.kleinunternehmer?.istKleinunternehmer && (
            <Alert severity="info" sx={{ mb: 2 }} icon={<InfoIcon />}>
              <Typography variant="body2" fontWeight={500}>
                §19 UStG Kleinunternehmerregelung
              </Typography>
              <Typography variant="body2">
                {invoice.kleinunternehmer.hinweisText}
              </Typography>
            </Alert>
          )}

          {/* XRechnung Validation Result */}
          {xrechnungValidation && (
            <Alert 
              severity={xrechnungValidation.valid ? 'success' : 'error'} 
              sx={{ mb: 2 }}
              icon={xrechnungValidation.valid ? <VerifiedIcon /> : <ErrorOutlineIcon />}
            >
              <Typography variant="body2" fontWeight={500}>
                XRechnung Validierung: {xrechnungValidation.valid ? 'Gültig' : 'Ungültig'}
              </Typography>
              {xrechnungValidation.errors?.length > 0 && (
                <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
                  {xrechnungValidation.errors.map((error, idx) => (
                    <li key={idx}><Typography variant="caption">{error}</Typography></li>
                  ))}
                </ul>
              )}
            </Alert>
          )}

          {/* Header Info */}
          <Grid container spacing={3} mb={3}>
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <BusinessIcon color="primary" />
                  <Typography variant="subtitle1" fontWeight={600}>
                    Rechnungsempfänger
                  </Typography>
                </Box>
                <Typography variant="body1" fontWeight={600}>
                  {invoice.rechnungsempfaenger?.firmenname || '-'}
                </Typography>
                {invoice.rechnungsempfaenger?.ansprechpartner && (
                  <Typography variant="body2" color="text.secondary">
                    z.H. {invoice.rechnungsempfaenger.ansprechpartner}
                  </Typography>
                )}
                <Typography variant="body2" color="text.secondary">
                  {invoice.rechnungsempfaenger?.strasse}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {invoice.rechnungsempfaenger?.plz} {invoice.rechnungsempfaenger?.ort}
                </Typography>
                {invoice.rechnungsempfaenger?.ustIdNr && (
                  <Typography variant="body2" color="text.secondary" mt={1}>
                    USt-IdNr.: {invoice.rechnungsempfaenger.ustIdNr}
                  </Typography>
                )}
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <CalendarIcon color="primary" />
                  <Typography variant="subtitle1" fontWeight={600}>
                    Rechnungsdaten
                  </Typography>
                </Box>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Rechnungsdatum
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {formatDate(invoice.rechnungsdatum)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Fälligkeitsdatum
                    </Typography>
                    <Typography
                      variant="body2"
                      fontWeight={500}
                      color={daysUntilDue < 0 ? 'error.main' : 'text.primary'}
                    >
                      {formatDate(invoice.faelligkeitsdatum)}
                    </Typography>
                    {daysUntilDue !== null && invoice.status !== 'bezahlt' && invoice.status !== 'storniert' && (
                      <Typography
                        variant="caption"
                        color={daysUntilDue < 0 ? 'error' : daysUntilDue <= 7 ? 'warning.main' : 'text.secondary'}
                      >
                        {daysUntilDue < 0
                          ? `${Math.abs(daysUntilDue)} Tage überfällig`
                          : daysUntilDue === 0
                            ? 'Heute fällig'
                            : `Noch ${daysUntilDue} Tage`
                        }
                      </Typography>
                    )}
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Leistungszeitraum
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {formatDate(invoice.leistungszeitraum?.von)} - {formatDate(invoice.leistungszeitraum?.bis)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Zahlungsziel
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {invoice.zahlungsbedingungen?.zahlungsziel || 14} Tage
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>

          {/* Positions Table */}
          <Typography variant="subtitle1" fontWeight={600} mb={2}>
            Rechnungspositionen
          </Typography>
          <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.50' }}>
                  <TableCell>Pos.</TableCell>
                  <TableCell>Beschreibung</TableCell>
                  <TableCell align="center">Menge</TableCell>
                  <TableCell>Einheit</TableCell>
                  <TableCell align="right">Einzelpreis</TableCell>
                  <TableCell align="right">MwSt</TableCell>
                  <TableCell align="right">Gesamt</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {invoice.positionen?.map((pos, index) => (
                  <TableRow key={index}>
                    <TableCell>{pos.positionsnummer || index + 1}</TableCell>
                    <TableCell>{pos.beschreibung}</TableCell>
                    <TableCell align="center">{pos.menge}</TableCell>
                    <TableCell>{pos.einheitName || pos.einheitCode || 'Stück'}</TableCell>
                    <TableCell align="right">{formatCurrency(pos.einzelpreis)}</TableCell>
                    <TableCell align="right">{pos.steuersatz}%</TableCell>
                    <TableCell align="right">{formatCurrency(pos.gesamtpreis)}</TableCell>
                  </TableRow>
                )) || (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      Keine Positionen vorhanden
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Totals */}
          <Box display="flex" justifyContent="flex-end" mb={3}>
            <Paper variant="outlined" sx={{ p: 2, minWidth: 350 }}>
              <Grid container spacing={1}>
                <Grid item xs={7}>
                  <Typography variant="body2">Nettobetrag:</Typography>
                </Grid>
                <Grid item xs={5}>
                  <Typography variant="body2" align="right">
                    {formatCurrency(invoice.nettobetrag || invoice.summen?.nettobetrag)}
                  </Typography>
                </Grid>
                
                {!invoice.kleinunternehmer?.istKleinunternehmer && (
                  <>
                    <Grid item xs={7}>
                      <Typography variant="body2">
                        MwSt. ({invoice.mwstSatz || invoice.summen?.mehrwertsteuer?.satz || 19}%):
                      </Typography>
                    </Grid>
                    <Grid item xs={5}>
                      <Typography variant="body2" align="right">
                        {formatCurrency(invoice.mwstBetrag || invoice.summen?.mehrwertsteuer?.betrag)}
                      </Typography>
                    </Grid>
                  </>
                )}
                
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                </Grid>
                
                <Grid item xs={7}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Gesamtbetrag:
                  </Typography>
                </Grid>
                <Grid item xs={5}>
                  <Typography variant="h6" fontWeight={600} align="right" color="primary">
                    {formatCurrency(invoice.gesamtbetrag || invoice.summen?.bruttobetrag)}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Box>

          {/* Status Change */}
          {availableStatuses.length > 0 && (
            <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Status ändern
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center">
                <TextField
                  select
                  size="small"
                  label="Neuer Status"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  sx={{ minWidth: 200 }}
                >
                  {availableStatuses.map((status) => (
                    <MenuItem key={status} value={status}>
                      {invoiceService.getInvoiceStatusDisplay(status).label}
                    </MenuItem>
                  ))}
                </TextField>
                <Button
                  variant="contained"
                  onClick={handleStatusChange}
                  disabled={!newStatus || statusLoading}
                  startIcon={statusLoading ? <CircularProgress size={20} /> : <EditIcon />}
                >
                  Status aktualisieren
                </Button>
                {canCancel && (
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => setStornoDialogOpen(true)}
                    startIcon={<CancelIcon />}
                  >
                    Stornieren
                  </Button>
                )}
              </Stack>
            </Paper>
          )}

          {/* Payment Info */}
          {invoice.zahlungsbedingungen?.bankverbindung && (
            <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Bankverbindung
              </Typography>
              <Grid container spacing={1}>
                <Grid item xs={12} sm={4}>
                  <Typography variant="caption" color="text.secondary">
                    IBAN
                  </Typography>
                  <Typography variant="body2">
                    {invoice.zahlungsbedingungen.bankverbindung.iban}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="caption" color="text.secondary">
                    BIC
                  </Typography>
                  <Typography variant="body2">
                    {invoice.zahlungsbedingungen.bankverbindung.bic}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="caption" color="text.secondary">
                    Bank
                  </Typography>
                  <Typography variant="body2">
                    {invoice.zahlungsbedingungen.bankverbindung.bankname}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          )}

          {/* Audit Log Accordion */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box display="flex" alignItems="center" gap={1}>
                <HistoryIcon color="action" />
                <Typography variant="subtitle2">
                  Änderungsverlauf (GoBD Audit Log)
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              {auditLogLoading ? (
                <Box display="flex" justifyContent="center" p={2}>
                  <CircularProgress size={24} />
                </Box>
              ) : auditLog.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Keine Einträge vorhanden
                </Typography>
              ) : (
                <List dense>
                  {auditLog.map((entry, index) => (
                    <ListItem key={index} divider={index < auditLog.length - 1}>
                      <ListItemIcon>
                        <HistoryIcon fontSize="small" color="action" />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box display="flex" justifyContent="space-between">
                            <Typography variant="body2" fontWeight={500}>
                              {entry.aktion}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatAuditDate(entry.zeitstempel)}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <>
                            <Typography variant="caption" component="span" display="block">
                              Benutzer: {entry.benutzer}
                            </Typography>
                            {entry.details && (
                              <Typography variant="caption" component="span" display="block">
                                {entry.details}
                              </Typography>
                            )}
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </AccordionDetails>
          </Accordion>

          {/* Notes */}
          {invoice.notizen && (
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Notizen:</strong> {invoice.notizen}
              </Typography>
            </Alert>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2, gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleDownloadPDF}
            disabled={loading}
          >
            PDF Download
          </Button>
          <Button
            variant="outlined"
            color="info"
            startIcon={<CodeIcon />}
            onClick={handleDownloadXRechnung}
            disabled={loading}
          >
            XRechnung XML
          </Button>
          <Button
            variant="outlined"
            startIcon={<VerifiedIcon />}
            onClick={handleValidateXRechnung}
            disabled={loading}
          >
            Validieren
          </Button>
          {invoice.status !== 'entwurf' && (
            <Button
              variant="outlined"
              startIcon={<EmailIcon />}
              onClick={handleResendEmail}
              disabled={loading}
            >
              E-Mail senden
            </Button>
          )}
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRegeneratePDF}
            disabled={loading}
          >
            PDF neu
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRegenerateXRechnung}
            disabled={loading}
          >
            XRechnung neu
          </Button>
          <Box flex={1} />
          <Button onClick={onClose}>
            Schließen
          </Button>
        </DialogActions>
      </Dialog>

      {/* Storno Dialog */}
      <Dialog open={stornoDialogOpen} onClose={() => setStornoDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <CancelIcon color="error" />
            <Typography variant="h6">Rechnung stornieren</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>GoBD Hinweis:</strong> Bei der Stornierung wird eine Gutschrift erstellt. 
              Die ursprüngliche Rechnung bleibt im System erhalten und wird als storniert markiert.
            </Typography>
          </Alert>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Stornogrund"
            value={stornoGrund}
            onChange={(e) => setStornoGrund(e.target.value)}
            placeholder="Bitte geben Sie den Grund für die Stornierung an..."
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStornoDialogOpen(false)}>Abbrechen</Button>
          <Button 
            variant="contained" 
            color="error" 
            onClick={handleCreateStorno}
            disabled={loading || !stornoGrund.trim()}
            startIcon={loading ? <CircularProgress size={20} /> : <CancelIcon />}
          >
            Stornieren
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default InvoiceDetailDialog;
