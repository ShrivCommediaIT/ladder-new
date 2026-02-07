import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  loading: false,
  success: false,
  error: null,
};

const APPKEY = "Py9YJXgBecbbqxjRVaHarcSnJyuzhxGqJTkY6xKZRfrdXFy72HPXvFRvfEjy"

// Thunk for challenge API
const challengeToPlayer = createAsyncThunk(
  "challenge/send",
  async (
    { user_id, challenge_to_rank },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.get(
        `https://ne-games.com/leaderBoard/api/user/challenge_to`,
        
        {
           headers: { APPKEY:APPKEY },  
          params: { user_id, challenge_to_rank },
          
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Challenge failed");
    }
  }
);

const challengeSlice = createSlice({
  name: "challenge",
  initialState,
  reducers: {
    resetChallengeStatus: (state) => {
      state.success = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(challengeToPlayer.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(challengeToPlayer.fulfilled, (state,action) => {
        state.loading = false;
        state.success = true;
        state.data = action.payload
      })
      .addCase(challengeToPlayer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetChallengeStatus } = challengeSlice.actions;
export {challengeToPlayer}
export default challengeSlice.reducer;
