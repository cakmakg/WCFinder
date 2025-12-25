/**
 * Root Layout
 *
 * Main app layout with Redux Provider and navigation
 * Handles initial auth state and routing
 *
 * Features:
 * - Error Boundary for crash prevention
 * - Offline Banner for network status
 * - SecureStore for token management
 * - Stripe integration
 */

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { PaperProvider, Portal } from 'react-native-paper';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { store } from '../src/store/store';
import { setInitialAuth } from '../src/store/slices/authSlice';
import { tokenStorage, userStorage } from '../src/utils/secureStorage';
import ErrorBoundary from '../src/components/common/ErrorBoundary';
import { OfflineBanner } from '../src/components/common/OfflineBanner';
import Constants from 'expo-constants';

// Conditional Stripe import (may not work in Expo Go)
let StripeProvider: any = null;
try {
  const stripeModule = require('@stripe/stripe-react-native');
  StripeProvider = stripeModule.StripeProvider;
} catch (error) {
  console.warn('Stripe React Native not available:', error);
}

export const unstable_settings = {
  initialRouteName: 'index',
};

// Initialize auth state from SecureStore (non-blocking)
const initializeAuth = async () => {
  try {
    const [token, user] = await Promise.all([
      tokenStorage.getAccessToken(),
      userStorage.get(),
    ]);

    console.log('[RootLayout] Initializing auth:', {
      hasToken: !!token,
      hasUser: !!user,
    });

    if (token && user) {
      store.dispatch(setInitialAuth({ token, user }));
    }
  } catch (error) {
    console.error('[RootLayout] Error initializing auth:', error);
  }
};

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  // Initialize auth on mount (non-blocking)
  useEffect(() => {
    initializeAuth();
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(modals)" options={{ presentation: 'modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const stripePublishableKey = Constants.expoConfig?.extra?.stripePublishableKey || '';

  const content = (
    <ErrorBoundary>
      <PaperProvider>
        <Portal.Host>
          <OfflineBanner />
          <RootLayoutNav />
        </Portal.Host>
      </PaperProvider>
    </ErrorBoundary>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        {StripeProvider && stripePublishableKey ? (
          <StripeProvider publishableKey={stripePublishableKey}>
            {content}
          </StripeProvider>
        ) : (
          content
        )}
      </Provider>
    </GestureHandlerRootView>
  );
}
