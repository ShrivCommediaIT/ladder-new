import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { fetchRosterLeaderboard } from "./rosterLeaderboardSlice";


const APPKEY = "Py9YJXgBecbbqxjRVaHarcSnJyuzhxGqJTkY6xKZRfrdXFy72HPXvFRvfEjy";

// Import roster thunk
export const importRoster = createAsyncThunk(
  "roster/importRoster",
  async ({ file, ladder_id }, { dispatch, rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("ladder_id", ladder_id);

      const res = await axios.post(
        "https://ne-games.com/leaderBoard/api/user/importRoster",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            APPKEY,
          },
        }
      );

      // IMPORTANT — SAME FLOW AS WINLOSE
      await dispatch(fetchRosterLeaderboard({ ladder_id, type: "roster" }));

      return res.data;
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

      // ✅ importRoster handlers
      .addCase(importRoster.pending, (state) => {
        state.importLoading = true;
        state.error = null;
      })

      .addCase(importRoster.fulfilled, (state, action) => {
        state.importLoading = false;

        // adjust depending on API structure
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
