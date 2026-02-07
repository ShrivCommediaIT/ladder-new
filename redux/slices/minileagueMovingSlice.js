import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const APPKEY = "Py9YJXgBecbbqxjRVaHarcSnJyuzhxGqJTkY6xKZRfrdXFy72HPXvFRvfEjy";

/* -------------------------------------------------------
   ✅ MOVE TO MINI LEAGUE API
------------------------------------------------------- */
export const moveToMiniLeague = createAsyncThunk(
  "playerMoving/moveToMiniLeague",
  async (
    {
      user_id,
      ladder_id,
      move_to_rank,
      move_from_rank,
      move_from_section,
      move_to_section,
    },
    { rejectWithValue }
  ) => {
    try {
      // ✅ STRONG VALIDATION
      if (
        !user_id ||
        !ladder_id ||
        move_to_rank === "" ||
        move_from_rank === "" ||
        !move_from_section ||
        !move_to_section
      ) {
        return rejectWithValue("All fields are required");
      }

      const params = {
        user_id,
        ladder_id,
        move_to_rank,
        move_from_rank,
        move_from_section,
        move_to_section,
      };

      const response = await axios.get(
        "https://ne-games.com/leaderBoard/api/user/move_to_minileague",
        {
          params,
          headers: { APPKEY },
        }
      );

      const data = response.data;

      if (data.status === 200) {
        return {
          success_message: data.message || "Player moved successfully ✅",
          result: data,
        };
      } else {
        return rejectWithValue(data.message || "Move failed");
      }
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || error.message || "Server Error"
      );
    }
  }
);

/* -------------------------------------------------------
   ✅ SLICE
------------------------------------------------------- */
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
