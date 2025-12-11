/**
 * Login Screen
 * 
 * User authentication screen
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, useTheme } from 'react-native-paper';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import useAuthCall from '../src/hooks/useAuthCall';
import { useSnackbar } from '../src/helper/toastNotify';

const loginSchema = Yup.object({
  email: Yup.string()
    .email("Bitte geben Sie eine gültige E-Mail ein")
    .required("E-Mail ist erforderlich"),
  password: Yup.string().required("Passwort ist erforderlich"),
});

export default function LoginScreen() {
  const { login } = useAuthCall();
  const router = useRouter();
  const theme = useTheme();
  const { currentUser } = useSelector((state: any) => state.auth);
  const { show, SnackbarComponent } = useSnackbar();

  // Redirect if already logged in
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
      >
        <View style={styles.content}>
          <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.primary }]}>
            SIGN IN
          </Text>

          <Formik
            initialValues={{ email: "", password: "" }}
            validationSchema={loginSchema}
            onSubmit={async (values, actions) => {
              try {
                await login(values);
                actions.resetForm();
              } catch (error: any) {
                show(error.message || "Login fehlgeschlagen", 'error');
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
                  {isSubmitting ? 'EINLOGGEN...' : 'EINLOGGEN'}
                </Button>
              </View>
            )}
          </Formik>

          <View style={styles.links}>
            <Button
              mode="text"
              onPress={() => router.push('/forgot-password')}
              style={styles.linkButton}
            >
              Passwort vergessen
            </Button>

            <Button
              mode="text"
              onPress={() => router.push('/register')}
              style={styles.linkButton}
            >
              Don't have an account? Sign Up
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

