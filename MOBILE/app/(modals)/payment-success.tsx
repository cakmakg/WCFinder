/**
 * Payment Success Screen
 * 
 * Shows after successful payment with booking details and QR code
 */

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Platform, Share, Linking } from 'react-native';
import { 
  Text, 
  Card, 
  Button, 
  Divider, 
  useTheme,
  IconButton,
  Surface,
  ActivityIndicator
} from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import api from '../../src/services/api';

interface PaymentSuccessData {
  paymentIntentId?: string;
  paymentId?: string;
  bookingData?: any;
  paymentMethod?: string;
  usageId?: string;
  accessCode?: string;
  businessName?: string;
  toiletName?: string;
  date?: string;
  personCount?: number;
  totalAmount?: number;
}

interface UsageDetails {
  _id: string;
  accessCode: string;
  business?: {
    _id: string;
    businessName: string;
    address?: any;
    location?: any;
  };
  toilet?: {
    _id: string;
    name: string;
  };
  startTime: string;
  personCount: number;
  genderPreference: string;
  payment?: {
    amount: number;
    currency: string;
    paymentMethod: string;
  };
}

export default function PaymentSuccessScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { paymentData: paymentDataParam } = useLocalSearchParams<{ paymentData: string }>();
  const { currentUser } = useSelector((state: any) => state.auth);
  
  const [paymentData, setPaymentData] = useState<PaymentSuccessData | null>(null);
  const [usageDetails, setUsageDetails] = useState<UsageDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (paymentDataParam) {
      try {
        const parsed = JSON.parse(paymentDataParam);
        setPaymentData(parsed);
        
        // Fetch usage details if paymentId is available
        if (parsed.paymentId) {
          fetchUsageDetails(parsed.paymentId);
        } else if (parsed.orderId && parsed.paymentMethod === 'paypal') {
          // For PayPal, find payment by orderId
          fetchUsageDetailsByOrderId(parsed.orderId);
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error('Error parsing payment data:', err);
        setError('Invalid payment data');
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, [paymentDataParam]);

  const fetchUsageDetails = async (paymentId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // First, get payment details to find usageId
      const paymentResponse = await api.get(`/payments/${paymentId}`);
      const payment = paymentResponse.data?.result || paymentResponse.data;
      
      const usageId = payment?.usageId || payment?.metadata?.usageId;
      
      if (usageId) {
        // Fetch usage details
        const usageResponse = await api.get(`/usages/my-usages/${usageId}`);
        const usage = usageResponse.data?.result || usageResponse.data;
        setUsageDetails(usage);
      } else {
        // Usage might not be created yet, wait a bit and retry
        setTimeout(async () => {
          try {
            const retryPaymentResponse = await api.get(`/payments/${paymentId}`);
            const retryPayment = retryPaymentResponse.data?.result || retryPaymentResponse.data;
            const retryUsageId = retryPayment?.usageId || retryPayment?.metadata?.usageId;
            
            if (retryUsageId) {
              const retryUsageResponse = await api.get(`/usages/my-usages/${retryUsageId}`);
              const retryUsage = retryUsageResponse.data?.result || retryUsageResponse.data;
              setUsageDetails(retryUsage);
            }
          } catch (retryErr) {
            console.error('Error retrying usage fetch:', retryErr);
          } finally {
            setLoading(false);
          }
        }, 2000);
        return;
      }
    } catch (err: any) {
      console.error('Error fetching usage details:', err);
      // Don't show error, usage might not be created yet
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsageDetailsByOrderId = async (orderId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Find payment by PayPal orderId
      const paymentsResponse = await api.get('/payments/my-payments');
      const payments = paymentsResponse.data?.result || paymentsResponse.data || [];
      const payment = payments.find((p: any) => p.paypalOrderId === orderId);
      
      if (payment) {
        const usageId = payment?.usageId || payment?.metadata?.usageId;
        if (usageId) {
          const usageResponse = await api.get(`/usages/my-usages/${usageId}`);
          const usage = usageResponse.data?.result || usageResponse.data;
          setUsageDetails(usage);
        } else {
          // Wait and retry
          setTimeout(async () => {
            try {
              const retryPaymentsResponse = await api.get('/payments/my-payments');
              const retryPayments = retryPaymentsResponse.data?.result || retryPaymentsResponse.data || [];
              const retryPayment = retryPayments.find((p: any) => p.paypalOrderId === orderId);
              if (retryPayment) {
                const retryUsageId = retryPayment?.usageId || retryPayment?.metadata?.usageId;
                if (retryUsageId) {
                  const retryUsageResponse = await api.get(`/usages/my-usages/${retryUsageId}`);
                  const retryUsage = retryUsageResponse.data?.result || retryUsageResponse.data;
                  setUsageDetails(retryUsage);
                }
              }
            } catch (retryErr) {
              console.error('Error retrying usage fetch:', retryErr);
            } finally {
              setLoading(false);
            }
          }, 2000);
          return;
        }
      }
    } catch (err: any) {
      console.error('Error fetching usage details by orderId:', err);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  const handleGoToBookings = () => {
    router.replace('/(modals)/my-bookings');
  };

  const handleGoHome = () => {
    router.replace('/(tabs)');
  };

  const handleShare = async () => {
    const accessCode = usageDetails?.accessCode || paymentData?.accessCode;
    if (!accessCode) return;
    
    const businessName = usageDetails?.business?.businessName || 
                        paymentData?.bookingData?.business?.name || 
                        paymentData?.businessName || 
                        'N/A';
    const toiletName = usageDetails?.toilet?.name || 
                      paymentData?.bookingData?.toilet?.name || 
                      paymentData?.toiletName || 
                      'N/A';
    
    try {
      await Share.share({
        message: `Mein WC-Zugangscode: ${accessCode}\n\nBusiness: ${businessName}\nToilette: ${toiletName}`,
        title: 'WC Zugangscode',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <IconButton
          icon="close"
          size={24}
          onPress={handleGoHome}
        />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Success Icon */}
        <View style={styles.successIcon}>
          <MaterialCommunityIcons 
            name="check-circle" 
            size={80} 
            color={theme.colors.primary} 
          />
        </View>

        <Text variant="headlineMedium" style={styles.successTitle}>
          Zahlung erfolgreich!
        </Text>
        
        <Text variant="bodyLarge" style={styles.successSubtitle}>
          Ihre Buchung wurde bestätigt
        </Text>

        {/* Access Code Card */}
        {(usageDetails?.accessCode || paymentData?.accessCode) && (
          <Card style={[styles.card, styles.accessCodeCard]}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Ihr Zugangscode
              </Text>
              
              <Surface style={styles.qrPlaceholder} elevation={1}>
                <MaterialCommunityIcons 
                  name="qrcode" 
                  size={100} 
                  color={theme.colors.primary} 
                />
                <Text variant="headlineSmall" style={styles.accessCode}>
                  {usageDetails?.accessCode || paymentData?.accessCode}
                </Text>
              </Surface>

              <Text variant="bodySmall" style={styles.qrHint}>
                Zeigen Sie diesen Code beim Eingang
              </Text>

              <Button
                mode="outlined"
                onPress={handleShare}
                style={styles.shareButton}
                icon="share-variant"
                disabled={!usageDetails?.accessCode && !paymentData?.accessCode}
              >
                Code teilen
              </Button>
            </Card.Content>
          </Card>
        )}

        {/* Booking Details Card */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Buchungsdetails
            </Text>
            
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
                <Text variant="bodySmall" style={styles.loadingText}>
                  Loading booking details...
                </Text>
              </View>
            ) : (
              <>
                {/* Customer Name */}
                {currentUser && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Kunde</Text>
                    <Text style={styles.detailValue}>
                      {currentUser.username || currentUser.email || '—'}
                    </Text>
                  </View>
                )}

                {/* Transaction ID */}
                {(paymentData?.paymentIntentId || paymentData?.orderId) && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Transaktions-ID</Text>
                    <Text style={[styles.detailValue, styles.monoText]}>
                      {paymentData.paymentIntentId || paymentData.orderId}
                    </Text>
                  </View>
                )}

                {/* Payment Method */}
                {paymentData?.paymentMethod && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Zahlungsmethode</Text>
                    <Text style={styles.detailValue}>
                      {paymentData.paymentMethod === 'card' ? 'Kreditkarte' : 'PayPal'}
                    </Text>
                  </View>
                )}

                {/* Business Name */}
                {(usageDetails?.business?.businessName || paymentData?.bookingData?.business?.name) && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Business</Text>
                    <Text style={styles.detailValue}>
                      {usageDetails?.business?.businessName || paymentData?.bookingData?.business?.name}
                    </Text>
                  </View>
                )}

                {/* Address */}
                {(usageDetails?.business?.address || paymentData?.bookingData?.business?.address) && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Adresse</Text>
                    <Text 
                      style={[styles.detailValue, { textDecorationLine: 'underline', color: theme.colors.primary }]}
                      onPress={() => {
                        const coords = usageDetails?.business?.location?.coordinates || 
                                     paymentData?.bookingData?.business?.location?.coordinates;
                        if (coords && coords.length === 2) {
                          const lat = coords[1];
                          const lng = coords[0];
                          Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`);
                        }
                      }}
                    >
                      {usageDetails?.business?.address?.street || paymentData?.bookingData?.business?.address?.street || ''}, {' '}
                      {usageDetails?.business?.address?.city || paymentData?.bookingData?.business?.address?.city || ''}
                    </Text>
                  </View>
                )}

                {/* Toilet Name */}
                {(usageDetails?.toilet?.name || paymentData?.bookingData?.toilet?.name) && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Toilette</Text>
                    <Text style={styles.detailValue}>
                      {usageDetails?.toilet?.name || paymentData?.bookingData?.toilet?.name}
                    </Text>
                  </View>
                )}

                {/* Date */}
                {(usageDetails?.startTime || paymentData?.bookingData?.date) && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Datum</Text>
                    <Text style={styles.detailValue}>
                      {new Date(usageDetails?.startTime || paymentData?.bookingData?.date).toLocaleDateString('de-DE')}
                    </Text>
                  </View>
                )}

                {/* Person Count */}
                {(usageDetails?.personCount || paymentData?.bookingData?.personCount) && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Personen</Text>
                    <Text style={styles.detailValue}>
                      {usageDetails?.personCount || paymentData?.bookingData?.personCount}
                    </Text>
                  </View>
                )}

                {/* Gender Preference */}
                {usageDetails?.genderPreference && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Geschlecht</Text>
                    <Text style={styles.detailValue}>
                      {usageDetails.genderPreference === 'Male' ? 'Männlich' : usageDetails.genderPreference === 'Female' ? 'Weiblich' : usageDetails.genderPreference}
                    </Text>
                  </View>
                )}

                {/* Total Amount */}
                {(usageDetails?.payment?.amount || paymentData?.bookingData?.pricing?.total) && (
                  <>
                    <Divider style={styles.divider} />
                    <View style={styles.detailRow}>
                      <Text style={[styles.detailLabel, styles.totalLabel]}>Gesamt</Text>
                      <Text style={[styles.detailValue, styles.totalValue, { color: theme.colors.primary }]}>
                        € {((usageDetails?.payment?.amount || paymentData?.bookingData?.pricing?.total) / 100 || paymentData?.bookingData?.pricing?.total || 0).toFixed(2)}
                      </Text>
                    </View>
                  </>
                )}
              </>
            )}
          </Card.Content>
        </Card>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={handleGoToBookings}
            style={styles.primaryButton}
            contentStyle={styles.buttonContent}
            icon="calendar-check"
          >
            Meine Buchungen
          </Button>

          <Button
            mode="outlined"
            onPress={handleGoHome}
            style={styles.secondaryButton}
            contentStyle={styles.buttonContent}
            icon="home"
          >
            Zur Startseite
          </Button>
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
    justifyContent: 'flex-end',
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  successIcon: {
    marginBottom: 16,
  },
  successTitle: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  successSubtitle: {
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: 24,
  },
  card: {
    width: '100%',
    marginBottom: 16,
  },
  accessCodeCard: {
    backgroundColor: '#f0f9ff',
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  qrPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#fff',
    marginBottom: 12,
  },
  accessCode: {
    fontWeight: 'bold',
    marginTop: 12,
    letterSpacing: 2,
  },
  qrHint: {
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 16,
  },
  shareButton: {
    marginTop: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailLabel: {
    opacity: 0.7,
  },
  detailValue: {
    fontWeight: '600',
  },
  divider: {
    marginVertical: 12,
  },
  totalLabel: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  totalValue: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  buttonContainer: {
    width: '100%',
    marginTop: 8,
  },
  primaryButton: {
    marginBottom: 12,
  },
  secondaryButton: {
    marginBottom: 24,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 8,
    opacity: 0.7,
  },
  monoText: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 12,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 8,
    opacity: 0.7,
  },
  monoText: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 12,
  },
});
