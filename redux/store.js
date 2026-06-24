import { configureStore } from "@reduxjs/toolkit";
import storageSession from "redux-persist/lib/storage/session";
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
import fetchLadderIdReducer from "./slices/playersSlice";
import resetLeaderboardReducer from "./slices/resetLeaderboardSlice";
import gradebarReducer from "./slices/gradebarSlice";
import playerResultReducer from "./slices/PlayerResultSlice";
import forgotPasswordReducer from "./slices/forgetPasswordSlice";
import resetPasswordReducer from "./slices/resetPasswordSlice";
import changePasswordReducer from "./slices/changePassword";
import miniLeagueReducer from "./slices/minileagueSlice";
import moveToMiniLeagueReducer from "./slices/minileagueMovingSlice";
import basicLeaderboardReducer from "./slices/BasicLeaderboardSlice";
import positiveLeaderBoardReducer from "./slices/positiveLeaderBoardSlice";
import negativeLeaderBoardReducer from "./slices/negativeLeaderBoardSlice";
import rosterReducer from "./slices/rosterSlice";
import rosterLeaderboardReducer from "./slices/rosterLeaderboardSlice";
import clubReducer from "./slices/clubSlice";
import clubAuthReducer from "./slices/loginClub";          // ✅ renamed from authClubReducer to avoid confusion
import progressFlowReducer from "./slices/progressFlowSlice";
import subscriptionReducer from "./slices/subscriptionSlice"; // ✅ was missing from store

const persistConfig = {
  key: "root",
  storage: storageSession,
  whitelist: [
    "user",
    "clubAuth",
    "profile",
    "profileImage",
    "club",
    "progressFlow",
    "subscription",
  ],
};

const rootReducer = combineReducers({
  user:                   userReducer,          // ✅ standard user auth (register/login)
  clubAuth:               clubAuthReducer,       // ✅ club admin login (was duplicate 'user')
  player:                 playersReducer,
  playerMove:             playerMoveReducer,
  ladder:                 ladderReducer,
  activity:               activityReducer,
  challenge:              challengeReducer,
  editdetail:             editPlayerReducer,
  userByRank:             fetchUserByRankReducer,
  profileImage:           profileImageReducer,
  profile:                profileReducer,
  playerStatus:           playerStatusReducer,
  importUsers:            importUsersReducer,
  fetchLadder:            fetchLaddersReducer,
  fetchLadderId:          fetchLadderIdReducer,
  resetLeaderboard:       resetLeaderboardReducer,
  gradebar:               gradebarReducer,
  playerResult:           playerResultReducer,
  forgotPassword:         forgotPasswordReducer,
  resetPassword:          resetPasswordReducer,
  changePassword:         changePasswordReducer,
  minileague:             miniLeagueReducer,
  minileaguePlayerMoving: moveToMiniLeagueReducer,
  skillLeaderboard:       basicLeaderboardReducer,
  positiveLeaderBoard:    positiveLeaderBoardReducer,
  negativeLeaderBoard:    negativeLeaderBoardReducer,
  club:                   clubReducer,
  roster:                 rosterReducer,
  rosterLeaderboard:      rosterLeaderboardReducer,
  progressFlow:           progressFlowReducer,
  subscription:           subscriptionReducer,  // ✅ added
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