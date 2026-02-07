// ✅ FIXED SLICE - Transform API data for UI
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const APPKEY = "Py9YJXgBecbbqxjRVaHarcSnJyuzhxGqJTkY6xKZRfrdXFy72HPXvFRvfEjy";


// sort by
export const fetchSkillLeaderboard = createAsyncThunk(
  "skillLeaderboard/fetchSkillLeaderboard",
  async (
    { ladder_id, type = "skill", sortbyskillnumber = 0 },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.get(
        "https://ne-games.com/leaderBoard/api/user/leaderboard",
        {
          headers: { APPKEY },
          params: {
            ladder_id,
            type,
            sortbyskillnumber,
          },
        }
      );

      const rawPlayers = response.data?.data || [];

      const transformedPlayers = rawPlayers.map(player => ({
        ...player,
        name: player.name,
        total_point: player.total_point || 0,
        id: player.id,
        rank: player.rank,
      }));

      return {
        data: transformedPlayers,
        gradebars: response.data.gradebarDetails || [],
        ladderDetails: response.data.ladderDetails || {},
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);


// importSkillLeaderboard remains same
export const importSkillLeaderboard = createAsyncThunk(
  "skillLeaderboard/importSkillLeaderboard",
  async (
    { file, ladder_id },
    { rejectWithValue }
  ) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("ladder_id", ladder_id);

      const response = await axios.post(
        "https://ne-games.com/leaderBoard/api/user/importskill",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data", APPKEY },
        }
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const skillLeaderboardSlice = createSlice({
  name: "skillLeaderboard",
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
      .addCase(fetchSkillLeaderboard.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSkillLeaderboard.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data;
        state.gradebars = action.payload.gradebars;
        state.ladderDetails = action.payload.ladderDetails;
      })
      .addCase(fetchSkillLeaderboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(importSkillLeaderboard.pending, (state) => {
        state.importLoading = true;
      })
      .addCase(importSkillLeaderboard.fulfilled, (state) => {
        state.importLoading = false;
      })
      .addCase(importSkillLeaderboard.rejected, (state, action) => {
        state.importLoading = false;
        state.error = action.payload;
      });
  },
});

export default skillLeaderboardSlice.reducer;
