// redux/slices/minileagueSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getRequest, postFormData } from "@/services/apiService";
import { API_ENDPOINTS } from "@/constants/api";

export const fetchMiniLeague = createAsyncThunk(
  "minileague/fetchMiniLeague",
  async ({ ladder_id, type = "minileague" }, { rejectWithValue }) => {
    try {
      const data = await getRequest(API_ENDPOINTS.LEADERBOARD, { ladder_id, type });
      return {
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
    error: null,
  },
  reducers: {},
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
      });
  },
});

export default miniLeagueSlice.reducer;
