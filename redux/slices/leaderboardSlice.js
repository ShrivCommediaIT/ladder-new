// redux/slices/leaderboardSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getRequest, postFormData } from "@/services/apiService";
import { API_ENDPOINTS } from "@/constants/api";

// 🚦 Change Player Status
export const changePlayerStatus = createAsyncThunk(
  "players/changePlayerStatus",
  async ({ user_id, player_status }, { rejectWithValue }) => {
    try {
      const data = await getRequest(API_ENDPOINTS.CHANGE_PLAYER_STATUS, {
        user_id,
        player_status,
      });
      if (!data) throw new Error("Failed to update status");
      return { user_id, player_status };
    } catch (error) {
      return rejectWithValue(error.message || "Unknown error");
    }
  }
);

// 🖼 Upload Ladder Logo
export const uploadLadderLogo = createAsyncThunk(
  "players/uploadLadderLogo",
  async ({ file, ladder_id }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("logo", file);
      formData.append("ladder_id", ladder_id);

      const data = await postFormData(API_ENDPOINTS.UPDATE_LADDER_LOGO, formData);
      if (!data) throw new Error("Failed to upload logo");
      return { ladder_id, logo: data.logo };
    } catch (error) {
      return rejectWithValue(error.message || "Unknown error");
    }
  }
);

// 🔒 In-flight request deduplication — prevents multiple concurrent calls for the same data
const pendingRequests = new Set();

// 📋 Fetch Leaderboard
export const fetchLeaderboard = createAsyncThunk(
  "players/fetchLeaderboard",
  async (payload, { rejectWithValue }) => {
    const requestKey = `${payload.ladder_id}-${payload.type || "default"}`;
    try {
      const res = await getRequest(API_ENDPOINTS.LEADERBOARD, {
        ...payload
      });
      if (!res) throw new Error("Failed to fetch leaderboard");

      // Resilient Payload: Spread original response + provide explicit keys
      return { 
        ...res,
        ladder_id: Number(payload.ladder_id || res.ladder_id),
        data: res?.data || [],
        image_path: res?.image_path || "",
        ladderDetails: res?.ladderDetails || {},
      };
    } catch (error) {
      return rejectWithValue(error.message || "Unknown error");
    } finally {
      pendingRequests.delete(requestKey);
    }
  },
  {
    // 🚦 Skip if an identical request is already in-flight
    condition: (payload) => {
      const requestKey = `${payload.ladder_id}-${payload.type || "default"}`;
      if (pendingRequests.has(requestKey)) return false; // abort — already pending
      pendingRequests.add(requestKey);
      return true;
    },
  }
);

// 📤 Upload CSV
export const uploadCSV = createAsyncThunk(
  "players/uploadCSV",
  async ({ file, ladder_id, type }, { dispatch, rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("ladder_id", ladder_id);
      formData.append("file", file);

      const apiUrl =
        type === "minileague"
          ? API_ENDPOINTS.IMPORT_MINILEAGUE
          : API_ENDPOINTS.IMPORT;

      const data = await postFormData(apiUrl, formData);
      if (data.status !== 200) throw new Error(data.message || "CSV upload failed");

      await dispatch(fetchLeaderboard({ ladder_id, type }));
      return { file, message: data.message };
    } catch (error) {
      return rejectWithValue(error.message || "Unknown error");
    }
  }
);

const initialState = {
  players: {},
  loading: false,
  error: null,
  selectedPlayer: null,
  status: "idle",
  lastUploadedCSV: null,
  invertRanking: false,
};

const playersSlice = createSlice({
  name: "players",
  initialState,
  reducers: {
    setSelectedPlayer: (state, action) => {
      state.selectedPlayer = action.payload;
    },
    toggleInvertRanking: (state) => {
      state.invertRanking = !state.invertRanking;
    },
    clearPlayersState: (state) => {
      state.players = {};
      state.selectedPlayer = null;
      state.error = null;
      state.status = "idle";
      state.lastUploadedCSV = null;
    },
    updatePlayerImage: (state, action) => {
      const { user_id, image } = action.payload;
      Object.values(state.players).forEach((ladder) => {
        const idx = ladder.data.findIndex((p) => p.id === user_id);
        if (idx !== -1) ladder.data[idx].image = image;
      });
      if (state.selectedPlayer?.id === user_id) {
        state.selectedPlayer.image = image;
      }
    },
    updatePlayerRank: (state, action) => {
      const { ladder_id, players } = action.payload;
      if (!state.players[ladder_id]) return;
      state.players[ladder_id] = { ...state.players[ladder_id], data: players };
    },
    setPlayers: (state, action) => {
      const { ladder_id, players } = action.payload;
      if (!state.players[ladder_id]) {
        state.players[ladder_id] = { data: [], image_path: "", ladderDetails: {} };
      }
      state.players[ladder_id].data = players;
    },
    updatePlayerRankDirect: (state, action) => {
      const { ladder_id, user_id, new_rank } = action.payload;
      const ladder = state.players[ladder_id];
      if (!ladder) return;
      const index = ladder.data.findIndex((p) => p.id === user_id);
      if (index === -1) return;
      const [player] = ladder.data.splice(index, 1);
      player.rank = new_rank;
      ladder.data.splice(new_rank - 1, 0, player);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLeaderboard.pending, (state) => {
        state.loading = true;
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchLeaderboard.fulfilled, (state, action) => {
        const { ladder_id, data, image_path, ladderDetails } = action.payload;
        state.loading = false;
        state.status = "succeeded";
        state.players[ladder_id] = {
          data: data || [],
          image_path: image_path || "",
          ladderDetails: ladderDetails || {},
        };
      })
      .addCase(fetchLeaderboard.rejected, (state, action) => {
        state.loading = false;
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(uploadLadderLogo.fulfilled, (state, action) => {
        const { ladder_id, logo } = action.payload;
        if (state.players[ladder_id]?.ladderDetails) {
          state.players[ladder_id].ladderDetails.logo = logo;
        }
      })
      .addCase(uploadCSV.pending, (state) => {
        state.loading = true;
        state.status = "loading";
      })
      .addCase(uploadCSV.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.lastUploadedCSV = action.payload.file;
      })
      .addCase(uploadCSV.rejected, (state, action) => {
        state.loading = false;
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(changePlayerStatus.fulfilled, (state, action) => {
        const { user_id, player_status } = action.payload;
        Object.values(state.players).forEach((ladder) => {
          const idx = ladder.data.findIndex((p) => p.id === user_id);
          if (idx !== -1) ladder.data[idx].player_status = player_status;
        });
      });
  },
});

export const {
  setSelectedPlayer,
  clearPlayersState,
  updatePlayerImage,
  updatePlayerRank,
  setPlayers,
  updatePlayerRankDirect,
  toggleInvertRanking,
} = playersSlice.actions;

export default playersSlice.reducer;
