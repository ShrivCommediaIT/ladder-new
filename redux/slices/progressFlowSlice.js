import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const APPKEY = "Py9YJXgBecbbqxjRVaHarcSnJyuzhxGqJTkY6xKZRfrdXFy72HPXvFRvfEjy";

// GET
// progressFlowSlice.js
export const fetchProgressFlow = createAsyncThunk(
  "progressFlow/fetchProgressFlow",
  async ({ user_id, user_type }, thunkAPI) => {
    try {
      const res = await axios.get(
        `https://ne-games.com/leaderBoard/api/user/getProgressFlow?user_id=${user_id}&user_type=${user_type}`,
        { headers: { "APPKEY": APPKEY } }
      );
      // unwrap nested data if exists
      return res.data?.data ?? res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue("Failed to fetch progress flow.");
    }
  }
);

// POST
export const updateProgressFlow = createAsyncThunk(
  "progressFlow/updateProgressFlow",
  async ({ user_id, user_type, step }, { rejectWithValue }) => {
    try {
      const res = await fetch(
        "https://ne-games.com/leaderBoard/api/user/updateProgressFlow",
        {
          method: "POST",
          headers: {
            "APPKEY": APPKEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ user_id, user_type, step }),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update progress flow");
      }

      const data = await res.json();
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
      // 🔄 GET Progress Flow
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

      // 📤 POST Update Progress Flow
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