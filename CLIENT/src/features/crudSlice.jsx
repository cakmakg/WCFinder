import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  loading: false,
  error: false,
  // Backend route'larına uygun isimlendirme - DEĞİŞTİ
  business: [],  // Backend: /business (businesses değil!)
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
        processedData = data.result; // Backend'iniz result field'ında veriyi döndürüyor
      } else if (Array.isArray(data)) {
        processedData = data;
      } else {
        processedData = [];
      }
      
      console.log('📦 Processing data for URL:', url, 'Data length:', processedData.length);
      
      // URL'den state field'ını belirle
      const stateField = getStateFieldFromUrl(url);
      if (stateField && state.hasOwnProperty(stateField)) {
        state[stateField] = processedData;
        console.log('✅ Data saved to state field:', stateField);
      } else {
        console.warn(`❌ Bilinmeyen URL: ${url}, Available fields:`, Object.keys(state));
      }
    },
    fetchFail: (state) => {
      state.loading = false;
      state.error = true;
    },
  },
});

// URL'den state field adını belirleyen fonksiyon - DEĞİŞTİ
const getStateFieldFromUrl = (url) => {
  const cleanUrl = url.replace(/^\/+|\/+$/g, '');
  
  // Backend route'larınıza göre mapping - DÜZELTME!
  const urlMapping = {
    'business': 'business',  // businesses DEĞİL, business!
    'toilet': 'toilet', 
    'users': 'users',
  };
  
  return urlMapping[cleanUrl] || cleanUrl;
};

export const { fetchStart, getSuccess, fetchFail } = crudSlice.actions;
export default crudSlice.reducer;