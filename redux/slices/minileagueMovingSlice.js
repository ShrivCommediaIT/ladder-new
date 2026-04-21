// redux/slices/minileagueMovingSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getRequest } from "@/services/apiService";
import { API_ENDPOINTS } from "@/constants/api";

export const moveToMiniLeague = createAsyncThunk(
  "playerMoving/moveToMiniLeague",
  async (
    { user_id, ladder_id, move_to_rank, move_from_rank, move_from_section, move_to_section },
    { rejectWithValue }
  ) => {
    try {
      // if (!user_id || !ladder_id || move_to_rank === "" || move_from_rank === "" || !move_from_section || !move_to_section) {
      //   return rejectWithValue("All fields are required");
      // }
      const data = await getRequest(API_ENDPOINTS.MOVE_TO_MINILEAGUE, {
        user_id, ladder_id, move_to_rank, move_from_rank, move_from_section, move_to_section,
      });
      if (data.status === 200) {
        return { success_message: data.message || "Player moved successfully ✅", result: data };
      }
      return rejectWithValue(data.message || "Move failed");
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || error.message || "Server Error"
      );
    }
  }
);

const miniLeagueSlice = createSlice({
  name: "minileaguePlayerMoving",
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
  },
  extraReducers: (builder) => {
    builder
      .addCase(moveToMiniLeague.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
        state.result = null;
      })
      .addCase(moveToMiniLeague.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.success_message;
        state.result = action.payload.result;
      })
      .addCase(moveToMiniLeague.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearMoveResult } = miniLeagueSlice.actions;
export default miniLeagueSlice.reducer;
