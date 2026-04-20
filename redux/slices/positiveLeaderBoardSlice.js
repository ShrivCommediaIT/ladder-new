// redux/slices/positiveLeaderBoardSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getRequest, postFormData } from "@/services/apiService";
import { API_ENDPOINTS } from "@/constants/api";
import { changePlayerStatus } from "./leaderboardSlice";

export const fetchPositiveLeaderboard = createAsyncThunk(
  "positiveLeaderboard/fetchPositiveLeaderboard",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await getRequest(API_ENDPOINTS.LEADERBOARD, {
        type: "positive",
        sortbyskillnumber: 0,
        ...payload
      });

      return {
        ...res,
        data: res?.data || [],
        gradebars: res.gradebarDetails || [],
        ladderDetails: res.ladderDetails || {},
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const importSkillLeaderboard = createAsyncThunk(
  "positiveLeaderboard/importSkillLeaderboard",
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

const positiveLeaderboardSlice = createSlice({
  name: "positiveLeaderboard",
  initialState: {
    loading: false,
    importLoading: false,
    data: [],
    gradebars: [],
    ladderDetails: null,
    appliedAge: 0,
    error: null,
  },
  reducers: {
    setAppliedAge: (state, action) => {
      state.appliedAge = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPositiveLeaderboard.pending, (state) => { state.loading = true; })
      .addCase(fetchPositiveLeaderboard.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data;
        state.gradebars = action.payload.gradebars;
        state.ladderDetails = action.payload.ladderDetails;
      })
      .addCase(fetchPositiveLeaderboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(importSkillLeaderboard.pending, (state) => { state.importLoading = true; })
      .addCase(importSkillLeaderboard.fulfilled, (state) => { state.importLoading = false; })
      .addCase(importSkillLeaderboard.rejected, (state, action) => {
        state.importLoading = false;
        state.error = action.payload;
      })
      .addCase(changePlayerStatus.fulfilled, (state, action) => {
        const { user_id, player_status } = action.payload;
        const player = state.data.find((p) => p.id === user_id);
        if (player) {
          player.player_status = player_status;
        }
      });
  },
});

export const { setAppliedAge } = positiveLeaderboardSlice.actions;
export default positiveLeaderboardSlice.reducer;
