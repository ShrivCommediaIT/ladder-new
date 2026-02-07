

// redux/slices/ladderSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// 🔐 API Key
const APPKEY = "Py9YJXgBecbbqxjRVaHarcSnJyuzhxGqJTkY6xKZRfrdXFy72HPXvFRvfEjy";

// ✅ Fetch ladders by user ID
// export const fetchLadders = createAsyncThunk(
//   "ladder/fetchLadders",
//   async (userId,  thunkAPI) => {
//     try {
//       const response = await axios.get(
//         `https://ne-games.com/leaderBoard/api/user/ladderList?user_id=${userId}`,
//         { headers: { APPKEY } }
//       );
//       return response.data.data || []; // ensure always array
//     } catch (error) {
//       return thunkAPI.rejectWithValue("Failed to fetch ladders");
//     }
//   }
// );


export const fetchLadders = createAsyncThunk(
  "ladder/fetchLadders",
  async ({ userId, created_by }, thunkAPI) => {
    try {
      let url = `https://ne-games.com/leaderBoard/api/user/ladderList?user_id=${userId}&created_by=${created_by}`;


      const response = await axios.get(url, { headers: { APPKEY } });

      return response.data.data || [];
    } catch (error) {
      return thunkAPI.rejectWithValue("Failed to fetch ladders");
    }
  }
);


const ladderSlice = createSlice({
  name: "fetchLadder", // same name as in store
  initialState: {
    allLadders: [],
    loading: false,
    error: null,
  },
  reducers: {
    // 🔥 Reset ladders to prevent stale data
    resetLadders: (state) => {
      state.allLadders = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLadders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLadders.fulfilled, (state, action) => {
        state.loading = false;
        state.allLadders = action.payload;
      })
      .addCase(fetchLadders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetLadders } = ladderSlice.actions; // ✅ export reset
export default ladderSlice.reducer;
