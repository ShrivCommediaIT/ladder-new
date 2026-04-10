// redux/slices/negativeLeaderBoardSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getRequest, postFormData } from "@/services/apiService";
import { API_ENDPOINTS } from "@/constants/api";

export const fetchNegativeLeaderboard = createAsyncThunk(
  "negativeLeaderboard/fetchNegativeLeaderboard",
  async ({ ladder_id, type = "negative", sortbyskillnumber = 0 }, { rejectWithValue }) => {
    try {
      const data = await getRequest(API_ENDPOINTS.LEADERBOARD, {
        ladder_id,
        type,
        sortbyskillnumber,
      });

      const rawPlayers = data?.data || [];
      const transformedPlayers = rawPlayers.map((player) => ({
        ...player,
        name: player.name,
        total_point: player.total_point || 0,
        id: player.id,
        rank: player.rank,
      }));

      return {
        data: transformedPlayers,
        gradebars: data.gradebarDetails || [],
        ladderDetails: data.ladderDetails || {},
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const importNegativeLeaderboard = createAsyncThunk(
  "negativeLeaderboard/importNegativeLeaderboard",
  async ({ file, ladder_id }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("ladder_id", ladder_id);
      const data = await postFormData(API_ENDPOINTS.IMPORT_SKILL, formData);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const negativeLeaderboardSlice = createSlice({
  name: "negativeLeaderboard",
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
      .addCase(fetchNegativeLeaderboard.pending, (state) => { state.loading = true; })
      .addCase(fetchNegativeLeaderboard.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data;
        state.gradebars = action.payload.gradebars;
        state.ladderDetails = action.payload.ladderDetails;
      })
      .addCase(fetchNegativeLeaderboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(importNegativeLeaderboard.pending, (state) => { state.importLoading = true; })
      .addCase(importNegativeLeaderboard.fulfilled, (state) => { state.importLoading = false; })
      .addCase(importNegativeLeaderboard.rejected, (state, action) => {
        state.importLoading = false;
        state.error = action.payload;
      });
  },
});

export default negativeLeaderboardSlice.reducer;
