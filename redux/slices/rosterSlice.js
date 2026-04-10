// redux/slices/rosterSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { postFormData } from "@/services/apiService";
import { API_ENDPOINTS } from "@/constants/api";
import { fetchRosterLeaderboard } from "./rosterLeaderboardSlice";

export const importRoster = createAsyncThunk(
  "roster/importRoster",
  async ({ file, ladder_id }, { dispatch, rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("ladder_id", ladder_id);

      const data = await postFormData(API_ENDPOINTS.IMPORT_ROSTER, formData);

      await dispatch(fetchRosterLeaderboard({ ladder_id, type: "roster" }));
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const rosterSlice = createSlice({
  name: "roster",
  initialState: {
    loading: false,
    importLoading: false,
    data: [],
    gradebars: [],
    ladderDetails: null,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(importRoster.pending, (state) => {
        state.importLoading = true;
        state.error = null;
      })
      .addCase(importRoster.fulfilled, (state, action) => {
        state.importLoading = false;
        state.data = action.payload.data || [];
        state.gradebars = action.payload.gradebars || [];
        state.ladderDetails = action.payload.ladderDetails || null;
      })
      .addCase(importRoster.rejected, (state, action) => {
        state.importLoading = false;
        state.error = action.payload;
      });
  },
});

export default rosterSlice.reducer;
