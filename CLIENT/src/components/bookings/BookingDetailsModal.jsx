import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Card,
  CardContent,
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
  // Note: Details are fetched in handleViewDetails, not here to avoid double requests

  if (!booking) return null;

  // If QR-only mode, show only QR
  if (isQROnly) {
    return (
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              QR-Code
            </Typography>
            <IconButton size="small" onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <SimpleQRView booking={booking} isMobile={isMobile} />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Schließen</Button>
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
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Reservierungsdetails
          </Typography>
          <IconButton size="small" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        {loadingDetails ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
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
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Schließen</Button>
      </DialogActions>
    </Dialog>
  );
};

const BookingDetailsContent = ({ booking, bookingDetails, isMobile, onOpenMaps, onDownloadQR }) => {
  return (
    <Box>
      {/* Booking Info */}
      <Card sx={{ mb: 3, bgcolor: 'grey.50' }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            {booking.businessId?.businessName || 'N/A'}
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {/* Status */}
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip 
                label={getStatusLabel(booking.status)} 
                color={getStatusColor(booking.status)}
                size="small"
              />
              <Chip 
                label={getPaymentStatusLabel(booking.paymentStatus)} 
                color={getPaymentStatusColor(booking.paymentStatus)}
                size="small"
              />
            </Box>

            {/* Address */}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <LocationOnIcon fontSize="small" color="action" />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Adresse
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    cursor: 'pointer', 
                    textDecoration: 'underline',
                    '&:hover': { color: 'primary.main' }
                  }}
                  onClick={() => onOpenMaps(booking)}
                >
                  {booking.businessId?.address?.street || 'N/A'}, {booking.businessId?.address?.city || 'N/A'}
                </Typography>
              </Box>
            </Box>

            {/* Date */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarTodayIcon fontSize="small" color="action" />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Datum
                </Typography>
                <Typography variant="body1">
                  {new Date(booking.startTime).toLocaleDateString('de-DE', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Typography>
              </Box>
            </Box>

            {/* Persons */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PeopleIcon fontSize="small" color="action" />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Personen
                </Typography>
                <Typography variant="body1">
                  {booking.personCount}
                </Typography>
              </Box>
            </Box>

            {/* Gender Preference */}
            {booking.genderPreference && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon fontSize="small" color="action" />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Geschlecht
                  </Typography>
                  <Typography variant="body1">
                    {getGenderLabel(booking.genderPreference)}
                  </Typography>
                </Box>
              </Box>
            )}

            {/* Total Amount */}
            <Box>
              <Typography variant="body2" color="text.secondary">
                Gesamtbetrag
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
                €{Number(booking.totalFee || 0).toFixed(2)}
              </Typography>
            </Box>

            {/* Payment Details */}
            {bookingDetails?.payment && (
              <>
                <Divider sx={{ my: 1 }} />
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    Zahlungsmethode
                  </Typography>
                  <Typography variant="body1">
                    {getPaymentMethodLabel(bookingDetails.payment)}
                  </Typography>
                </Box>
                {bookingDetails.payment.transactionId && (
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Transaktions-ID
                    </Typography>
                    <Typography variant="body1" sx={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>
                      {bookingDetails.payment.transactionId}
                    </Typography>
                  </Box>
                )}
                {bookingDetails.payment.paymentIntentId && (
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Payment Intent ID
                    </Typography>
                    <Typography variant="body1" sx={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>
                      {bookingDetails.payment.paymentIntentId}
                    </Typography>
                  </Box>
                )}
              </>
            )}

            {/* Created Date */}
            <Box>
              <Typography variant="body2" color="text.secondary">
                Reserviert am
              </Typography>
              <Typography variant="body1">
                {new Date(booking.createdAt).toLocaleDateString('de-DE', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* QR Code Section */}
      {booking.accessCode && (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              QR-Code
            </Typography>

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                p: 2,
                bgcolor: 'white',
                borderRadius: 2,
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
                fontWeight: 600,
                letterSpacing: 2,
                mb: 2,
                textAlign: 'center',
              }}
            >
              {booking.accessCode}
            </Typography>

            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={onDownloadQR}
              fullWidth
            >
              QR-Code herunterladen
            </Button>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

const SimpleQRView = ({ booking, isMobile }) => {
  return (
    <Box sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Ihr QR-Code
      </Typography>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          p: 2,
          bgcolor: 'white',
          borderRadius: 2,
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
          fontWeight: 600,
          letterSpacing: 2,
          mb: 2,
        }}
      >
        {booking.accessCode}
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {booking.businessId?.businessName}
      </Typography>
    </Box>
  );
};

export default BookingDetailsModal;

