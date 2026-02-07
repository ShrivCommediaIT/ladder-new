// src/redux/slices/playerResultSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "https://ne-games.com/leaderBoard/api/user/result/show";
const APPKEY =
  "Py9YJXgBecbbqxjRVaHarcSnJyuzhxGqJTkY6xKZRfrdXFy72HPXvFRvfEjy";

// 🔹 AsyncThunk for fetching player result
export const fetchPlayerResult = createAsyncThunk(
  "playerResult/fetchPlayerResult",
  async ({ user_id, ladder_id }, { rejectWithValue }) => {
    try {
      const response = await axios.get(API_URL, {
        params: { user_id, ladder_id },
        headers: {
          APPKEY: APPKEY,
        },
      });
      return response.data.data; // only "data" object return kar rahe hain
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
