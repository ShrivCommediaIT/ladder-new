// redux/slices/BasicLeaderboardSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getRequest, postFormData } from "@/services/apiService";
import { API_ENDPOINTS } from "@/constants/api";
import { changePlayerStatus } from "./leaderboardSlice";

export const fetchSkillLeaderboard = createAsyncThunk(
  "skillLeaderboard/fetchSkillLeaderboard",
  async (payload, { rejectWithValue }) => {
    try {
      const data = await getRequest(API_ENDPOINTS.LEADERBOARD, payload);

      return {
        ...data,
        data: data?.data || [],
        gradebars: data.gradebarDetails || [],
        ladderDetails: data.ladderDetails || {},
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const importSkillLeaderboard = createAsyncThunk(
  "skillLeaderboard/importSkillLeaderboard",
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

const skillLeaderboardSlice = createSlice({
  name: "skillLeaderboard",
  initialState: {
    loading: false,
    importLoading: false,
    data: [],
    gradebars: [],
    ladderDetails: null,
    appliedAge: 0,
    appliedAgeType: "",
    appliedGender: "",
    appliedCountry: "",
    appliedWitnessBy: 0,
    error: null,
  },
  reducers: {
    setAppliedAge: (state, action) => {
      state.appliedAge = action.payload;
    },
    setAgeFilter: (state, action) => {
      const { age, ageType, gender, country } = action.payload;
      state.appliedAge = age;
      state.appliedAgeType = ageType;
      state.appliedGender = gender;
      state.appliedCountry = country || "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSkillLeaderboard.pending, (state) => { state.loading = true; })
      .addCase(fetchSkillLeaderboard.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data;
        state.gradebars = action.payload.gradebars;
        state.ladderDetails = action.payload.ladderDetails;
        state.appliedWitnessBy = action.meta.arg?.witness_by || 0;

        const { dob, gender, country } = action.meta.arg || {};
        if (!dob && !gender && !country) {
          state.appliedAge = 0;
          state.appliedAgeType = "";
          state.appliedGender = "";
          state.appliedCountry = "";
        } else {
          if (country !== undefined) {
            state.appliedCountry = country || "";
          }
        }
      })
      .addCase(fetchSkillLeaderboard.rejected, (state, action) => {
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

export const { setAppliedAge, setAgeFilter } = skillLeaderboardSlice.actions;
export default skillLeaderboardSlice.reducer;
