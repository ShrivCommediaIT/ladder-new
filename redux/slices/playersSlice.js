// redux/slices/playersSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getRequest, postFormData } from "@/services/apiService";
import { API_ENDPOINTS } from "@/constants/api";

// 🔄 Fetch Leaderboard
export const fetchLeaderboard = createAsyncThunk(
  "players/fetchLeaderboard",
  async ({ ladder_id }, thunkAPI) => {
    try {
      const data = await getRequest(API_ENDPOINTS.LEADERBOARD, { ladder_id });
      return {
        ladder_id,
        data: data.data,
        image_path: data.image_path,
        gradebarDetails: data.gradebarDetails || [],
        ladderDetails: data.ladderDetails || null,
      };
    } catch (err) {
      return thunkAPI.rejectWithValue("Failed to fetch leaderboard.");
    }
  }
);

// 📤 Upload CSV
export const uploadCSV = createAsyncThunk(
  "players/uploadCSV",
  async ({ file, ladder_id }, { dispatch, rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("ladder_id", ladder_id);

      const data = await postFormData(API_ENDPOINTS.IMPORT, formData);
      if (!data) throw new Error("Upload failed");

      await dispatch(fetchLeaderboard({ ladder_id }));
      return true;
    } catch (error) {
      return rejectWithValue(error.message || "Unknown error");
    }
  }
);

// 🔁 Change Player Status
export const changePlayerStatus = createAsyncThunk(
  "players/changePlayerStatus",
  async ({ user_id, player_status }, { rejectWithValue }) => {
    try {
      await getRequest(API_ENDPOINTS.CHANGE_PLAYER_STATUS, {
        user_id,
        player_status,
      });
      return { user_id, player_status };
    } catch (err) {
      return rejectWithValue(err.message || "Unknown error");
    }
  }
);

const initialState = {
  playersByLadder: {},
  image_path: "",
  loading: false,
  error: null,
  selectedPlayer: null,
  gradebarDetails: [],
};

const playersSlice = createSlice({
  name: "playersLadder",
  initialState,
  reducers: {
    setSelectedPlayer: (state, action) => {
      state.selectedPlayer = action.payload;
    },
    clearPlayersState: (state) => {
      state.playersByLadder = {};
      state.selectedPlayer = null;
      state.error = null;
      state.loading = false;
    },
    updatePlayerImage: (state, action) => {
      const { ladder_id, user_id, image } = action.payload;
      const playerList = state.playersByLadder[ladder_id];
      if (!playerList) return;
      const playerIndex = playerList.findIndex((p) => p.id === user_id);
      if (playerIndex !== -1) {
        state.playersByLadder[ladder_id][playerIndex].image = image;
      }
      if (state.selectedPlayer?.id === user_id) {
        state.selectedPlayer.image = image;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLeaderboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLeaderboard.fulfilled, (state, action) => {
        const { ladder_id, data, image_path, gradebarDetails } = action.payload;
        state.loading = false;
        state.playersByLadder[ladder_id] = data;
        state.image_path = image_path;
        state.gradebarDetails = gradebarDetails;
      })
      .addCase(fetchLeaderboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(uploadCSV.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadCSV.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(uploadCSV.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(changePlayerStatus.fulfilled, (state, action) => {
        const { user_id, player_status } = action.payload;
        for (const ladder_id in state.playersByLadder) {
          const player = state.playersByLadder[ladder_id].find(
            (p) => p.id === user_id
          );
          if (player) {
            player.player_status = player_status;
            break;
          }
        }
      });
  },
});

export const { setSelectedPlayer, clearPlayersState, updatePlayerImage } =
  playersSlice.actions;
export default playersSlice.reducer;
