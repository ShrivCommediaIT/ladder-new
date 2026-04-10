// redux/slices/forgetPasswordSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getRequest } from "@/services/apiService";
import { API_ENDPOINTS } from "@/constants/api";

export const forgotPassword = createAsyncThunk(
  "forgotPassword/request",
  async (email, { rejectWithValue }) => {
    try {
      const data = await getRequest(API_ENDPOINTS.FORGOT_PASSWORD, { email });
      return data;
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
