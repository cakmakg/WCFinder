import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  loading: false,
  error: false,
  // Artık tüm verilerimizi burada, kendi isimleriyle saklayacağız.
  bussiness: [],
  toilets: [],
  // ileride eklenecekler: reviews: [], reservations: [] ...
};

const crudSlice = createSlice({
  name: "crud", // Slice adını "crud" olarak güncelledik
  initialState,
  reducers: {
    fetchStart: (state) => {
      state.loading = true;
      state.error = false;
    },
    /**
     * Genel getSuccess reducer'ı.
     * Hangi state'i güncelleyeceğini payload'dan gelen `url` bilgisine göre belirler.
     */
    getSuccess: (state, { payload }) => {
      state.loading = false;
      // payload.url -> "bussiness", "toilets" vb.
      // state['bussiness'] = payload.data.result
      state[payload.url] = payload.data.result;
    },
    fetchFail: (state) => {
      state.loading = false;
      state.error = true;
    },
  },
});

export const {
  fetchStart,
  getSuccess,
  fetchFail,
} = crudSlice.actions;

export default crudSlice.reducer;