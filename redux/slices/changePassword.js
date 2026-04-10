// redux/slices/changePassword.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { postRequest } from "@/services/apiService";
import { API_ENDPOINTS } from "@/constants/api";

export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async ({ id, old_password, password }, { rejectWithValue }) => {
    try {
      const data = await postRequest(API_ENDPOINTS.CHANGE_PASSWORD, {
        id,
        old_password,
        password,
      });
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Something went wrong, please try again"
      );
    }
  }
);

const changePasswordSlice = createSlice({
  name: "changePassword",
  initialState: {
    loading: false,
    success: false,
    error: null,
    message: "",
  },
  reducers: {
    resetChangePasswordState: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
      state.message = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload || "Failed to change password";
      });
  },
});

export const { resetChangePasswordState } = changePasswordSlice.actions;
export default changePasswordSlice.reducer;
