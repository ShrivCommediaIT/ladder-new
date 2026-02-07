

// ================= new version =>

  import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const APPKEY = "Py9YJXgBecbbqxjRVaHarcSnJyuzhxGqJTkY6xKZRfrdXFy72HPXvFRvfEjy";

export const editUserDetails = createAsyncThunk(
  "editdetail/editUserDetails",
  async ({ user_id, formData }, { rejectWithValue }) => {
    try {
      if (!user_id) throw new Error("User ID is required.");

      const data = new FormData();
      data.append("user_id", user_id);
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          data.append(key, value);
        }
      });

      const res = await axios.post(
        "https://ne-games.com/leaderBoard/api/user/editDetails",
        data,
        {
          headers: {
            APPKEY,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return res.data;
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || "Update failed";
      return rejectWithValue(message);
    }
  }
);

const editPlayerSlice = createSlice({
  name: "editdetail",
  initialState: {
    loading: false,
    successMessage: null,
    error: null,
  },
  reducers: {
    resetEditPlayerState: (state) => {
      state.loading = false;
      state.successMessage = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(editUserDetails.pending, (state) => {
        state.loading = true;
        state.successMessage = null;
        state.error = null;
      })
      .addCase(editUserDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage =
          action.payload?.success_message || "Player updated successfully.";
      })
      .addCase(editUserDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetEditPlayerState } = editPlayerSlice.actions;
export default editPlayerSlice.reducer;
