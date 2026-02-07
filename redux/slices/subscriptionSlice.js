// features/subscription/subscriptionSlice.js

// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import axios from "axios";

// const APPKEY = "Py9YJXgBecbbqxjRVaHarcSnJyuzhxGqJTkY6xKZRfrdXFy72HPXvFRvfEjy";

// // ✅ Async thunk to buy subscription
// export const buySubscription = createAsyncThunk(
//   "subscription/buySubscription",
//   async ({ user_id, subscription }, thunkAPI) => {
//     try {
//       const response = await axios.post(
//         "https://ne-games.com/leaderBoard/api/user/buySubscription",
//         {
//           user_id,
//           subscription, // "free" | "monthly" | "yearly"
//         },
//         {
//           headers: {
//             APPKEY: APPKEY,
//           },
//         }
//       );
//       return response.data;
//     } catch (error) {
//       return thunkAPI.rejectWithValue(error.response?.data || "Subscription failed");
//     }
//   }
// );

// const subscriptionSlice = createSlice({
//   name: "subscription",
//   initialState: {
//     loading: false,
//     error: null,
//     data: null,
//   },
//   reducers: {},
//   extraReducers: (builder) => {
//     builder
//       .addCase(buySubscription.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(buySubscription.fulfilled, (state, action) => {
//         state.loading = false;
//         state.data = action.payload;
//       })
//       .addCase(buySubscription.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       });
//   },
// });

// export default subscriptionSlice.reducer;










import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

 const APPKEY = "Py9YJXgBecbbqxjRVaHarcSnJyuzhxGqJTkY6xKZRfrdXFy72HPXvFRvfEjy";


export const buySubscription = createAsyncThunk(
  "subscription/buySubscription",
  async (
    { user_id, no_of_users, subscription_type, amount, transaction_id, transaction_status },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.post(
        "https://ne-games.com/leaderBoard/api/user/buySubscription",
        {
          user_id,
          no_of_users,
          subscription_type,
          amount,
          transaction_id,
          transaction_status,
        },
        {
          headers: {
            APPKEY: APPKEY,
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const subscriptionSlice = createSlice({
  name: "subscription",
  initialState: { loading: false, error: null, data: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(buySubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(buySubscription.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(buySubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default subscriptionSlice.reducer;
