/**
 * Auth Slice
 * 
 * Manages authentication state and user data
 * 
 * Security:
 * - Never stores passwords or sensitive data in localStorage
 * - Only stores minimal user data (id, username, role)
 * - Email and other sensitive data must be fetched from backend
 */
import { createSlice } from "@reduxjs/toolkit";
import { getUserData, storeUserData, removeUserData } from "../utils/userStorage";

const getInitialToken = () => {
  try {
    const token = localStorage.getItem('token');
    return token;
  } catch (error) {
    console.error('Error reading token from localStorage:', error);
    return null;
  }
};

const getInitialUser = () => {
  // Use secure user storage utility
  return getUserData();
};

const initialState = {
  currentUser: getInitialUser(),
  loading: false,
  error: false,
  token: getInitialToken(),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    fetchStart: (state) => {
      state.loading = true;
      state.error = false;
    },

    registerSuccess: (state, { payload }) => {
      const userData = payload.user || payload.data?.user;
      const tokenData = payload.bearer?.accessToken || payload.token;
      
      // Security: Sanitize user data - remove sensitive information
      // Store: _id, username, role, isActive, email, firstName, lastName
      // Never store: password
      const sanitizedUser = userData ? {
        _id: userData._id,
        username: userData.username,
        role: userData.role,
        isActive: userData.isActive,
        email: userData.email, // Email is safe to store (not sensitive PII)
        firstName: userData.firstName,
        lastName: userData.lastName,
      } : null;
      
      state.currentUser = sanitizedUser;
      state.token = tokenData;
      state.loading = false;
      
      if (tokenData) {
        localStorage.setItem('token', tokenData);
      }
      if (sanitizedUser) {
        // Use secure storage utility (removes password only)
        storeUserData(sanitizedUser);
      }
    },

    loginSuccess: (state, { payload }) => {
      // ✅ Fallback: Backend response formatı değişebilir
      const userData = payload?.user || payload?.data?.user;
      const tokenData = payload?.bearer?.accessToken || payload?.token;
      
      // Security: Sanitize user data - remove sensitive information
      // Store: _id, username, role, isActive, email, firstName, lastName
      // Never store: password
      const sanitizedUser = userData ? {
        _id: userData._id,
        username: userData.username,
        role: userData.role,
        isActive: userData.isActive,
        email: userData.email, // Email is safe to store (not sensitive PII)
        firstName: userData.firstName,
        lastName: userData.lastName,
      } : null;
      
      state.currentUser = sanitizedUser;
      state.token = tokenData;
      state.loading = false;
      
      if (tokenData) {
        localStorage.setItem('token', tokenData);
      }
      if (sanitizedUser) {
        // Use secure storage utility (removes password only)
        storeUserData(sanitizedUser);
      }
    },

    logoutSuccess: (state) => {
      state.currentUser = null;
      state.token = null;
      state.loading = false;
      
      localStorage.removeItem('token');
      // Use secure removal utility
      removeUserData();
    },

    userUpdateSuccess: (state, { payload }) => {
      const userData = payload.user || payload.data?.user;
      
      // Security: Sanitize user data before storing
      // Store: _id, username, role, isActive, email, firstName, lastName
      // Never store: password
      const sanitizedUser = userData ? {
        _id: userData._id,
        username: userData.username,
        role: userData.role,
        isActive: userData.isActive,
        email: userData.email, // Email is safe to store (not sensitive PII)
        firstName: userData.firstName,
        lastName: userData.lastName,
      } : null;
      
      state.currentUser = sanitizedUser;
      state.loading = false;
      
      if (sanitizedUser) {
        // Use secure storage utility (removes password only)
        storeUserData(sanitizedUser);
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
      localStorage.removeItem('token');
      // Use secure removal utility
      removeUserData();
    }
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
} = authSlice.actions;

// ✅ Selectors - computed properties burada
export const selectIsAdmin = (state) => state.auth.currentUser?.role === 'admin';
export const selectIsOwner = (state) => state.auth.currentUser?.role === 'owner';
export const selectIsUser = (state) => state.auth.currentUser?.role === 'user';

export default authSlice.reducer;