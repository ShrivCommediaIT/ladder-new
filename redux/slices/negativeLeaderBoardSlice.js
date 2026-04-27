// redux/slices/negativeLeaderBoardSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getRequest, postFormData } from "@/services/apiService";
import { API_ENDPOINTS } from "@/constants/api";
import { changePlayerStatus } from "./leaderboardSlice";

export const fetchNegativeLeaderboard = createAsyncThunk(
  "negativeLeaderboard/fetchNegativeLeaderboard",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await getRequest(API_ENDPOINTS.LEADERBOARD, {
        type: "negative",
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
    appliedAge: 0,
    appliedAgeType: "under",
    appliedGender: "",
    error: null,
  },
  reducers: {
    setAppliedAge: (state, action) => {
      state.appliedAge = action.payload;
    },
    setAgeFilter: (state, action) => {
      const { age, ageType, gender } = action.payload;
      state.appliedAge = age;
      state.appliedAgeType = ageType;
      state.appliedGender = gender;
    },
  },
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

export const { setAppliedAge, setAgeFilter } = negativeLeaderboardSlice.actions;
export default negativeLeaderboardSlice.reducer;
