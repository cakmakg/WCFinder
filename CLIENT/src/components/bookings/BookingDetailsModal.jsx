import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Chip,
  Button,
  Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import DownloadIcon from '@mui/icons-material/Download';
import QRCode from 'react-qr-code';
import {
  getStatusLabel,
  getPaymentStatusLabel,
  getPaymentMethodLabel,
  getGenderLabel,
} from './bookingUtils';
import { COLORS, RADII, SHADOWS } from '../../theme/designTokens';

// Weiche Pill-Farben je Status — gleiche Semantik wie bookingUtils.getStatusColor
const STATUS_CHIP_COLORS = {
  pending: { bg: '#fffbeb', fg: '#b45309' },
  confirmed: { bg: '#ecfdf5', fg: '#047857' },
  active: { bg: COLORS.accentBoxBg, fg: COLORS.primary },
  completed: { bg: '#f1f5f9', fg: COLORS.textSecondary },
  cancelled: { bg: '#fef2f2', fg: '#dc2626' },
  expired: { bg: '#f1f5f9', fg: COLORS.textSecondary },
};

const PAYMENT_CHIP_COLORS = {
  pending: { bg: '#fffbeb', fg: '#b45309' },
  paid: { bg: '#ecfdf5', fg: '#047857' },
  failed: { bg: '#fef2f2', fg: '#dc2626' },
  refunded: { bg: '#f1f5f9', fg: COLORS.textSecondary },
};

const FALLBACK_CHIP = { bg: '#f1f5f9', fg: COLORS.textSecondary };

const pillChipSx = (palette = FALLBACK_CHIP) => ({
  borderRadius: '999px',
  height: 24,
  fontSize: '0.72rem',
  fontWeight: 600,
  backgroundColor: palette.bg,
  color: palette.fg,
  '& .MuiChip-label': { px: 1.25 },
});

const closeButtonSx = {
  borderRadius: RADII.button,
  textTransform: 'none',
  fontWeight: 600,
  color: COLORS.textSecondary,
};

/* ---------- QR-Ticket im Stil der FlowDemo-QrVignette ---------- */
const QrTicket = ({ booking, isMobile, htmlId }) => (
  <Box
    sx={{
      display: 'inline-flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 1.25,
      p: 2.5,
      backgroundColor: 'white',
      border: `1px solid ${COLORS.border}`,
      borderRadius: RADII.card,
      boxShadow: SHADOWS.subtle,
      mb: 2,
    }}
  >
    {htmlId ? (
      <div id={htmlId}>
        <QRCode value={booking.accessCode} size={isMobile ? 150 : 200} level="H" />
      </div>
    ) : (
      <QRCode value={booking.accessCode} size={isMobile ? 150 : 200} level="H" />
    )}
    <Typography
      sx={{
        fontSize: '0.72rem',
        color: COLORS.textSecondary,
        letterSpacing: 1.5,
        textTransform: 'uppercase',
      }}
    >
      Buchung · Nr. {booking.accessCode}
    </Typography>
  </Box>
);

