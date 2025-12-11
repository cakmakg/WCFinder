/**
 * Index Screen - Entry Point
 * 
 * Redirects to login or home based on auth state
 */

import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserData } from '../src/utils/userStorage';

export default function IndexScreen() {
  const router = useRouter();
  const { currentUser, token } = useSelector((state: any) => state.auth);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if we have token and user in storage
        const [storedToken, storedUser] = await Promise.all([
          AsyncStorage.getItem('token'),
          getUserData(),
        ]);

        // Small delay to ensure Redux state is updated
        await new Promise(resolve => setTimeout(resolve, 500));

        // Check Redux state or storage
        if ((currentUser && token) || (storedToken && storedUser)) {
          router.replace('/(tabs)');
        } else {
          router.replace('/(auth)/login');
        }
      } catch (error) {
        console.error('Auth check error:', error);
        router.replace('/(auth)/login');
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, []);

  // Show loading while checking auth
  if (isChecking) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // This should not be reached, but just in case
  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});

