/**
 * Payment Screen
 * 
 * Handles payment processing after booking
 * Similar to CLIENT PaymentPage
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Platform, Alert, TextInput } from 'react-native';
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
// Conditional Stripe import (may not work in Expo Go)
let useStripe: any = null;
let CardField: any = null;
try {
  const stripeModule = require('@stripe/stripe-react-native');
  useStripe = stripeModule.useStripe;
  CardField = stripeModule.CardField;
} catch (error) {
  console.warn('Stripe React Native not available:', error);
}
import { BookingData } from '../../src/components/business/BookingPanel';
import api from '../../src/services/api';
import { tokenStorage } from '../../src/utils/secureStorage';

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
  const [cardDetails, setCardDetails] = useState<any>(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  
  const stripe = useStripe ? useStripe() : null;
  const confirmPayment = stripe?.confirmPayment;

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
    const checkAuth = async () => {
      const storedToken = await tokenStorage.getAccessToken();
      console.log('[Payment] Auth check:', {
        hasToken: !!token,
        hasStoredToken: !!storedToken,
        hasCurrentUser: !!currentUser
      });

      if (!token && !storedToken && !currentUser) {
        console.log('[Payment] No auth found, redirecting to login');
        router.replace('/(auth)/login');
      }
    };

    checkAuth();
  }, [token, currentUser]);

  // Handle card payment confirmation
  const handleCardPayment = async () => {
    if (!clientSecret || !cardDetails?.complete) {
      setError('Please enter valid card details');
      return;
    }

    try {
      setProcessingPayment(true);
      setError(null);

      console.log('[Payment] Confirming card payment...');

      const { error: confirmError, paymentIntent } = await confirmPayment(clientSecret, {
        paymentMethodType: 'Card',
      });

      if (confirmError) {
        console.error('[Payment] Card payment error:', confirmError);
        setError(confirmError.message || 'Payment failed');
        return;
      }

      if (paymentIntent?.status === 'Succeeded') {
        console.log('[Payment] Payment succeeded:', paymentIntent.id);
        Alert.alert(
          'Payment Successful',
          'Your payment has been processed successfully!',
          [
            {
              text: 'OK',
              onPress: () => {
                // Navigate to bookings or home
                router.replace('/(tabs)' as any);
              },
            },
          ]
        );
      }
    } catch (err: any) {
      console.error('[Payment] Card payment error:', err);
      setError(err.message || 'Payment failed');
    } finally {
      setProcessingPayment(false);
    }
  };

  // Create Stripe payment intent
  const createStripePaymentIntent = async () => {
    if (!bookingData) return;

    // Prevent double submission
    if (loading || clientSecret) {
      return;
    }

    // Check authentication
    if (!token) {
      setError('Please login to continue with payment');
      router.replace('/(auth)/login');
      return;
    }

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

      console.log('[Payment] Creating Stripe payment intent...', {
        businessId: bookingDataForPayment.businessId,
        hasToken: !!token,
      });

      const response = await api.post('/payments/stripe/create', {
        bookingData: bookingDataForPayment,
      });

      console.log('[Payment] Stripe payment intent response:', {
        hasClientSecret: !!response.data?.result?.clientSecret,
        hasPaymentId: !!response.data?.result?.paymentId,
      });

      if (response.data?.result?.clientSecret) {
        setClientSecret(response.data.result.clientSecret);
        setPaymentId(response.data.result.paymentId);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err: any) {
      console.error('[Payment] Stripe payment error:', err);
      
      // Handle 401 Unauthorized
      if (err.response?.status === 401) {
        setError('Authentication failed. Please login again.');
        // Clear storage and redirect to login
        setTimeout(() => {
          router.replace('/(auth)/login');
        }, 2000);
      } else if (err.response?.status === 409) {
        // Handle duplicate payment (409 Conflict)
        setError('A payment for this booking already exists. Please check your bookings.');
      } else {
        setError(err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to create payment');
      }
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
                left={() => <List.Icon icon="credit-card-outline" />}
                right={() => <RadioButton value="card" />}
                onPress={() => setPaymentMethod('card')}
              />

              <List.Item
                title="PayPal"
                left={() => <List.Icon icon="wallet-outline" />}
                right={() => <RadioButton value="paypal" />}
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

        {/* Card Payment Form - Show when card is selected and clientSecret exists */}
        {clientSecret && paymentMethod === 'card' && (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Card Payment
              </Text>
              
              {CardField && stripe ? (
                <>
                  <CardField
                    postalCodeEnabled={false}
                    placeholders={{
                      number: '4242 4242 4242 4242',
                    }}
                    cardStyle={{
                      backgroundColor: '#FFFFFF',
                      textColor: '#000000',
                      borderWidth: 1,
                      borderColor: '#E0E0E0',
                      borderRadius: 8,
                    }}
                    style={styles.cardField}
                    onCardChange={(cardDetails: any) => {
                      setCardDetails(cardDetails);
                      // CardField doesn't expose error in Details type, handle validation separately
                      if (!cardDetails.complete && cardDetails.number) {
                        // Card is incomplete but user has started typing
                        setError(null);
                      } else if (cardDetails.complete) {
                        setError(null);
                      }
                    }}
                  />

                  {error && (
                    <Text style={styles.cardError}>{error}</Text>
                  )}

                  <Button
                    mode="contained"
                    onPress={handleCardPayment}
                    style={styles.confirmButton}
                    contentStyle={styles.confirmButtonContent}
                    loading={processingPayment}
                    disabled={!cardDetails?.complete || processingPayment}
                    icon="lock"
                  >
                    {processingPayment ? 'Processing...' : 'Pay €' + bookingData.pricing.total.toFixed(2)}
                  </Button>
                </>
              ) : (
                <View>
                  <Text variant="bodyMedium" style={styles.infoText}>
                    Card payment requires a development build. Please use PayPal or contact support.
                  </Text>
                  <Text variant="bodySmall" style={styles.infoSubtext}>
                    Stripe card payment is not available in Expo Go. Please build the app with EAS Build to use card payments.
                  </Text>
                </View>
              )}
            </Card.Content>
          </Card>
        )}

        {/* PayPal Payment Info - Show when PayPal is selected and clientSecret exists */}
        {clientSecret && paymentMethod === 'paypal' && (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                PayPal Payment
              </Text>
              <Text variant="bodyMedium" style={styles.infoText}>
                PayPal payment integration is in development. Please contact support to complete your booking.
              </Text>
            </Card.Content>
          </Card>
        )}

        {/* Payment Button */}
        {!clientSecret ? (
          <Button
            mode="contained"
            onPress={createStripePaymentIntent}
            style={styles.payButton}
            contentStyle={styles.payButtonContent}
            loading={loading}
            disabled={loading}
            icon="lock"
          >
            {loading ? 'Processing...' : 'Continue to Payment'}
          </Button>
        ) : (
          <View style={styles.paymentReadyContainer}>
            <Text variant="bodyMedium" style={[styles.paymentReadyText, { color: theme.colors.primary }]}>
              ✓ Payment intent created successfully
            </Text>
            <Text variant="bodySmall" style={styles.paymentReadySubtext}>
              Please select a payment method above to proceed
            </Text>
          </View>
        )}

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
  infoText: {
    marginBottom: 8,
    opacity: 0.8,
  },
  infoSubtext: {
    marginTop: 4,
    opacity: 0.6,
    fontStyle: 'italic',
  },
  paymentReadyContainer: {
    backgroundColor: '#f0f9ff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  paymentReadyText: {
    fontWeight: '600',
    marginBottom: 4,
  },
  paymentReadySubtext: {
    opacity: 0.7,
    textAlign: 'center',
  },
  cardField: {
    width: '100%',
    height: 50,
    marginVertical: 16,
  },
  cardError: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 8,
  },
  confirmButton: {
    marginTop: 16,
  },
  confirmButtonContent: {
    paddingVertical: 8,
  },
});

