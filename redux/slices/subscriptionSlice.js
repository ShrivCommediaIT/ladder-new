// redux/slices/subscriptionSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { postRequest } from "@/services/apiService";
import { API_ENDPOINTS } from "@/constants/api";

export const buySubscription = createAsyncThunk(
  "subscription/buySubscription",
  async (
    { user_id, no_of_users, subscription_type, amount, transaction_id, transaction_status },
    { rejectWithValue }
  ) => {
    try {
      const data = await postRequest(API_ENDPOINTS.BUY_SUBSCRIPTION, {
        user_id,
        no_of_users,
        subscription_type,
        amount,
        transaction_id,
        transaction_status,
      });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const subscriptionSlice = createSlice({
  name: "subscription",
  initialState: { loading: false, error: null, data: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(buySubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(buySubscription.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(buySubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default subscriptionSlice.reducer;
