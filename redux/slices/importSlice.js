// redux/slices/importSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { postFormData } from "@/services/apiService";
import { API_ENDPOINTS } from "@/constants/api";

export const importUsers = createAsyncThunk(
  "import/importUsers",
  async (formData, { rejectWithValue }) => {
    try {
      const data = await postFormData(API_ENDPOINTS.IMPORT_MINILEAGUE, formData);
      return data;
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
