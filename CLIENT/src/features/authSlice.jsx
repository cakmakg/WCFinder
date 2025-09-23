import { createSlice } from "@reduxjs/toolkit";

// LocalStorage'dan token'ı oku
const getInitialToken = () => {
  try {
    const token = localStorage.getItem('token');
    console.log('📚 Initial token from localStorage:', token ? 'exists' : 'not found');
    return token;
  } catch (error) {
    console.error('Error reading token from localStorage:', error);
    return null;
  }
};

// LocalStorage'dan user'ı oku
const getInitialUser = () => {
  try {
    const user = localStorage.getItem('user');
    console.log('👤 Initial user from localStorage:', user ? 'exists' : 'not found');
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
  isAdmin: getInitialUser()?.isAdmin || false,
  isOwner: getInitialUser()?.isOwner || false,
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
      console.log('✅ Register success payload:', payload);
      
      // Register response da backend formatına göre güncelle
      const userData = payload.user;
      const tokenData = payload.bearer?.token; // bearer field'ından token al
      
      state.currentUser = userData;
      state.token = tokenData;
      state.loading = false;
      state.isAdmin = userData?.isAdmin || false;
      state.isOwner = userData?.isOwner || false;
      
      // LocalStorage'a kaydet
      if (tokenData) {
        localStorage.setItem('token', tokenData);
        console.log('💾 Register token saved to localStorage');
      }
      if (userData) {
        localStorage.setItem('user', JSON.stringify(userData));
        console.log('💾 Register user saved to localStorage');
      }
    },
    userUpdateSuccess: (state, { payload }) => {
      state.currentUser = payload.user || payload.data?.user;
      state.loading = false;
      
      // LocalStorage'daki user'ı güncelle
      if (state.currentUser) {
        localStorage.setItem('user', JSON.stringify(state.currentUser));
      }
    },
    loginSuccess: (state, { payload }) => {
      console.log('✅ Login success payload:', payload);
      
      // Backend response formatı: { error: false, bearer: { accessToken: "...", refreshToken: "..." }, user: { ... } }
      const userData = payload.user;
      const tokenData = payload.bearer?.accessToken; // BURADA DEĞİŞİKLİK: accessToken
      
      console.log('🔍 Parsed user:', userData);
      console.log('🔍 Parsed token:', tokenData ? tokenData.substring(0, 20) + '...' : 'No token found');
      
      state.currentUser = userData;
      state.token = tokenData;
      state.loading = false;
      state.isAdmin = userData?.isAdmin || false;
      state.isOwner = userData?.isOwner || false;
      
      // LocalStorage'a kaydet
      if (tokenData) {
        localStorage.setItem('token', tokenData);
        console.log('💾 Token saved to localStorage:', tokenData.substring(0, 20) + '...');
      } else {
        console.error('❌ No token found in payload.bearer.accessToken');
        console.error('❌ Available payload keys:', Object.keys(payload));
        if (payload.bearer) {
          console.error('❌ Available bearer keys:', Object.keys(payload.bearer));
        }
      }
      
      if (userData) {
        localStorage.setItem('user', JSON.stringify(userData));
        console.log('💾 User saved to localStorage:', userData.username);
      }
    },
    logoutSuccess: (state) => {
      state.currentUser = null;
      state.token = null;
      state.loading = false;
      state.isAdmin = false;
      state.isOwner = false;
      
      // LocalStorage'ı temizle
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      console.log('🗑️ Token and user removed from localStorage');
    },
    fetchFail: (state) => {
      state.loading = false;
      state.error = true;
    },
    // Token'ı manuel olarak temizlemek için
    clearAuth: (state) => {
      state.currentUser = null;
      state.token = null;
      state.loading = false;
      state.isAdmin = false;
      state.isOwner = false;
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

export default authSlice.reducer;