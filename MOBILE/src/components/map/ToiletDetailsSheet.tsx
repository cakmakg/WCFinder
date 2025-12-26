/**
 * Toilet Details Bottom Sheet
 *
 * Modern bottom sheet showing toilet/business details
 * Uber/Delivery app style with photo, rating, distance, and booking button
 */

import React, { useMemo } from 'react';
import { View, StyleSheet, Image, ScrollView } from 'react-native';
import { Text, Button, Chip, Divider, Surface } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface ToiletDetailsSheetProps {
  toilet: any;
  userLocation: { latitude: number; longitude: number } | null;
  onBookPress: () => void;
}

export const ToiletDetailsSheet: React.FC<ToiletDetailsSheetProps> = ({
  toilet,
  userLocation,
  onBookPress,
}) => {
  // Calculate distance
  const distance = useMemo(() => {
    if (!userLocation || !toilet.location?.coordinates) {
      return null;
    }

    const [longitude, latitude] = toilet.location.coordinates;

    // Haversine formula for distance calculation
    const R = 6371; // Earth's radius in km
    const dLat = (latitude - userLocation.latitude) * (Math.PI / 180);
    const dLon = (longitude - userLocation.longitude) * (Math.PI / 180);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(userLocation.latitude * (Math.PI / 180)) *
        Math.cos(latitude * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
  }, [userLocation, toilet.location]);

  const formatDistance = (dist: number | null) => {
    if (!dist) return '';

    if (dist < 1) {
      return `${Math.round(dist * 1000)}m`;
    }

    return `${dist.toFixed(1)}km`;
  };

  // Get business info
  const business = toilet.business || {};
  const businessName = business.name || business.businessName || 'Unknown';
  const businessType = business.businessType || toilet.businessType || '';
  const address = typeof business.address === 'string'
    ? business.address
    : `${business.address?.street || ''}, ${business.address?.city || ''}`;
  const fee = toilet.fee || 0;

  // Get placeholder image
  const imageUri = toilet.image || business.image || 'https://via.placeholder.com/400x200?text=Toilet';

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Image */}
      <Image
        source={{ uri: imageUri }}
        style={styles.image}
        resizeMode="cover"
      />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <Text variant="headlineSmall" style={styles.title}>
              {businessName}
            </Text>
            {businessType && (
              <Chip icon="store" style={styles.typeChip} compact>
                {businessType}
              </Chip>
            )}
          </View>

          {distance !== null && (
            <View style={styles.distanceBadge}>
              <MaterialCommunityIcons name="map-marker-distance" size={20} color="#6200EE" />
              <Text variant="titleMedium" style={styles.distanceText}>
                {formatDistance(distance)}
              </Text>
            </View>
          )}
        </View>

        {/* Address */}
        <View style={styles.addressContainer}>
          <MaterialCommunityIcons name="map-marker" size={20} color="#757575" />
          <Text variant="bodyMedium" style={styles.address}>
            {address}
          </Text>
        </View>
      </View>

      <Divider />

      {/* Details */}
      <View style={styles.details}>
        {/* Price */}
        <Surface style={styles.detailCard} elevation={1}>
          <MaterialCommunityIcons name="cash" size={24} color="#00C853" />
          <View style={styles.detailContent}>
            <Text variant="bodySmall" style={styles.detailLabel}>
              Usage Fee
            </Text>
            <Text variant="titleMedium" style={styles.detailValue}>
              €{fee.toFixed(2)}
            </Text>
          </View>
        </Surface>

        {/* Gender */}
        {toilet.genderPreference && (
          <Surface style={styles.detailCard} elevation={1}>
            <MaterialCommunityIcons
              name={
                toilet.genderPreference === 'male'
                  ? 'human-male'
                  : toilet.genderPreference === 'female'
                  ? 'human-female'
                  : 'human-male-female'
              }
              size={24}
              color="#6200EE"
            />
            <View style={styles.detailContent}>
              <Text variant="bodySmall" style={styles.detailLabel}>
                Type
              </Text>
              <Text variant="titleMedium" style={styles.detailValue}>
                {toilet.genderPreference.charAt(0).toUpperCase() +
                  toilet.genderPreference.slice(1)}
              </Text>
            </View>
          </Surface>
        )}

        {/* Availability */}
        <Surface style={styles.detailCard} elevation={1}>
          <MaterialCommunityIcons
            name={toilet.isAvailable !== false ? 'check-circle' : 'close-circle'}
            size={24}
            color={toilet.isAvailable !== false ? '#00C853' : '#FF5252'}
          />
          <View style={styles.detailContent}>
            <Text variant="bodySmall" style={styles.detailLabel}>
              Status
            </Text>
            <Text variant="titleMedium" style={styles.detailValue}>
              {toilet.isAvailable !== false ? 'Available' : 'Occupied'}
            </Text>
          </View>
        </Surface>
      </View>

      {/* Booking Button */}
      <Button
        mode="contained"
        onPress={onBookPress}
        style={styles.bookButton}
        contentStyle={styles.bookButtonContent}
        labelStyle={styles.bookButtonLabel}
        icon="calendar-check"
      >
        Reserve Now
      </Button>

      {/* Bottom Spacing */}
      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: 200,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerLeft: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  typeChip: {
    alignSelf: 'flex-start',
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3E5F5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  distanceText: {
    marginLeft: 4,
    fontWeight: 'bold',
    color: '#6200EE',
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  address: {
    flex: 1,
    marginLeft: 8,
    color: '#757575',
  },
  details: {
    padding: 16,
    gap: 12,
  },
  detailCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  detailContent: {
    marginLeft: 16,
    flex: 1,
  },
  detailLabel: {
    color: '#757575',
    marginBottom: 4,
  },
  detailValue: {
    fontWeight: '600',
  },
  bookButton: {
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
  },
  bookButtonContent: {
    paddingVertical: 8,
  },
  bookButtonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomSpacing: {
    height: 32,
  },
});
