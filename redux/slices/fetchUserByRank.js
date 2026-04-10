// redux/slices/fetchUserByRank.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getRequest } from "@/services/apiService";
import { API_ENDPOINTS } from "@/constants/api";

export const fetchUserByRank = createAsyncThunk(
  "userByRank/fetchUserByRank",
  async ({ rank, ladder_id }, { rejectWithValue }) => {
    try {
      const data = await getRequest(API_ENDPOINTS.DETAILS_BY_RANK, {
        rank,
        ladder_id,
      });
      return data.data;
    } catch (error) {
      return rejectWithValue("Failed to fetch player");
    }
  }
);

const userByRankSlice = createSlice({
  name: "userByRank",
  initialState: {
    user: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearUserByRank: (state) => {
      state.user = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserByRank.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserByRank.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(fetchUserByRank.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearUserByRank } = userByRankSlice.actions;
export default userByRankSlice.reducer;
