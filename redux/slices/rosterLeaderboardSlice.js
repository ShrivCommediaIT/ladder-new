// redux/slices/rosterLeaderboardSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getRequest } from "@/services/apiService";
import { API_ENDPOINTS } from "@/constants/api";

export const fetchRosterLeaderboard = createAsyncThunk(
  "rosterLeaderboard/fetchRosterLeaderboard",
  async ({ ladder_id }, { rejectWithValue }) => {
    try {
      const data = await getRequest(API_ENDPOINTS.LEADERBOARD, {
        ladder_id,
        type: "roster",
      });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const initialState = {
  loading: false,
  error: null,
  data: [],
  image_path: "",
  ladderDetails: null,
  gradebar: null,
  gradebarDetails: [],
};

const rosterLeaderboardSlice = createSlice({
  name: "rosterLeaderboard",
  initialState,
  reducers: {
    clearRosterLeaderboard: (state) => {
      state.data = [];
      state.ladderDetails = null;
      state.gradebar = null;
      state.gradebarDetails = [];
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRosterLeaderboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRosterLeaderboard.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data || [];
        state.image_path = action.payload.image_path || "";
        state.ladderDetails = action.payload.ladderDetails || null;
        state.gradebar = action.payload.gradebar || null;
        state.gradebarDetails = action.payload.gradebarDetails || [];
      })
      .addCase(fetchRosterLeaderboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearRosterLeaderboard } = rosterLeaderboardSlice.actions;
export default rosterLeaderboardSlice.reducer;
