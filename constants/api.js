// constants/api.js
// ✅ All API config read from .env.local — never hardcode these!

export const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "https://ne-games.com/leaderBoard/api";

export const APPKEY =
  process.env.NEXT_PUBLIC_APPKEY ||
  "Py9YJXgBecbbqxjRVaHarcSnJyuzhxGqJTkY6xKZRfrdXFy72HPXvFRvfEjy";

// ─────────────────────────────────────────────
// ALL API ENDPOINTS — grouped by domain
// ─────────────────────────────────────────────

export const API_ENDPOINTS = {
  // ── Auth ─────────────────────────────────────
  LOGIN:              "/user/login",
  REGISTER:           "/user/register",
  FORGOT_PASSWORD:    "/user/forgot/password",
  RESET_PASSWORD:     "/user/changeforgotpassword",
  CHANGE_PASSWORD:    "/user/change/password",

  // ── User / Profile ───────────────────────────
  PROFILE:                "/user/profile",
  EDIT_DETAILS:           "/user/editDetails",
  UPDATE_PROFILE_IMAGE:   "/user/updateProfileImage",
  GET_LADDER_BY_USER_ID:  "/user/getLadderByUserId",

  // ── Ladder ───────────────────────────────────
  LADDER_LIST:        "/user/ladderList",
  CREATE_LADDER:      "/user/creatLadder",
  UPDATE_LADDER_TOKEN:"/user/updateLadderToken",
  UPDATE_LADDER_LOGO: "/user/updateladderlogo",

  // ── Leaderboard ──────────────────────────────
  LEADERBOARD:        "/user/leaderboard",
  RESET_LEADERBOARD:  "/user/Resetleaderboard",

  // ── Players ──────────────────────────────────
  DETAILS_BY_RANK:    "/user/detailsByrank",
  CHANGE_PLAYER_STATUS:"/user/changePlayerStatus",

  // ── Results / Moving ─────────────────────────
  RESULT_SAVE:          "/user/result/save",
  RESULT_SHOW:          "/user/result/show",
  MOVE_TO:              "/user/move_to",
  RESULT_BESTOF5:       "/user/resultforbestof5/save",
  RESULT_MINILEAGUE:    "/user/resultpostminileague/save",
  MOVE_TO_MINILEAGUE:   "/user/move_to_minileague",

  // ── Activity & Challenge ──────────────────────
  ACTIVITY:           "/user/activity",
  CHALLENGE_TO:       "/user/challenge_to",

  // ── Import / Upload ──────────────────────────
  IMPORT:             "/user/import",
  IMPORT_MINILEAGUE:  "/user/importminileague",
  IMPORT_SKILL:       "/user/importskill",
  IMPORT_ROSTER:      "/user/importRoster",

  // ── Gradebar ─────────────────────────────────
  UPDATE_GRADEBAR:    "/user/updategradeBar",
  RESET_GRADEBAR:     "/user/resetgradeBar",

  // ── Subscription ─────────────────────────────
  BUY_SUBSCRIPTION:   "/user/buySubscription",

  // ── Progress Flow ────────────────────────────
  GET_PROGRESS_FLOW:    "/user/getProgressFlow",
  UPDATE_PROGRESS_FLOW: "/user/updateProgressFlow",

  // ── Club (App User) ──────────────────────────
  APP_USER_CREATE:    "/app/user/create",
  APP_USER_LOGIN:     "/app/user/login",
};