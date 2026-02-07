// redux/slices/importSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const APPKEY = "Py9YJXgBecbbqxjRVaHarcSnJyuzhxGqJTkY6xKZRfrdXFy72HPXvFRvfEjy"

// Async thunk to handle CSV/bulk import
export const importUsers = createAsyncThunk(
  "import/importUsers",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        // "https://ne-games.com/leaderBoard/api/user/import",
        "https://ne-games.com/leaderBoard/api/user/importminileague",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            "APPKEY": APPKEY,
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Import failed. Please try again."
      );
    }
  }
);

const importSlice = createSlice({
  name: "import",
  initialState: {
    loading: false,
    success: false,
    error: null,
    response: null,
  },
  reducers: {
    resetImportState: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
      state.response = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(importUsers.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(importUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.response = action.payload;
      })
      .addCase(importUsers.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload;
      });
  },
});

export const { resetImportState } = importSlice.actions;
export default importSlice.reducer;
