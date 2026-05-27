// redux/slices/playerMovingSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getRequest } from "@/services/apiService";
import { API_ENDPOINTS } from "@/constants/api";

// 1) Standard move
export const movePlayer = createAsyncThunk(
  "playerMoving/movePlayer",
  async (payload, { rejectWithValue }) => {
    try {
      const data = await getRequest(API_ENDPOINTS.RESULT_SAVE, payload);
      if (data.status === 200) {
        return {
          success_message: data.message || "Move Successful",
          eligible_for_token: data.eligible_for_token,
          result: data,
        };
      }
      return rejectWithValue(data.message || "Move failed");
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// 2) Simple move
export const movePlayer1 = createAsyncThunk(
  "playerMoving/movePlayer1",
  async ({ user_id, move_from_user_id, move_to_rank, move_from_rank, ladder_id }, { rejectWithValue }) => {
    try {
      const data = await getRequest(API_ENDPOINTS.MOVE_TO, {
        user_id, move_from_user_id, move_to_rank, move_from_rank, ladder_id,
      });
      if (data.status === 200) {
        return { success_message: data.message || "Move Successful", result: data };
      }
      return rejectWithValue(data.message || "Move failed");
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// 3) Best of 5
export const movePlayerBestOf5 = createAsyncThunk(
  "playerMoving/movePlayerBestOf5",
  async (payload, { rejectWithValue }) => {
    try {
      const data = await getRequest(API_ENDPOINTS.RESULT_BESTOF5, payload);
      if (data.status === 200) {
        return {
          success_message: data.message || "Best of 5 Result Saved",
          eligible_for_token: data.eligible_for_token,
          result: data,
        };
      }
      return rejectWithValue(data.message || "Best of 5 save failed");
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// 4) Mini League move
export const moveMiniLeague = createAsyncThunk(
  "playerMoving/moveMiniLeague",
  async (
    { ladder_id, match_status, user_id, score, move_to_rank, move_from_rank, bet = "", move_from_section, move_to_section, opposit_user_id },
    { rejectWithValue }
  ) => {
    try {
      if (!ladder_id || !match_status || !user_id || !move_to_rank) {
        return rejectWithValue("Missing core fields");
      }
      const data = await getRequest(API_ENDPOINTS.RESULT_MINILEAGUE, {
        ladder_id: Number(ladder_id),
        match_status,
        user_id: Number(user_id),
        move_to_rank: Number(move_to_rank),
        move_from_rank: Number(move_from_rank || 0),
        opposit_user_id,
        score: score || "",
        bet: bet || "",
        move_from_section: String(move_from_section),
        move_to_section: String(move_to_section),
      });
      if (data.status === 200 || data.success) {
        return { success_message: data.message || "Mini League Result Saved!", result: data };
      }
      return rejectWithValue(data.message || data.error || "Save failed");
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        `HTTP ${error.response?.status || "Unknown"}`;
      return rejectWithValue(errorMsg);
    }
  }
);

const playerMovingSlice = createSlice({
  name: "playerMoving",
  initialState: {
    loading: false,
    error: null,
    successMessage: null,
    result: null,
  },
  reducers: {
    clearMoveResult(state) {
      state.loading = false;
      state.error = null;
      state.successMessage = null;
      state.result = null;
    },
    resetState(state) {
      state.loading = false;
      state.error = null;
      state.successMessage = null;
      state.result = null;
    },
  },
  extraReducers: (builder) => {
    const thunks = [movePlayer, movePlayer1, movePlayerBestOf5, moveMiniLeague];
    thunks.forEach((thunk) => {
      builder
        .addCase(thunk.pending, (state) => {
          state.loading = true;
          state.error = null;
          state.successMessage = null;
          state.result = null;
        })
        .addCase(thunk.fulfilled, (state, action) => {
          state.loading = false;
          state.successMessage = action.payload.success_message;
          state.result = action.payload.result;
        })
        .addCase(thunk.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload || "Action failed";
        });
    });
  },
});

export const { clearMoveResult, resetState } = playerMovingSlice.actions;
export default playerMovingSlice.reducer;
