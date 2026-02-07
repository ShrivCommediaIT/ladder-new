import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// 🔐 Move to .env.local in production
const APPKEY =
  process.env.NEXT_PUBLIC_APPKEY ||
  "Py9YJXgBecbbqxjRVaHarcSnJyuzhxGqJTkY6xKZRfrdXFy72HPXvFRvfEjy";

/* --------------------------------------
   🎯 Async Thunks
-------------------------------------- */

// 🚦 Change Player Status
export const changePlayerStatus = createAsyncThunk(
  "players/changePlayerStatus",
  async ({ user_id, player_status }, { rejectWithValue }) => {
    try {
      const res = await fetch(
        `https://ne-games.com/leaderBoard/api/user/changePlayerStatus?user_id=${user_id}&player_status=${player_status}`,
        {
          method: "GET",
          headers: { APPKEY },
        },
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update status");

      return { user_id, player_status };
    } catch (error) {
      return rejectWithValue(error.message || "Unknown error");
    }
  },
);

// 🖼 Upload Ladder Logo
export const uploadLadderLogo = createAsyncThunk(
  "players/uploadLadderLogo",
  async ({ file, ladder_id }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("logo", file);
      formData.append("ladder_id", ladder_id);

      const res = await fetch(
        "https://ne-games.com/leaderBoard/api/user/updateladderlogo",
        {
          method: "POST",
          headers: { APPKEY },
          body: formData,
        },
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to upload logo");

      return { ladder_id, logo: data.logo }; // ✅ safer return format
    } catch (error) {
      return rejectWithValue(error.message || "Unknown error");
    }
  },
);

export const fetchLeaderboard = createAsyncThunk(
  "players/fetchLeaderboard",
  async (
    { ladder_id, type = "bestof5" || "best3" || "winlose" },
    { rejectWithValue },
  ) => {
    try {
      // ✔ ALWAYS send type directly
      const url = `https://ne-games.com/leaderBoard/api/user/leaderboard?ladder_id=${ladder_id}&type=${type}`;

      const res = await fetch(url, { headers: { APPKEY } });
      const data = await res.json();

      if (!res.ok)
        throw new Error(data.message || "Failed to fetch leaderboard");

      return { ladder_id, ...data };
    } catch (error) {
      return rejectWithValue(error.message || "Unknown error");
    }
  },
);

export const uploadCSV = createAsyncThunk(
  "players/uploadCSV",
  async ({ file, ladder_id, type }, { dispatch, rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("ladder_id", ladder_id);
      formData.append("file", file);

      // ✅ TYPE KE HISAB SE API SELECT
      const apiUrl =
        type === "minileague"
          ? "https://ne-games.com/leaderBoard/api/user/importminileague"
          : "https://ne-games.com/leaderBoard/api/user/import";

      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { APPKEY },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || data.status !== 200) {
        throw new Error(data.message || "CSV upload failed");
      }

      // ✅ CSV UPLOAD KE BAAD TYPE KE SAATH REFRESH
      await dispatch(fetchLeaderboard({ ladder_id, type }));

      return { file, message: data.message };
    } catch (error) {
      return rejectWithValue(error.message || "Unknown error");
    }
  },
);

/* --------------------------------------
   🧠 Initial State
-------------------------------------- */
const initialState = {
  players: {}, // { [ladder_id]: { data: [], image_path, ladderDetails } }
  loading: false,
  error: null,
  selectedPlayer: null,
  status: "idle", // idle | loading | succeeded | failed
  lastUploadedCSV: null,
  invertRanking: false,
};

/* --------------------------------------
   🏗 Slice
-------------------------------------- */
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
      state.players[ladder_id] = {
        ...state.players[ladder_id],
        data: players,
      };
    },
    setPlayers: (state, action) => {
      const { ladder_id, players } = action.payload;
      if (!state.players[ladder_id]) {
        state.players[ladder_id] = {
          data: [],
          image_path: "",
          ladderDetails: {},
        };
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
      /* --- Fetch Leaderboard --- */
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

      /* --- Upload Ladder Logo --- */
      .addCase(uploadLadderLogo.fulfilled, (state, action) => {
        const { ladder_id, logo } = action.payload;
        if (state.players[ladder_id]?.ladderDetails) {
          state.players[ladder_id].ladderDetails.logo = logo;
        }
      })

      /* --- Upload CSV --- */
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

      /* --- Change Player Status --- */
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

// export { fetchLeaderboard }

export default playersSlice.reducer;
