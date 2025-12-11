/**
 * useAuthCall Hook for React Native
 * 
 * Authentication-specific API calls
 * Handles login, register, and logout
 */

import { useRouter } from 'expo-router';
import { useDispatch } from 'react-redux';
import {
  fetchStart,
  loginSuccess,
  registerSuccess,
  fetchFail,
  logoutSuccess,
} from '../store/slices/authSlice';
import useApiCall from './useApiCall';

/**
 * Masks sensitive data (password) before logging
 */
const maskSensitiveData = (data: any) => {
  if (!data || typeof data !== 'object') return data;
  const safe = { ...data };
  if (safe.password) safe.password = '***REDACTED***';
  return safe;
};

const useAuthCall = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const apiCall = useApiCall();

  const login = async (userInfo: { email: string; password: string }) => {
    console.log("🔐 [useAuthCall] Login called with:", maskSensitiveData(userInfo));
    try {
      console.log("🔐 [useAuthCall] Calling apiCall with url: /auth/login");
      const data = await apiCall({
        url: "/auth/login",
        method: "post",
        body: userInfo,
        startAction: fetchStart,
        successAction: loginSuccess,
        errorAction: fetchFail,
        successMessage: "Giriş işlemi başarılı.",
        requiresAuth: false,
      });
      
      console.log('🔐 Login response:', data);
      
      if (data?.bearer?.accessToken || data?.token) {
        // Navigate to home after successful login
        router.replace('/(tabs)');
      }
      
      return data;
    } catch (error) {
      console.error('❌ Login failed:', error);
      throw error;
    }
  };

  const register = async (userInfo: any) => {
    try {
      const data = await apiCall({
        url: "/users",
        method: "post",
        body: userInfo,
        startAction: fetchStart,
        successAction: registerSuccess,
        errorAction: fetchFail,
        successMessage: "Kayıt işlemi başarılı.",
        requiresAuth: false,
      });
      
      // Navigate to login after successful registration
      router.replace('/login');
      return data;
    } catch (error) {
      console.error('❌ Register failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiCall({
        url: "/auth/logout",
        method: "get",
        startAction: fetchStart,
        successAction: logoutSuccess,
        errorAction: fetchFail,
        successMessage: "Çıkış işlemi başarılı.",
        requiresAuth: true,
      });
    } catch (error) {
      console.error('❌ Logout API failed:', error);
      // Even if API fails, logout locally
      dispatch(logoutSuccess());
    } finally {
      // Navigate to login after logout
      router.replace('/login');
    }
  };

  return { login, register, logout };
};

export default useAuthCall;

