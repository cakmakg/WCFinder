/**
 * Forgot Password Screen
 * 
 * Password reset request screen
 */

import React from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, useTheme } from 'react-native-paper';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useRouter } from 'expo-router';
import { useSnackbar } from '../../src/helper/toastNotify';
import api from '../../src/services/api';

const forgotPasswordSchema = Yup.object({
  email: Yup.string()
    .email("Bitte geben Sie eine gültige E-Mail ein")
    .required("E-Mail ist erforderlich"),
});

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const theme = useTheme();
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
        <View style={styles.content}>
          <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.primary }]}>
            Passwort zurücksetzen
          </Text>

          <Text variant="bodyMedium" style={styles.description}>
            Geben Sie Ihre E-Mail-Adresse ein und wir senden Ihnen einen Link zum Zurücksetzen des Passworts.
          </Text>

          <Formik
            initialValues={{ email: "" }}
            validationSchema={forgotPasswordSchema}
            onSubmit={async (values, actions) => {
              try {
                await api.post('/auth/forgot-password', { email: values.email });
                show("E-Mail zum Zurücksetzen des Passworts wurde gesendet.", 'success');
                actions.resetForm();
                setTimeout(() => {
                  router.push('/(auth)/login');
                }, 2000);
              } catch (error: any) {
                show(error.response?.data?.message || "Fehler beim Senden der E-Mail", 'error');
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
                />
                {touched.email && errors.email && (
                  <Text style={styles.errorText}>{errors.email}</Text>
                )}

                <Button
                  mode="contained"
                  onPress={() => handleSubmit()}
                  loading={isSubmitting}
                  disabled={isSubmitting}
                  style={styles.button}
                  contentStyle={styles.buttonContent}
                >
                  {isSubmitting ? 'SENDEN...' : 'LINK SENDEN'}
                </Button>
              </View>
            )}
          </Formik>

          <View style={styles.links}>
            <Button
              mode="text"
              onPress={() => router.back()}
              style={styles.linkButton}
            >
              Zurück zur Anmeldung
            </Button>
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
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: 'bold',
  },
  description: {
    textAlign: 'center',
    marginBottom: 32,
    opacity: 0.7,
  },
  form: {
    marginBottom: 20,
  },
  input: {
    marginBottom: 8,
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 12,
    marginBottom: 8,
    marginLeft: 12,
  },
  button: {
    marginTop: 16,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  links: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkButton: {
    marginVertical: 4,
  },
});

