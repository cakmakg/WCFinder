/**
 * Payment Screen
 * 
 * Handles payment processing after booking
 * Similar to CLIENT PaymentPage
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Platform, Alert } from 'react-native';
import { 
  Text, 
  Card, 
  Button, 
  Divider, 
  ActivityIndicator, 
  useTheme,
  IconButton,
  RadioButton,
  List
} from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSelector } from 'react-redux';
import { BookingData } from '../../src/components/business/BookingPanel';
import api from '../../src/services/api';

export default function PaymentScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { bookingData: bookingDataParam } = useLocalSearchParams<{ bookingData: string }>();
  const { currentUser, token } = useSelector((state: any) => state.auth);
  
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal'>('card');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);

  // Parse booking data from params
  useEffect(() => {
    if (bookingDataParam) {
      try {
        const parsed = JSON.parse(bookingDataParam);
        setBookingData(parsed);
      } catch (err) {
        console.error('Error parsing booking data:', err);
        setError('Invalid booking data');
      }
    }
  }, [bookingDataParam]);

  // Check authentication
  useEffect(() => {
    if (!token && !currentUser) {
      router.replace('/(auth)/login');
    }
  }, [token, currentUser]);

  // Create Stripe payment intent
  const createStripePaymentIntent = async () => {
    if (!bookingData) return;

    try {
      setLoading(true);
      setError(null);

      const bookingDataForPayment = {
        businessId: bookingData.business.id,
        toiletId: bookingData.toilet.id,
        personCount: bookingData.personCount,
        startTime: new Date(bookingData.date).toISOString(),
        genderPreference: bookingData.userGender,
        totalAmount: bookingData.pricing.total,
      };

      const response = await api.post('/payments/stripe/create', {
        bookingData: bookingDataForPayment,
      });

      if (response.data?.result?.clientSecret) {
        setClientSecret(response.data.result.clientSecret);
        setPaymentId(response.data.result.paymentId);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err: any) {
      console.error('Stripe payment error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to create payment');
    } finally {
      setLoading(false);
    }
  };

  const handleBackPress = () => {
    router.back();
  };

  if (!bookingData) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <IconButton
            icon="arrow-left"
            size={24}
            onPress={handleBackPress}
          />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No booking information available</Text>
          <Button onPress={handleBackPress} mode="outlined">
            Go Back
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          size={24}
          onPress={handleBackPress}
        />
        <Text variant="titleLarge" style={styles.headerTitle}>
          Payment
        </Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Order Summary */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Order Summary
            </Text>
            
            <View style={styles.summaryRow}>
              <Text variant="bodyMedium" style={styles.summaryLabel}>
                Business
              </Text>
              <Text variant="bodyMedium" style={styles.summaryValue}>
                {bookingData.business.name}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text variant="bodyMedium" style={styles.summaryLabel}>
                Toilet
              </Text>
              <Text variant="bodyMedium" style={styles.summaryValue}>
                {bookingData.toilet.name}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text variant="bodyMedium" style={styles.summaryLabel}>
                Date
              </Text>
              <Text variant="bodyMedium" style={styles.summaryValue}>
                {new Date(bookingData.date).toLocaleDateString()}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text variant="bodyMedium" style={styles.summaryLabel}>
                People
              </Text>
              <Text variant="bodyMedium" style={styles.summaryValue}>
                {bookingData.personCount}
              </Text>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.priceRow}>
              <Text variant="bodyMedium" style={styles.priceLabel}>
                € {bookingData.pricing.basePrice.toFixed(2)} × {bookingData.personCount}
              </Text>
              <Text variant="bodyMedium" style={styles.priceValue}>
                € {(bookingData.pricing.basePrice * bookingData.personCount).toFixed(2)}
              </Text>
            </View>

            <View style={styles.priceRow}>
              <Text variant="bodyMedium" style={styles.priceLabel}>
                Service Fee
              </Text>
              <Text variant="bodyMedium" style={styles.priceValue}>
                € {bookingData.pricing.serviceFee.toFixed(2)}
              </Text>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.totalRow}>
              <Text variant="titleLarge" style={styles.totalLabel}>
                Total
              </Text>
              <Text variant="titleLarge" style={[styles.totalValue, { color: theme.colors.primary }]}>
                € {bookingData.pricing.total.toFixed(2)}
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Payment Method Selection */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Payment Method
            </Text>

            <RadioButton.Group
              onValueChange={(value) => setPaymentMethod(value as 'card' | 'paypal')}
              value={paymentMethod}
            >
              <List.Item
                title="Credit/Debit Card"
                left={(props) => <List.Icon {...props} icon="credit-card" />}
                right={(props) => (
                  <RadioButton {...props} value="card" />
                )}
                onPress={() => setPaymentMethod('card')}
              />

              <List.Item
                title="PayPal"
                left={(props) => <List.Icon {...props} icon="paypal" />}
                right={(props) => (
                  <RadioButton {...props} value="paypal" />
                )}
                onPress={() => setPaymentMethod('paypal')}
              />
            </RadioButton.Group>
          </Card.Content>
        </Card>

        {error && (
          <Card style={[styles.card, styles.errorCard]}>
            <Card.Content>
              <Text style={styles.errorText}>{error}</Text>
            </Card.Content>
          </Card>
        )}

        {/* Payment Button */}
        <Button
          mode="contained"
          onPress={createStripePaymentIntent}
          style={styles.payButton}
          contentStyle={styles.payButtonContent}
          loading={loading}
          disabled={loading || !!clientSecret}
          icon="lock"
        >
          {loading ? 'Processing...' : clientSecret ? 'Payment Ready' : 'Continue to Payment'}
        </Button>

        {/* Security Badge */}
        <View style={styles.securityBadge}>
          <Text variant="bodySmall" style={[styles.securityText, { color: theme.colors.primary }]}>
            🔒 Secure Payment
          </Text>
        </View>
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
  headerTitle: {
    fontWeight: 'bold',
    marginLeft: 8,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    opacity: 0.7,
  },
  summaryValue: {
    fontWeight: '600',
  },
  divider: {
    marginVertical: 12,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  priceLabel: {
    opacity: 0.7,
  },
  priceValue: {
    fontWeight: '600',
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
  errorCard: {
    backgroundColor: '#fee2e2',
  },
  errorText: {
    color: '#ef4444',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  payButton: {
    marginTop: 8,
    marginBottom: 16,
  },
  payButtonContent: {
    paddingVertical: 8,
  },
  securityBadge: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f0f9ff',
    marginBottom: 32,
  },
  securityText: {
    fontWeight: '600',
  },
});

