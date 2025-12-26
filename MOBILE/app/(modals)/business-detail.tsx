/**
 * Business Detail Screen - Modern Compact Design
 *
 * Uber/Delivery app inspired single-flow booking page
 * Clean, compact, and modern layout
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Platform, Image, TouchableOpacity } from 'react-native';
import {
  Text,
  Button,
  ActivityIndicator,
  useTheme,
  IconButton,
  Surface,
  Divider,
  Chip
} from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useBusinessDetail } from '../../src/hooks/useBusiness';
import { BookingPanel, BookingData } from '../../src/components/business/BookingPanel';
import toiletService, { Toilet } from '../../src/services/toiletService';

export default function BusinessDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { business, loading, error } = useBusinessDetail(id || null);
  const [toilets, setToilets] = useState<Toilet[]>([]);
  const [toiletsLoading, setToiletsLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingFormData, setBookingFormData] = useState<{
    userGender: string;
    date: Date;
    personCount: number;
  } | null>(null);

  // Memoize the form change callback to prevent infinite loops
  const handleFormChange = useCallback((formData: {
    userGender: string;
    date: Date;
    personCount: number;
  }) => {
    setBookingFormData(formData);
  }, []);

  // Fetch toilets for this business
  useEffect(() => {
    if (!id) return;

    const fetchToilets = async () => {
      try {
        setToiletsLoading(true);
        const data = await toiletService.getByBusiness(id);
        setToilets(data);
      } catch (err: any) {
        console.error('Error fetching toilets:', err);
      } finally {
        setToiletsLoading(false);
      }
    };

    fetchToilets();
  }, [id]);

  const handleBookingSubmit = async (bookingData: BookingData) => {
    try {
      setBookingLoading(true);
      setBookingError(null);

      router.push({
        pathname: '/(modals)/payment',
        params: {
          bookingData: JSON.stringify(bookingData),
        },
      });
    } catch (err: any) {
      console.error('Booking error:', err);
      setBookingError(err.message || 'Failed to process booking');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleBackPress = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (error || !business) {
    return (
      <View style={styles.errorContainer}>
        <MaterialCommunityIcons name="alert-circle" size={64} color="#EF4444" />
        <Text style={styles.errorText}>{error || 'Business not found'}</Text>
        <Button onPress={handleBackPress} mode="contained">
          Go Back
        </Button>
      </View>
    );
  }

  const coordinates = business.location?.coordinates;
  const address = typeof business.address === 'string'
    ? business.address
    : `${business.address?.street || ''}, ${business.address?.city || ''}`.trim();

  const mapRegion = coordinates && coordinates.length >= 2 ? {
    latitude: coordinates[1] || 0,
    longitude: coordinates[0] || 0,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  } : null;


  return (
    <View style={styles.container}>
      {/* Large Map Section */}
      {mapRegion && (
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            initialRegion={mapRegion}
            showsUserLocation={false}
            showsMyLocationButton={false}
            toolbarEnabled={false}
          >
            <Marker
              coordinate={{
                latitude: coordinates[1] || 0,
                longitude: coordinates[0] || 0,
              }}
            >
              <MaterialCommunityIcons name="toilet" size={40} color={theme.colors.primary} />
            </Marker>
          </MapView>

          {/* Map Overlay Buttons */}
          <View style={styles.mapOverlay}>
            <TouchableOpacity
              style={styles.mapButton}
              onPress={handleBackPress}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.mapButton}
              onPress={() => {}}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="share-variant" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Scrollable Content Panel */}
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Location Name and Rating */}
        <View style={styles.locationHeader}>
          <Text variant="headlineSmall" style={styles.locationName}>
            {business.name || business.businessName}
          </Text>
          {business.rating && (
            <View style={styles.ratingContainer}>
              <Text variant="titleMedium" style={styles.ratingValue}>
                {business.rating.toFixed(2)}
              </Text>
              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <MaterialCommunityIcons
                    key={star}
                    name="star"
                    size={16}
                    color={star <= Math.round(business.rating || 0) ? "#FFD700" : "#E0E0E0"}
                  />
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Location Section */}
        {address && (
          <View style={styles.infoSection}>
            <Text variant="titleMedium" style={styles.sectionTitle}>Location</Text>
            <View style={styles.infoItem}>
              <MaterialCommunityIcons name="map-marker" size={20} color="#666" />
              <Text variant="bodyMedium" style={styles.infoText}>
                {address}
              </Text>
            </View>
          </View>
        )}

        {/* Opening Hours Section */}
        {business.openingHours && (
          <View style={styles.infoSection}>
            <Text variant="titleMedium" style={styles.sectionTitle}>Opening Hours</Text>
            <View style={styles.infoItem}>
              <MaterialCommunityIcons name="clock-outline" size={20} color="#666" />
              <Text variant="bodyMedium" style={styles.infoText}>
                {business.openingHours}
              </Text>
            </View>
          </View>
        )}

        {/* Facilities Section */}
        {toiletsLoading ? (
          <View style={styles.centerContent}>
            <ActivityIndicator size="small" />
          </View>
        ) : toilets.length > 0 && (
          <View style={styles.infoSection}>
            <Text variant="titleMedium" style={styles.sectionTitle}>Facilities</Text>
            <View style={styles.facilitiesGrid}>
              <View style={styles.facilityItem}>
                <MaterialCommunityIcons name="counter" size={24} color={theme.colors.primary} />
                <Text variant="bodySmall" style={styles.facilityText}>
                  {toilets.length} {toilets.length === 1 ? 'Toilet' : 'Toilets'}
                </Text>
              </View>
              <View style={styles.facilityItem}>
                <MaterialCommunityIcons name="currency-eur" size={24} color={theme.colors.primary} />
                <Text variant="bodySmall" style={styles.facilityText}>
                  €{toilets[0]?.fee?.toFixed(2) || '0.00'}
                </Text>
              </View>
              {toilets.some(t => t.features?.isAccessible) && (
                <View style={styles.facilityItem}>
                  <MaterialCommunityIcons name="wheelchair-accessibility" size={24} color={theme.colors.primary} />
                  <Text variant="bodySmall" style={styles.facilityText}>
                    Accessible
                  </Text>
                </View>
              )}
              {toilets.some(t => t.features?.hasBabyChangingStation) && (
                <View style={styles.facilityItem}>
                  <MaterialCommunityIcons name="baby-carriage" size={24} color={theme.colors.primary} />
                  <Text variant="bodySmall" style={styles.facilityText}>
                    Baby Care
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Description Section */}
        {business.description && (
          <View style={styles.infoSection}>
            <Text variant="titleMedium" style={styles.sectionTitle}>About</Text>
            <Text variant="bodyMedium" style={styles.descriptionText}>
              {business.description}
            </Text>
          </View>
        )}

        {/* Booking Panel - Visible */}
        {toilets.length > 0 && (
          <View style={styles.bookingPanelContainer}>
            <BookingPanel
              business={business}
              toilets={toilets}
              onBookingSubmit={handleBookingSubmit}
              onFormChange={handleFormChange}
              loading={bookingLoading}
              error={bookingError}
            />
          </View>
        )}
      </ScrollView>

      {/* Fixed Bottom Booking Bar */}
      {toilets.length > 0 && (
        <Surface style={styles.bottomBar} elevation={4}>
          <View style={styles.bottomBarContent}>
            <View style={styles.priceInfo}>
              <Text variant="titleMedium" style={styles.priceText}>
                € {toilets[0]?.fee?.toFixed(2) || '0.00'} / Day
              </Text>
            </View>
            <Button
              mode="contained"
              onPress={() => {
                if (toilets.length > 0 && bookingFormData) {
                  const basePrice = toilets[0]?.fee || 1.00;
                  const serviceFee = 0.75;
                  const total = (basePrice * bookingFormData.personCount) + serviceFee;
                  
                  const bookingData: BookingData = {
                    business: {
                      id: business._id,
                      name: business.name || business.businessName || '',
                      address: business.address,
                      location: business.location
                    },
                    toilet: {
                      id: toilets[0]._id,
                      name: toilets[0].name,
                      fee: toilets[0].fee
                    },
                    userGender: bookingFormData.userGender,
                    date: bookingFormData.date.toISOString().split('T')[0],
                    personCount: bookingFormData.personCount,
                    pricing: {
                      basePrice,
                      serviceFee,
                      total
                    }
                  };
                  handleBookingSubmit(bookingData);
                }
              }}
              style={[styles.bookButton, { backgroundColor: theme.colors.primary }]}
              contentStyle={styles.bookButtonContent}
              loading={bookingLoading}
              disabled={bookingLoading || !bookingFormData || !bookingFormData.userGender}
              labelStyle={styles.bookButtonLabel}
            >
              JETZT BUCHEN
            </Button>
          </View>
        </Surface>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mapContainer: {
    height: '45%',
    width: '100%',
    position: 'relative',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  mapOverlay: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    zIndex: 1,
  },
  mapButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 100, // Space for fixed bottom bar
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 12,
    opacity: 0.7,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F5F5F5',
  },
  errorText: {
    color: '#EF4444',
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
    fontSize: 16,
  },
  locationHeader: {
    marginBottom: 16,
  },
  locationName: {
    fontWeight: 'bold',
    marginBottom: 12,
    fontSize: 24,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingValue: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewsCount: {
    color: '#666',
    marginLeft: 4,
  },
  infoSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
    fontSize: 18,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  infoText: {
    flex: 1,
    color: '#424242',
  },
  bookingPanelContainer: {
    marginTop: 8,
    marginBottom: 16,
  },
  facilitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 8,
  },
  facilityItem: {
    alignItems: 'center',
    minWidth: 80,
    gap: 4,
  },
  facilityText: {
    textAlign: 'center',
    fontWeight: '500',
    fontSize: 12,
  },
  descriptionText: {
    color: '#424242',
    lineHeight: 22,
    marginTop: 8,
  },
  centerContent: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 34 : 12,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  bottomBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  priceInfo: {
    flex: 1,
  },
  priceText: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  bookButton: {
    flex: 1,
    borderRadius: 12,
  },
  bookButtonContent: {
    paddingVertical: 12,
  },
  bookButtonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});
