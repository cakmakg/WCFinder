/**
 * Business Card Component
 * 
 * Displays a business/toilet card in list view
 * Similar to luggage storage app design
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Text, Chip, Button, useTheme } from 'react-native-paper';
import { Business } from '../../services/businessService';

interface BusinessCardProps {
  business: Business;
  onPress?: (business: Business) => void;
  distance?: number; // in kilometers
}

export const BusinessCard: React.FC<BusinessCardProps> = ({ business, onPress, distance }) => {
  const theme = useTheme();

  const formatDistance = (km: number): string => {
    if (km < 1) {
      return `${Math.round(km * 1000)}m`;
    }
    return `${km.toFixed(1)}km`;
  };

  const formatFee = (fee?: number): string => {
    if (fee === undefined || fee === null) return 'N/A';
    if (fee === 0) return 'Free';
    return `€${fee.toFixed(2)}`;
  };

  const getBusinessTypeIcon = (type?: string): string => {
    switch (type?.toLowerCase()) {
      case 'hotel':
        return 'hotel';
      case 'restaurant':
      case 'cafe':
        return 'food';
      case 'shop':
      case 'geschäft':
        return 'store';
      default:
        return 'store';
    }
  };

  const formatOpeningHours = (hours?: string): string => {
    if (!hours) return 'Hours not available';
    if (hours.toLowerCase().includes('24/7') || hours.toLowerCase().includes('24 hours')) {
      return '24/7 geöffnet';
    }
    return hours;
  };

  const is24Hours = business.openingHours?.toLowerCase().includes('24/7') || 
                    business.openingHours?.toLowerCase().includes('24 hours');

  return (
    <TouchableOpacity onPress={() => onPress?.(business)} activeOpacity={0.7}>
      <Card style={styles.card} mode="elevated">
        <Card.Content style={styles.cardContent}>
          {/* Header: Type, Name, Rating */}
          <View style={styles.header}>
            <View style={styles.typeContainer}>
              <View style={styles.typeIcon}>
                <Text style={styles.typeIconText}>
                  {business.businessType === 'Hotel' ? '🏨' : 
                   business.businessType === 'Restaurant' ? '🍽️' :
                   business.businessType === 'Cafe' ? '☕' :
                   business.businessType === 'Shop' ? '🛒' : '📍'}
                </Text>
              </View>
              <Text variant="bodySmall" style={styles.typeText}>
                {business.businessType || 'Business'}
              </Text>
            </View>
            <View style={styles.titleContainer}>
              <Text variant="titleMedium" style={styles.title} numberOfLines={1}>
                {business.name || business.businessName || 'Unknown Business'}
              </Text>
            </View>
            {business.rating && (
              <View style={styles.ratingContainer}>
                <Text variant="bodySmall" style={styles.rating}>
                  ⭐ {business.rating.toFixed(2)}
                  {business.reviewCount && ` (${business.reviewCount})`}
                </Text>
              </View>
            )}
          </View>

          {/* Opening Hours */}
          <View style={styles.hoursContainer}>
            <Text variant="bodySmall" style={[styles.hoursText, is24Hours && styles.hours24Text]}>
              🕐 {formatOpeningHours(business.openingHours)}
            </Text>
          </View>

          {/* Address */}
          {business.address && (
            <Text variant="bodySmall" style={styles.address} numberOfLines={1}>
              📍 {typeof business.address === 'string' 
                ? business.address 
                : `${business.address.street || ''}, ${business.address.city || ''}`.trim()}
            </Text>
          )}

          {/* Footer: Price, Distance, Action Button */}
          <View style={styles.footer}>
            <View style={styles.footerLeft}>
              <Text variant="bodyMedium" style={styles.price}>
                {formatFee(business.fee || business.price)} {business.fee === 0 || business.price === 0 ? '' : 'Tasche/Tag'}
              </Text>
              {distance !== undefined && (
                <Text variant="bodySmall" style={styles.distance}>
                  {formatDistance(distance)} away
                </Text>
              )}
            </View>
            <Button
              mode="contained"
              style={styles.actionButton}
              contentStyle={styles.actionButtonContent}
              labelStyle={styles.actionButtonLabel}
              icon="arrow-right"
              onPress={() => onPress?.(business)}
            >
              View
            </Button>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 8,
    borderRadius: 12,
  },
  cardContent: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  typeContainer: {
    marginRight: 12,
    alignItems: 'center',
  },
  typeIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  typeIconText: {
    fontSize: 18,
  },
  typeText: {
    fontSize: 10,
    opacity: 0.7,
    textAlign: 'center',
  },
  titleContainer: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 2,
    fontSize: 15,
  },
  ratingContainer: {
    alignItems: 'flex-end',
  },
  rating: {
    fontWeight: '600',
    color: '#FFA500',
  },
  hoursContainer: {
    marginBottom: 4,
  },
  hoursText: {
    opacity: 0.7,
    fontSize: 13,
  },
  hours24Text: {
    color: '#4CAF50',
    fontWeight: '500',
  },
  address: {
    opacity: 0.6,
    marginBottom: 6,
    fontSize: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  footerLeft: {
    flex: 1,
  },
  price: {
    fontWeight: '600',
    marginBottom: 4,
  },
  distance: {
    opacity: 0.6,
    fontSize: 11,
  },
  actionButton: {
    marginLeft: 12,
    borderRadius: 8,
  },
  actionButtonContent: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  actionButtonLabel: {
    fontSize: 12,
  },
});

