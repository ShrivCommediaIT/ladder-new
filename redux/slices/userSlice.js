// =========================== ==> 25/08/25
// Prakash

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { differenceInDays, parseISO } from "date-fns";

// const getUserFromStorage = () => {
//   if (typeof window !== "undefined") {
//     try {
//       const data = localStorage.getItem("userData");
//       return data ? JSON.parse(data) : null;
//     } catch {
//       return null;
//     }
//   }
//   return null;
// };

const APPKEY = "Py9YJXgBecbbqxjRVaHarcSnJyuzhxGqJTkY6xKZRfrdXFy72HPXvFRvfEjy";

// ==================== Thunks ====================

// Register
const registerUser = createAsyncThunk(
  "user/registerUser",
  async (payload, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      Object.entries(payload).forEach(([key, value]) =>
        formData.append(key, value),
      );
      const res = await axios.post(
        "https://ne-games.com/leaderBoard/api/user/register",
        formData,
        { headers: { "Content-Type": "multipart/form-data", APPKEY } },
      );

      if (res.data.status !== 200) return rejectWithValue(res.data);

      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { message: "Registration failed" },
      );
    }
  },
);

// Login
const loginUser = createAsyncThunk(
  "user/loginUser",
  async (payload, { rejectWithValue }) => {
    const url = "https://ne-games.com/leaderBoard/api/user/login";

    const config = {
      headers: {
        APPKEY,
        "Content-Type": "multipart/form-data",
      },
      timeout: 10000, // ✅ important
    };

    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      formData.append(key, value);
    });

    try {
      // ✅ first attempt
      try {
        const res = await axios.post(url, formData, config);

        if (res.data?.status !== 200) {
          return rejectWithValue(res.data);
        }

        return res.data;

      } catch (firstErr) {
        // ✅ retry once automatically
        const res = await axios.post(url, formData, config);

        if (res.data?.status !== 200) {
          return rejectWithValue(res.data);
        }

        return res.data;
      }

    } catch (err) {
      console.log("LOGIN API ERROR:", err);

      if (err.code === "ECONNABORTED") {
        return rejectWithValue({ message: "Server timeout — try again" });
      }

      if (!err.response) {
        return rejectWithValue({ message: "Network/CORS error" });
      }

      return rejectWithValue(
        err.response.data || { message: "Login failed" }
      );
    }
  }
);


// Fetch Ladder
const fetchLadderByUserId = createAsyncThunk(
  "user/fetchLadderByUserId",
  async (userId, { rejectWithValue }) => {
    try {
      const res = await axios.get(
        `https://ne-games.com/leaderBoard/api/user/getLadderByUserId/${userId}`,
        { headers: { APPKEY } },
      );
      return res.data?.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { message: "Ladder fetch failed" },
      );
    }
  },
);

// ✅ Edit user details (name + phone)
export const editUserDetails = createAsyncThunk(
  "user/editUserDetails",
  async ({ id, user_id, name, phone }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("id", id);
      formData.append("user_id", user_id);
      formData.append("name", name);
      formData.append("phone", phone);

      const res = await axios.post(
        "https://ne-games.com/leaderBoard/api/user/editDetails",
        formData,
        { headers: { APPKEY, "Content-Type": "multipart/form-data" } },
      );

      if (res.data.status !== 200) return rejectWithValue(res.data);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { message: "Update failed" },
      );
    }
  },
);

// ==================== Slice ====================
const userSlice = createSlice({
  name: "user",
  initialState: {
    loading: false,
    user: null,
    subscription: null,
    successMessage: null,
    error: null,
    isFreePlanExpired: false,
  },

  reducers: {
    resetUserState: (state) => {
      state.loading = false;
      state.user = null;
      state.subscription = null;
      state.successMessage = null;
      state.error = null;
      state.isFreePlanExpired = false;
    },
    logoutUser: (state) => {
      state.user = null;
      state.subscription = null;
      state.successMessage = null;
      state.error = null;
      state.isFreePlanExpired = false;
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setLadderId: (state, action) => {
      if (state.user) state.user.ladder_id = action.payload;
    },
  },
  extraReducers: (builder) => {
    // REGISTER
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.data;
        state.successMessage =
          action.payload.success_message || "Registered successfully!";
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Registration failed";
      });

    // LOGIN
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;

        const userData = action.payload?.data || null;
        const subscriptionData = action.payload?.subscription || null;

        state.user = userData;
        state.subscription = subscriptionData;
        state.successMessage =
          action.payload.success_message || "Login successful!";
        state.error = null;

        // ✅ VERY IMPORTANT
        if (typeof window !== "undefined" && userData) {
          localStorage.setItem("userData", JSON.stringify(userData));
        }
      })

      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Login failed";
        state.successMessage = null;
      });

    // FETCH LADDER
    builder.addCase(fetchLadderByUserId.fulfilled, (state, action) => {
      if (state.user) state.user.ladder_id = action.payload?.id;
    });

    // ✅ Edit user details (name + phone)
    builder
      .addCase(editUserDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(editUserDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage =
          action.payload?.success_message || "User updated successfully!";
        if (state.user) {
          state.user.name = action.meta.arg.name;
          state.user.phone = action.meta.arg.phone;
        }
        localStorage.setItem("userData", JSON.stringify(state.user));
      })
      .addCase(editUserDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to update user";
      });
  },
});

export const { resetUserState, setUser, logoutUser, setLadderId } =
  userSlice.actions;
export { registerUser, loginUser, fetchLadderByUserId };
export default userSlice.reducer;
