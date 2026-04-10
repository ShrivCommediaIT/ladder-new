// redux/slices/resetLeaderboardSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getRequest } from "@/services/apiService";
import { API_ENDPOINTS } from "@/constants/api";

export const resetLeaderboard = createAsyncThunk(
  "resetLeaderboard/reset",
  async (ladderId, { rejectWithValue }) => {
    try {
      const data = await getRequest(API_ENDPOINTS.RESET_LEADERBOARD, {
        ladder_id: ladderId,
      });
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to reset leaderboard"
      );
    }
  }
);

const resetLeaderboardSlice = createSlice({
  name: "resetLeaderboard",
  initialState: {
    loading: false,
    success: false,
    error: null,
  },
  reducers: {
    resetState: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(resetLeaderboard.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(resetLeaderboard.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(resetLeaderboard.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload;
      });
  },
});

export const { resetState } = resetLeaderboardSlice.actions;
export default resetLeaderboardSlice.reducer;
