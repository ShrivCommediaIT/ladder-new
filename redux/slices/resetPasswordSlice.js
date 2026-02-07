// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import axios from "axios";

// const API_URL = "https://ne-games.com/leaderBoard/api/user/changeforgotpassword";
// const APP_KEY =
//   "Py9YJXgBecbbqxjRVaHarcSnJyuzhxGqJTkY6xKZRfrdXFy72HPXvFRvfEjy";

// // Async thunk
// export const resetPassword = createAsyncThunk(
//   "auth/resetPassword",
//   async ({ email, password, id }, { rejectWithValue }) => {
//     try {
//       const formData = new FormData();
//       formData.append("email", email);
//       formData.append("password", password);
//       formData.append("id", id);

//       const response = await axios.post(API_URL, formData, {
//         headers: {
//           APPKEY: APP_KEY,
//         },
//       });

//       return response.data;
//     } catch (error) {
//       return rejectWithValue(
//         error.response?.data || "Something went wrong, please try again"
//       );
//     }
//   }
// );

// const resetPasswordSlice = createSlice({
//   name: "resetPassword",
//   initialState: {
//     loading: false,
//     success: false,
//     error: null,
//     message: "",
//   },
//   reducers: {
//     resetResetPasswordState: (state) => {
//       state.loading = false;
//       state.success = false;
//       state.error = null;
//       state.message = "";
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       .addCase(resetPassword.pending, (state) => {
//         state.loading = true;
//         state.success = false;
//         state.error = null;
//       })
//       .addCase(resetPassword.fulfilled, (state, action) => {
//         state.loading = false;
//         state.success = true;
//         state.message =
//           action.payload?.message || "Password reset successfully!";
//       })
//       .addCase(resetPassword.rejected, (state, action) => {
//         state.loading = false;
//         state.success = false;
//         state.error = action.payload || "Failed to reset password";
//       });
//   },
// });

// export const { resetResetPasswordState } = resetPasswordSlice.actions;
// export default resetPasswordSlice.reducer;














// =========================================

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL =
  "https://ne-games.com/leaderBoard/api/user/changeforgotpassword";
const APP_KEY =
  "Py9YJXgBecbbqxjRVaHarcSnJyuzhxGqJTkY6xKZRfrdXFy72HPXvFRvfEjy";

// Async thunk → Reset karne ke liye (email + password + id bhejna hoga)
export const resetPassword = createAsyncThunk(
  "resetPassword/change",
  async ({ email, password, id }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);
      formData.append("id", id);

      const response = await axios.post(API_URL, formData, {
        headers: {
          APPKEY: APP_KEY,
        },
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.response?.data ||
          "Something went wrong, please try again"
      );
    }
  }
);

const resetPasswordSlice = createSlice({
  name: "resetPassword",
  initialState: {
    loading: false,
    success: false,
    error: null,
    message: "",
  },
  reducers: {
    resetResetPasswordState: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
      state.message = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message =
          action.payload?.message || "Password reset successfully!";
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error =
          action.payload || "Failed to reset password. Try again later!";
      });
  },
});

export const { resetResetPasswordState } = resetPasswordSlice.actions;
export default resetPasswordSlice.reducer;
