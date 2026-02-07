import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "https://ne-games.com/leaderBoard/api/user/change/password";
const APP_KEY =
  "Py9YJXgBecbbqxjRVaHarcSnJyuzhxGqJTkY6xKZRfrdXFy72HPXvFRvfEjy";

// Async thunk
export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async ({ id, old_password, password }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        API_URL,
        { id, old_password, password }, 
        {
          headers: {
            APPKEY: APP_KEY,
          },
        }
      );

      return response.data;
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
      .addCase(changePassword.fulfilled, (state, action) => {
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
