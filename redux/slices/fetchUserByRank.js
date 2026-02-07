// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import axios from "axios";

// export const fetchUserByRank = createAsyncThunk(
//   "userByRank/fetchUserByRank",
//   async ({ rank, ladder_id }, { rejectWithValue }) => {
//     try {
//       const response = await axios.get(
//         "https://ne-games.com/leaderBoard/api/user/detailsByrank",
//         {
//           params: {
//             rank,
//             ladder_id,
//           },
//         }
//       );
//       return response.data;
//     } catch (error) {
//       return rejectWithValue("Failed to fetch player");
//     }
//   }
// );

// const userByRankSlice = createSlice({
//   name: "userByRank",
//   initialState: {
//     user: null,
//     loading: false,
//     error: null,
//   },
//   reducers: {
//     clearUserByRank: (state) => {
//       state.user = null;
//       state.loading = false;
//       state.error = null;
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       .addCase(fetchUserByRank.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchUserByRank.fulfilled, (state, action) => {
//         state.loading = false;
//         state.user = action.payload;
//       })
//       .addCase(fetchUserByRank.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       });
//   },
// });

// export const { clearUserByRank } = userByRankSlice.actions;
// export default userByRankSlice.reducer;















// =============================== ==>

//   import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import axios from "axios";

// const APPKEY =
//   "Py9YJXgBecbbqxjRVaHarcSnJyuzhxGqJTkY6xKZRfrdXFy72HPXvFRvfEjy";

// export const fetchUserByRank = createAsyncThunk(
//   "userByRank/fetchUserByRank",
//   async ({ rank, ladder_id }, { rejectWithValue }) => {
//     try {
//       const response = await axios.get(
//         "https://ne-games.com/leaderBoard/api/user/detailsByrank",
//         {
//           params: {
//             rank,
//             ladder_id,
//           },
//           headers: {
//             appkey: APPKEY,
//           },
//         }
//       );
//       return response.data;
//     } catch (error) {
//       return rejectWithValue("Failed to fetch player");
//     }
//   }
// );

// const userByRankSlice = createSlice({
//   name: "userByRank",
//   initialState: {
//     user: null,
//     loading: false,
//     error: null,
//   },
//   reducers: {
//     clearUserByRank: (state) => {
//       state.user = null;
//       state.loading = false;
//       state.error = null;
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       .addCase(fetchUserByRank.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchUserByRank.fulfilled, (state, action) => {
//         state.loading = false;
//         state.user = action.payload;
//       })
//       .addCase(fetchUserByRank.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       });
//   },
// });

// export const { clearUserByRank } = userByRankSlice.actions;
// export default userByRankSlice.reducer;












// ===================== ==>

  import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const APPKEY = "Py9YJXgBecbbqxjRVaHarcSnJyuzhxGqJTkY6xKZRfrdXFy72HPXvFRvfEjy";

export const fetchUserByRank = createAsyncThunk(
  "userByRank/fetchUserByRank",
  async ({ rank, ladder_id }, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        "https://ne-games.com/leaderBoard/api/user/detailsByrank",
        {
          params: { rank, ladder_id },
          headers: { appkey: APPKEY },
        }
      );
      return response.data.data; // ✅ Return only the player object
    } catch (error) {
      return rejectWithValue("Failed to fetch player");
    }
  }
);

const userByRankSlice = createSlice({
  name: "userByRank",
  initialState: {
    user: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearUserByRank: (state) => {
      state.user = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserByRank.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserByRank.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload; // ✅ Set player object
      })
      .addCase(fetchUserByRank.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearUserByRank } = userByRankSlice.actions;
export default userByRankSlice.reducer;
