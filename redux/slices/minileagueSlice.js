import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const APPKEY = "Py9YJXgBecbbqxjRVaHarcSnJyuzhxGqJTkY6xKZRfrdXFy72HPXvFRvfEjy";

// =============================== ladder type for minileague

export const fetchMiniLeague = createAsyncThunk(
  "minileague/fetchMiniLeague",
  async ({ ladder_id, type = "minileague" }, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `https://ne-games.com/leaderBoard/api/user/leaderboard?ladder_id=${ladder_id}&type=${type}`,
        { headers: { APPKEY } },
      );

      const rawSections = response.data?.data || [];

      return {
        data: rawSections, // ✅ section-wise players
        gradebars: response.data.gradebarDetails || [], // ✅ gradebars
        ladderDetails: response.data.ladderDetails || {}, // ✅ VERY IMPORTANT (TYPE YAHI SE AAYEGA)
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const importMiniLeague = createAsyncThunk(
  "minileague/importMiniLeague",
  async ({ file, ladder_id }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("ladder_id", ladder_id);

      const response = await axios.post(
        "https://ne-games.com/leaderBoard/api/user/importminileague",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data", APPKEY },
        },
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

const miniLeagueSlice = createSlice({
  name: "minileague",
  initialState: {
    loading: false,
    importLoading: false,
    data: [], // section-wise data
    gradebars: [],
    ladderDetails: null,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMiniLeague.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMiniLeague.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data;
        state.gradebars = action.payload.gradebars;

        // ✅ yahi se ab ladderType milega
        state.ladderDetails = action.payload.ladderDetails;
      })

      .addCase(fetchMiniLeague.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(importMiniLeague.pending, (state) => {
        state.importLoading = true;
      })
      .addCase(importMiniLeague.fulfilled, (state) => {
        state.importLoading = false;
      })
      .addCase(importMiniLeague.rejected, (state, action) => {
        state.importLoading = false;
        state.error = action.payload;
      });
  },
});

export default miniLeagueSlice.reducer;
