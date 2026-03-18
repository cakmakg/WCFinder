import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  loading: false,
  error: false,
  // Backend route'larına uygun isimlendirme
  business: [],  // Backend: /business
  toilet: [],    // Backend: /toilet
  users: [],     // Backend: /users
};

const crudSlice = createSlice({
  name: "crud",
  initialState,
  reducers: {
    fetchStart: (state) => {
      state.loading = true;
      state.error = false;
    },
    getSuccess: (state, { payload }) => {
      state.loading = false;
      state.error = false;

      const { url, data } = payload;

      // Backend'den gelen data yapısını kontrol et
      let processedData;
      if (data && data.result) {
        processedData = data.result;
      } else if (Array.isArray(data)) {
        processedData = data;
      } else {
        processedData = [];
      }

      // URL'den state field'ını belirle
      const stateField = getStateFieldFromUrl(url);
      if (stateField && Object.prototype.hasOwnProperty.call(state, stateField)) {
        state[stateField] = processedData;
        if (import.meta.env.DEV) {
          console.log(`✅ Saved ${processedData.length} items to state.${stateField}`);
        }
      } else {
        if (import.meta.env.DEV) console.error('❌ Invalid state field:', stateField);
      }
    },
    fetchFail: (state) => {
      state.loading = false;
      state.error = true;
    },
  },
});

// URL'den state field adını belirleyen fonksiyon
const getStateFieldFromUrl = (url) => {
  const cleanUrl = url.replace(/^\/+|\/+$/g, '');

  // Backend route'larınıza göre mapping
  const urlMapping = {
    'business': 'business',
    'toilets': 'toilet',
    'toilet': 'toilet',
    'users': 'users',
  };

  return urlMapping[cleanUrl] || cleanUrl;
};

export const { fetchStart, getSuccess, fetchFail } = crudSlice.actions;
export default crudSlice.reducer;
