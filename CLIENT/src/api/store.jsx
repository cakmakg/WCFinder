import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/authSlice";
import crudReducer from "../features/crudSlice"; // DEĞİŞTİ: bussinessSlice -> crudSlice

const store = configureStore({
  reducer: {
    auth: authReducer,
    crud: crudReducer, // DEĞİŞTİ: bussiness -> crud
  },
  devTools: process.env.NODE_ENV !== "production",
});

export default store;