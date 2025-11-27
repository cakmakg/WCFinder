// CLIENT/src/pages/MyBookingsPage.jsx

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Container,
  Box,
  Typography,
  Alert,
  Tabs,
  Tab,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';
import OwnerPanel from './OwnerPanel';
import BookingsTab from '../components/bookings/BookingsTab';
import ProfileTab from '../components/bookings/ProfileTab';
import BookingDetailsModal from '../components/bookings/BookingDetailsModal';
import { useBookings } from '../hooks/useBookings';
import { useBookingDetails } from '../hooks/useBookingDetails';
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
  
  // Use secure user storage utility (removes sensitive data)
  const localStorageUser = useMemo(() => {
    try {
      const { getUserData } = require('../utils/userStorage');
      return getUserData();
    } catch {
      return null;
    }
  }, []);
  
  const user = currentUser || localStorageUser;
  const isOwner = user?.role === 'owner' || 
                  user?.role === 'admin' || 
                  user?.isOwner === true || 
                  user?.isAdmin === true;

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
    // Set the booking, modal will fetch details automatically if needed
    // Don't fetch here to avoid double requests
    fetchBookingDetails(booking).catch((err) => {
      if (err.response?.status !== 429) {
        setError('Fehler beim Laden der Reservierungsdetails.');
      }
    });
  };

  const handleViewQR = (booking) => {
    viewQROnly(booking);
  };

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
        setError(null);
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Fehler beim Aktualisieren des Profils.');
    }
  };

  const handleDeleteProfile = async () => {
    try {
      await apiCall({
        url: `/users/${user._id}`,
        method: 'delete',
        requiresAuth: true,
      });
      
      dispatch(clearAuth());
      await logout();
      navigate('/');
    } catch (err) {
      console.error('Error deleting profile:', err);
      if (err.response?.status === 403) {
        setError('Sie haben keine Berechtigung, Ihr Profil zu löschen. Bitte kontaktieren Sie den Administrator.');
      } else {
        setError('Fehler beim Löschen des Profils.');
      }
    }
  };

  const handleDownloadQR = () => {
    if (selectedBooking?.accessCode) {
      downloadQRCode(selectedBooking.accessCode);
    }
  };

  const handleOpenMaps = (booking) => {
    openMaps(booking);
  };

  if (isOwner) {
    return <OwnerPanel />;
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f7fa', py: 3 }}>
      <Container maxWidth="lg">
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 700, color: '#1a1a2e' }}>
          Meine Reservierungen
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{
            mb: 3,
            borderBottom: '1px solid #e2e8f0',
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              minHeight: 64,
            },
          }}
        >
          <Tab
            icon={<CalendarTodayIcon />}
            iconPosition="start"
            label="Reservierungen"
          />
          <Tab
            icon={<PersonIcon />}
            iconPosition="start"
            label="Profil"
          />
        </Tabs>

        {/* Tab 0: Reservierungen */}
        {activeTab === 0 && (
          <BookingsTab
            bookings={bookings}
            loading={loading}
            onViewDetails={handleViewDetails}
            onViewQR={handleViewQR}
          />
        )}

        {/* Tab 1: Profil */}
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
      </Container>
    </Box>
  );
};

export default MyBookingsPage;
