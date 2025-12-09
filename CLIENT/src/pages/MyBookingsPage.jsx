// CLIENT/src/pages/MyBookingsPage.jsx

import React, { useState, useMemo, useEffect } from 'react';
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
  
  const baseUser = currentUser || localStorageUser;
  
  // ✅ Fetch full user data from backend (includes email, firstName, lastName)
  const [user, setUser] = useState(baseUser);
  const [loadingUser, setLoadingUser] = useState(false);
  
  useEffect(() => {
    const fetchUserData = async () => {
      if (!baseUser?._id) {
        setUser(null);
        return;
      }
      
      // If baseUser already has email, firstName, lastName, use it directly
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
      } catch (err) {
        console.error('Error fetching user data:', err);
        // Fallback to baseUser if fetch fails
        setUser(baseUser);
      } finally {
        setLoadingUser(false);
      }
    };
    
    fetchUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseUser?._id]);
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
        setUser(response.result); // Update local user state
        setError(null);
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Fehler beim Aktualisieren des Profils.');
    }
  };

  const handleDeleteProfile = async () => {
    try {
      console.log('🗑️ [handleDeleteProfile] Starting profile deletion using /users/me endpoint', {
        userId: user?._id,
        hasToken: !!localStorage.getItem('token')
      });

      // ✅ DELETE request - /users/me endpoint'ini kullan (daha güvenli, ID göndermeye gerek yok)
      // Backend req.user.id'den kullanıcı ID'sini alır (JWT token'dan)
      // useApiCall 204 durumunda null döndürür, bu normaldir
      const response = await apiCall({
        url: `/users/me`, // ✅ Örnek koda göre: /users/me endpoint'i kullan
        method: 'delete',
        requiresAuth: true,
        errorAction: null, // ✅ Toast göstermesin, hatayı kendimiz handle edeceğiz
        errorMessage: null, // ✅ Toast göstermesin, hatayı kendimiz handle edeceğiz
      });
      
      console.log('✅ [handleDeleteProfile] Profile deleted successfully, response:', response);
      
      // ✅ 204 No Content durumunda response null olabilir, bu normaldir
      // useApiCall zaten 204 durumunu handle ediyor ve null döndürüyor
      
      // ✅ Auth state'i temizle ve logout yap
      dispatch(clearAuth());
      await logout();
      
      // ✅ Ana sayfaya yönlendir
      navigate('/', { replace: true });
    } catch (err) {
      console.error('❌ [handleDeleteProfile] Error deleting profile:', {
        error: err,
        message: err.message,
        response: err.response,
        status: err.response?.status,
        data: err.response?.data
      });
      
      // ✅ Hata mesajını throw et ki ProfileTab'de gösterilebilsin
      let errorMessage = 'Fehler beim Löschen des Profils.';
      
      // ✅ Önce backend'den gelen spesifik mesajı kontrol et
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message && err.message !== 'Bir hata oluştu.' && err.message !== 'Fehler beim Löschen des Profils.') {
        // useApiCall'dan gelen mesajı kullan (eğer genel mesaj değilse)
        errorMessage = err.message;
      } else if (err.response?.status === 403) {
        errorMessage = 'Sie haben keine Berechtigung, Ihr Profil zu löschen. Bitte kontaktieren Sie den Administrator.';
      } else if (err.response?.status === 404) {
        errorMessage = 'Benutzer nicht gefunden.';
      } else if (err.response?.status === 401) {
        errorMessage = 'Sie sind nicht angemeldet. Bitte melden Sie sich erneut an.';
      } else if (err.response?.status === 500) {
        errorMessage = 'Serverfehler. Bitte versuchen Sie es später erneut oder kontaktieren Sie den Support.';
      }
      
      console.error('❌ [handleDeleteProfile] Final error message:', errorMessage);
      console.error('❌ [handleDeleteProfile] Error details:', {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        message: err.message,
        originalError: err
      });
      
      // ✅ Hata mesajını throw et
      throw new Error(errorMessage);
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

  if (loadingUser) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
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
