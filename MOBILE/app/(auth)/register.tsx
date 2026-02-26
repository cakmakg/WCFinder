/**
 * Register Screen
 *
 * User registration screen with gradient hero
 */

import React from 'react';
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
import useAuthCall from '../../src/hooks/useAuthCall';
import { useSnackbar } from '../../src/helper/toastNotify';

const registerSchema = Yup.object({
  username: Yup.string()
    .min(3, 'Benutzername muss mindestens 3 Zeichen lang sein')
    .required('Benutzername ist erforderlich'),
  email: Yup.string()
    .email('Bitte geben Sie eine gültige E-Mail ein')
    .required('E-Mail ist erforderlich'),
  password: Yup.string()
    .min(6, 'Passwort muss mindestens 6 Zeichen lang sein')
    .required('Passwort ist erforderlich'),
  firstName: Yup.string().required('Vorname ist erforderlich'),
  lastName: Yup.string().required('Nachname ist erforderlich'),
});

export default function RegisterScreen() {
  const { register } = useAuthCall();
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
          <Text style={styles.heroTitle}>Konto erstellen</Text>
          <Text style={styles.heroSubtitle}>Registrieren Sie sich</Text>
        </LinearGradient>

        {/* Form Section */}
        <View style={styles.formSection}>
          <Formik
            initialValues={{
              username: '',
              email: '',
              password: '',
              firstName: '',
              lastName: '',
            }}
            validationSchema={registerSchema}
            onSubmit={async (values, actions) => {
              try {
                await register(values);
                actions.resetForm();
                show('Registrierung erfolgreich! Bitte melden Sie sich an.', 'success');
                router.push('/(auth)/login');
              } catch (error: any) {
                show(error.message || 'Registrierung fehlgeschlagen', 'error');
              } finally {
                actions.setSubmitting(false);
              }
            }}
          >
            {({ values, handleChange, handleBlur, errors, touched, isSubmitting, handleSubmit }) => (
              <View style={styles.form}>
                <TextInput
                  label="Benutzername"
                  value={values.username}
                  onChangeText={handleChange('username')}
                  onBlur={handleBlur('username')}
                  autoCapitalize="none"
                  error={touched.username && !!errors.username}
                  style={styles.input}
                  mode="outlined"
                  outlineColor="rgba(8,145,178,0.2)"
                  activeOutlineColor="#0891b2"
                  left={<TextInput.Icon icon="account-outline" color="#0891b2" />}
                />
                {touched.username && errors.username && (
                  <Text style={styles.errorText}>{errors.username}</Text>
                )}

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

                <View style={styles.row}>
                  <TextInput
                    label="Vorname"
                    value={values.firstName}
                    onChangeText={handleChange('firstName')}
                    onBlur={handleBlur('firstName')}
                    error={touched.firstName && !!errors.firstName}
                    style={[styles.input, styles.halfInput]}
                    mode="outlined"
                    outlineColor="rgba(8,145,178,0.2)"
                    activeOutlineColor="#0891b2"
                  />
                  <TextInput
                    label="Nachname"
                    value={values.lastName}
                    onChangeText={handleChange('lastName')}
                    onBlur={handleBlur('lastName')}
                    error={touched.lastName && !!errors.lastName}
                    style={[styles.input, styles.halfInput]}
                    mode="outlined"
                    outlineColor="rgba(8,145,178,0.2)"
                    activeOutlineColor="#0891b2"
                  />
                </View>
                {(touched.firstName && errors.firstName) || (touched.lastName && errors.lastName) ? (
                  <Text style={styles.errorText}>
                    {errors.firstName || errors.lastName}
                  </Text>
                ) : null}

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
                      <Text style={styles.submitText}>Registrieren</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}
          </Formik>

          <View style={styles.links}>
            <TouchableOpacity
              onPress={() => router.push('/(auth)/login')}
              style={styles.linkButton}
            >
              <Text style={styles.linkText}>
                Bereits ein Konto?{' '}
                <Text style={styles.linkTextBold}>Anmelden</Text>
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
    paddingTop: 60,
    paddingBottom: 40,
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
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  halfInput: {
    flex: 1,
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
