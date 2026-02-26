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
  IconButton,
  RadioButton,
  List,
  TextInput
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
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
  const [cardError, setCardError] = useState<string | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [cardholderName, setCardholderName] = useState('');
  const [cardholderSurname, setCardholderSurname] = useState('');
  const [billingEmail, setBillingEmail] = useState('');

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
        setError('Ungültige Buchungsdaten');
      }
    }
  }, [bookingDataParam]);

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = await tokenStorage.getAccessToken();

      if (!token && !storedToken && !currentUser) {
        router.replace('/(auth)/login');
      }
    };

    checkAuth();
  }, [token, currentUser]);

  // Handle card payment confirmation
  const handleCardPayment = async () => {
    if (!clientSecret || !cardDetails?.complete) {
      setError('Bitte gültige Kartendaten eingeben');
      return;
    }

    try {
      setProcessingPayment(true);
      setError(null);

      // Validate billing details
      if (!cardholderName.trim()) {
        setError('Bitte geben Sie Ihren Vornamen ein');
        return;
      }
      if (!cardholderSurname.trim()) {
        setError('Bitte geben Sie Ihren Nachnamen ein');
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!billingEmail.trim() || !emailRegex.test(billingEmail)) {
        setError('Bitte geben Sie eine gültige E-Mail-Adresse ein');
        return;
      }

      const { error: confirmError, paymentIntent } = await confirmPayment(clientSecret, {
        paymentMethodType: 'Card',
        billingDetails: {
          name: `${cardholderName.trim()} ${cardholderSurname.trim()}`.trim(),
          email: billingEmail.trim(),
        },
      });

      if (confirmError) {
        setError(confirmError.message || 'Zahlung fehlgeschlagen');
        return;
      }

      if (paymentIntent?.status === 'Succeeded') {
        // Navigate to payment success with booking data and payment info
        router.replace({
          pathname: '/(modals)/payment-success',
          params: {
            paymentData: JSON.stringify({
              paymentIntentId: paymentIntent.id,
              paymentId: paymentId,
              bookingData: bookingData,
              paymentMethod: 'card',
            }),
          },
        });
      }
    } catch (err: any) {
      setError(err.message || 'Zahlung fehlgeschlagen');
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
      setError('Bitte melden Sie sich an, um fortzufahren');
      router.replace('/(auth)/login');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Ensure date is properly formatted
      if (!bookingData.date) {
        throw new Error('Buchungsdatum fehlt');
      }
      const parsedDate = bookingData.date instanceof Date
        ? bookingData.date
        : new Date(bookingData.date);
      if (isNaN(parsedDate.getTime())) {
        throw new Error('Ungültiges Buchungsdatum');
      }
      const startTime = parsedDate.toISOString();

      // Ensure totalAmount is a number
      const totalAmount = typeof bookingData.pricing.total === 'string'
        ? parseFloat(bookingData.pricing.total)
        : Number(bookingData.pricing.total);

      if (isNaN(totalAmount) || totalAmount <= 0) {
        throw new Error(`Ungültiger Gesamtbetrag: ${bookingData.pricing.total}`);
      }

      const bookingDataForPayment = {
        businessId: bookingData.business.id,
        toiletId: bookingData.toilet.id,
        personCount: bookingData.personCount || 1,
        startTime,
        genderPreference: bookingData.userGender || 'Male',
        totalAmount,
      };

      const response = await api.post('/payments/stripe/create', {
        bookingData: bookingDataForPayment,
      });

      if (response.data?.result?.clientSecret) {
        setClientSecret(response.data.result.clientSecret);
        setPaymentId(response.data.result.paymentId);
      } else {
        throw new Error('Ungültige Antwort vom Server');
      }
    } catch (err: any) {
      // Handle 401 Unauthorized
      if (err.response?.status === 401) {
        setError('Authentifizierung fehlgeschlagen. Bitte erneut anmelden.');
        setTimeout(() => {
          router.replace('/(auth)/login');
        }, 2000);
      } else if (err.response?.status === 409) {
        setError('Für diese Buchung existiert bereits eine Zahlung. Bitte prüfen Sie Ihre Buchungen.');
      } else if (err.response?.status === 502) {
        setError('Der Zahlungsdienst ist vorübergehend nicht verfügbar. Bitte später erneut versuchen oder PayPal verwenden.');
      } else if (err.response?.status === 500) {
        const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Serverfehler aufgetreten';
        setError(`Zahlung fehlgeschlagen: ${errorMessage}. Bitte erneut versuchen oder Support kontaktieren.`);
      } else {
        setError(err.response?.data?.message || err.response?.data?.error || err.message || 'Zahlung konnte nicht erstellt werden');
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
        <LinearGradient
          colors={['#0891b2', '#0e7490']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <IconButton
            icon="arrow-left"
            size={24}
            onPress={handleBackPress}
            iconColor="#fff"
          />
        </LinearGradient>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Keine Buchungsinformationen verfügbar</Text>
          <Button onPress={handleBackPress} mode="outlined">
            Zurück
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#0891b2', '#0e7490']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <IconButton
          icon="arrow-left"
          size={24}
          onPress={handleBackPress}
          iconColor="#fff"
        />
        <Text variant="titleLarge" style={styles.headerTitle}>
          Zahlung
        </Text>
      </LinearGradient>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Order Summary */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Bestellübersicht
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
                Toilette
              </Text>
              <Text variant="bodyMedium" style={styles.summaryValue}>
                {bookingData.toilet.name}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text variant="bodyMedium" style={styles.summaryLabel}>
                Datum
              </Text>
              <Text variant="bodyMedium" style={styles.summaryValue}>
                {new Date(bookingData.date).toLocaleDateString('de-DE')}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text variant="bodyMedium" style={styles.summaryLabel}>
                Personen
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
                Servicegebühr
              </Text>
              <Text variant="bodyMedium" style={styles.priceValue}>
                € {bookingData.pricing.serviceFee.toFixed(2)}
              </Text>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.totalRow}>
              <Text variant="titleLarge" style={styles.totalLabel}>
                Gesamt
              </Text>
              <Text variant="titleLarge" style={[styles.totalValue, { color: '#0891b2' }]}>
                € {bookingData.pricing.total.toFixed(2)}
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Payment Method Selection */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Zahlungsmethode
            </Text>

            <RadioButton.Group
              onValueChange={(value) => setPaymentMethod(value as 'card' | 'paypal')}
              value={paymentMethod}
            >
              <List.Item
                title="Kredit-/Debitkarte"
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
                Kartenzahlung
              </Text>

              {CardField && stripe ? (
                <>
                  {/* Cardholder Name */}
                  <TextInput
                    style={styles.textInput}
                    label="Vorname"
                    value={cardholderName}
                    onChangeText={setCardholderName}
                    mode="outlined"
                    autoCapitalize="words"
                  />

                  {/* Cardholder Surname */}
                  <TextInput
                    style={styles.textInput}
                    label="Nachname"
                    value={cardholderSurname}
                    onChangeText={setCardholderSurname}
                    mode="outlined"
                    autoCapitalize="words"
                  />

                  {/* Billing Email */}
                  <TextInput
                    style={styles.textInput}
                    label="E-Mail"
                    value={billingEmail}
                    onChangeText={setBillingEmail}
                    mode="outlined"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />

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
                    onCardChange={(details: any) => {
                      setCardDetails(details);
                      if (details.complete) {
                        setCardError(null);
                      } else if (details.validNumber === 'Invalid') {
                        setCardError('Ungültige Kartennummer');
                      } else if (details.validExpiryDate === 'Invalid') {
                        setCardError('Ungültiges Ablaufdatum');
                      } else if (details.validCVC === 'Invalid') {
                        setCardError('Ungültiger Sicherheitscode (CVC)');
                      } else {
                        setCardError(null);
                      }
                    }}
                  />

                  {cardError && (
                    <Text style={styles.cardError}>{cardError}</Text>
                  )}

                  <Button
                    mode="contained"
                    buttonColor="#0891b2"
                    onPress={handleCardPayment}
                    style={styles.confirmButton}
                    contentStyle={styles.confirmButtonContent}
                    loading={processingPayment}
                    disabled={!cardDetails?.complete || !cardholderName.trim() || !cardholderSurname.trim() || !billingEmail.trim() || processingPayment}
                    icon="lock"
                  >
                    {processingPayment ? 'Verarbeitung...' : `€ ${bookingData.pricing.total.toFixed(2)} Jetzt bezahlen`}
                  </Button>
                </>
              ) : (
                <View>
                  <Text variant="bodyMedium" style={styles.infoText}>
                    Kartenzahlung erfordert einen Development Build. Bitte verwenden Sie PayPal oder kontaktieren Sie den Support.
                  </Text>
                  <Text variant="bodySmall" style={styles.infoSubtext}>
                    Stripe-Kartenzahlung ist in Expo Go nicht verfügbar. Bitte erstellen Sie die App mit EAS Build, um Kartenzahlungen zu nutzen.
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
                PayPal-Zahlung
              </Text>
              <Text variant="bodyMedium" style={styles.infoText}>
                PayPal-Zahlung ist derzeit in Entwicklung. Bitte kontaktieren Sie den Support, um Ihre Buchung abzuschließen.
              </Text>
            </Card.Content>
          </Card>
        )}

        {/* Payment Button */}
        {!clientSecret ? (
          <Button
            mode="contained"
            buttonColor="#0891b2"
            onPress={async () => {
              // Route to proper payment flow depending on selected payment method
              if (paymentMethod === 'card') {
                await createStripePaymentIntent();
              } else if (paymentMethod === 'paypal') {
                // If PayPal is selected, call PayPal create endpoint instead of Stripe
                try {
                  setLoading(true);
                  setError(null);

                  if (!token) {
                    setError('Bitte melden Sie sich an, um fortzufahren');
                    router.replace('/(auth)/login');
                    return;
                  }

                  // Ensure date is properly formatted
                  if (!bookingData.date) {
                    setError('Buchungsdatum fehlt');
                    setLoading(false);
                    return;
                  }
                  const parsedDatePaypal = bookingData.date instanceof Date
                    ? bookingData.date
                    : new Date(bookingData.date);
                  if (isNaN(parsedDatePaypal.getTime())) {
                    setError('Ungültiges Buchungsdatum');
                    setLoading(false);
                    return;
                  }
                  const startTime = parsedDatePaypal.toISOString();

                  // Ensure totalAmount is a number
                  const totalAmount = typeof bookingData.pricing.total === 'string'
                    ? parseFloat(bookingData.pricing.total)
                    : Number(bookingData.pricing.total);

                  if (isNaN(totalAmount) || totalAmount <= 0) {
                    setError(`Ungültiger Gesamtbetrag: ${bookingData.pricing.total}`);
                    setLoading(false);
                    return;
                  }

                  const bookingDataForPayment = {
                    businessId: bookingData.business.id,
                    toiletId: bookingData.toilet.id,
                    personCount: bookingData.personCount || 1,
                    startTime,
                    genderPreference: bookingData.userGender || 'Male',
                    totalAmount,
                  };

                  const response = await api.post('/payments/paypal/create', {
                    bookingData: bookingDataForPayment,
                  });

                  const orderId = response.data?.result?.orderId;
                  const paypalPaymentId = response.data?.result?.paymentId;

                  if (orderId) {
                    // Navigate to payment success with booking data and PayPal info
                    router.replace({
                      pathname: '/(modals)/payment-success',
                      params: {
                        paymentData: JSON.stringify({
                          orderId: orderId,
                          paymentId: paypalPaymentId,
                          bookingData: bookingData,
                          paymentMethod: 'paypal',
                        }),
                      },
                    });
                  } else {
                    throw new Error('Ungültige Antwort vom Server');
                  }
                } catch (err: any) {
                  if (err.response?.status === 401) {
                    setError('Authentifizierung fehlgeschlagen. Bitte erneut anmelden.');
                    setTimeout(() => {
                      router.replace('/(auth)/login');
                    }, 2000);
                  } else if (err.response?.status === 500) {
                    const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Serverfehler aufgetreten';
                    let userMessage = `PayPal-Zahlung fehlgeschlagen: ${errorMessage}`;

                    if (errorMessage.includes('PayPal configuration') || errorMessage.includes('PAYPAL_CLIENT_ID')) {
                      userMessage += '\n\nBitte kontaktieren Sie den Support. PayPal ist nicht korrekt konfiguriert.';
                    } else if (errorMessage.includes('Business not found')) {
                      userMessage += '\n\nDas ausgewählte Business wurde nicht gefunden. Bitte erneut versuchen.';
                    } else if (errorMessage.includes('Invalid totalAmount')) {
                      userMessage += '\n\nUngültiger Zahlungsbetrag. Bitte erneut versuchen.';
                    } else {
                      userMessage += '\n\nBitte erneut versuchen oder Support kontaktieren.';
                    }

                    setError(userMessage);
                  } else if (err.response?.status === 502) {
                    setError('Der Zahlungsdienst ist vorübergehend nicht verfügbar. Bitte später erneut versuchen.');
                  } else {
                    setError(err.response?.data?.message || err.response?.data?.error || err.message || 'PayPal-Bestellung konnte nicht erstellt werden');
                  }
                } finally {
                  setLoading(false);
                }
              }
            }}
            style={styles.payButton}
            contentStyle={styles.payButtonContent}
            loading={loading}
            disabled={loading}
            icon={paymentMethod === 'paypal' ? 'wallet' : 'credit-card'}
          >
            {loading
              ? 'Verarbeitung...'
              : paymentMethod === 'paypal'
                ? `Mit PayPal bezahlen – €${bookingData.pricing.total.toFixed(2)}`
                : 'Weiter zur Zahlung'}
          </Button>
        ) : (
          <View style={styles.paymentReadyContainer}>
            <Text variant="bodyMedium" style={[styles.paymentReadyText, { color: '#0891b2' }]}>
              ✓ Zahlungsvorgang erfolgreich initialisiert
            </Text>
            <Text variant="bodySmall" style={styles.paymentReadySubtext}>
              Bitte wählen Sie oben eine Zahlungsmethode aus
            </Text>
          </View>
        )}

        {/* Security Badge */}
        <View style={styles.securityBadge}>
          <Text variant="bodySmall" style={[styles.securityText, { color: '#0891b2' }]}>
            🔒 Sichere Zahlung
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingHorizontal: 8,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
  },
  headerTitle: {
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    borderRadius: 14,
    borderLeftWidth: 3,
    borderLeftColor: '#0891b2',
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
    borderLeftColor: '#ef4444',
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
    borderRadius: 12,
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
  textInput: {
    marginBottom: 16,
  },
});
