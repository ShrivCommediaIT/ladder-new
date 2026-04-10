// redux/slices/gradebarSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getRequest, postRequest } from "@/services/apiService";
import { API_ENDPOINTS } from "@/constants/api";

// Fetch Gradebars
export const fetchGradebars = createAsyncThunk(
  "gradebar/fetchGradebars",
  async (ladder_id, { rejectWithValue }) => {
    try {
      const data = await getRequest(API_ENDPOINTS.LEADERBOARD, { ladder_id });
      if (data.status !== 200) {
        return rejectWithValue(data.message || "Failed to fetch gradebars");
      }
      return {
        gradebarDetails: data.gradebarDetails || [],
        gradebar: data.gradebar || {},
        preset: data.gradebar?.preset || 6,
        ladderDetails: data.ladderDetails || {},
      };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Update Gradebar Details
export const updategradeBar = createAsyncThunk(
  "gradebar/updategradeBar",
  async ({ gradebar_id, gradebar_details }, { rejectWithValue }) => {
    try {
      if (!gradebar_id) throw new Error("gradebar_id is required!");

      const data = await postRequest(API_ENDPOINTS.UPDATE_GRADEBAR, {
        gradebar_id,
        gradebar_details: gradebar_details.map((g) => ({
          gradebar_details_id: g.id,
          gradebar_name: g.gradebar_name || "",
          player_id: g.player_id || null,
        })),
      });

      if (data.status !== 200) {
        return rejectWithValue(
          data.error_message || data.message || "Failed to update gradebar"
        );
      }
      return { gradebar_details, message: data.success_message };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Reset Gradebar
export const resetGradebar = createAsyncThunk(
  "gradebar/resetGradebar",
  async ({ gradebar_id, ladder_id, preset, gradebar_name }, { rejectWithValue }) => {
    try {
      if (!gradebar_id) throw new Error("gradebar_id is required!");
      if (!ladder_id) throw new Error("ladder_id is required!");

      const data = await postRequest(API_ENDPOINTS.RESET_GRADEBAR, {
        gradebar_id,
        ladder_id,
        preset,
        gradebar_name,
      });

      if (data.status !== 200) {
        return rejectWithValue(data.message || "Failed to reset gradebar");
      }
      return {
        gradebar: data.data.gradebar,
        gradebarDetails: data.data.gradebar_details,
        preset: data.data.gradebar.preset,
      };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const gradebarSlice = createSlice({
  name: "gradebar",
  initialState: {
    gradebarDetails: [],
    ladderDetails: {},
    gradebar: {},
    preset: 10,
    loading: false,
    updating: false,
    error: null,
    primaryGradebarName: null,
  },
  reducers: {
    updateLocalGradebarName: (state, action) => {
      const { updatedGrades } = action.payload;
      state.gradebarDetails = updatedGrades;
    },
    updatePrimaryGradebarName: (state, action) => {
      state.primaryGradebarName = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGradebars.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGradebars.fulfilled, (state, action) => {
        state.loading = false;
        state.gradebarDetails = action.payload.gradebarDetails;
        state.gradebar = action.payload.gradebar;
        state.preset = action.payload.preset;
        state.ladderDetails = action.payload.ladderDetails;
      })
      .addCase(fetchGradebars.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updategradeBar.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updategradeBar.fulfilled, (state, action) => {
        state.updating = false;
        state.gradebarDetails = action.payload.gradebar_details;
      })
      .addCase(updategradeBar.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload;
      })
      .addCase(resetGradebar.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(resetGradebar.fulfilled, (state, action) => {
        state.updating = false;
        state.gradebar = action.payload.gradebar;
        state.gradebarDetails = action.payload.gradebarDetails;
        state.preset = action.payload.preset;
      })
      .addCase(resetGradebar.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload;
      });
  },
});

export const { updateLocalGradebarName, updatePrimaryGradebarName } =
  gradebarSlice.actions;
export default gradebarSlice.reducer;