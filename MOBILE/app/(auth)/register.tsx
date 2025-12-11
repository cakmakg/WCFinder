/**
 * Register Screen
 * 
 * User registration screen
 */

import React from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, useTheme } from 'react-native-paper';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useRouter } from 'expo-router';
import useAuthCall from '../../src/hooks/useAuthCall';
import { useSnackbar } from '../../src/helper/toastNotify';

const registerSchema = Yup.object({
  username: Yup.string()
    .min(3, "Benutzername muss mindestens 3 Zeichen lang sein")
    .required("Benutzername ist erforderlich"),
  email: Yup.string()
    .email("Bitte geben Sie eine gültige E-Mail ein")
    .required("E-Mail ist erforderlich"),
  password: Yup.string()
    .min(6, "Passwort muss mindestens 6 Zeichen lang sein")
    .required("Passwort ist erforderlich"),
  firstName: Yup.string().required("Vorname ist erforderlich"),
  lastName: Yup.string().required("Nachname ist erforderlich"),
});

export default function RegisterScreen() {
  const { register } = useAuthCall();
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
            SIGN UP
          </Text>

          <Formik
            initialValues={{ 
              username: "", 
              email: "", 
              password: "", 
              firstName: "", 
              lastName: "" 
            }}
            validationSchema={registerSchema}
            onSubmit={async (values, actions) => {
              try {
                await register(values);
                actions.resetForm();
                show("Registrierung erfolgreich! Bitte melden Sie sich an.", 'success');
                router.push('/(auth)/login');
              } catch (error: any) {
                show(error.message || "Registrierung fehlgeschlagen", 'error');
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
                  />
                  <TextInput
                    label="Nachname"
                    value={values.lastName}
                    onChangeText={handleChange('lastName')}
                    onBlur={handleBlur('lastName')}
                    error={touched.lastName && !!errors.lastName}
                    style={[styles.input, styles.halfInput]}
                    mode="outlined"
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
                />
                {touched.password && errors.password && (
                  <Text style={styles.errorText}>{errors.password}</Text>
                )}

                <Button
                  mode="contained"
                  onPress={() => handleSubmit()}
                  loading={isSubmitting}
                  disabled={isSubmitting}
                  style={styles.button}
                  contentStyle={styles.buttonContent}
                >
                  {isSubmitting ? 'REGISTRIEREN...' : 'REGISTRIEREN'}
                </Button>
              </View>
            )}
          </Formik>

          <View style={styles.links}>
            <Button
              mode="text"
              onPress={() => router.push('/(auth)/login')}
              style={styles.linkButton}
            >
              Bereits ein Konto? Anmelden
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
    marginBottom: 40,
    fontWeight: 'bold',
  },
  form: {
    marginBottom: 20,
  },
  input: {
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  halfInput: {
    flex: 1,
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

