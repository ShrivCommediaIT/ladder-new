// constants/api.js
// ✅ All API config read from .env.local — never hardcode these!

export const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "https://ne-games.com/leaderBoard/api";

const appKey = process.env.NEXT_PUBLIC_APPKEY;
if (!appKey && typeof window === "undefined") {
  console.error("CRITICAL WARNING: NEXT_PUBLIC_APPKEY environment variable is missing!");
}
export const APPKEY = appKey || "";

export const IMAGE_BASE_URL =
  process.env.NEXT_PUBLIC_IMAGE_BASE_URL ||
  "https://ne-games.com/leaderBoard/public/admin/clip-one/assets/user/original";

// ─────────────────────────────────────────────
// ALL API ENDPOINTS — grouped by domain
// ─────────────────────────────────────────────

export const API_ENDPOINTS = {
  // ── Auth ─────────────────────────────────────
  LOGIN:              "/user/login",
  REGISTER:           "/user/register",
  GUEST_REGISTER:     "/guest/register",
  GUEST_LOGIN:        "/guest/login",
  FORGOT_PASSWORD:    "/user/forgot/password",
  RESET_PASSWORD:     "/user/changeforgotpassword",
  CHANGE_PASSWORD:    "/user/change/password",

  // ── User / Profile ───────────────────────────
  PROFILE:                "/user/profile",
  EDIT_DETAILS:           "/user/editDetails",
  UPDATE_PROFILE_IMAGE:   "/user/updateProfileImage",
  GET_LADDER_BY_USER_ID:  "/user/getLadderByUserId",

  // ── Ladder ───────────────────────────────────
  LADDER_LIST:            "/user/ladderList",
  CREATE_LADDER:          "/user/creatLadder",
  UPDATE_LADDER_TOKEN:    "/user/updateLadderToken",
  UPDATE_LADDER_LOGO:     "/user/updateladderlogo",
  DELETE_LEADERBOARD:     "/user/Deleteleaderboard",

  // ── Leaderboard ──────────────────────────────
  LEADERBOARD:            "/user/leaderboard",
  RESET_LEADERBOARD:      "/user/Resetleaderboard",
  RESET_SCORE:            "/user/resetscore",

  // ── Players ──────────────────────────────────
  DETAILS_BY_RANK:        "/user/detailsByrank",
  CHANGE_PLAYER_STATUS:   "/user/changePlayerStatus",
  ADD_BY_ADMIN:           "/user/addbyadmin",
  REMOVE_USER:            "/user/removeUser",

  // ── Results / Moving ─────────────────────────
  RESULT_SAVE:            "/user/result/save",
  RESULT_SHOW:            "/user/result/show",
  MOVE_TO:                "/user/move_to",
  RESULT_BESTOF5:         "/user/resultforbestof5/save",
  RESULT_MINILEAGUE:      "/user/resultpostminileague/save",
  MOVE_TO_MINILEAGUE:     "/user/move_to_minileague",
  SAVE_PERFORMANCE_RESULT: "/user/savePerformanceResult",
  GET_PERFORMANCE_RESULT_LIST: "/user/getPerformanceResultList",
  PERFORMANCE_RESULT_DETAILS: "/PerformanceResultdetails",
  PERFORMANCE_RESULT_UPDATE: "/PerformanceResultupdate",

  // ── Mini League ──────────────────────────────
  UPDATE_MINILEAGUE:               "/user/update/minileague",
  MINILEAGUE_ADD_BY_ADMIN:         "/user/minileagueaddbyadmin",
  REMOVE_USER_MINILEAGUE:          "/user/removeUserminileague",
  MINILEAGUE_UPDATE_GRADEBAR_NAME: "/user/minileagueupdateGradebarName",
  RESET_MINILEAGUE_SCORE:          "/user/resetscore",

  // ── Skill Leaderboard ────────────────────────
  GET_SKILL_SETUP:         "/user/getskillsetup",
  SKILL_SETUP:             "/user/skillSetup",
  GET_SKILL_BY_NUMBER:     "/user/getskillBynumber",
  POST_RESULT_SKILLBOARD:  "/user/postResultSkillboard",
  GET_TOP_SCORE:           "/user/getTopScore",
  RESET_SKILLBOARD:        "/user/resetSkillboard",
  ADD_USER_SKILLBOARD:     "/user/adduserskillboard",
  DELETE_SKILL_SETUP:      "/user/DeleteskillSetup",

  // ── Activity & Challenge ──────────────────────
  ACTIVITY:               "/user/activity",
  ACTIVITY_DELETE:        "/user/activityDelete",
  CHALLENGE_TO:           "/user/challenge_to",

  // ── Rules ────────────────────────────────────
  GET_RULES_SUGGESTION:   "/user/getRulesSuggestion",
  UPDATE_RULES_DOCUMENT:  "/user/updateRulesDocument",

  // ── Import / Upload ──────────────────────────
  IMPORT:                 "/user/import",
  IMPORT_MINILEAGUE:      "/user/importminileague",
  IMPORT_SKILL:           "/user/importskill",
  IMPORT_ROSTER:          "/user/importRoster",

  // ── Gradebar ─────────────────────────────────
  UPDATE_GRADEBAR:        "/user/updategradeBar",
  RESET_GRADEBAR:         "/user/resetgradeBar",

  // ── Subscription ─────────────────────────────
  BUY_SUBSCRIPTION:       "/user/buySubscription",
  UPDATE_PLAYER_PAYMENT_STATUS: "/user/updatePlayerPaymentStatus",

  // ── Progress Flow ────────────────────────────
  GET_PROGRESS_FLOW:      "/user/getProgressFlow",
  UPDATE_PROGRESS_FLOW:   "/user/updateProgressFlow",

  // ── Club (App User) ──────────────────────────
  APP_USER_CREATE:          "/app/user/create",
  APP_USER_LOGIN:           "/app/user/login",
  APP_USER_UPDATE:          "/app/user/update",
  APP_USER_GET_ALL:         "/app/user/getAll",
  APP_USER_GENERATE_CODES:  "/app/user/generateAccessCodes",
  APP_USER_GET_CODES:       "/app/user/getAccessCodes",
  APP_USER_COUPON_LIST:     "/app/user/couponList",

  // ── Other ─────────────────────────────────────
  INVERTER:               "/user/inverter",
  REDEEM_TOKENS:          "/user/redeemTokens",
  HELPDESK:               "/user/helpDesk",
};
