// redux/slices/clubSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { postRequest } from "@/services/apiService";
import { API_ENDPOINTS } from "@/constants/api";

export const createClub = createAsyncThunk(
  "club/createClub",
  async ({ club_code, club_pin, user_id }, { rejectWithValue }) => {
    try {
      const data = await postRequest(API_ENDPOINTS.APP_USER_CREATE, {
        user_id,
        login_id: club_code,
        password: club_pin,
        user_type: "admin",
      });

      if (data?.status === false) {
        return rejectWithValue(data?.message || "Club creation failed");
      }
      return data;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || err.message || "Server error"
      );
    }
  }
);

const clubSlice = createSlice({
  name: "club",
  initialState: {
    loading: false,
    success: false,
    data: null,
    error: null,
  },
  reducers: {
    resetClubState: (state) => {
      state.loading = false;
      state.success = false;
      state.data = null;
      state.error = null;
      localStorage.removeItem("createdClub");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createClub.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createClub.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.data = action.payload;
        if (action.payload?.data) {
          localStorage.setItem("createdClub", JSON.stringify(action.payload.data));
        }
      })
      .addCase(createClub.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });
  },
});

export const { resetClubState } = clubSlice.actions;
export default clubSlice.reducer;