const BookingDetailsModal = ({
  open,
  booking,
  bookingDetails,
  loadingDetails,
  isMobile,
  isQROnly,
  onClose,
  onOpenMaps,
  onDownloadQR,
}) => {
  if (!booking) return null;

  // QR-only mode
  if (isQROnly) {
    return (
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{ sx: { borderRadius: isMobile ? 0 : RADII.panel } }}
      >
        {/* Gradient Header */}
        <Box
          sx={{
            background: COLORS.primaryGradient,
            px: 3,
            py: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>
            QR-Code
          </Typography>
          <IconButton size="small" onClick={onClose} sx={{ color: 'rgba(255,255,255,0.8)' }}>
            <CloseIcon />
          </IconButton>
        </Box>
        <DialogContent sx={{ pt: 3 }}>
          <SimpleQRView booking={booking} isMobile={isMobile} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} sx={closeButtonSx}>
            Schließen
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{ sx: { borderRadius: isMobile ? 0 : RADII.panel } }}
    >
      {/* Gradient Header */}
      <Box
        sx={{
          background: COLORS.primaryGradient,
          px: 3,
          py: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>
          Reservierungsdetails
        </Typography>
        <IconButton size="small" onClick={onClose} sx={{ color: 'rgba(255,255,255,0.8)' }}>
          <CloseIcon />
        </IconButton>
      </Box>
      <DialogContent sx={{ pt: 3 }}>
        {loadingDetails ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress sx={{ color: COLORS.primary }} />
          </Box>
        ) : bookingDetails ? (
          <BookingDetailsContent
            booking={booking}
            bookingDetails={bookingDetails}
            isMobile={isMobile}
            onOpenMaps={onOpenMaps}
            onDownloadQR={onDownloadQR}
          />
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress sx={{ color: COLORS.primary }} />
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} sx={closeButtonSx}>
          Schließen
        </Button>
      </DialogActions>
    </Dialog>
  );
};

/* ---------- Detail Row Helper ---------- */
const DetailRow = ({ icon: Icon, label, children }) => (
  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
    <Box
      sx={{
        width: 32,
        height: 32,
        borderRadius: '8px',
        backgroundColor: 'rgba(8,145,178,0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        mt: 0.3,
      }}
    >
      <Icon sx={{ fontSize: 18, color: COLORS.primary }} />
    </Box>
    <Box>
      <Typography variant="caption" sx={{ color: COLORS.textSecondary, display: 'block', mb: 0.2 }}>
        {label}
      </Typography>
      {children}
    </Box>
  </Box>
);

/* ---------- Booking Details Content ---------- */
const BookingDetailsContent = ({ booking, bookingDetails, isMobile, onOpenMaps, onDownloadQR }) => {
  return (
    <Box>
      {/* Haupt-Infokarte */}
      <Box
        sx={{
          backgroundColor: 'white',
          border: `1px solid ${COLORS.border}`,
          borderLeft: `3px solid ${COLORS.primary}`,
          borderRadius: RADII.card,
          boxShadow: SHADOWS.subtle,
          p: 2.5,
          mb: 3,
        }}
      >
        <Typography
          variant="h6"
          sx={{ mb: 2, fontWeight: 800, color: COLORS.textHeading, letterSpacing: '-0.02em' }}
        >
          {booking.businessId?.businessName || 'N/A'}
        </Typography>

        {/* Status-Pills */}
        <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mb: 2.5 }}>
          <Chip
            label={getStatusLabel(booking.status)}
            size="small"
            sx={pillChipSx(STATUS_CHIP_COLORS[booking.status])}
          />
          <Chip
            label={getPaymentStatusLabel(booking.paymentStatus)}
            size="small"
            sx={pillChipSx(PAYMENT_CHIP_COLORS[booking.paymentStatus])}
          />
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Adresse */}
          <DetailRow icon={LocationOnIcon} label="Adresse">
            <Typography
              variant="body2"
              sx={{
                cursor: 'pointer',
                color: COLORS.primary,
                fontWeight: 500,
                '&:hover': { textDecoration: 'underline' },
              }}
              onClick={() => onOpenMaps(booking)}
            >
              {booking.businessId?.address?.street || 'N/A'}, {booking.businessId?.address?.city || 'N/A'}
            </Typography>
          </DetailRow>

          {/* Datum */}
          <DetailRow icon={CalendarTodayIcon} label="Datum">
            <Typography variant="body2" sx={{ fontWeight: 500, color: COLORS.textHeading }}>
              {new Date(booking.startTime).toLocaleDateString('de-DE', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Typography>
          </DetailRow>

          {/* Personen */}
          <DetailRow icon={PeopleIcon} label="Personen">
            <Typography variant="body2" sx={{ fontWeight: 500, color: COLORS.textHeading }}>
              {booking.personCount}
            </Typography>
          </DetailRow>

          {/* Geschlecht */}
          {booking.genderPreference && (
            <DetailRow icon={PersonIcon} label="Geschlecht">
              <Typography variant="body2" sx={{ fontWeight: 500, color: COLORS.textHeading }}>
                {getGenderLabel(booking.genderPreference)}
              </Typography>
            </DetailRow>
          )}
        </Box>

        {/* Preis-Akzentbox */}
        <Box
          sx={{
            mt: 2.5,
            backgroundColor: COLORS.accentBoxBg,
            borderLeft: `3px solid ${COLORS.primary}`,
            borderRadius: '10px',
            px: 2,
            py: 1.5,
          }}
        >
          <Typography variant="caption" sx={{ color: COLORS.textSecondary, display: 'block', mb: 0.2 }}>
            Gesamtbetrag
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 800, color: COLORS.primary, letterSpacing: '-0.02em' }}>
            {'€'}{Number(booking.totalFee || 0).toFixed(2)}
          </Typography>
        </Box>

        {/* Zahlungsdetails */}
        {bookingDetails?.payment && (
          <>
            <Divider sx={{ my: 2, borderColor: COLORS.border }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box>
                <Typography variant="caption" sx={{ color: COLORS.textSecondary }}>
                  Zahlungsmethode
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500, color: COLORS.textHeading }}>
                  {getPaymentMethodLabel(bookingDetails.payment)}
                </Typography>
              </Box>
              {(bookingDetails.payment.transactionId || bookingDetails.payment.paymentIntentId) && (
                <Box>
                  <Typography variant="caption" sx={{ color: COLORS.textSecondary }}>
                    Transaktions-ID
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem', color: COLORS.textPrimary }}>
                    {bookingDetails.payment.transactionId || bookingDetails.payment.paymentIntentId}
                  </Typography>
                </Box>
              )}
            </Box>
          </>
        )}

        {/* Buchungsdatum */}
        <Divider sx={{ my: 2, borderColor: COLORS.border }} />
        <Typography variant="caption" sx={{ color: COLORS.textLight }}>
          Reserviert am {new Date(booking.createdAt).toLocaleDateString('de-DE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Typography>
      </Box>

      {/* QR-Ticket */}
      {booking.accessCode && (
        <Box
          sx={{
            backgroundColor: COLORS.backgroundLight,
            border: `1px solid ${COLORS.border}`,
            borderRadius: RADII.card,
            p: 2.5,
            textAlign: 'center',
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{ mb: 2, fontWeight: 800, color: COLORS.textHeading, letterSpacing: '-0.02em' }}
          >
            Ihr Zugang
          </Typography>

          <QrTicket booking={booking} isMobile={isMobile} htmlId="qr-code-svg-detail" />

          <Typography variant="body2" sx={{ color: COLORS.textSecondary, mb: 2 }}>
            QR-Code am Eingang vorzeigen – fertig.
          </Typography>

          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={onDownloadQR}
            fullWidth
            sx={{
              borderRadius: RADII.button,
              textTransform: 'none',
              fontWeight: 600,
              color: COLORS.primary,
              borderColor: COLORS.primary,
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                borderColor: COLORS.primaryDark,
                backgroundColor: 'rgba(8,145,178,0.06)',
                transform: 'translateY(-1px)',
              },
              '&:active': { transform: 'translateY(0) scale(0.98)' },
            }}
          >
            QR-Code herunterladen
          </Button>
        </Box>
      )}
    </Box>
  );
};

/* ---------- Simple QR View ---------- */
const SimpleQRView = ({ booking, isMobile }) => {
  return (
    <Box sx={{ textAlign: 'center' }}>
      <Typography
        variant="subtitle1"
        sx={{ mb: 2, fontWeight: 800, color: COLORS.textHeading, letterSpacing: '-0.02em' }}
      >
        Ihr QR-Code
      </Typography>

      <QrTicket booking={booking} isMobile={isMobile} />

      <Typography variant="body2" sx={{ color: COLORS.textSecondary }}>
        {booking.businessId?.businessName}
      </Typography>
    </Box>
  );
};

export default BookingDetailsModal;
