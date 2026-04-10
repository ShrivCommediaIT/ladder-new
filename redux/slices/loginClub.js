// redux/slices/loginClub.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { postRequest } from "@/services/apiService";
import { API_ENDPOINTS } from "@/constants/api";
import { setUser } from "./userSlice"; // ✅ fixed: was missing import

export const loginClub = createAsyncThunk(
  "auth/loginClub",
  async ({ club_id, pin }, { rejectWithValue, dispatch }) => {
    try {
      const data = await postRequest(API_ENDPOINTS.APP_USER_LOGIN, {
        login_id: club_id,
        password: pin,
        user_type: "admin",
      });

      if (data?.status === false) {
        return rejectWithValue(data?.message || "Login failed");
      }

      // Sync into main user slice
      dispatch(setUser(data.data));

      if (typeof window !== "undefined") {
        localStorage.setItem("userData", JSON.stringify(data.data));
      }

      return data.data;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || err.message || "Login failed"
      );
    }
  }
);

const loginSlice = createSlice({
  name: "clubAuth",  // ✅ renamed from "user" to avoid conflict with userSlice
  initialState: {
    loading: false,
    success: false,
    user: null,
    error: null,
  },
  reducers: {
    resetLoginState: (state) => {
      state.loading = false;
      state.success = false;
      state.user = null;
      state.error = null;
    },
    logout: (state) => {
      state.user = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginClub.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(loginClub.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.user = action.payload;
      })
      .addCase(loginClub.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });
  },
});

export const { resetLoginState, logout } = loginSlice.actions;
export default loginSlice.reducer;
