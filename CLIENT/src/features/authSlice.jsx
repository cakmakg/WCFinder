// features/authSlice.jsx
import { createSlice } from "@reduxjs/toolkit";

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
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error('Error reading user from localStorage:', error);
    return null;
  }
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
      
      state.currentUser = userData;
      state.token = tokenData;
      state.loading = false;
      
      if (tokenData) {
        localStorage.setItem('token', tokenData);
      }
      if (userData) {
        localStorage.setItem('user', JSON.stringify(userData));
      }
    },

    loginSuccess: (state, { payload }) => {
      const userData = payload.user;
      const tokenData = payload.bearer?.accessToken;
      
      state.currentUser = userData;
      state.token = tokenData;
      state.loading = false;
      
      if (tokenData) {
        localStorage.setItem('token', tokenData);
      }
      if (userData) {
        localStorage.setItem('user', JSON.stringify(userData));
      }
    },

    logoutSuccess: (state) => {
      state.currentUser = null;
      state.token = null;
      state.loading = false;
      
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },

    userUpdateSuccess: (state, { payload }) => {
      state.currentUser = payload.user || payload.data?.user;
      state.loading = false;
      
      if (state.currentUser) {
        localStorage.setItem('user', JSON.stringify(state.currentUser));
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
      localStorage.removeItem('user');
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