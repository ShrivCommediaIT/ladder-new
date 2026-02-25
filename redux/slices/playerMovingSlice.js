

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const APPKEY = "Py9YJXgBecbbqxjRVaHarcSnJyuzhxGqJTkY6xKZRfrdXFy72HPXvFRvfEjy";

/* -------------------------------------------------------
   🔥 1) NORMAL RESULT SAVE API (BEST 3 / WIN-LOSE)
------------------------------------------------------- */
// export const movePlayer = createAsyncThunk(
//   "playerMoving/movePlayer",
//   async (
//     { user_id, move_from_user_id, move_to_rank, move_from_rank, ladder_id, match_status, score, bet = "" },
//     { rejectWithValue }
//   ) => {
//     try {
//       const params = { user_id, ladder_id, match_status, move_to_rank, move_from_user_id, score };

//       if (match_status === "beat" && move_from_rank) params.move_from_rank = move_from_rank;
//       if (match_status === "lost") params.move_to_rank = move_to_rank;

//       const response = await axios.get(
//         "https://ne-games.com/leaderBoard/api/user/result/save",
//         { params, headers: { APPKEY } }
//       );

//       const data = response.data;

//       if (data.status === 200) {
//         return {
//           success_message:
//             data.message || (match_status === "beat" ? "Move Successful" : "Result Saved (Lost)"),
//           result: data,
//         };
//       } else {
//         return rejectWithValue(data.message || "Move failed");
//       }
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || error.message);
//     }
//   }
// );


export const movePlayer = createAsyncThunk(
  "playerMoving/movePlayer",
  async (
    { user_id, move_from_user_id, move_to_rank, move_from_rank, ladder_id, match_status, score, bet = "" },
    { rejectWithValue }
  ) => {
    try {

      const params = {
        user_id,
        ladder_id,
        match_status,
        move_to_rank,
        move_from_user_id,
        score,

        // ✅ ONLY win/lose me bet jayega
        ...(match_status === "beat" || match_status === "lost"
          ? { bet }
          : {}),
      };

      if (match_status === "beat" && move_from_rank)
        params.move_from_rank = move_from_rank;

      if (match_status === "lost")
        params.move_to_rank = move_to_rank;

      const response = await axios.get(
        "https://ne-games.com/leaderBoard/api/user/result/save",
        { params, headers: { APPKEY } }
      );

      const data = response.data;

      if (data.status === 200) {
        return {
          success_message:
            data.message ||
            (match_status === "beat"
              ? "Move Successful"
              : "Result Saved (Lost)"),
          result: data,
        };
      } else {
        return rejectWithValue(data.message || "Move failed");
      }

    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

/* -------------------------------------------------------
    2) SIMPLE MOVE API
------------------------------------------------------- */
export const movePlayer1 = createAsyncThunk(
  "playerMoving/movePlayer1",
  async ({ user_id, move_from_user_id, move_to_rank, move_from_rank, ladder_id }, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        "https://ne-games.com/leaderBoard/api/user/move_to",
        {
          params: { user_id, move_from_user_id, move_to_rank, move_from_rank, ladder_id },
          headers: { APPKEY },
        }
      );

      const data = response.data;

      if (data.status === 200) {
        return { success_message: data.message || "Move Successful", result: data };
      } else {
        return rejectWithValue(data.message || "Move failed");
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

/* -------------------------------------------------------
   🔥 3) BEST OF 5 API (BET SUPPORTED)
------------------------------------------------------- */
export const movePlayerBestOf5 = createAsyncThunk(
  "playerMoving/movePlayerBestOf5",
  async ({ ladder_id, match_status, user_id, score, move_to_rank, move_from_rank, bet = "" }, { rejectWithValue }) => {
    try {
      const requiredFields = { ladder_id, match_status, user_id, move_to_rank, score, move_from_rank };
      for (const [key, value] of Object.entries(requiredFields)) {
        if (!value && value !== 0) return rejectWithValue(`Missing required field: ${key}`);
      }

      const params = { ladder_id, match_status, user_id, move_to_rank, score, move_from_rank, bet: bet || "" };

      const response = await axios.get(
        "https://ne-games.com/leaderBoard/api/user/resultforbestof5/save",
        { params, headers: { APPKEY } }
      );

      const data = response.data;

      if (data.status === 200) {
        return { success_message: data.message || "Best of 5 Result Saved ", result: data };
      } else {
        return rejectWithValue(data.message || "Best of 5 save failed");
      }
    } catch (error) {
      console.error(" BestOf5 Error:", error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);


/* -------------------------------------------------------
   🔥 4) MINI LEAGUE MOVE API - FIXED VALIDATION
------------------------------------------------------- */
export const moveMiniLeague = createAsyncThunk(
  "playerMoving/moveMiniLeague",
  async ({ 
    ladder_id, 
    match_status, 
    user_id, 
    score, 
    move_to_rank, 
    move_from_rank, 
    bet = "", 
    move_from_section,
    move_to_section
  }, { rejectWithValue }) => {
    try {
      //  MINIMAL VALIDATION - BACKEND HANDLE KAREGA
      if (!ladder_id || !match_status || !user_id || !move_to_rank) {
        return rejectWithValue("Missing core fields");
      }

      const params = { 
        ladder_id: Number(ladder_id),
        match_status,
        user_id: Number(user_id),
        move_to_rank: Number(move_to_rank),
        move_from_rank: Number(move_from_rank || 0),
        score: score || "",
        bet: bet || "",
        // 🔥 BACKEND EXPECTS THESE EXACT FIELDS
        move_from_section: String(move_from_section),
        move_to_section: String(move_to_section)
      };


      const response = await axios.get(
        "https://ne-games.com/leaderBoard/api/user/resultpostminileague/save",
        { 
          params, 
          headers: { APPKEY },
          timeout: 10000  // 10s timeout
        }
      );

      const data = response.data;

      if (data.status === 200 || data.success) {
        return { success_message: data.message || "Mini League Result Saved!", result: data };
      } else {
        return rejectWithValue(data.message || data.error || "Save failed");
      }
    } catch (error) {
      console.error("API ERROR:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      // 🔥 DETAILED ERROR MESSAGES
      const errorMsg = error.response?.data?.message || 
                      error.response?.data?.error || 
                      error.message || 
                      `HTTP ${error.response?.status || 'Unknown'}`;
      
      return rejectWithValue(errorMsg);
    }
  }
);


/* -------------------------------------------------------
   🔥 SLICE - ALL PLAYER MOVES
------------------------------------------------------- */
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
