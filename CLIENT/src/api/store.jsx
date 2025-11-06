// src/app/store.jsx
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/authSlice";
import crudReducer from "../features/crudSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    crud: crudReducer,
  },
});

// Debug için
if (typeof window !== 'undefined') {
  window.store = store;
}

export default store;