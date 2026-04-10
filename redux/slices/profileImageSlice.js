// redux/slices/profileImageSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { postFormData } from "@/services/apiService";
import { API_ENDPOINTS } from "@/constants/api";

export const uploadProfileImage = createAsyncThunk(
  "profileImage/upload",
  async ({ id, image }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("id", id);
      formData.append("image", image);

      const data = await postFormData(
        API_ENDPOINTS.UPDATE_PROFILE_IMAGE,
        formData
      );
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Image upload failed. Try again."
      );
    }
  }
);

const profileImageSlice = createSlice({
  name: "profileImage",
  initialState: {
    loading: false,
    success: false,
    error: null,
    uploadedData: null,
  },
  reducers: {
    resetProfileImageState: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
      state.uploadedData = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(uploadProfileImage.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(uploadProfileImage.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.uploadedData = action.payload;
      })
      .addCase(uploadProfileImage.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload;
      });
  },
});

export const { resetProfileImageState } = profileImageSlice.actions;
export default profileImageSlice.reducer;
