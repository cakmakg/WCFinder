/**
 * Modern Booking Panel Component
 *
 * Clean, simple booking interface with modern design
 * Uber/Delivery app inspired layout
 */

import React, { useState } from 'react';
import { View, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import {
  Card,
  Text,
  Button,
  Divider,
  useTheme,
  IconButton,
  Surface,
  Chip
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Business } from '../../services/businessService';
import { Toilet } from '../../services/toiletService';

// Conditional import for DateTimePicker
let DateTimePicker: any = null;
if (Platform.OS !== 'web') {
  try {
    DateTimePicker = require('@react-native-community/datetimepicker').default;
  } catch (error) {
    console.warn('DateTimePicker not available:', error);
  }
}

interface BookingPanelProps {
  business: Business;
  toilets: Toilet[];
  onBookingSubmit: (bookingData: BookingData) => void;
  onFormChange?: (formData: { userGender: string; date: Date; personCount: number }) => void;
  loading?: boolean;
  error?: string | null;
}

export interface BookingData {
  business: {
    id: string;
    name: string;
    address: any;
    location: any;
  };
  toilet: {
    id: string;
    name: string;
    fee: number;
  };
  userGender: string;
  date: string;
  personCount: number;
  pricing: {
    basePrice: number;
    serviceFee: number;
    total: number;
  };
}

export const BookingPanel: React.FC<BookingPanelProps> = ({
  business,
  toilets,
  onBookingSubmit,
  onFormChange,
  loading = false,
  error
}) => {
  const theme = useTheme();
  const [userGender, setUserGender] = useState<string>('');
  const [date, setDate] = useState<Date>(new Date());
  const [personCount, setPersonCount] = useState<number>(1);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Notify parent of form changes
  React.useEffect(() => {
    if (onFormChange) {
      onFormChange({ userGender, date, personCount });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userGender, date, personCount]);

  if (!toilets || toilets.length === 0) {
    return (
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="bodyMedium" style={styles.warningText}>
            No toilets available for booking
          </Text>
        </Card.Content>
      </Card>
    );
  }

  const basePrice = toilets[0]?.fee || 1.00;
  const serviceFee = 0.75;
  const total = (basePrice * personCount) + serviceFee;

  const handleReservation = () => {
    if (!business?._id) {
      return;
    }

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
      userGender,
      date: date.toISOString().split('T')[0], // YYYY-MM-DD format
      personCount,
      pricing: {
        basePrice,
        serviceFee,
        total
      }
    };

    onBookingSubmit(bookingData);
  };

  const formatDate = (date: Date): string => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = days[date.getDay()];
    const month = months[date.getMonth()];
    const dayNum = date.getDate();
    return `${day}, ${dayNum} ${month}`;
  };

  const minDate = new Date();
  minDate.setHours(0, 0, 0, 0);

  return (
    <>
      <Card style={styles.card}>
        <Card.Content style={styles.cardContent}>
          {/* Date Selection */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="calendar" size={20} color={theme.colors.primary} />
          <Text variant="titleMedium" style={styles.sectionTitle}>Date</Text>
        </View>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowDatePicker(true)}
          activeOpacity={0.7}
        >
          <Text variant="bodyLarge" style={styles.dateText}>
            {formatDate(date)}
          </Text>
          <MaterialCommunityIcons name="chevron-down" size={20} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Gender Selection */}
      <View style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>Gender</Text>
        <View style={styles.genderContainer}>
          <Chip
            selected={userGender === 'Male'}
            onPress={() => setUserGender('Male')}
            style={[
              styles.genderChip,
              userGender === 'Male' && styles.genderChipSelected
            ]}
            textStyle={[
              styles.genderChipText,
              userGender === 'Male' && styles.genderChipTextSelected
            ]}
          >
            Male
          </Chip>
          <Chip
            selected={userGender === 'Female'}
            onPress={() => setUserGender('Female')}
            style={[
              styles.genderChip,
              userGender === 'Female' && styles.genderChipSelected
            ]}
            textStyle={[
              styles.genderChipText,
              userGender === 'Female' && styles.genderChipTextSelected
            ]}
          >
            Female
          </Chip>
        </View>
      </View>

      {/* Number of People */}
      <View style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>Number of People</Text>
        <View style={styles.peopleContainer}>
          <IconButton
            icon="minus"
            size={24}
            onPress={() => setPersonCount(Math.max(1, personCount - 1))}
            disabled={personCount <= 1}
            style={styles.peopleButton}
          />
          <Text variant="headlineMedium" style={styles.peopleCount}>
            {personCount}
          </Text>
          <IconButton
            icon="plus"
            size={24}
            onPress={() => setPersonCount(Math.min(10, personCount + 1))}
            disabled={personCount >= 10}
            style={styles.peopleButton}
          />
        </View>
      </View>

      {/* Price Details Card */}
      <Card style={styles.priceCard}>
        <Card.Content>
          <View style={styles.priceRow}>
            <Text variant="bodyMedium" style={styles.priceLabel}>
              € {basePrice.toFixed(2)} × {personCount}
            </Text>
            <Text variant="bodyMedium" style={styles.priceValue}>
              € {(basePrice * personCount).toFixed(2)}
            </Text>
          </View>
          <View style={styles.priceRow}>
            <Text variant="bodyMedium" style={styles.priceLabel}>
              Service Fee
            </Text>
            <Text variant="bodyMedium" style={styles.priceValue}>
              € {serviceFee.toFixed(2)}
            </Text>
          </View>
          <Divider style={styles.divider} />
          <View style={styles.totalRow}>
            <Text variant="titleLarge" style={styles.totalLabel}>
              Total
            </Text>
            <Text variant="titleLarge" style={[styles.totalValue, { color: theme.colors.primary }]}>
              € {total.toFixed(2)}
            </Text>
          </View>
        </Card.Content>
      </Card>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Date Picker */}
      {showDatePicker && Platform.OS !== 'web' && DateTimePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          minimumDate={minDate}
          onChange={(event: any, selectedDate?: Date) => {
            if (Platform.OS === 'android') {
              setShowDatePicker(false);
            }
            if (selectedDate) {
              setDate(selectedDate);
              if (Platform.OS === 'ios') {
                setShowDatePicker(false);
              }
            }
          }}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontWeight: '600',
  },
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  dateText: {
    fontWeight: '600',
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  genderChip: {
    flex: 1,
    height: 48,
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  genderChipSelected: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
  },
  genderChipText: {
    fontSize: 16,
    fontWeight: '600',
  },
  genderChipTextSelected: {
    color: '#2196F3',
  },
  peopleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingVertical: 8,
  },
  peopleButton: {
    margin: 0,
  },
  peopleCount: {
    fontWeight: 'bold',
    minWidth: 60,
    textAlign: 'center',
  },
  priceCard: {
    backgroundColor: '#F8F9FA',
    marginBottom: 24,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  priceLabel: {
    opacity: 0.7,
  },
  priceValue: {
    fontWeight: '600',
  },
  divider: {
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  totalLabel: {
    fontWeight: 'bold',
  },
  totalValue: {
    fontWeight: 'bold',
  },
  errorContainer: {
    backgroundColor: '#fee2e2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#ef4444',
  },
  warningText: {
    opacity: 0.7,
    textAlign: 'center',
  },
  card: {
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: '#fff',
  },
  cardContent: {
    padding: 20,
  },
});
