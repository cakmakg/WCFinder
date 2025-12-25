/**
 * Payment Success Screen
 * 
 * Shows after successful payment with booking details and QR code
 */

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Platform, Share } from 'react-native';
import { 
  Text, 
  Card, 
  Button, 
  Divider, 
  useTheme,
  IconButton,
  Surface
} from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface PaymentSuccessData {
  usageId?: string;
  accessCode?: string;
  businessName?: string;
  toiletName?: string;
  date?: string;
  personCount?: number;
  totalAmount?: number;
}

export default function PaymentSuccessScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { paymentData: paymentDataParam } = useLocalSearchParams<{ paymentData: string }>();
  
  const [paymentData, setPaymentData] = useState<PaymentSuccessData | null>(null);

  useEffect(() => {
    if (paymentDataParam) {
      try {
        const parsed = JSON.parse(paymentDataParam);
        setPaymentData(parsed);
      } catch (err) {
        console.error('Error parsing payment data:', err);
      }
    }
  }, [paymentDataParam]);

  const handleGoToBookings = () => {
    router.replace('/(modals)/my-bookings');
  };

  const handleGoHome = () => {
    router.replace('/(tabs)');
  };

  const handleShare = async () => {
    if (!paymentData?.accessCode) return;
    
    try {
      await Share.share({
        message: `Mein WC-Zugangscode: ${paymentData.accessCode}\n\nBusiness: ${paymentData.businessName || 'N/A'}\nToilette: ${paymentData.toiletName || 'N/A'}`,
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
        {paymentData?.accessCode && (
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
                  {paymentData.accessCode}
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
            
            {paymentData?.businessName && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Business</Text>
                <Text style={styles.detailValue}>{paymentData.businessName}</Text>
              </View>
            )}

            {paymentData?.toiletName && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Toilette</Text>
                <Text style={styles.detailValue}>{paymentData.toiletName}</Text>
              </View>
            )}

            {paymentData?.date && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Datum</Text>
                <Text style={styles.detailValue}>
                  {new Date(paymentData.date).toLocaleDateString('de-DE')}
                </Text>
              </View>
            )}

            {paymentData?.personCount && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Personen</Text>
                <Text style={styles.detailValue}>{paymentData.personCount}</Text>
              </View>
            )}

            {paymentData?.totalAmount && (
              <>
                <Divider style={styles.divider} />
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, styles.totalLabel]}>Gesamt</Text>
                  <Text style={[styles.detailValue, styles.totalValue, { color: theme.colors.primary }]}>
                    € {paymentData.totalAmount.toFixed(2)}
                  </Text>
                </View>
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
});
