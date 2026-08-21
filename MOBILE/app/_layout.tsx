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
import { MD3LightTheme, PaperProvider, Portal, configureFonts } from 'react-native-paper';
import { useEffect, useCallback } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { store } from '../src/store/store';
import { setInitialAuth } from '../src/store/slices/authSlice';
import { tokenStorage, userStorage } from '../src/utils/secureStorage';
import ErrorBoundary from '../src/components/common/ErrorBoundary';
import { OfflineBanner } from '../src/components/common/OfflineBanner';
import { colors as tokenColors, fonts as appFonts } from '../src/theme/tokens';
import Constants from 'expo-constants';

// Keep the splash screen visible until the brand font is ready
SplashScreen.preventAutoHideAsync().catch(() => {});

// Conditional Stripe import (may not work in Expo Go)
let StripeProvider: any = null;
try {
  const stripeModule = require('@stripe/stripe-react-native');
  StripeProvider = stripeModule.StripeProvider;
} catch (error) {
  console.warn('Stripe React Native not available:', error);
}

// Custom Paper MD3 theme — Soft Glass tokens (cyan brand + Plus Jakarta Sans).
// Paper is only used for primitives (TextInput, Snackbar, ActivityIndicator).
const paperTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: tokenColors.primary,
    secondary: tokenColors.primaryDark,
  },
  fonts: configureFonts({ config: { fontFamily: appFonts.regular } }),
};

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

    if (__DEV__) {
      console.log('[RootLayout] Initializing auth:', { hasToken: !!token, hasUser: !!user });
    }

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
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded]);

  // `extra.stripePublishableKey` is only present when declared in app config;
  // fall back to the EXPO_PUBLIC_ env vars (a publishable key is safe to inline).
  // Both key names are checked to match whichever the environment defines.
  const stripePublishableKey =
    Constants.expoConfig?.extra?.stripePublishableKey ||
    process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
    process.env.EXPO_PUBLIC_STRIPE_KEY ||
    '';

  if (!fontsLoaded) {
    return null;
  }

  const content = (
    <ErrorBoundary>
      <PaperProvider theme={paperTheme}>
        <Portal.Host>
          <OfflineBanner />
          <RootLayoutNav />
        </Portal.Host>
      </PaperProvider>
    </ErrorBoundary>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <SafeAreaProvider>
        <Provider store={store}>
          {StripeProvider && stripePublishableKey ? (
            <StripeProvider publishableKey={stripePublishableKey}>{content}</StripeProvider>
          ) : (
            content
          )}
        </Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
