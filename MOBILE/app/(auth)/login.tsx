/**
 * Login Screen
 *
 * User authentication screen with gradient hero
 */

import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { TextInput, Text, ActivityIndicator } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import useAuthCall from '../../src/hooks/useAuthCall';
import { useSnackbar } from '../../src/helper/toastNotify';

const loginSchema = Yup.object({
  email: Yup.string()
    .email('Bitte geben Sie eine gültige E-Mail ein')
    .required('E-Mail ist erforderlich'),
  password: Yup.string().required('Passwort ist erforderlich'),
});

export default function LoginScreen() {
  const { login } = useAuthCall();
  const router = useRouter();
  const { currentUser } = useSelector((state: any) => state.auth);
  const { show, SnackbarComponent } = useSnackbar();

  useEffect(() => {
    if (currentUser) {
      router.replace('/(tabs)');
    }
  }, [currentUser, router]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        {/* Hero Section */}
        <LinearGradient
          colors={['#0891b2', '#0e7490']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name="toilet" size={40} color="#0891b2" />
          </View>
          <Text style={styles.heroTitle}>Willkommen zurück</Text>
          <Text style={styles.heroSubtitle}>Melden Sie sich an</Text>
        </LinearGradient>

        {/* Form Section */}
        <View style={styles.formSection}>
          <Formik
            initialValues={{ email: '', password: '' }}
            validationSchema={loginSchema}
            onSubmit={async (values, actions) => {
              try {
                await login(values);
                actions.resetForm();
              } catch (error: any) {
                show(error.message || 'Login fehlgeschlagen', 'error');
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

                <TextInput
                  label="Kennwort"
                  value={values.password}
                  onChangeText={handleChange('password')}
                  onBlur={handleBlur('password')}
                  secureTextEntry
                  error={touched.password && !!errors.password}
                  style={styles.input}
                  mode="outlined"
                  outlineColor="rgba(8,145,178,0.2)"
                  activeOutlineColor="#0891b2"
                  left={<TextInput.Icon icon="lock-outline" color="#0891b2" />}
                />
                {touched.password && errors.password && (
                  <Text style={styles.errorText}>{errors.password}</Text>
                )}

                <TouchableOpacity
                  onPress={() => handleSubmit()}
                  disabled={isSubmitting}
                  style={[styles.submitButton, isSubmitting && { opacity: 0.7 }]}
                  activeOpacity={0.85}
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
                      <Text style={styles.submitText}>Anmelden</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}
          </Formik>

          <View style={styles.links}>
            <TouchableOpacity
              onPress={() => router.push('/(auth)/forgot-password')}
              style={styles.linkButton}
            >
              <Text style={styles.linkText}>Passwort vergessen?</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/(auth)/register')}
              style={styles.linkButton}
            >
              <Text style={styles.linkText}>
                Noch kein Konto?{' '}
                <Text style={styles.linkTextBold}>Registrieren</Text>
              </Text>
            </TouchableOpacity>
          </View>
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
    paddingTop: 70,
    paddingBottom: 48,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.82)',
    textAlign: 'center',
  },
  formSection: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    padding: 24,
    paddingTop: 32,
  },
  form: {
    marginBottom: 8,
  },
  input: {
    marginBottom: 8,
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
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  links: {
    marginTop: 20,
    alignItems: 'center',
    gap: 8,
  },
  linkButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  linkText: {
    color: '#0891b2',
    fontSize: 14,
  },
  linkTextBold: {
    fontWeight: '700',
  },
});
