import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Replace with .env variable in production
const APPKEY = "Py9YJXgBecbbqxjRVaHarcSnJyuzhxGqJTkY6xKZRfrdXFy72HPXvFRvfEjy";

// 🔄 Fetch Leaderboard
export const fetchLeaderboard = createAsyncThunk(
  "players/fetchLeaderboard",
  async ({ ladder_id }, thunkAPI) => {
    try {
      const res = await axios.get(
        `https://ne-games.com/leaderBoard/api/user/leaderboard?ladder_id=${ladder_id}`
      );
      return { ladder_id, data: res.data.data, image_path: res.data.image_path, gradebarDetails: res.data.gradebarDetails || [],ladderDetails: res.data.ladderDetails || null };
    } catch (err) {
      return thunkAPI.rejectWithValue("Failed to fetch leaderboard.");
    }
  }
);
// console.log("Full API response:", res.data);

// 📤 Upload CSV
export const uploadCSV = createAsyncThunk(
  "players/uploadCSV",
  async ({ file, ladder_id }, { dispatch, rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("ladder_id", ladder_id);

      const res = await fetch("https://ne-games.com/leaderBoard/api/user/import", {
        method: "POST",
        headers: { APPKEY },
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Upload failed");
      }

      // Refetch after successful upload
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
      const res = await fetch(
        `https://ne-games.com/leaderBoard/api/user/changePlayerStatus?user_id=${user_id}&player_status=${player_status}`,
        {
          method: "GET",
          headers: { APPKEY },
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update status");
      }

      return { user_id, player_status };
    } catch (err) {
      return rejectWithValue(err.message || "Unknown error");
    }
  }
);

const initialState = {
  playersByLadder: {}, // 🔄 Ladder-wise player data
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
      // 🟡 Fetch Leaderboard
      .addCase(fetchLeaderboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLeaderboard.fulfilled, (state, action) => {
        const { ladder_id, data, image_path } = action.payload;
        const { name,  id: ladderId, logo } = action.payload.ladderDetails || {};
        const gradebarDetails = action.payload.gradebarDetails || [];

        state.loading = false;
        state.playersByLadder[ladder_id] = data;
        state.image_path = image_path;
        state.gradebarDetails = gradebarDetails;
        
      })
      .addCase(fetchLeaderboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 📤 CSV Upload
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

      // 🔄 Change Player Status
      .addCase(changePlayerStatus.fulfilled, (state, action) => {
        const { user_id, player_status } = action.payload;
        for (const ladder_id in state.playersByLadder) {
          const player = state.playersByLadder[ladder_id].find((p) => p.id === user_id);
          if (player) {
            player.player_status = player_status;
            break;
          }
        }
      });
  },
});

export const { setSelectedPlayer, clearPlayersState, updatePlayerImage } = playersSlice.actions;
export default playersSlice.reducer;














