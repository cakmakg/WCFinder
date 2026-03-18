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

  const handleDownloadQR = () => {
    if (selectedBooking?.accessCode) downloadQRCode(selectedBooking.accessCode);
  };

  const handleOpenMaps = (booking) => openMaps(booking);

  if (isOwner) return <OwnerPanel />;

  if (loadingUser) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress sx={{ color: '#0891b2' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', py: 4 }}>
      <Box sx={{ maxWidth: 1100, mx: 'auto', px: { xs: 2, md: 3 } }}>

        {/* Gradient Header */}
        <Paper
          elevation={0}
          sx={{
            background: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)',
            borderRadius: '16px',
            p: { xs: 2.5, md: 3 },
            mb: 3,
            boxShadow: '0 4px 20px rgba(8,145,178,0.25)',
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#fff', mb: 0.3 }}>
            Meine Reservierungen
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.75)' }}>
            Ihre Buchungen und Profilinformationen
          </Typography>
        </Paper>

        {error && (
          <Alert
            severity="error"
            sx={{ mb: 2.5, borderRadius: '12px' }}
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}

        {/* Modern Tabs */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: '14px',
            mb: 3,
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            overflow: 'hidden',
          }}
        >
          <Tabs
            value={activeTab}
            onChange={(e, v) => setActiveTab(v)}
            sx={{
              px: 1,
              '& .MuiTabs-indicator': {
                backgroundColor: '#0891b2',
                height: 3,
                borderRadius: '3px 3px 0 0',
              },
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.9rem',
                color: '#64748b',
                minHeight: 56,
                '&.Mui-selected': { color: '#0891b2', fontWeight: 700 },
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
