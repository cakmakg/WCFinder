/**
 * Booking Panel Component
 * 
 * Similar to CLIENT BookingPanel
 * Allows users to select gender, date, and person count before booking
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Platform, TouchableOpacity, ScrollView as RNScrollView } from 'react-native';
import { 
  Card, 
  Text, 
  Button, 
  Divider, 
  ActivityIndicator, 
  useTheme,
  Dialog,
  RadioButton
} from 'react-native-paper';
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

const genders = ['Male', 'Female'];
const peopleOptions = Array.from({ length: 10 }, (_, i) => i + 1);

export const BookingPanel: React.FC<BookingPanelProps> = ({ 
  business, 
  toilets, 
  onBookingSubmit,
  loading = false,
  error 
}) => {
  const theme = useTheme();
  const [userGender, setUserGender] = useState<string>('');
  const [date, setDate] = useState<Date>(new Date());
  const [personCount, setPersonCount] = useState<number>(1);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showGenderDialog, setShowGenderDialog] = useState(false);
  const [showPersonDialog, setShowPersonDialog] = useState(false);

  // Debug: Track dialog state changes
  useEffect(() => {
    console.log('[BookingPanel] Gender dialog state changed:', showGenderDialog);
  }, [showGenderDialog]);

  useEffect(() => {
    console.log('[BookingPanel] People dialog state changed:', showPersonDialog);
  }, [showPersonDialog]);

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
    if (!userGender || !date) {
      return;
    }

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
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const minDate = new Date();
  minDate.setHours(0, 0, 0, 0);

  return (
    <>
      <Card style={styles.card}>
        <Card.Content>
          {/* Header */}
          <View style={styles.header}>
            <Text variant="titleLarge" style={styles.title}>
              Booking
            </Text>
            <Text variant="bodySmall" style={styles.subtitle}>
              Select your preferences to continue
            </Text>
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Gender Selection */}
          <View style={styles.inputContainer}>
            <Text variant="bodyMedium" style={styles.label}>
              Gender
            </Text>
          <Button
            mode="outlined"
            onPress={() => {
              console.log('[BookingPanel] Gender button pressed');
              console.log('[BookingPanel] Current showGenderDialog state:', showGenderDialog);
              setShowGenderDialog(true);
              console.log('[BookingPanel] setShowGenderDialog(true) called');
            }}
            style={styles.selectButton}
            contentStyle={styles.selectButtonContent}
            icon="account"
          >
            {userGender ? userGender : 'Select Gender'}
          </Button>
          </View>

          {/* Date Selection */}
          <View style={styles.inputContainer}>
            <Text variant="bodyMedium" style={styles.label}>
              Date
            </Text>
            <Button
              mode="outlined"
              onPress={() => setShowDatePicker(true)}
              style={styles.selectButton}
              contentStyle={styles.selectButtonContent}
              icon="calendar"
            >
              {formatDate(date)}
            </Button>
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
          </View>

          {/* Person Count */}
          <View style={styles.inputContainer}>
            <Text variant="bodyMedium" style={styles.label}>
              Number of People
            </Text>
          <Button
            mode="outlined"
            onPress={() => {
              console.log('[BookingPanel] People button pressed');
              console.log('[BookingPanel] Current showPersonDialog state:', showPersonDialog);
              setShowPersonDialog(true);
              console.log('[BookingPanel] setShowPersonDialog(true) called');
            }}
            style={styles.selectButton}
            contentStyle={styles.selectButtonContent}
            icon="account-group"
          >
            {personCount ? `People: ${personCount}` : 'Number of People'}
          </Button>
          </View>

          {/* Price Breakdown */}
          <View style={styles.priceContainer}>
            <View style={styles.priceRow}>
              <Text variant="bodyMedium" style={styles.priceLabel}>
                € {basePrice.toFixed(2)} × {personCount} {personCount === 1 ? 'Person' : 'People'}
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
          </View>

          {/* Booking Button */}
          <Button
            mode="contained"
            onPress={handleReservation}
            disabled={!userGender || !date || loading}
            style={styles.bookButton}
            contentStyle={styles.bookButtonContent}
            loading={loading}
            icon="lock"
          >
            {loading ? 'Processing...' : 'Continue to Payment'}
          </Button>

          {/* Security Badge */}
          <View style={styles.securityBadge}>
            <Text variant="bodySmall" style={[styles.securityText, { color: theme.colors.primary }]}>
              🔒 Secure Payment
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Gender Dialog - Direct Dialog without Portal for modal compatibility */}
      <Dialog
        visible={showGenderDialog}
        onDismiss={() => {
          console.log('[BookingPanel] Gender dialog dismissed');
          setShowGenderDialog(false);
        }}
        dismissable={true}
        dismissableBackButton={true}
        style={styles.dialog}
      >
        <Dialog.Title>Select Gender</Dialog.Title>
        <Dialog.Content>
          <RadioButton.Group
            onValueChange={(value) => {
              console.log('Gender selected via RadioButton:', value);
              setUserGender(value);
              setShowGenderDialog(false);
            }}
            value={userGender}
          >
            {genders.map((g) => (
              <TouchableOpacity
                key={g}
                style={styles.optionRow}
                onPress={() => {
                  console.log('Gender option pressed:', g);
                  setUserGender(g);
                  setShowGenderDialog(false);
                }}
                activeOpacity={0.7}
              >
                <RadioButton value={g} />
                <Text variant="bodyLarge" style={styles.optionText}>{g}</Text>
              </TouchableOpacity>
            ))}
          </RadioButton.Group>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => {
            console.log('Cancel pressed');
            setShowGenderDialog(false);
          }}>Cancel</Button>
        </Dialog.Actions>
      </Dialog>

      {/* Person Count Dialog - Direct Dialog without Portal for modal compatibility */}
      <Dialog
        visible={showPersonDialog}
        onDismiss={() => {
          console.log('[BookingPanel] People dialog dismissed');
          setShowPersonDialog(false);
        }}
        dismissable={true}
        dismissableBackButton={true}
        style={styles.dialog}
      >
        <Dialog.Title>Number of People</Dialog.Title>
        <Dialog.Content>
          <RNScrollView style={styles.dialogScrollView}>
            <RadioButton.Group
              onValueChange={(value) => {
                const num = Number(value);
                console.log('People selected via RadioButton:', num);
                setPersonCount(num);
                setShowPersonDialog(false);
              }}
              value={personCount.toString()}
            >
              {peopleOptions.map((n) => (
                <TouchableOpacity
                  key={n}
                  style={styles.optionRow}
                  onPress={() => {
                    console.log('People option pressed:', n);
                    setPersonCount(n);
                    setShowPersonDialog(false);
                  }}
                  activeOpacity={0.7}
                >
                  <RadioButton value={n.toString()} />
                  <Text variant="bodyLarge" style={styles.optionText}>{n}</Text>
                </TouchableOpacity>
              ))}
            </RadioButton.Group>
          </RNScrollView>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => {
            console.log('Cancel pressed');
            setShowPersonDialog(false);
          }}>Cancel</Button>
        </Dialog.Actions>
      </Dialog>
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    opacity: 0.7,
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
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontWeight: '600',
  },
  selectButton: {
    marginTop: 4,
  },
  selectButtonContent: {
    paddingVertical: 8,
  },
  priceContainer: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
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
  },
  totalLabel: {
    fontWeight: 'bold',
  },
  totalValue: {
    fontWeight: 'bold',
  },
  bookButton: {
    marginTop: 8,
  },
  bookButtonContent: {
    paddingVertical: 8,
  },
  securityBadge: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f0f9ff',
  },
  securityText: {
    fontWeight: '600',
  },
  warningText: {
    opacity: 0.7,
    textAlign: 'center',
  },
  dialogScrollView: {
    maxHeight: 300,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    minHeight: 48,
    paddingHorizontal: 4,
  },
  optionText: {
    marginLeft: 8,
    flex: 1,
  },
  dialog: {
    zIndex: 9999,
    elevation: 9999,
  },
});
