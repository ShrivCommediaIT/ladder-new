// redux/slices/editdetailSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { postFormData } from "@/services/apiService";
import { API_ENDPOINTS } from "@/constants/api";

export const editUserDetails = createAsyncThunk(
  "editdetail/editUserDetails",
  async ({ user_id, formData }, { rejectWithValue }) => {
    try {
      if (!user_id) throw new Error("User ID is required.");

      const data = new FormData();
      data.append("user_id", user_id);
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null && key !== "user_id") {
          data.append(key, value);
        }
      });

      const res = await postFormData(API_ENDPOINTS.EDIT_DETAILS, data);
      return res;
    } catch (err) {
      const message = err.response?.data?.message || err.message || "Update failed";
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
