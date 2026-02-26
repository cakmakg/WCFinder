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
  getStatusColor,
  getStatusLabel,
  getPaymentStatusColor,
  getPaymentStatusLabel,
  getPaymentMethodLabel,
  getGenderLabel,
} from './bookingUtils';

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
        PaperProps={{ sx: { borderRadius: isMobile ? 0 : '16px' } }}
      >
        {/* Gradient Header */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)',
            px: 3,
            py: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#fff' }}>
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
          <Button
            onClick={onClose}
            sx={{
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 600,
              color: '#64748b',
            }}
          >
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
      PaperProps={{ sx: { borderRadius: isMobile ? 0 : '16px' } }}
    >
      {/* Gradient Header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)',
          px: 3,
          py: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#fff' }}>
          Reservierungsdetails
        </Typography>
        <IconButton size="small" onClick={onClose} sx={{ color: 'rgba(255,255,255,0.8)' }}>
          <CloseIcon />
        </IconButton>
      </Box>
      <DialogContent sx={{ pt: 3 }}>
        {loadingDetails ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress sx={{ color: '#0891b2' }} />
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
            <CircularProgress sx={{ color: '#0891b2' }} />
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={onClose}
          sx={{
            borderRadius: '10px',
            textTransform: 'none',
            fontWeight: 600,
            color: '#64748b',
          }}
        >
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
      <Icon sx={{ fontSize: 18, color: '#0891b2' }} />
    </Box>
    <Box>
      <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 0.2 }}>
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
      {/* Main Info Card */}
      <Box
        sx={{
          border: '1px solid rgba(8,145,178,0.12)',
          borderLeft: '3px solid #0891b2',
          borderRadius: '14px',
          p: 2.5,
          mb: 3,
          backgroundColor: '#fafcfe',
        }}
      >
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: '#0f172a' }}>
          {booking.businessId?.businessName || 'N/A'}
        </Typography>

        {/* Status chips */}
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 2.5 }}>
          <Chip
            label={getStatusLabel(booking.status)}
            color={getStatusColor(booking.status)}
            size="small"
            sx={{ fontWeight: 600 }}
          />
          <Chip
            label={getPaymentStatusLabel(booking.paymentStatus)}
            color={getPaymentStatusColor(booking.paymentStatus)}
            size="small"
            sx={{ fontWeight: 600 }}
          />
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Address */}
          <DetailRow icon={LocationOnIcon} label="Adresse">
            <Typography
              variant="body2"
              sx={{
                cursor: 'pointer',
                color: '#0891b2',
                fontWeight: 500,
                '&:hover': { textDecoration: 'underline' },
              }}
              onClick={() => onOpenMaps(booking)}
            >
              {booking.businessId?.address?.street || 'N/A'}, {booking.businessId?.address?.city || 'N/A'}
            </Typography>
          </DetailRow>

          {/* Date */}
          <DetailRow icon={CalendarTodayIcon} label="Datum">
            <Typography variant="body2" sx={{ fontWeight: 500, color: '#0f172a' }}>
              {new Date(booking.startTime).toLocaleDateString('de-DE', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Typography>
          </DetailRow>

          {/* Persons */}
          <DetailRow icon={PeopleIcon} label="Personen">
            <Typography variant="body2" sx={{ fontWeight: 500, color: '#0f172a' }}>
              {booking.personCount}
            </Typography>
          </DetailRow>

          {/* Gender */}
          {booking.genderPreference && (
            <DetailRow icon={PersonIcon} label="Geschlecht">
              <Typography variant="body2" sx={{ fontWeight: 500, color: '#0f172a' }}>
                {getGenderLabel(booking.genderPreference)}
              </Typography>
            </DetailRow>
          )}
        </Box>

        {/* Price */}
        <Box
          sx={{
            mt: 2.5,
            backgroundColor: '#f0f9ff',
            borderLeft: '3px solid #0891b2',
            borderRadius: '10px',
            px: 2,
            py: 1.5,
          }}
        >
          <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 0.2 }}>
            Gesamtbetrag
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0891b2' }}>
            {'\u20AC'}{Number(booking.totalFee || 0).toFixed(2)}
          </Typography>
        </Box>

        {/* Payment Details */}
        {bookingDetails?.payment && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#64748b' }}>
                  Zahlungsmethode
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500, color: '#0f172a' }}>
                  {getPaymentMethodLabel(bookingDetails.payment)}
                </Typography>
              </Box>
              {(bookingDetails.payment.transactionId || bookingDetails.payment.paymentIntentId) && (
                <Box>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>
                    Transaktions-ID
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#334155' }}>
                    {bookingDetails.payment.transactionId || bookingDetails.payment.paymentIntentId}
                  </Typography>
                </Box>
              )}
            </Box>
          </>
        )}

        {/* Created Date */}
        <Divider sx={{ my: 2 }} />
        <Typography variant="caption" sx={{ color: '#94a3b8' }}>
          Reserviert am {new Date(booking.createdAt).toLocaleDateString('de-DE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Typography>
      </Box>

      {/* QR Code Section */}
      {booking.accessCode && (
        <Box
          sx={{
            border: '1px solid rgba(8,145,178,0.12)',
            borderRadius: '14px',
            p: 2.5,
            textAlign: 'center',
          }}
        >
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 700, color: '#0f172a' }}>
            QR-Code
          </Typography>

          <Box
            sx={{
              display: 'inline-flex',
              justifyContent: 'center',
              p: 2.5,
              bgcolor: '#f0f9ff',
              borderRadius: '14px',
              mb: 2,
            }}
          >
            <div id="qr-code-svg-detail">
              <QRCode
                value={booking.accessCode}
                size={isMobile ? 150 : 200}
                level="H"
              />
            </div>
          </Box>

          <Typography
            variant="h5"
            sx={{
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: 3,
              mb: 2,
              color: '#0891b2',
            }}
          >
            {booking.accessCode}
          </Typography>

          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={onDownloadQR}
            fullWidth
            sx={{
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 600,
              color: '#0891b2',
              borderColor: '#0891b2',
              '&:hover': {
                borderColor: '#0e7490',
                backgroundColor: 'rgba(8,145,178,0.06)',
              },
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
      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 700, color: '#0f172a' }}>
        Ihr QR-Code
      </Typography>

      <Box
        sx={{
          display: 'inline-flex',
          justifyContent: 'center',
          p: 2.5,
          bgcolor: '#f0f9ff',
          borderRadius: '14px',
          mb: 2,
        }}
      >
        <QRCode
          value={booking.accessCode}
          size={isMobile ? 150 : 200}
          level="H"
        />
      </Box>

      <Typography
        variant="h5"
        sx={{
          fontFamily: 'monospace',
          fontWeight: 700,
          letterSpacing: 3,
          mb: 1,
          color: '#0891b2',
        }}
      >
        {booking.accessCode}
      </Typography>

      <Typography variant="body2" sx={{ color: '#64748b' }}>
        {booking.businessId?.businessName}
      </Typography>
    </Box>
  );
};

export default BookingDetailsModal;
