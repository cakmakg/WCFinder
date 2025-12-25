/**
 * My Bookings Screen
 * 
 * Shows user's booking history with details
 */

import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Platform, RefreshControl, Share } from 'react-native';
import { 
  Text, 
  Card, 
  Button, 
  Divider, 
  useTheme,
  IconButton,
  ActivityIndicator,
  Chip,
  Surface
} from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { tokenStorage, clearAllStorage } from '../../src/utils/secureStorage';
import { useAuth } from '../../src/hooks/useAuth';
import useAxios from '../../src/hooks/useAxios';

interface Booking {
  _id: string;
  accessCode?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'expired';
  personCount: number;
  startTime: string;
  totalAmount?: number;
  businessId?: {
    _id: string;
    name: string;
    address?: {
      street?: string;
      city?: string;
    };
  };
  toiletId?: {
    _id: string;
    name: string;
    gender?: string;
  };
  createdAt: string;
}

export default function MyBookingsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { currentUser, token, isInitializing, isAuthenticated } = useAuth();
  const { axiosWithToken } = useAxios();
  
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedBooking, setExpandedBooking] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    try {
      setError(null);
      
      // Double check token from secure storage
      const storedToken = await tokenStorage.getAccessToken();
      console.log('[MyBookings] Fetching bookings...', {
        hasReduxToken: !!token,
        hasStoredToken: !!storedToken,
        storedTokenPreview: storedToken ? storedToken.substring(0, 30) + '...' : 'null',
        isAuthenticated
      });
      
      if (!storedToken && !token) {
        setError('Bitte melden Sie sich an, um Ihre Buchungen zu sehen');
        setLoading(false);
        return;
      }
      
      // Use axiosWithToken which handles token from AsyncStorage
      const response = await axiosWithToken.get('/usages/my-usages');
      
      console.log('[MyBookings] Bookings response:', {
        count: response.data?.result?.length || 0,
      });
      
      if (response.data?.result) {
        // Sort by date, newest first
        const sortedBookings = response.data.result.sort(
          (a: Booking, b: Booking) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setBookings(sortedBookings);
      }
    } catch (err: any) {
      console.error('[MyBookings] Error fetching bookings:', err);
      console.error('[MyBookings] Error details:', {
        status: err.response?.status,
        message: err.response?.data?.message,
        data: err.response?.data
      });
      
      // Handle 401 specifically
      if (err.response?.status === 401) {
        setError('Sitzung abgelaufen. Bitte melden Sie sich erneut an.');
        // Clear secure storage and redirect to login after a short delay
        try {
          await clearAllStorage();
        } catch (clearError) {
          console.error('[MyBookings] Error clearing storage:', clearError);
        }
        setTimeout(() => {
          router.replace('/(auth)/login');
        }, 2000);
      } else {
        setError(err.response?.data?.message || err.message || 'Buchungen konnten nicht geladen werden');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token, isAuthenticated, router, axiosWithToken]);

  // Wait for auth initialization before fetching
  useEffect(() => {
    const checkAndFetch = async () => {
      if (isInitializing) {
        console.log('[MyBookings] Waiting for auth initialization...');
        return;
      }
      
      // Check secure storage directly for token
      const storedToken = await tokenStorage.getAccessToken();
      
      console.log('[MyBookings] Auth initialized, checking auth state...', {
        isAuthenticated,
        hasReduxToken: !!token,
        hasStoredToken: !!storedToken,
        hasUser: !!currentUser,
        userId: currentUser?._id
      });
      
      // If no token anywhere, redirect to login
      if (!storedToken && !token) {
        console.log('[MyBookings] No token found, redirecting to login');
        setLoading(false);
        setError('Bitte melden Sie sich an, um Ihre Buchungen zu sehen');
        setTimeout(() => {
          router.replace('/(auth)/login');
        }, 1500);
        return;
      }
      
      fetchBookings();
    };
    
    checkAndFetch();
  }, [isInitializing, fetchBookings, token, currentUser, router]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchBookings();
  }, [fetchBookings]);

  const handleBack = () => {
    router.back();
  };

  const handleGoHome = () => {
    router.replace('/(tabs)');
  };

  const handleShare = async (booking: Booking) => {
    if (!booking.accessCode) return;
    
    try {
      await Share.share({
        message: `Mein WC-Zugangscode: ${booking.accessCode}\n\nBusiness: ${booking.businessId?.name || 'N/A'}\nToilette: ${booking.toiletId?.name || 'N/A'}\nDatum: ${new Date(booking.startTime).toLocaleDateString('de-DE')}`,
        title: 'WC Zugangscode',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return '#22c55e'; // green
      case 'completed':
        return '#3b82f6'; // blue
      case 'pending':
        return '#f59e0b'; // amber
      case 'cancelled':
      case 'expired':
        return '#ef4444'; // red
      default:
        return '#6b7280'; // gray
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Bestätigt';
      case 'completed':
        return 'Abgeschlossen';
      case 'pending':
        return 'Ausstehend';
      case 'cancelled':
        return 'Storniert';
      case 'expired':
        return 'Abgelaufen';
      default:
        return status;
    }
  };

  const toggleExpanded = (bookingId: string) => {
    setExpandedBooking(expandedBooking === bookingId ? null : bookingId);
  };

  const renderBookingCard = (booking: Booking) => {
    const isExpanded = expandedBooking === booking._id;
    const statusColor = getStatusColor(booking.status);
    
    return (
      <Card 
        key={booking._id} 
        style={styles.bookingCard}
        onPress={() => toggleExpanded(booking._id)}
      >
        <Card.Content>
          {/* Header Row */}
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Text variant="titleMedium" style={styles.businessName}>
                {booking.businessId?.name || 'Business'}
              </Text>
              <Text variant="bodySmall" style={styles.toiletName}>
                {booking.toiletId?.name || 'Toilette'}
              </Text>
            </View>
            <Chip 
              style={[styles.statusChip, { backgroundColor: statusColor + '20' }]}
              textStyle={{ color: statusColor, fontSize: 12 }}
            >
              {getStatusLabel(booking.status)}
            </Chip>
          </View>

          {/* Date and Person Row */}
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <MaterialCommunityIcons name="calendar" size={16} color="#666" />
              <Text style={styles.infoText}>
                {new Date(booking.startTime).toLocaleDateString('de-DE')}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <MaterialCommunityIcons name="account-group" size={16} color="#666" />
              <Text style={styles.infoText}>{booking.personCount} Person(en)</Text>
            </View>
            {booking.totalAmount && (
              <View style={styles.infoItem}>
                <MaterialCommunityIcons name="currency-eur" size={16} color="#666" />
                <Text style={styles.infoText}>€ {booking.totalAmount.toFixed(2)}</Text>
              </View>
            )}
          </View>

          {/* Expanded Content */}
          {isExpanded && (
            <View style={styles.expandedContent}>
              <Divider style={styles.divider} />
              
              {/* Access Code */}
              {booking.accessCode && booking.status === 'confirmed' && (
                <Surface style={styles.accessCodeContainer} elevation={1}>
                  <Text variant="labelMedium" style={styles.accessCodeLabel}>
                    Zugangscode
                  </Text>
                  <View style={styles.accessCodeRow}>
                    <MaterialCommunityIcons 
                      name="qrcode" 
                      size={40} 
                      color={theme.colors.primary} 
                    />
                    <Text variant="headlineSmall" style={styles.accessCode}>
                      {booking.accessCode}
                    </Text>
                  </View>
                  <Button
                    mode="outlined"
                    onPress={() => handleShare(booking)}
                    style={styles.shareButton}
                    icon="share-variant"
                    compact
                  >
                    Teilen
                  </Button>
                </Surface>
              )}

              {/* Additional Details */}
              {booking.businessId?.address && (
                <View style={styles.addressContainer}>
                  <MaterialCommunityIcons name="map-marker" size={16} color="#666" />
                  <Text style={styles.addressText}>
                    {booking.businessId.address.street}, {booking.businessId.address.city}
                  </Text>
                </View>
              )}

              <Text variant="bodySmall" style={styles.createdAt}>
                Gebucht am: {new Date(booking.createdAt).toLocaleString('de-DE')}
              </Text>
            </View>
          )}

          {/* Expand Indicator */}
          <View style={styles.expandIndicator}>
            <MaterialCommunityIcons 
              name={isExpanded ? "chevron-up" : "chevron-down"} 
              size={24} 
              color="#999" 
            />
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          size={24}
          onPress={handleBack}
        />
        <Text variant="titleLarge" style={styles.headerTitle}>
          Meine Buchungen
        </Text>
        <View style={{ width: 48 }} />
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Buchungen werden geladen...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <MaterialCommunityIcons name="alert-circle-outline" size={60} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
          <Button mode="contained" onPress={fetchBookings} style={styles.retryButton}>
            Erneut versuchen
          </Button>
        </View>
      ) : bookings.length === 0 ? (
        <View style={styles.centerContainer}>
          <MaterialCommunityIcons name="calendar-blank" size={60} color="#999" />
          <Text style={styles.emptyTitle}>Keine Buchungen</Text>
          <Text style={styles.emptySubtitle}>
            Sie haben noch keine Buchungen. Finden Sie eine Toilette in der Nähe!
          </Text>
          <Button mode="contained" onPress={handleGoHome} style={styles.findButton}>
            Toilette finden
          </Button>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {bookings.map(renderBookingCard)}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    opacity: 0.7,
  },
  errorText: {
    marginTop: 16,
    color: '#ef4444',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
  },
  emptyTitle: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptySubtitle: {
    marginTop: 8,
    textAlign: 'center',
    opacity: 0.7,
    paddingHorizontal: 32,
  },
  findButton: {
    marginTop: 24,
  },
  bookingCard: {
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardHeaderLeft: {
    flex: 1,
    marginRight: 12,
  },
  businessName: {
    fontWeight: 'bold',
  },
  toiletName: {
    opacity: 0.7,
    marginTop: 2,
  },
  statusChip: {
    height: 26,
  },
  infoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontSize: 13,
    color: '#666',
  },
  expandedContent: {
    marginTop: 12,
  },
  divider: {
    marginBottom: 16,
  },
  accessCodeContainer: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f0f9ff',
    alignItems: 'center',
    marginBottom: 16,
  },
  accessCodeLabel: {
    opacity: 0.7,
    marginBottom: 8,
  },
  accessCodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  accessCode: {
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  shareButton: {
    marginTop: 12,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  addressText: {
    fontSize: 13,
    color: '#666',
    flex: 1,
  },
  createdAt: {
    opacity: 0.6,
    marginTop: 8,
  },
  expandIndicator: {
    alignItems: 'center',
    marginTop: 8,
  },
});
