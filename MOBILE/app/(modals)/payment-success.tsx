/**
 * Payment Success Screen
 *
 * Shows after successful payment with green gradient hero and booking details
 */

import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, ScrollView, Platform, Share, Linking, TouchableOpacity } from 'react-native';
import {
  Text,
  Card,
  Button,
  Divider,
  IconButton,
  Surface,
  ActivityIndicator,
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
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
  const router = useRouter();
  const { paymentData: paymentDataParam } = useLocalSearchParams<{ paymentData: string }>();
  const { currentUser } = useSelector((state: any) => state.auth);

  const [paymentData, setPaymentData] = useState<PaymentSuccessData | null>(null);
  const [usageDetails, setUsageDetails] = useState<UsageDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => { isMountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (paymentDataParam) {
      try {
        const parsed = JSON.parse(paymentDataParam);
        setPaymentData(parsed);

        if (parsed.paymentId) {
          fetchUsageDetails(parsed.paymentId);
        } else if (parsed.orderId && parsed.paymentMethod === 'paypal') {
          fetchUsageDetailsByOrderId(parsed.orderId);
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error('Error parsing payment data:', err);
        setError('Ungültige Zahlungsdaten');
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

      const paymentResponse = await api.get(`/payments/${paymentId}`);
      const payment = paymentResponse.data?.result || paymentResponse.data;
      const usageId = payment?.usageId || payment?.metadata?.usageId;

      if (usageId) {
        const usageResponse = await api.get(`/usages/my-usages/${usageId}`);
        const usage = usageResponse.data?.result || usageResponse.data;
        setUsageDetails(usage);
      } else {
        setTimeout(async () => {
          if (!isMountedRef.current) return;
          try {
            const retryPaymentResponse = await api.get(`/payments/${paymentId}`);
            const retryPayment = retryPaymentResponse.data?.result || retryPaymentResponse.data;
            const retryUsageId = retryPayment?.usageId || retryPayment?.metadata?.usageId;
            if (retryUsageId) {
              const retryUsageResponse = await api.get(`/usages/my-usages/${retryUsageId}`);
              const retryUsage = retryUsageResponse.data?.result || retryUsageResponse.data;
              if (isMountedRef.current) setUsageDetails(retryUsage);
            }
          } catch (retryErr) {
            console.error('Error retrying usage fetch:', retryErr);
          } finally {
            if (isMountedRef.current) setLoading(false);
          }
        }, 2000);
        return;
      }
    } catch (err: any) {
      console.error('Error fetching usage details:', err);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsageDetailsByOrderId = async (orderId: string) => {
    try {
      setLoading(true);
      setError(null);

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
          setTimeout(async () => {
            if (!isMountedRef.current) return;
            try {
              const retryPaymentsResponse = await api.get('/payments/my-payments');
              const retryPayments = retryPaymentsResponse.data?.result || retryPaymentsResponse.data || [];
              const retryPayment = retryPayments.find((p: any) => p.paypalOrderId === orderId);
              if (retryPayment) {
                const retryUsageId = retryPayment?.usageId || retryPayment?.metadata?.usageId;
                if (retryUsageId) {
                  const retryUsageResponse = await api.get(`/usages/my-usages/${retryUsageId}`);
                  const retryUsage = retryUsageResponse.data?.result || retryUsageResponse.data;
                  if (isMountedRef.current) setUsageDetails(retryUsage);
                }
              }
            } catch (retryErr) {
              console.error('Error retrying usage fetch:', retryErr);
            } finally {
              if (isMountedRef.current) setLoading(false);
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

    const businessName =
      usageDetails?.business?.businessName ||
      paymentData?.bookingData?.business?.name ||
      paymentData?.businessName ||
      'N/A';
    const toiletName =
      usageDetails?.toilet?.name ||
      paymentData?.bookingData?.toilet?.name ||
      paymentData?.toiletName ||
      'N/A';

    try {
      await Share.share({
        message: `Mein WC-Zugangscode: ${accessCode}\n\nBusiness: ${businessName}\nToilette: ${toiletName}`,
        title: 'WC Zugangscode',
      });
    } catch (shareError) {
      console.error('Error sharing:', shareError);
    }
  };

  return (
    <View style={styles.container}>
      {/* Green Gradient Hero */}
      <LinearGradient
        colors={['#22c55e', '#16a34a']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <TouchableOpacity
          onPress={handleGoHome}
          style={styles.closeButton}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="close" size={24} color="#fff" />
        </TouchableOpacity>

        <View style={styles.successIconCircle}>
          <MaterialCommunityIcons name="check-circle" size={60} color="#22c55e" />
        </View>

        <Text style={styles.heroTitle}>Zahlung erfolgreich!</Text>
        <Text style={styles.heroSubtitle}>Ihre Buchung wurde bestätigt</Text>
      </LinearGradient>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Access Code Card */}
        {(usageDetails?.accessCode || paymentData?.accessCode) && (
          <Card style={[styles.card, styles.accessCodeCard]}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Ihr Zugangscode
              </Text>

              <Surface style={styles.qrPlaceholder} elevation={1}>
                <MaterialCommunityIcons name="qrcode" size={100} color="#22c55e" />
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
                textColor="#22c55e"
                disabled={!usageDetails?.accessCode && !paymentData?.accessCode}
              >
                Code teilen
              </Button>
            </Card.Content>
          </Card>
        )}

        {/* Booking Details Card */}
        <Card style={[styles.card, styles.detailsCard]}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Buchungsdetails
            </Text>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#0891b2" />
                <Text variant="bodySmall" style={styles.loadingText}>
                  Buchungsdetails werden geladen...
                </Text>
              </View>
            ) : (
              <>
                {currentUser && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Kunde</Text>
                    <Text style={styles.detailValue}>
                      {currentUser.username || currentUser.email || '—'}
                    </Text>
                  </View>
                )}

                {(paymentData?.paymentIntentId || (paymentData as any)?.orderId) && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Transaktions-ID</Text>
                    <Text style={[styles.detailValue, styles.monoText]}>
                      {paymentData?.paymentIntentId || (paymentData as any)?.orderId}
                    </Text>
                  </View>
                )}

                {paymentData?.paymentMethod && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Zahlungsmethode</Text>
                    <Text style={styles.detailValue}>
                      {paymentData.paymentMethod === 'card' ? 'Kreditkarte' : 'PayPal'}
                    </Text>
                  </View>
                )}

                {(usageDetails?.business?.businessName || paymentData?.bookingData?.business?.name) && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Business</Text>
                    <Text style={styles.detailValue}>
                      {usageDetails?.business?.businessName || paymentData?.bookingData?.business?.name}
                    </Text>
                  </View>
                )}

                {(usageDetails?.business?.address || paymentData?.bookingData?.business?.address) && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Adresse</Text>
                    <Text
                      style={[styles.detailValue, { textDecorationLine: 'underline', color: '#0891b2' }]}
                      onPress={() => {
                        const coords =
                          usageDetails?.business?.location?.coordinates ||
                          paymentData?.bookingData?.business?.location?.coordinates;
                        if (coords && coords.length === 2) {
                          const lat = coords[1];
                          const lng = coords[0];
                          Linking.openURL(
                            `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
                          );
                        }
                      }}
                    >
                      {usageDetails?.business?.address?.street ||
                        paymentData?.bookingData?.business?.address?.street ||
                        ''},{' '}
                      {usageDetails?.business?.address?.city ||
                        paymentData?.bookingData?.business?.address?.city ||
                        ''}
                    </Text>
                  </View>
                )}

                {(usageDetails?.toilet?.name || paymentData?.bookingData?.toilet?.name) && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Toilette</Text>
                    <Text style={styles.detailValue}>
                      {usageDetails?.toilet?.name || paymentData?.bookingData?.toilet?.name}
                    </Text>
                  </View>
                )}

                {(usageDetails?.startTime || paymentData?.bookingData?.date) && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Datum</Text>
                    <Text style={styles.detailValue}>
                      {new Date(
                        usageDetails?.startTime || paymentData?.bookingData?.date
                      ).toLocaleDateString('de-DE')}
                    </Text>
                  </View>
                )}

                {(usageDetails?.personCount || paymentData?.bookingData?.personCount) && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Personen</Text>
                    <Text style={styles.detailValue}>
                      {usageDetails?.personCount || paymentData?.bookingData?.personCount}
                    </Text>
                  </View>
                )}

                {usageDetails?.genderPreference && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Geschlecht</Text>
                    <Text style={styles.detailValue}>
                      {usageDetails.genderPreference === 'Male'
                        ? 'Männlich'
                        : usageDetails.genderPreference === 'Female'
                        ? 'Weiblich'
                        : usageDetails.genderPreference}
                    </Text>
                  </View>
                )}

                {(usageDetails?.payment?.amount || paymentData?.bookingData?.pricing?.total) && (
                  <>
                    <Divider style={styles.divider} />
                    <View style={styles.detailRow}>
                      <Text style={[styles.detailLabel, styles.totalLabel]}>Gesamt</Text>
                      <Text style={[styles.detailValue, styles.totalValue]}>
                        €{' '}
                        {(usageDetails?.payment?.amount
                          ? usageDetails.payment.amount / 100
                          : paymentData?.bookingData?.pricing?.total || 0
                        ).toFixed(2)}
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
            buttonColor="#0891b2"
            icon="calendar-check"
          >
            Meine Buchungen
          </Button>

          <Button
            mode="outlined"
            onPress={handleGoHome}
            style={styles.secondaryButton}
            contentStyle={styles.buttonContent}
            textColor="#0891b2"
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
    backgroundColor: '#f8fafc',
  },
  hero: {
    paddingTop: Platform.OS === 'ios' ? 60 : 36,
    paddingBottom: 36,
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: 10,
  },
  closeButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 56 : 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255,255,255,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 8,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  card: {
    width: '100%',
    marginBottom: 16,
    borderRadius: 14,
    borderLeftWidth: 3,
  },
  accessCodeCard: {
    borderLeftColor: '#22c55e',
    backgroundColor: '#f0fdf4',
  },
  detailsCard: {
    borderLeftColor: '#0891b2',
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#0f172a',
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
    color: '#0f172a',
  },
  qrHint: {
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 16,
    color: '#64748b',
  },
  shareButton: {
    marginTop: 8,
    borderColor: '#22c55e',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailLabel: {
    opacity: 0.7,
    color: '#64748b',
  },
  detailValue: {
    fontWeight: '600',
    color: '#0f172a',
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  divider: {
    marginVertical: 12,
  },
  totalLabel: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#0f172a',
    opacity: 1,
  },
  totalValue: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#0891b2',
  },
  buttonContainer: {
    width: '100%',
    marginTop: 8,
  },
  primaryButton: {
    marginBottom: 12,
    borderRadius: 12,
  },
  secondaryButton: {
    marginBottom: 24,
    borderRadius: 12,
    borderColor: '#0891b2',
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
    color: '#64748b',
  },
  monoText: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 12,
  },
});
