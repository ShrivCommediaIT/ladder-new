import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const loginClub = createAsyncThunk(
  "auth/loginClub",
  async ({ club_id, pin }, { rejectWithValue, dispatch }) => {
    try {
      const payload = JSON.stringify({
        login_id: club_id,
        password: pin,
        user_type: "admin",
      });

      const res = await axios.post(
        "https://ne-games.com/leaderBoard/api/app/user/login",
        payload,
        {
          headers: {
            APPKEY: "Py9YJXgBecbbqxjRVaHarcSnJyuzhxGqJTkY6xKZRfrdXFy72HPXvFRvfEjy",
            "Content-Type": "application/json",
          },
        }
      );

      console.log("response api : ", res.data)

      if (res.data?.status === false) {
        return rejectWithValue(res.data?.message || "Login failed");
      }

      //  GLOBAL USER SET
      dispatch(setUser(res.data.data));

      // optional: localStorage
      localStorage.setItem("userData", JSON.stringify(res.data.data));

      return res.data.data; 
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || err.data.error_message
      );
    }
  }
);



// ---------------------- SLICE ----------------------
const loginSlice = createSlice({
  name: "user",
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
