import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// ---------------------- THUNK ----------------------
export const createClub = createAsyncThunk(
  "club/createClub",
  async ({ club_code, club_pin, user_id }, { rejectWithValue }) => {
    try {
      // JSON payload mapping as requested
      const payload = JSON.stringify({
        user_id: user_id,          // admin id
        login_id: club_code,       // club code
        password: club_pin,        // club pin
        user_type: "admin",
      });

      const res = await axios.post(
        "https://ne-games.com/leaderBoard/api/app/user/create",
        payload,
        {
          headers: {
            APPKEY:
              "Py9YJXgBecbbqxjRVaHarcSnJyuzhxGqJTkY6xKZRfrdXFy72HPXvFRvfEjy",
            "Content-Type": "application/json",
          },
        }
      );

      console.log("response", res.data)

      if (res.data?.status === false) {
        return rejectWithValue(res.data?.message || "Club creation failed");
      }

      return res.data;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || err.message || "Server error"
      );
    }
  }
);

// ---------------------- SLICE ----------------------
// const clubSlice = createSlice({
//   name: "club",
//   initialState: {
//     loading: false,
//     success: false,
//     data: null,
//     error: null,
//   },

//   reducers: {
//     resetClubState: (state) => {
//       state.loading = false;
//       state.success = false;
//       state.data = null;
//       state.error = null;
//     },
//   },

//   extraReducers: (builder) => {
//     builder
//       .addCase(createClub.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//         state.success = false;
//       })
//       .addCase(createClub.fulfilled, (state, action) => {
//         state.loading = false;
//         state.success = true;
//         state.data = action.payload;
//       })
//       .addCase(createClub.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//         state.success = false;
//       });
//   },
// });


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
      // Also clear localStorage if needed
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

        // ✅ Save the response to localStorage
        if (action.payload?.data) {
          localStorage.setItem(
            "createdClub",
            JSON.stringify(action.payload.data)
          );
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
