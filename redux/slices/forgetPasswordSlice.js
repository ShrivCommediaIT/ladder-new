
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// API endpoint
const API_URL = "https://ne-games.com/leaderBoard/api/user/forgot/password";
const APP_KEY =
  "Py9YJXgBecbbqxjRVaHarcSnJyuzhxGqJTkY6xKZRfrdXFy72HPXvFRvfEjy";

// Async thunk → Reset link bhejne ke liye
export const forgotPassword = createAsyncThunk(
  "forgotPassword/request",
  async (email, { rejectWithValue }) => {
    try {
      const response = await axios.get(API_URL, {
        params: { email },
        headers: {
          APPKEY: APP_KEY,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.response?.data ||
          "Something went wrong, please try again"
      );
    }
  }
);

const forgotPasswordSlice = createSlice({
  name: "forgotPassword",
  initialState: {
    loading: false,
    success: false,
    error: null,
    message: "",
  },
  reducers: {
    resetForgotPasswordState: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
      state.message = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message =
          action.payload?.message || "Password reset link sent successfully!";
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error =
          action.payload || "Failed to send password reset link. Try again!";
      });
  },
});

export const { resetForgotPasswordState } = forgotPasswordSlice.actions;
export default forgotPasswordSlice.reducer;
