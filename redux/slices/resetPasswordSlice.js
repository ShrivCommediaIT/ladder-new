// redux/slices/resetPasswordSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { postFormData } from "@/services/apiService";
import { API_ENDPOINTS } from "@/constants/api";

export const resetPassword = createAsyncThunk(
  "resetPassword/change",
  async ({ email, password, id }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);
      formData.append("id", id);

      const data = await postFormData(API_ENDPOINTS.RESET_PASSWORD, formData);
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

const resetPasswordSlice = createSlice({
  name: "resetPassword",
  initialState: {
    loading: false,
    success: false,
    error: null,
    message: "",
  },
  reducers: {
    resetResetPasswordState: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
      state.message = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message =
          action.payload?.message || "Password reset successfully!";
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error =
          action.payload || "Failed to reset password. Try again later!";
      });
  },
});

export const { resetResetPasswordState } = resetPasswordSlice.actions;
export default resetPasswordSlice.reducer;
