/**
 * useAuth Hook
 * 
 * Centralized authentication state and methods
 * Handles token refresh, validation, and logout
 */

import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logoutSuccess, setInitialAuth } from '../store/slices/authSlice';
import api from '../services/api';
import { getUserData } from '../utils/userStorage';

export const useAuth = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { currentUser, token } = useSelector((state: any) => state.auth);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isValidating, setIsValidating] = useState(false);

  // Initialize auth state on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  // Validate token with backend
  const validateToken = async (token: string): Promise<boolean> => {
    try {
      setIsValidating(true);
      const response = await api.get('/auth/me');
      
      if (response.data?.user) {
        // Token is valid, update user data
        const user = response.data.user;
        await AsyncStorage.setItem('token', token);
        dispatch(setInitialAuth({ token, user }));
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Token validation failed:', error);
      // Token is invalid, clear storage
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  // Initialize auth from AsyncStorage
  const initializeAuth = async () => {
    try {
      setIsInitializing(true);
      const [storedToken, storedUser] = await Promise.all([
        AsyncStorage.getItem('token'),
        getUserData(),
      ]);

      if (storedToken && storedUser) {
        // Validate token with backend
        const isValid = await validateToken(storedToken);
        if (!isValid) {
          // Token invalid, redirect to login
          router.replace('/(auth)/login');
        }
      } else {
        // No token, redirect to login
        router.replace('/(auth)/login');
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      router.replace('/(auth)/login');
    } finally {
      setIsInitializing(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Call logout endpoint (optional, backend may not require it)
      try {
        await api.post('/auth/logout');
      } catch (error) {
        // Ignore logout API errors
        console.log('Logout API call failed (non-critical):', error);
      }

      // Clear local storage
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      
      // Update Redux state
      dispatch(logoutSuccess());
      
      // Navigate to login
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, clear local state
      dispatch(logoutSuccess());
      router.replace('/(auth)/login');
    }
  };

  // Check if user is authenticated
  const isAuthenticated = !!currentUser && !!token;

  return {
    currentUser,
    token,
    isAuthenticated,
    isInitializing,
    isValidating,
    logout,
    validateToken,
  };
};

