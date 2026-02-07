import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
// import { headers } from "next/headers";

const APPKEY = "Py9YJXgBecbbqxjRVaHarcSnJyuzhxGqJTkY6xKZRfrdXFy72HPXvFRvfEjy";

// ✅ Async thunk to reset leaderboard
export const resetLeaderboard = createAsyncThunk(
  "resetLeaderboard/reset",
  async (ladderId, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `https://ne-games.com/leaderBoard/api/user/Resetleaderboard?ladder_id=${ladderId}`,
        {
          headers: {
            APPKEY:
              "Py9YJXgBecbbqxjRVaHarcSnJyuzhxGqJTkY6xKZRfrdXFy72HPXvFRvfEjy",
          },
        }
      );
      return response.data;
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
