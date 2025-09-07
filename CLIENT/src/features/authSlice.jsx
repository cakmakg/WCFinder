import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentUser: null,
  loading: false,
  error: false,
  token: null,
  isAdmin: false, // Added for consistency
  isOwner: false, // Added for your project's logic
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
      state.currentUser = payload.user;
      state.token = payload.token;
      state.loading = false;
      state.isAdmin = payload.user?.isAdmin || false;
      state.isOwner = payload.user?.isOwner || false;
    },
    userUpdateSuccess: (state, { payload }) => {
      state.currentUser = payload.user;
      state.loading = false;
    },
    loginSuccess: (state, { payload }) => {
      state.currentUser = payload.user;
      state.token = payload.token;
      state.loading = false;
      state.isAdmin = payload.user?.isAdmin || false;
      state.isOwner = payload.user?.isOwner || false;
    },
    logoutSuccess: (state) => {
      state.currentUser = null;
      state.token = null;
      state.loading = false;
      state.isAdmin = false;
      state.isOwner = false;
    },
    fetchFail: (state) => {
      state.loading = false;
      state.error = true;
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
} = authSlice.actions;

export default authSlice.reducer;