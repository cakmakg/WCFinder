// CLIENT/src/pages/MyBookingsPage.jsx

import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  Alert,
  Tabs,
  Tab,
  useTheme,
  useMediaQuery,
  CircularProgress,
} from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';
// eslint-disable-next-line no-unused-vars
import { motion, useReducedMotion } from 'framer-motion';
import { COLORS, RADII, SHADOWS, PAGE_HEADER_BG, DOT_GRID, TYPOGRAPHY } from '../theme/designTokens';
import OwnerPanel from './OwnerPanel';
import BookingsTab from '../components/bookings/BookingsTab';
import ProfileTab from '../components/bookings/ProfileTab';
import BookingDetailsModal from '../components/bookings/BookingDetailsModal';
import { useBookings } from '../hooks/useBookings';
import { useBookingDetails } from '../hooks/useBookingDetails';
import { getUserData } from '../utils/userStorage';
import useApiCall from '../hook/useApiCall';
import useAuthCall from '../hook/useAuthCall';
import { userUpdateSuccess, clearAuth } from '../features/authSlice';
import { downloadQRCode, openMaps } from '../utils/bookingHelpers';

const MyBookingsPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const reduce = useReducedMotion();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.auth);
  const apiCall = useApiCall();
  const { logout } = useAuthCall();

  const localStorageUser = useMemo(() => {
    try {
      return getUserData();
    } catch {
      return null;
    }
  }, []);

  const baseUser = currentUser || localStorageUser;

  const [user, setUser] = useState(baseUser);
  const [loadingUser, setLoadingUser] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!baseUser?._id) { setUser(null); return; }
      if (baseUser?.email && baseUser?.firstName !== undefined && baseUser?.lastName !== undefined) {
        setUser(baseUser);
        return;
      }
      setLoadingUser(true);
      try {
        const response = await apiCall({
          url: `/users/${baseUser._id}`,
          method: 'get',
          requiresAuth: true,
        });
        if (response?.result) {
          setUser(response.result);
        } else {
          setUser(baseUser);
        }
      } catch {
        setUser(baseUser);
      } finally {
        setLoadingUser(false);
      }
    };
    fetchUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseUser?._id]);

  const isOwner = user?.role === 'owner' || user?.role === 'admin' || user?.isOwner === true || user?.isAdmin === true;

  const [activeTab, setActiveTab] = useState(0);
  const { bookings, loading, error, paymentMethods, setError } = useBookings(user, isOwner);
  const {
    selectedBooking,
    bookingDetails,
    loadingDetails,
    isQROnly,
    fetchBookingDetails,
    clearSelection,
    viewQROnly,
  } = useBookingDetails();

  const handleViewDetails = (booking) => {
    fetchBookingDetails(booking).catch((err) => {
      if (err.response?.status !== 429) {
        setError('Fehler beim Laden der Reservierungsdetails.');
      }
    });
  };

  const handleViewQR = (booking) => viewQROnly(booking);

  const handleProfileUpdate = async (profileData) => {
    try {
      const response = await apiCall({
        url: `/users/${user._id}`,
        method: 'put',
        body: profileData,
        requiresAuth: true,
      });
      if (response?.result) {
        dispatch(userUpdateSuccess({ user: response.result }));
        setUser(response.result);
        setError(null);
      }
    } catch {
      setError('Fehler beim Aktualisieren des Profils.');
    }
  };

  const handleDeleteProfile = async () => {
    try {
      await apiCall({
        url: `/users/me`,
        method: 'delete',
        requiresAuth: true,
        errorAction: null,
        errorMessage: null,
      });
      dispatch(clearAuth());
      await logout();
      navigate('/', { replace: true });
    } catch (err) {
      let errorMessage = 'Fehler beim Löschen des Profils.';
      if (err.response?.data?.message) errorMessage = err.response.data.message;
      else if (err.response?.status === 403) errorMessage = 'Keine Berechtigung.';
      else if (err.response?.status === 404) errorMessage = 'Benutzer nicht gefunden.';
      else if (err.response?.status === 401) errorMessage = 'Nicht angemeldet.';
      throw new Error(errorMessage);
    }
  };

  // DSGVO Art. 15: Kişisel veriyi JSON dosyası olarak indir
  const handleExportData = async () => {
    if (exporting) return;
    setExporting(true);
    try {
      const data = await apiCall({
        url: `/users/me/export`,
        method: 'get',
        requiresAuth: true,
        errorMessage: 'Fehler beim Herunterladen Ihrer Daten.',
      });
      // Transport-Flag entfernen, nur die eigentlichen Daten exportieren
      const exportPayload = { ...(data || {}) };
      delete exportPayload.error;
      const blob = new Blob([JSON.stringify(exportPayload, null, 2)], {
        type: 'application/json',
      });
      const href = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = href;
      link.download = `wcfinder-datenexport-${user?._id || 'konto'}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(href);
    } catch {
      // Fehlermeldung wird bereits von apiCall als Toast angezeigt
    } finally {
      setExporting(false);
    }
  };

  const handleDownloadQR = () => {
    if (selectedBooking?.accessCode) downloadQRCode(selectedBooking.accessCode);
  };

  const handleOpenMaps = (booking) => openMaps(booking);

  if (isOwner) return <OwnerPanel />;

  if (loadingUser) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress sx={{ color: COLORS.primary }} />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: COLORS.backgroundLight }}>

      {/* ── Heller Seitenkopf mit Punktraster ── */}
      <Box
        component="header"
        sx={{
          background: PAGE_HEADER_BG,
          pt: { xs: 4, md: 5.5 },
          pb: { xs: 3, md: 4 },
          position: 'relative',
          overflow: 'hidden',
          borderBottom: `1px solid ${COLORS.border}`,
        }}
      >
        {/* Dezentes Punktraster als Textur */}
        <Box
          aria-hidden="true"
          sx={{
            position: 'absolute',
            inset: 0,
            ...DOT_GRID,
            maskImage: 'linear-gradient(180deg, rgba(0,0,0,0.7), transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        <Box sx={{ maxWidth: 1100, mx: 'auto', px: { xs: 2, md: 3 }, position: 'relative', zIndex: 1 }}>
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <Typography
              component="h1"
              sx={{
                ...TYPOGRAPHY.pageTitle,
                fontSize: { xs: '1.6rem', md: '2.1rem' },
                lineHeight: 1.2,
                mb: 0.5,
              }}
            >
              Meine Buchungen
            </Typography>
            <Typography sx={{ color: COLORS.textSecondary, fontSize: { xs: '0.95rem', md: '1.05rem' } }}>
              Ihre Reservierungen und Profilinformationen auf einen Blick
            </Typography>
          </motion.div>
        </Box>
      </Box>

      <Box sx={{ maxWidth: 1100, mx: 'auto', px: { xs: 2, md: 3 }, pt: 3, pb: 6 }}>

        {error && (
          <Alert
            severity="error"
            sx={{ mb: 2.5, borderRadius: RADII.button }}
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}

        {/* Tab-Leiste */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: RADII.card,
            mb: 3,
            backgroundColor: 'white',
            border: `1px solid ${COLORS.border}`,
            boxShadow: SHADOWS.subtle,
            overflow: 'hidden',
          }}
        >
          <Tabs
            value={activeTab}
            onChange={(e, v) => setActiveTab(v)}
            sx={{
              px: 1,
              '& .MuiTabs-indicator': {
                backgroundColor: COLORS.primary,
                height: 3,
                borderRadius: '3px 3px 0 0',
              },
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.9rem',
                color: COLORS.textSecondary,
                minHeight: 56,
                '&.Mui-selected': { color: COLORS.primary, fontWeight: 700 },
              },
            }}
          >
            <Tab icon={<CalendarTodayIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="Reservierungen" />
            <Tab icon={<PersonIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="Profil" />
          </Tabs>
        </Paper>

        {/* Tab Content */}
        {activeTab === 0 && (
          <BookingsTab
            bookings={bookings}
            loading={loading}
            onViewDetails={handleViewDetails}
            onViewQR={handleViewQR}
          />
        )}

        {activeTab === 1 && (
          <ProfileTab
            user={user}
            paymentMethods={paymentMethods}
            onUpdateProfile={handleProfileUpdate}
            onDeleteProfile={handleDeleteProfile}
            onExportData={handleExportData}
            exporting={exporting}
          />
        )}

        {/* Booking Details Modal */}
        <BookingDetailsModal
          open={!!selectedBooking}
          booking={selectedBooking}
          bookingDetails={bookingDetails}
          loadingDetails={loadingDetails}
          isMobile={isMobile}
          isQROnly={isQROnly}
          onClose={clearSelection}
          onOpenMaps={handleOpenMaps}
          onDownloadQR={handleDownloadQR}
        />
      </Box>
    </Box>
  );
};

export default MyBookingsPage;
