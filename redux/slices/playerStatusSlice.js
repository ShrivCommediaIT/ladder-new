// redux/slices/playerStatusSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getRequest } from "@/services/apiService";
import { API_ENDPOINTS } from "@/constants/api";

export const changePlayerStatus = createAsyncThunk(
  "playerStatus/change",
  async ({ user_id, player_status }, { rejectWithValue }) => {
    try {
      const data = await getRequest(API_ENDPOINTS.CHANGE_PLAYER_STATUS, {
        user_id,
        player_status,
      });
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to change player status"
      );
    }
  }
);

const playerStatusSlice = createSlice({
  name: "playerStatus",
  initialState: {
    loading: false,
    successMessage: null,
    error: null,
    updatedData: null,
  },
  reducers: {
    clearStatusMessage: (state) => {
      state.successMessage = null;
      state.error = null;
      state.updatedData = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(changePlayerStatus.pending, (state) => {
        state.loading = true;
        state.successMessage = null;
        state.error = null;
      })
      .addCase(changePlayerStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload?.message || "Status updated!";
        state.updatedData = action.payload?.data || null;
      })
      .addCase(changePlayerStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearStatusMessage } = playerStatusSlice.actions;
export default playerStatusSlice.reducer;
