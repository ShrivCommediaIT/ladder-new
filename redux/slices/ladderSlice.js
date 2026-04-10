// redux/slices/ladderSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getRequest, postRequest } from "@/services/apiService";
import { API_ENDPOINTS } from "@/constants/api";

// ✅ Create Ladder
export const createLadder = createAsyncThunk(
  "ladder/create",
  async ({ user_id, name, type, created_by }, { rejectWithValue }) => {
    try {
      const data = await postRequest(API_ENDPOINTS.CREATE_LADDER, {
        user_id,
        name,
        type,
        created_by,
      });
      return data;
    } catch (error) {
      return rejectWithValue(error?.response?.data || error.message);
    }
  }
);

// ✅ Fetch Ladders by User ID
export const fetchLadderByUserId = createAsyncThunk(
  "ladder/fetchLadders",
  async ({ userId }, thunkAPI) => {
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

const createLadderSlice = createSlice({
  name: "createLadder",
  initialState: {
    data: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearCreateLadderState: (state) => {
      state.data = [];
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createLadder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createLadder.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload?.data || [];
      })
      .addCase(createLadder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchLadderByUserId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLadderByUserId.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchLadderByUserId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCreateLadderState } = createLadderSlice.actions;
export default createLadderSlice.reducer;
