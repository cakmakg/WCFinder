/**
 * Forgot Password Screen
 *
 * Password reset request screen with gradient hero
 */

import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { TextInput, Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useRouter } from 'expo-router';
import { useSnackbar } from '../../src/helper/toastNotify';
import api from '../../src/services/api';

const forgotPasswordSchema = Yup.object({
  email: Yup.string()
    .email('Bitte geben Sie eine gültige E-Mail ein')
    .required('E-Mail ist erforderlich'),
});

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { show, SnackbarComponent } = useSnackbar();

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Gradient Hero */}
        <LinearGradient
          colors={['#0891b2', '#0e7490']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name="lock-reset" size={36} color="#0891b2" />
          </View>
          <Text style={styles.heroTitle}>Passwort zurücksetzen</Text>
          <Text style={styles.heroSubtitle}>
            Geben Sie Ihre E-Mail-Adresse ein und wir senden Ihnen einen Link zum Zurücksetzen.
          </Text>
        </LinearGradient>

        {/* Form Card */}
        <View style={styles.formCard}>
          <Formik
            initialValues={{ email: '' }}
            validationSchema={forgotPasswordSchema}
            onSubmit={async (values, actions) => {
              try {
                await api.post('/auth/forgot-password', { email: values.email });
                show('E-Mail zum Zurücksetzen des Passworts wurde gesendet.', 'success');
                actions.resetForm();
                setTimeout(() => {
                  router.push('/(auth)/login');
                }, 2000);
              } catch (error: any) {
                show(
                  error.response?.data?.message || 'Fehler beim Senden der E-Mail',
                  'error'
                );
              } finally {
                actions.setSubmitting(false);
              }
            }}
          >
            {({ values, handleChange, handleBlur, errors, touched, isSubmitting, handleSubmit }) => (
              <View style={styles.form}>
                <TextInput
                  label="E-Mail-Adresse"
                  value={values.email}
                  onChangeText={handleChange('email')}
                  onBlur={handleBlur('email')}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  error={touched.email && !!errors.email}
                  style={styles.input}
                  mode="outlined"
                  outlineColor="rgba(8,145,178,0.2)"
                  activeOutlineColor="#0891b2"
                  left={<TextInput.Icon icon="email-outline" color="#0891b2" />}
                />
                {touched.email && errors.email && (
                  <Text style={styles.errorText}>{errors.email}</Text>
                )}

                <TouchableOpacity
                  onPress={() => handleSubmit()}
                  disabled={isSubmitting}
                  activeOpacity={0.85}
                  style={[styles.submitButton, isSubmitting && { opacity: 0.7 }]}
                >
                  <LinearGradient
                    colors={['#0891b2', '#0e7490']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.submitGradient}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <Text style={styles.submitLabel}>Link senden</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}
          </Formik>

          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backLink}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="arrow-left" size={16} color="#0891b2" />
            <Text style={styles.backLinkText}>Zurück zur Anmeldung</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <SnackbarComponent />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    flexGrow: 1,
  },
  hero: {
    paddingTop: 80,
    paddingBottom: 48,
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    lineHeight: 20,
  },
  formCard: {
    margin: 20,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    elevation: 3,
    shadowColor: '#0891b2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  form: {
    marginBottom: 4,
  },
  input: {
    marginBottom: 6,
    backgroundColor: '#fff',
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 12,
    marginBottom: 8,
    marginLeft: 12,
  },
  submitButton: {
    marginTop: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  submitGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  submitLabel: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 20,
    paddingVertical: 8,
  },
  backLinkText: {
    color: '#0891b2',
    fontWeight: '600',
    fontSize: 14,
  },
});
