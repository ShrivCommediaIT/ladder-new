import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// 🔐 Move to .env in production
const APPKEY =
  process.env.NEXT_PUBLIC_APPKEY ||
  "Py9YJXgBecbbqxjRVaHarcSnJyuzhxGqJTkY6xKZRfrdXFy72HPXvFRvfEjy";

/* ---------------------------------------
   🚀 Fetch Roster Leaderboard (AXIOS)
--------------------------------------- */

export const fetchRosterLeaderboard = createAsyncThunk(
  "rosterLeaderboard/fetchRosterLeaderboard",
  async ({ ladder_id }, { rejectWithValue }) => {
    try {
      const res = await axios.get(
        "https://ne-games.com/leaderBoard/api/user/leaderboard",
        {
          params: {
            ladder_id,
            type: "roster",
          },
          headers: {
            APPKEY,
          },
        }
      );

      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

/* ---------------------------------------
   🧠 State
--------------------------------------- */

const initialState = {
  loading: false,
  error: null,
  data: [],
  image_path: "",
  ladderDetails: null,
  gradebar: null,
  gradebarDetails: [],
};

/* ---------------------------------------
   🏗 Slice
--------------------------------------- */

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

      // 🔄 Pending
      .addCase(fetchRosterLeaderboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      // ✅ Success
      .addCase(fetchRosterLeaderboard.fulfilled, (state, action) => {
        state.loading = false;

        state.data = action.payload.data || [];
        state.image_path = action.payload.image_path || "";
        state.ladderDetails = action.payload.ladderDetails || null;
        state.gradebar = action.payload.gradebar || null;
        state.gradebarDetails = action.payload.gradebarDetails || [];
      })

      // ❌ Error
      .addCase(fetchRosterLeaderboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

/* --------------------------------------- */

export const { clearRosterLeaderboard } =
  rosterLeaderboardSlice.actions;

export default rosterLeaderboardSlice.reducer;
