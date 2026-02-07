// redux/slices/profileSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// App key
const APPKEY = "Py9YJXgBecbbqxjRVaHarcSnJyuzhxGqJTkY6xKZRfrdXFy72HPXvFRvfEjy";

// Async thunk to fetch profile data
export const fetchUserProfile = createAsyncThunk(
  "profile/fetch",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `https://ne-games.com/leaderBoard/api/user/profile?id=${userId}`,
        {
          headers: {
            APPKEY,
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to fetch profile"
      );
    }
  }
);

const profileSlice = createSlice({
  name: "profile",
  initialState: {
    data: null,
    loading: false,
    error: null,
  },
  reducers: {
    resetProfileState: (state) => {
      state.data = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetProfileState } = profileSlice.actions;
export default profileSlice.reducer;
