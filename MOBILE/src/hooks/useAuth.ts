/**
 * useAuth Hook
 * 
 * Centralized authentication state and methods
 * Handles token refresh, validation, and logout
 */

import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { logoutSuccess, setInitialAuth } from '../store/slices/authSlice';
import api from '../services/api';
import { tokenStorage, userStorage, clearAllStorage } from '../utils/secureStorage';

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

  // Validate token with backend (optional - token validation)
  // Note: Backend doesn't have /auth/me endpoint, so we skip validation
  // Token will be validated on next API call automatically
  const validateToken = async (token: string): Promise<boolean> => {
    try {
      setIsValidating(true);
      
      // If we have token and user data, assume valid
      // Token will be validated on next API call if invalid
      if (token) {
        // Just check if token exists, don't validate with backend
        // Backend will validate token on next API call
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Token validation failed:', error);
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  // Initialize auth from secure storage if Redux doesn't already have it
  const initializeAuth = async () => {
    try {
      setIsInitializing(true);

      // If we already have auth in Redux, don't re-initialize or redirect from here.
      if (currentUser && token) {
        return;
      }

      const [storedToken, storedUser] = await Promise.all([
        tokenStorage.getAccessToken(),
        userStorage.get(),
      ]);

      if (storedToken && storedUser) {
        // Set initial auth state from secure storage; validation happens on next API call
        dispatch(setInitialAuth({ token: storedToken, user: storedUser }));
      } else {
        // Do NOT redirect here — routing decisions should be handled by root/index screens.
        // Avoid causing navigation side-effects when a component mounts (e.g., Profile screen).
        console.debug('[useAuth] No stored auth found in secure storage; skipping redirect in hook.');
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      // Don't redirect here to avoid unexpected navigation while components mount
    } finally {
      setIsInitializing(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Call logout endpoint (optional, backend may not require it)
      try {
        // Server implements logout as GET /auth/logout
        await api.get('/auth/logout');
      } catch (error) {
        // Ignore logout API errors (some backends don't have logout endpoint)
        console.log('Logout API call failed (non-critical):', error);
      }

      // Clear secure storage
      await clearAllStorage();

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

