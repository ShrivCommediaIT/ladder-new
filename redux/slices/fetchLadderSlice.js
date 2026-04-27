// redux/slices/fetchLadderSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getRequest } from "@/services/apiService";
import { API_ENDPOINTS } from "@/constants/api";

export const fetchLadders = createAsyncThunk(
  "ladder/fetchLadders",
  async ({ userId, created_by }, thunkAPI) => {
    try {
      const data = await getRequest(API_ENDPOINTS.LADDER_LIST, {
        user_id: userId,
      });
      return data.data || [];
    } catch (error) {
      return thunkAPI.rejectWithValue("Failed to fetch ladders");
    }
  }
);

const ladderSlice = createSlice({
  name: "fetchLadder",
  initialState: {
    allLadders: [],
    loading: false,
    error: null,
  },
  reducers: {
    resetLadders: (state) => {
      state.allLadders = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLadders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLadders.fulfilled, (state, action) => {
        state.loading = false;
        state.allLadders = action.payload;
      })
      .addCase(fetchLadders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetLadders } = ladderSlice.actions;
export default ladderSlice.reducer;
