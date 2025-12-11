/**
 * Toilet List Component
 * 
 * Displays list of toilets for a business
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Chip, useTheme } from 'react-native-paper';
import { Toilet } from '../../services/toiletService';

interface ToiletListProps {
  toilets: Toilet[];
}

export const ToiletList: React.FC<ToiletListProps> = ({ toilets }) => {
  const theme = useTheme();

  if (!toilets || toilets.length === 0) {
    return null;
  }

  const formatFee = (fee: number): string => {
    if (fee === 0) return 'Kostenlos';
    return `€${fee.toFixed(2)}`;
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'available':
        return theme.colors.primary;
      case 'in_use':
        return theme.colors.error;
      case 'out_of_order':
        return theme.colors.error;
      default:
        return theme.colors.onSurface;
    }
  };

  const getStatusBackgroundColor = (status: string): string => {
    const color = getStatusColor(status);
    // Convert color to rgba with opacity
    // Extract RGB values from theme color
    if (color.startsWith('#')) {
      // Hex color - convert to rgba
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, 0.2)`;
    }
    // If already rgba, modify opacity
    if (color.startsWith('rgba')) {
      const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (match) {
        return `rgba(${match[1]}, ${match[2]}, ${match[3]}, 0.2)`;
      }
    }
    // Fallback
    return color + '33'; // Add opacity in hex format
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'available':
        return 'Verfügbar';
      case 'in_use':
        return 'Besetzt';
      case 'out_of_order':
        return 'Außer Betrieb';
      default:
        return status;
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="titleLarge" style={styles.title}>
        Verfügbare Toiletten
      </Text>

      {toilets.map((toilet) => (
        <Card key={toilet._id} style={styles.toiletCard} mode="outlined">
          <Card.Content>
            <View style={styles.toiletHeader}>
              <View style={styles.toiletInfo}>
                <Text variant="titleMedium" style={styles.toiletName}>
                  {toilet.name}
                </Text>
              </View>
              <Text variant="titleMedium" style={[styles.toiletPrice, { color: theme.colors.primary }]}>
                {formatFee(toilet.fee)}
              </Text>
            </View>

            <View style={styles.chipContainer}>
              <Chip
                icon="check-circle"
                style={[styles.chip, { backgroundColor: getStatusBackgroundColor(toilet.status) }]}
                textStyle={{ color: getStatusColor(toilet.status) }}
              >
                {getStatusLabel(toilet.status)}
              </Chip>

              {toilet.features?.isAccessible && (
                <Chip
                  icon="wheelchair-accessibility"
                  style={styles.chip}
                  mode="outlined"
                >
                  Barrierefrei
                </Chip>
              )}

              {toilet.features?.hasBabyChangingStation && (
                <Chip
                  icon="baby-face-outline"
                  style={styles.chip}
                  mode="outlined"
                >
                  Wickeltisch
                </Chip>
              )}
            </View>
          </Card.Content>
        </Card>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  toiletCard: {
    marginBottom: 12,
  },
  toiletHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  toiletInfo: {
    flex: 1,
    marginRight: 8,
  },
  toiletName: {
    fontWeight: '600',
  },
  toiletPrice: {
    fontWeight: '600',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    marginRight: 8,
    marginBottom: 4,
  },
});

