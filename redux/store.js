

// store.js
import { configureStore } from "@reduxjs/toolkit";
import storageSession from "redux-persist/lib/storage/session"; // 👈 sessionStorage
import { persistReducer, persistStore } from "redux-persist";
import { combineReducers } from "redux";

import userReducer from "./slices/userSlice";
import playersReducer from "./slices/leaderboardSlice";
import playerMoveReducer from "./slices/playerMovingSlice";
import ladderReducer from "./slices/ladderSlice";
import activityReducer from "./slices/activitySlice";
import challengeReducer from "./slices/challengeSlice";
import editPlayerReducer from "./slices/editdetailSlice";
import fetchUserByRankReducer from "./slices/fetchUserByRank";
import profileImageReducer from "./slices/profileImageSlice";
import profileReducer from "./slices/profileSlice";
import playerStatusReducer from "./slices/playerStatusSlice";
import importUsersReducer from "./slices/importSlice";

import fetchLaddersReducer from "./slices/fetchLadderSlice";
import fetchLadderIdReducer from './slices/playersSlice'
import  resetLeaderboardReducer from "./slices/resetLeaderboardSlice";
import gradebarReducer from "./slices/gradebarSlice"
import playerResultReducer from "./slices/PlayerResultSlice"

import forgotPasswordReducer from "./slices/forgetPasswordSlice"
import resetPasswordReducer from "./slices/resetPasswordSlice"
import changePasswordReducer from "./slices/changePassword"
import miniLeagueReducer from "./slices/minileagueSlice";
import moveToMiniLeagueReducer  from "./slices/minileagueMovingSlice";
import basicLeaderboardReducer from "./slices/BasicLeaderboardSlice";
import rosterReducer from "./slices/rosterSlice";
import rosterLeaderboardReducer from "./slices/rosterLeaderboardSlice";

import clubReducer from "./slices/clubSlice"; 
import authClubReducer from "./slices/loginClub";


const persistConfig = {
  key: "root",
  storage: storageSession, // 👈 ab sessionStorage
  whitelist: [
    "user",
    "player",
    "playerMove",
    "ladder",
    "activity",
    "editdetail",
    "userByRank",
    "profileImage",
    "players",
    "playerStatus",
    "import",
    "ladderlist",
    "playersLadder",
    "resetLeaderboard",
    "gradebar",
    "playerResult",
    "minileague",
    "minileaguePlayerMoving",
    "skillLeaderboard",
    "club",
    "roster",
    "rosterLeaderboard",
  ],
};

const rootReducer = combineReducers({
  user: userReducer,
  player: playersReducer,
  playerMove: playerMoveReducer,
  ladder: ladderReducer,
  activity: activityReducer,
  challenge: challengeReducer,
  editdetail: editPlayerReducer,
  userByRank: fetchUserByRankReducer,
  profileImage: profileImageReducer,
  profile: profileImageReducer,
  playerStatus: playerStatusReducer,
  importUsers: importUsersReducer,
  createLadder: ladderReducer,
  fetchLadder: fetchLaddersReducer,
  fetchLadderId: fetchLadderIdReducer,
  resetLeaderboard: resetLeaderboardReducer,
  gradebar: gradebarReducer,
  playerResult: playerResultReducer,
  forgotPassword: forgotPasswordReducer,
  resetPassword:resetPasswordReducer,
  changePassword:changePasswordReducer,
  minileague: miniLeagueReducer,
  minileaguePlayerMoving: moveToMiniLeagueReducer,
  skillLeaderboard: basicLeaderboardReducer,
  club: clubReducer,
  user: authClubReducer,
  roster: rosterReducer,
  rosterLeaderboard: rosterLeaderboardReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);
