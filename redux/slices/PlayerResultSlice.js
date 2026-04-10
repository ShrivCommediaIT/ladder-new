// redux/slices/PlayerResultSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getRequest } from "@/services/apiService";
import { API_ENDPOINTS } from "@/constants/api";

export const fetchPlayerResult = createAsyncThunk(
  "playerResult/fetchPlayerResult",
  async ({ user_id, ladder_id }, { rejectWithValue }) => {
    try {
      const data = await getRequest(API_ENDPOINTS.RESULT_SHOW, {
        user_id,
        ladder_id,
      });
      return data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch player result"
      );
    }
  }
);

const playerResultSlice = createSlice({
  name: "playerResult",
  initialState: {
    data: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlayerResult.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPlayerResult.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchPlayerResult.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default playerResultSlice.reducer;
