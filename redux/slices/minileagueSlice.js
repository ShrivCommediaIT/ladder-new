// redux/slices/minileagueSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getRequest, postFormData } from "@/services/apiService";
import { API_ENDPOINTS } from "@/constants/api";
import { changePlayerStatus } from "./leaderboardSlice";

export const fetchMiniLeague = createAsyncThunk(
  "minileague/fetchMiniLeague",
  async (payload, { rejectWithValue }) => {
    try {
      const data = await getRequest(API_ENDPOINTS.LEADERBOARD, { 
        type: "minileague",
        ...payload
      });
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

export const importMiniLeague = createAsyncThunk(
  "minileague/importMiniLeague",
  async ({ file, ladder_id }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("ladder_id", ladder_id);
      const data = await postFormData(API_ENDPOINTS.IMPORT_MINILEAGUE, formData);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const miniLeagueSlice = createSlice({
  name: "minileague",
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
    setAgeFilter: (state, action) => {
      const { age, ageType, gender } = action.payload;
      state.appliedAge = age;
      state.appliedAgeType = ageType;
      state.appliedGender = gender;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMiniLeague.pending, (state) => { state.loading = true; })
      .addCase(fetchMiniLeague.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data;
        state.gradebars = action.payload.gradebars;
        state.ladderDetails = action.payload.ladderDetails;
      })
      .addCase(fetchMiniLeague.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(importMiniLeague.pending, (state) => { state.importLoading = true; })
      .addCase(importMiniLeague.fulfilled, (state) => { state.importLoading = false; })
      .addCase(importMiniLeague.rejected, (state, action) => {
        state.importLoading = false;
        state.error = action.payload;
      })
      .addCase(changePlayerStatus.fulfilled, (state, action) => {
        const { user_id, player_status } = action.payload;
        // Search through sections for the matching player
        state.data.forEach((section) => {
          const player = section.users_record?.find((p) => p.id === user_id);
          if (player) {
            player.player_status = player_status;
          }
        });
      });
  },
});

export const { setAgeFilter } = miniLeagueSlice.actions;
export default miniLeagueSlice.reducer;
