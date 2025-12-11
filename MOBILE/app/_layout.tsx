/**
 * Root Layout
 * 
 * Main app layout with Redux Provider and navigation
 * Handles initial auth state and routing
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserData } from '../src/utils/userStorage';

export const unstable_settings = {
  initialRouteName: 'index',
};

// Initialize auth state from AsyncStorage (non-blocking)
const initializeAuth = async () => {
  try {
    const [token, user] = await Promise.all([
      AsyncStorage.getItem('token'),
      getUserData(),
    ]);
    
    if (token && user) {
      store.dispatch(setInitialAuth({ token, user }));
    }
  } catch (error) {
    console.error('Error initializing auth:', error);
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
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <PaperProvider>
          <Portal.Host>
            <RootLayoutNav />
          </Portal.Host>
        </PaperProvider>
      </Provider>
    </GestureHandlerRootView>
  );
}
