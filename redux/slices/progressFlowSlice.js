// redux/slices/progressFlowSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getRequest, postRequest } from "@/services/apiService";
import { API_ENDPOINTS } from "@/constants/api";

// GET progress flow
export const fetchProgressFlow = createAsyncThunk(
  "progressFlow/fetchProgressFlow",
  async ({ user_id, user_type }, thunkAPI) => {
    try {
      const data = await getRequest(API_ENDPOINTS.GET_PROGRESS_FLOW, {
        user_id,
        user_type,
      });
      return data?.data ?? data;
    } catch (err) {
      return thunkAPI.rejectWithValue("Failed to fetch progress flow.");
    }
  }
);

// POST update progress flow
export const updateProgressFlow = createAsyncThunk(
  "progressFlow/updateProgressFlow",
  async ({ user_id, user_type, step }, { rejectWithValue }) => {
    try {
      const data = await postRequest(API_ENDPOINTS.UPDATE_PROGRESS_FLOW, {
        user_id,
        user_type,
        step,
      });
      return data;
    } catch (err) {
      return rejectWithValue(err.message || "Unknown error");
    }
  }
);

const initialState = {
  data: null,
  loading: false,
  error: null,
  updateLoading: false,
  updateError: null,
};

const progressFlowSlice = createSlice({
  name: "progressFlow",
  initialState,
  reducers: {
    clearProgressFlow: (state) => {
      state.data = null;
      state.error = null;
      state.loading = false;
      state.updateError = null;
      state.updateLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProgressFlow.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProgressFlow.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchProgressFlow.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateProgressFlow.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(updateProgressFlow.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.data = action.payload;
      })
      .addCase(updateProgressFlow.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
      });
  },
});

export const { clearProgressFlow } = progressFlowSlice.actions;
export default progressFlowSlice.reducer;