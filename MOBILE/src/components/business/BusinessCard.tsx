/**
 * Business Card Component
 * 
 * Displays a business/toilet card in list view
 * Similar to luggage storage app design
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Text, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Business } from '../../services/businessService';

interface BusinessCardProps {
  business: Business;
  onPress?: (business: Business) => void;
  distance?: number; // in kilometers
  minFee?: number; // minimum toilet fee for this business
}

export const BusinessCard: React.FC<BusinessCardProps> = ({ business, onPress, distance, minFee }) => {
  const formatDistance = (km: number): string => {
    if (km < 1) {
      return `${Math.round(km * 1000)}m`;
    }
    return `${km.toFixed(1)}km`;
  };

  const formatFee = (fee?: number): string => {
    if (fee === undefined || fee === null || fee === 0) return 'Kostenlos';
    return `€${fee.toFixed(2)} / Person`;
  };

  const getBusinessTypeIcon = (type?: string): string => {
    switch (type?.toLowerCase()) {
      case 'hotel': return 'bed-outline';
      case 'restaurant': return 'silverware-fork-knife';
      case 'cafe': return 'coffee-outline';
      case 'shop':
      case 'geschäft': return 'shopping-outline';
      default: return 'map-marker';
    }
  };

  const getBusinessTypeColor = (type?: string): string => {
    switch (type?.toLowerCase()) {
      case 'hotel': return '#6366f1';
      case 'restaurant': return '#f97316';
      case 'cafe': return '#92400e';
      case 'shop':
      case 'geschäft': return '#10b981';
      default: return '#0891b2';
    }
  };

  const formatOpeningHours = (hours?: string): string => {
    if (!hours) return 'Öffnungszeiten nicht verfügbar';
    if (hours.toLowerCase().includes('24/7') || hours.toLowerCase().includes('24 hours')) {
      return '24/7 geöffnet';
    }
    return hours;
  };

  const is24Hours = business.openingHours?.toLowerCase().includes('24/7') ||
                    business.openingHours?.toLowerCase().includes('24 hours');

  const typeColor = getBusinessTypeColor(business.businessType);
  const typeIcon = getBusinessTypeIcon(business.businessType);

  return (
    <TouchableOpacity onPress={() => onPress?.(business)} activeOpacity={0.7}>
      <Card style={[styles.card, { borderLeftColor: typeColor }]} mode="elevated">
        <Card.Content style={styles.cardContent}>
          {/* Header: Type, Name, Rating */}
          <View style={styles.header}>
            <View style={styles.typeContainer}>
              <View style={[styles.typeIcon, { backgroundColor: `${typeColor}18` }]}>
                <MaterialCommunityIcons name={typeIcon as any} size={18} color={typeColor} />
              </View>
              <Text variant="bodySmall" style={[styles.typeText, { color: typeColor }]}>
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
            <MaterialCommunityIcons
              name="clock-outline"
              size={11}
              color={is24Hours ? '#4CAF50' : '#64748b'}
              style={{ marginRight: 3, marginTop: 1 }}
            />
            <Text variant="bodySmall" style={[styles.hoursText, is24Hours && styles.hours24Text]}>
              {formatOpeningHours(business.openingHours)}
            </Text>
          </View>

          {/* Address */}
          {business.address && (
            <View style={styles.addressRow}>
              <MaterialCommunityIcons name="map-marker-outline" size={11} color="#9ca3af" style={{ marginRight: 3, marginTop: 1 }} />
              <Text variant="bodySmall" style={styles.address} numberOfLines={1}>
                {typeof business.address === 'string'
                  ? business.address
                  : `${business.address.street || ''}, ${business.address.city || ''}`.trim()}
              </Text>
            </View>
          )}

          {/* Footer: Price, Distance, Action Button */}
          <View style={styles.footer}>
            <View style={styles.footerLeft}>
              <Text variant="bodyMedium" style={styles.price}>
                {formatFee(minFee ?? business.fee ?? business.price)}
              </Text>
              {distance !== undefined && (
                <Text variant="bodySmall" style={styles.distance}>
                  {formatDistance(distance)} entfernt
                </Text>
              )}
            </View>
            <Button
              mode="contained"
              style={styles.actionButton}
              contentStyle={styles.actionButtonContent}
              labelStyle={styles.actionButtonLabel}
              buttonColor="#0891b2"
              icon="arrow-right"
              onPress={() => onPress?.(business)}
            >
              Ansehen
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
    borderRadius: 14,
    borderLeftWidth: 3,
  },
  cardContent: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  typeContainer: {
    marginRight: 8,
    alignItems: 'center',
  },
  typeIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  typeIconText: {
    fontSize: 14,
  },
  typeText: {
    fontSize: 9,
    opacity: 0.7,
    textAlign: 'center',
  },
  titleContainer: {
    flex: 1,
    marginRight: 6,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 1,
    fontSize: 14,
  },
  ratingContainer: {
    alignItems: 'flex-end',
  },
  rating: {
    fontWeight: '600',
    color: '#FFA500',
    fontSize: 11,
  },
  hoursContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 3,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  hoursText: {
    opacity: 0.7,
    fontSize: 11,
  },
  hours24Text: {
    color: '#4CAF50',
    fontWeight: '500',
  },
  address: {
    opacity: 0.6,
    fontSize: 11,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  footerLeft: {
    flex: 1,
  },
  price: {
    fontWeight: '600',
    marginBottom: 2,
    fontSize: 13,
  },
  distance: {
    opacity: 0.6,
    fontSize: 10,
  },
  actionButton: {
    marginLeft: 8,
    borderRadius: 10,
  },
  actionButtonContent: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  actionButtonLabel: {
    fontSize: 11,
  },
});

