/**
 * Business Detail Screen
 * 
 * Shows detailed information about a business/toilet
 * Similar to CLIENT BusinessDetail page
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Linking, Platform } from 'react-native';
import { Text, Card, Button, Chip, Divider, ActivityIndicator, useTheme, IconButton, Menu } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useBusinessDetail } from '../../src/hooks/useBusiness';
import { BusinessMap } from '../../src/components/map/BusinessMap';
import { ToiletList } from '../../src/components/business/ToiletList';
import { BookingPanel, BookingData } from '../../src/components/business/BookingPanel';
import toiletService, { Toilet } from '../../src/services/toiletService';

export default function BusinessDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { business, loading, error } = useBusinessDetail(id || null);
  const [toilets, setToilets] = useState<Toilet[]>([]);
  const [toiletsLoading, setToiletsLoading] = useState(false);
  const [toiletsError, setToiletsError] = useState<string | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  // Fetch toilets for this business
  useEffect(() => {
    if (!id) return;

    const fetchToilets = async () => {
      try {
        setToiletsLoading(true);
        setToiletsError(null);
        const data = await toiletService.getByBusiness(id);
        setToilets(data);
      } catch (err: any) {
        console.error('Error fetching toilets:', err);
        setToiletsError(err.message || 'Failed to fetch toilets');
      } finally {
        setToiletsLoading(false);
      }
    };

    fetchToilets();
  }, [id]);

  const formatFee = (fee?: number): string => {
    if (fee === undefined || fee === null) return 'N/A';
    if (fee === 0) return 'Free';
    return `€${fee.toFixed(2)}`;
  };

  const handleBookingSubmit = async (bookingData: BookingData) => {
    try {
      setBookingLoading(true);
      setBookingError(null);

      // Navigate to payment page with booking data
      // We'll pass the data as JSON string in params (Expo Router limitation)
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

  const handleCallPress = () => {
    if (business?.phone) {
      Linking.openURL(`tel:${business.phone}`);
    }
  };

  const handleWebsitePress = () => {
    if (business?.website) {
      Linking.openURL(business.website);
    }
  };

  const handleBackPress = () => {
    router.back();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (error || !business) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error || 'Business not found'}</Text>
        <Button onPress={handleBackPress} mode="outlined">
          Go Back
        </Button>
      </View>
    );
  }

  const coordinates = business.location?.coordinates;
  const mapLocation = coordinates
    ? { latitude: coordinates[1], longitude: coordinates[0] }
    : null;

  return (
    <View style={styles.container}>
      {/* Header with back button */}
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          size={24}
          onPress={handleBackPress}
          style={styles.backButton}
        />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Business Header */}
        <Card style={styles.headerCard}>
          <Card.Content>
            <View style={styles.titleRow}>
              <Text variant="headlineSmall" style={styles.title}>
                {business.name || business.businessName || 'Business'}
              </Text>
              {business.approvalStatus === 'approved' && (
                <Chip icon="check-circle" style={styles.verifiedChip} compact>
                  Verified
                </Chip>
              )}
            </View>

            {/* Business Type and Status */}
            <View style={styles.chipRow}>
              <Chip 
                icon="store" 
                style={styles.chip}
                mode="outlined"
              >
                {business.businessType || 'Business'}
              </Chip>
              {business.approvalStatus && (
                <Chip 
                  style={[
                    styles.chip,
                    business.approvalStatus === 'approved' 
                      ? { backgroundColor: theme.colors.primaryContainer }
                      : { backgroundColor: theme.colors.errorContainer }
                  ]}
                  compact
                >
                  {business.approvalStatus === 'approved' ? 'Approved' : 'Pending'}
                </Chip>
              )}
            </View>

            {/* Opening Hours and Toilet Count */}
            <View style={styles.infoRow}>
              {business.openingHours && (
                <View style={styles.infoItem}>
                  <Text variant="bodySmall" style={styles.infoLabel}>
                    🕐 {business.openingHours}
                  </Text>
                </View>
              )}
              <View style={styles.infoItem}>
                <Text variant="bodySmall" style={styles.infoLabel}>
                  🚽 {toilets.length} {toilets.length === 1 ? 'Toilet' : 'Toilets'}
                </Text>
              </View>
            </View>

            {/* Address */}
            {business.address && (
              <View style={styles.addressRow}>
                <Text variant="bodySmall" style={styles.address}>
                  📍 {typeof business.address === 'string' 
                    ? business.address 
                    : `${business.address.street || ''}, ${business.address.postalCode || ''} ${business.address.city || ''}`.trim()}
                </Text>
              </View>
            )}

            {/* Rating */}
            {business.rating && (
              <View style={styles.ratingContainer}>
                <Text variant="bodyMedium" style={styles.rating}>
                  ⭐ {business.rating.toFixed(1)}
                  {business.reviewCount && ` (${business.reviewCount} reviews)`}
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Map */}
        {mapLocation && (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Location
              </Text>
              <View style={styles.mapContainer}>
                <BusinessMap
                  businesses={[business]}
                  selectedBusiness={business}
                  userLocation={mapLocation}
                />
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Toilet List */}
        {toiletsLoading ? (
          <Card style={styles.card}>
            <Card.Content>
              <ActivityIndicator size="small" />
              <Text style={styles.loadingText}>Loading toilets...</Text>
            </Card.Content>
          </Card>
        ) : toiletsError ? (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.errorText}>{toiletsError}</Text>
            </Card.Content>
          </Card>
        ) : toilets.length > 0 ? (
          <ToiletList toilets={toilets} />
        ) : (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="bodyMedium" style={styles.noToiletsText}>
                No toilets available at this location.
              </Text>
            </Card.Content>
          </Card>
        )}

        {/* Contact Info */}
        {(business.phone || business.email || business.website) && (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Contact
              </Text>
              {business.phone && (
                <Button
                  icon="phone"
                  mode="text"
                  onPress={handleCallPress}
                  style={styles.contactButton}
                >
                  {business.phone}
                </Button>
              )}
              {business.email && (
                <Text variant="bodyMedium" style={styles.contactText}>
                  ✉️ {business.email}
                </Text>
              )}
              {business.website && (
                <Button
                  icon="web"
                  mode="text"
                  onPress={handleWebsitePress}
                  style={styles.contactButton}
                >
                  Visit Website
                </Button>
              )}
            </Card.Content>
          </Card>
        )}

        {/* Description */}
        {business.description && (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Description
              </Text>
              <Text variant="bodyMedium">{business.description}</Text>
            </Card.Content>
          </Card>
        )}

        <Divider style={styles.divider} />

        {/* Booking Panel */}
        {toilets.length > 0 ? (
          <BookingPanel
            business={business}
            toilets={toilets}
            onBookingSubmit={handleBookingSubmit}
            loading={bookingLoading}
            error={bookingError}
          />
        ) : (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="bodyMedium" style={styles.noToiletsText}>
                Reservation not possible - No toilets available
              </Text>
            </Card.Content>
          </Card>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    zIndex: 1,
  },
  backButton: {
    marginLeft: 0,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingTop: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    opacity: 0.7,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    color: '#d32f2f',
    marginBottom: 16,
    textAlign: 'center',
  },
  headerCard: {
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  title: {
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  verifiedChip: {
    backgroundColor: '#e8f5e9',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    gap: 8,
  },
  chip: {
    marginRight: 8,
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
    gap: 16,
  },
  infoItem: {
    marginRight: 16,
  },
  infoLabel: {
    opacity: 0.7,
  },
  addressRow: {
    marginBottom: 8,
  },
  address: {
    opacity: 0.7,
  },
  ratingContainer: {
    marginTop: 8,
  },
  rating: {
    fontWeight: '600',
    color: '#FFA500',
  },
  card: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  mapContainer: {
    height: 250,
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 8,
  },
  contactButton: {
    marginBottom: 8,
    justifyContent: 'flex-start',
  },
  contactText: {
    marginBottom: 8,
  },
  divider: {
    marginVertical: 16,
  },
  bookButton: {
    marginTop: 8,
    marginBottom: 32,
  },
  bookButtonContent: {
    paddingVertical: 8,
  },
  noToiletsText: {
    opacity: 0.7,
    textAlign: 'center',
  },
});
