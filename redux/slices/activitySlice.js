// redux/slices/activitySlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getRequest } from "@/services/apiService";
import { API_ENDPOINTS } from "@/constants/api";

export const fetchUserActivity = createAsyncThunk(
  "activity/fetchUserActivity",
  async ({ ladder_id }, { rejectWithValue }) => {
    try {
      const data = await getRequest(API_ENDPOINTS.ACTIVITY, { ladder_id });
      if (data.status === 200) return data;
      return rejectWithValue(data.message || "Failed to fetch activity");
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const activitySlice = createSlice({
  name: "activity",
  initialState: {
    loading: false,
    data: { data: [] },
    error: null,
  },
  reducers: {
    clearActivityState(state) {
      state.loading = false;
      state.data = { data: [] };
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserActivity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserActivity.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchUserActivity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Something went wrong";
      });
  },
});

export const { clearActivityState } = activitySlice.actions;
export default activitySlice.reducer;
