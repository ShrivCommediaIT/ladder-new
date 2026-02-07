

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// 🔑 API Token (AppKey)
const APPKEY = "Py9YJXgBecbbqxjRVaHarcSnJyuzhxGqJTkY6xKZRfrdXFy72HPXvFRvfEjy";

// ----------------- FETCH GRADEBARS -----------------
export const fetchGradebars = createAsyncThunk(
  "gradebar/fetchGradebars",
  async (ladder_id, { rejectWithValue }) => {
    try {
      const res = await fetch(
        `https://ne-games.com/leaderBoard/api/user/leaderboard?ladder_id=${ladder_id}`,
        {
          headers: {
            appkey: APPKEY,
          },
        }
      );

      const data = await res.json();
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


// ----------------- UPDATE GRADEBAR DETAILS -----------------
export const updategradeBar = createAsyncThunk(
  "gradebar/updategradeBar",
  async ({ gradebar_id, gradebar_details }, { rejectWithValue }) => {
    try {
      if (!gradebar_id) throw new Error("gradebar_id is required!");

      const res = await fetch(
        `https://ne-games.com/leaderBoard/api/user/updategradeBar`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            appkey: APPKEY,
          },
          body: JSON.stringify({
            gradebar_id,
            gradebar_details: gradebar_details.map((g) => ({
              gradebar_details_id: g.id, // 👈 API ko ye chahiye
              gradebar_name: g.gradebar_name || "",
              player_id: g.player_id || null, // 👈 agar players bhi hai toh unka id pass karo
            })),
          }),
        }
      );

      const data = await res.json();

      if (data.status !== 200) {
        return rejectWithValue(
          data.error_message || data.message || "Failed to update gradebar"
        );
      }

      return {
        gradebar_details,
        message: data.success_message ,
      };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);


// ----------------- RESET GRADEBAR -----------------
export const resetGradebar = createAsyncThunk(
  "gradebar/resetGradebar",
  async ({ gradebar_id, ladder_id, preset, gradebar_name }, { rejectWithValue }) => {
    try {
      if (!gradebar_id) throw new Error("gradebar_id is required!");
      if (!ladder_id) throw new Error("ladder_id is required!");

      const res = await fetch(
        `https://ne-games.com/leaderBoard/api/user/resetgradeBar`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            appkey: APPKEY,
          },
          body: JSON.stringify({
            gradebar_id,
            ladder_id,
            preset,
            gradebar_name,
          }),
        }
      );

      const data = await res.json();
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

// ----------------- SLICE -----------------
const gradebarSlice = createSlice({
  name: "gradebar",
  initialState: {
    gradebarDetails: [],
    ladderDetails: {}, // ✅ ADD
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
    state.primaryGradebarName = action.payload; // ✅ नया reducer
  },

  },
  extraReducers: (builder) => {
    builder
      // fetch
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

      // update
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

      // reset
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

// export const { updateLocalGradebarName } = gradebarSlice.actions;
export const {
  updateLocalGradebarName,
  updatePrimaryGradebarName, // ✅ अब available
} = gradebarSlice.actions;
export default gradebarSlice.reducer;