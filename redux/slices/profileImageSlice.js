



// // ================
// // redux/slices/profileImageSlice.js
// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import axios from "axios";

// // App key
// const APPKEY = "Py9YJXgBecbbqxjRVaHarcSnJyuzhxGqJTkY6xKZRfrdXFy72HPXvFRvfEjy";

// // Async thunk to upload profile image
// export const uploadProfileImage = createAsyncThunk(
//   "profileImage/upload",
//   async ({ id, image }, { rejectWithValue }) => {
//     try {
//       const formData = new FormData();
//       formData.append("id", id);
//       formData.append("image", image);

//       const response = await axios.post(
//         "https://ne-games.com/leaderBoard/api/user/updateProfileImage",
//         formData,
//         {
//           headers: {
//             "Content-Type": "multipart/form-data",
//             "APPKEY": APPKEY, // 🔐 Custom header
//           },
//         }
//       );

//       return response.data;
//     } catch (error) {
//       return rejectWithValue(
//         error.response?.data || "Image upload failed. Try again."
//       );
//     }
//   }
// );

// const profileImageSlice = createSlice({
//   name: "profileImage",
//   initialState: {
//     loading: false,
//     success: false,
//     error: null,
//     uploadedData: null,
//   },
//   reducers: {
//     resetProfileImageState: (state) => {
//       state.loading = false;
//       state.success = false;
//       state.error = null;
//       state.uploadedData = null;
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       .addCase(uploadProfileImage.pending, (state) => {
//         state.loading = true;
//         state.success = false;
//         state.error = null;
//       })
//       .addCase(uploadProfileImage.fulfilled, (state, action) => {
//         state.loading = false;
//         state.success = true;
//         state.uploadedData = action.payload;
//       })
//       .addCase(uploadProfileImage.rejected, (state, action) => {
//         state.loading = false;
//         state.success = false;
//         state.error = action.payload;
//       });
//   },
// });

// export const { resetProfileImageState } = profileImageSlice.actions;
// export default profileImageSlice.reducer;
















// =========================== ==> 22

// redux/slices/profileImageSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const APPKEY = "Py9YJXgBecbbqxjRVaHarcSnJyuzhxGqJTkY6xKZRfrdXFy72HPXvFRvfEjy";

// Upload profile image
export const uploadProfileImage = createAsyncThunk(
  "profileImage/upload",
  async ({ id, image }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("id", id);
      formData.append("image", image);

      const response = await axios.post(
        "https://ne-games.com/leaderBoard/api/user/updateProfileImage",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            APPKEY,
          },
        }
      );

      return response.data; // full response
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
        state.uploadedData = action.payload; // keep response
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
