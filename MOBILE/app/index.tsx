/**
 * Index Screen - Entry Point
 * 
 * Redirects to login or home based on auth state
 */

import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';

export default function IndexScreen() {
  const router = useRouter();
  const { currentUser, token } = useSelector((state: any) => state.auth);

  useEffect(() => {
    // Small delay to ensure auth state is initialized
    const timer = setTimeout(() => {
      if (currentUser && token) {
        router.replace('/(tabs)');
      } else {
        router.replace('/login');
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [currentUser, token, router]);

  // Show loading while checking auth
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );
}

