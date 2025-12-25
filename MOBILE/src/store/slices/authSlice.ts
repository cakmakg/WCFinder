/**
 * Auth Slice for React Native
 *
 * Manages authentication state and user data
 * Uses expo-secure-store for encrypted token storage
 * Uses AsyncStorage for non-sensitive user data
 *
 * Security:
 * - Tokens stored in SecureStore (hardware-backed encryption)
 * - Never stores passwords or sensitive data
 * - Only stores minimal user data (id, username, role)
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { tokenStorage, userStorage, clearAllStorage } from '../../utils/secureStorage';

interface User {
  _id: string;
  username: string;
  role: string;
  isActive?: boolean;
  email?: string;
  firstName?: string;
  lastName?: string;
}

interface AuthState {
  currentUser: User | null;
  loading: boolean;
  error: boolean;
  token: string | null;
}

// Async function to get initial token from SecureStore
const getInitialToken = async (): Promise<string | null> => {
  try {
    const token = await tokenStorage.getAccessToken();
    return token;
  } catch (error) {
    console.error('Error reading token from SecureStore:', error);
    return null;
  }
};

// Async function to get initial user
const getInitialUser = async (): Promise<User | null> => {
  return await userStorage.get();
};

// Initial state - will be updated after async operations
const initialState: AuthState = {
  currentUser: null,
  loading: false,
  error: false,
  token: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    fetchStart: (state) => {
      state.loading = true;
      state.error = false;
    },

    registerSuccess: (state, action: PayloadAction<any>) => {
      const userData = action.payload?.user || action.payload?.data?.user;
      const tokenData = action.payload?.bearer?.accessToken || action.payload?.token;

      // Security: Sanitize user data
      const sanitizedUser: User | null = userData ? {
        _id: userData._id,
        username: userData.username,
        role: userData.role,
        isActive: userData.isActive,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
      } : null;

      state.currentUser = sanitizedUser;
      state.token = tokenData;
      state.loading = false;

      // Store in SecureStore (async operations)
      if (tokenData) {
        tokenStorage.saveAccessToken(tokenData).catch(console.error);
      }
      if (sanitizedUser) {
        userStorage.save(sanitizedUser).catch(console.error);
      }
    },

    loginSuccess: (state, action: PayloadAction<any>) => {
      const userData = action.payload?.user || action.payload?.data?.user;
      const tokenData = action.payload?.bearer?.accessToken || action.payload?.token;

      // Security: Sanitize user data
      const sanitizedUser: User | null = userData ? {
        _id: userData._id,
        username: userData.username,
        role: userData.role,
        isActive: userData.isActive,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
      } : null;

      state.currentUser = sanitizedUser;
      state.token = tokenData;
      state.loading = false;

      // Store in SecureStore (async operations)
      if (tokenData) {
        tokenStorage.saveAccessToken(tokenData).catch(console.error);
      }
      if (sanitizedUser) {
        userStorage.save(sanitizedUser).catch(console.error);
      }
    },

    logoutSuccess: (state) => {
      state.currentUser = null;
      state.token = null;
      state.loading = false;

      // Remove from SecureStore (async operations)
      clearAllStorage().catch(console.error);
    },

    userUpdateSuccess: (state, action: PayloadAction<any>) => {
      const userData = action.payload?.user || action.payload?.data?.user;

      // Security: Sanitize user data
      const sanitizedUser: User | null = userData ? {
        _id: userData._id,
        username: userData.username,
        role: userData.role,
        isActive: userData.isActive,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
      } : null;

      state.currentUser = sanitizedUser;
      state.loading = false;

      if (sanitizedUser) {
        userStorage.save(sanitizedUser).catch(console.error);
      }
    },

    fetchFail: (state) => {
      state.loading = false;
      state.error = true;
    },

    clearAuth: (state) => {
      state.currentUser = null;
      state.token = null;
      state.loading = false;

      // Remove from SecureStore (async operations)
      clearAllStorage().catch(console.error);
    },

    setInitialAuth: (state, action: PayloadAction<{ token: string | null; user: any }>) => {
      state.token = action.payload.token;
      state.currentUser = action.payload.user;
    },
  },
});

export const {
  fetchStart,
  fetchFail,
  registerSuccess,
  loginSuccess,
  logoutSuccess,
  userUpdateSuccess,
  clearAuth,
  setInitialAuth,
} = authSlice.actions;

// Selectors
export const selectIsAdmin = (state: { auth: AuthState }) => state.auth.currentUser?.role === 'admin';
export const selectIsOwner = (state: { auth: AuthState }) => state.auth.currentUser?.role === 'owner';
export const selectIsUser = (state: { auth: AuthState }) => state.auth.currentUser?.role === 'user';

export default authSlice.reducer;

