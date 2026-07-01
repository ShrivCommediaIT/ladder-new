"use client";
import PlayerRankBadge from "@/components/shared/PlayerRankBadge";
import { IMAGE_BASE_URL } from "@/constants/api";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchLeaderboard } from "@/redux/slices/leaderboardSlice";
import { fetchGradebars } from "@/redux/slices/gradebarSlice";
import { fetchSkillLeaderboard } from "@/redux/slices/BasicLeaderboardSlice";
import { fetchNegativeLeaderboard } from "@/redux/slices/negativeLeaderBoardSlice";
import { fetchPositiveLeaderboard } from "@/redux/slices/positiveLeaderBoardSlice";
import { fetchRosterLeaderboard } from "@/redux/slices/rosterLeaderboardSlice";
import { fetchMiniLeague } from "@/redux/slices/minileagueSlice";
import Logo from "@/public/logo.jpg";
import { formatSecondsToTime } from "@/helper/helperFunction";
import PlayerPerformationRanking from "./PlayerPerformationRanking";
import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import PlayerStatusToggle from "./PlayerStatusToggle";
import { PLAYER_COLOR_CLASSES, getPlayerInitials, getPhoneText } from "./ladderUtils";

/* ─────────────────────────────────────────────
   1. DEFAULT CARD  (bestof5 / best5 / best3 / winlose)
───────────────────────────────────────────── */
const DefaultPlayerCard = ({ player, rank }) => {
  const imageUrl = player.image ? `${IMAGE_BASE_URL}/${player.image}?t=${Date.now()}` : null;
  return (
    <div
      className="mb-3 rounded-xl transition-all duration-200 group overflow-hidden"
      style={{
        background: "var(--best-board-surface)",
        border: "1px solid var(--best-board-border-strong)",
        boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
      }}
    >
      {/* ── TOP STRIP ── */}
      <div
        className="flex items-center justify-between px-2 sm:px-3 py-1.5 gap-2"
        style={{
          borderBottom: "1px solid var(--best-board-border)",
          background: "var(--best-board-surface-soft)",
        }}
      >
        <PlayerStatusToggle player={player} user={true} viewOnly={true} />

        <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap justify-end">
          {player.age && (
            <span
              className="text-[9px] sm:text-[10px] font-semibold px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap bg-[var(--best-board-accent-soft)] border border-[var(--best-board-border-strong)] text-[var(--best-board-highlight)]"
            >
              Age : {player.age}
            </span>
          )}
          {player.gender && (
            <span
              className="text-[9px] sm:text-[10px] font-semibold px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap bg-[var(--best-board-accent-soft)] border border-[var(--best-board-border-strong)] text-[var(--best-board-highlight)]"
            >
              Gender: {player.gender === "male" || player.gender === "Male" ? "M" : "F"}
            </span>
          )}
          {player.country && (
            <span
              className="text-[9px] sm:text-[10px] font-semibold px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap bg-[var(--best-board-accent-soft)] border border-[var(--best-board-border-strong)] text-[var(--best-board-highlight)]"
            >
              Country: {player.country}
            </span>
          )}
        </div>
      </div>

      {/* ── MAIN BODY ── */}
      <div className="flex items-center justify-between px-4 py-3 sm:py-4 gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <PlayerRankBadge rank={rank} />

          {/* Avatar (Left side) */}
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={player?.name || "Player"}
              width={64}
              height={64}
              className="h-12 w-12 sm:h-16 sm:w-16 rounded-full object-cover shrink-0"
              unoptimized
            />
          ) : (
            <div className={`flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-gradient-to-br ${PLAYER_COLOR_CLASSES[(Number(rank) - 1) % PLAYER_COLOR_CLASSES.length]} text-sm sm:text-base font-bold text-white shrink-0`}>
              {getPlayerInitials(player?.name)}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <p className="truncate text-h5 font-semibold text-[var(--best-board-text)] mb-0.5">
              {player?.name || "N/A"}
            </p>
            <p className="truncate text-sm text-[var(--best-board-muted)]">
              {getPhoneText(player?.phone)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   2. MINILEAGUE CARD
───────────────────────────────────────────── */
const MinileaguePlayerCard = ({ player, rank, groupSize }) => {
  const src = player?.image ? `${IMAGE_BASE_URL}/${player.image}?t=${Date.now()}` : Logo;
  const sectionStart = Math.floor((rank - 1) / groupSize) * groupSize + 1;
  const sectionRanks = Array.from({ length: groupSize }, (_, i) => sectionStart + i);

  return (
    <div
      className="mb-3 rounded-xl transition-all duration-200 group overflow-hidden"
      style={{
        background: "var(--best-board-surface)",
        border: "1px solid var(--best-board-border-strong)",
        boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
      }}
    >
      {/* ── TOP STRIP ── */}
      <div
        className="flex items-center justify-between px-2 sm:px-3 py-1.5 gap-2"
        style={{
          borderBottom: "1px solid var(--best-board-border)",
          background: "var(--secondary)",
        }}
      >
        <PlayerStatusToggle player={player} user={true} viewOnly={true} />

        <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap justify-end">
          {player.age && (
            <span
              className="text-[9px] sm:text-[10px] font-semibold px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap"
              style={{
                background: "var(--best-board-accent-soft)",
                color: "white",
                border: "1px solid var(--best-board-border-strong)",
              }}
            >
              Age : {player.age}
            </span>
          )}
          {player.gender && (
            <span
              className="text-[9px] sm:text-[10px] font-semibold px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap"
              style={{
                background: "var(--best-board-accent-soft)",
                color: "white",
                border: "1px solid var(--best-board-border-strong)",
              }}
            >
              Gender: {player.gender === "male" ? "M" : "F"}
            </span>
          )}
          {player.country && (
            <span
              className="text-[9px] sm:text-[10px] font-semibold px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap"
              style={{
                background: "var(--best-board-accent-soft)",
                color: "white",
                border: "1px solid var(--best-board-border-strong)",
              }}
            >
              Country: {player.country}
            </span>
          )}
        </div>
      </div>

      {/* ── MAIN BODY ── */}
      <div className="flex items-stretch px-2 sm:px-3 py-2 sm:py-2.5 gap-2 sm:gap-3">
        {/* LEFT SECTION */}
        <div className="flex-1 min-w-0 overflow-hidden">
          <div className="flex w-full items-center mb-2 min-w-0">
            <PlayerRankBadge
              rank={rank}
              sizeClass="h-10 w-10 sm:h-12 sm:w-12"
              imgSize={48}
              textClass="text-[9px] sm:text-xs"
            />
            <div className="flex-1 min-w-0 ml-2">
              <div className="text-[var(--best-board-text)] font-bold text-xs sm:text-sm truncate">
                {player?.name || "N/A"}
              </div>
              <div
                className="text-[10px] sm:text-xs truncate leading-tight"
                style={{ color: "var(--best-board-muted)" }}
              >
                {player?.phone || "N/A"}
              </div>
            </div>
          </div>

          <div className="mt-1">
            <div className="flex gap-1 overflow-x-auto pb-1">
              {sectionRanks.map(r => {
                const found = player.result_details?.find(i => Number(i.rank) === Number(r));
                return (
                  <div key={r} className="flex flex-col items-center gap-1 flex-shrink-0">
                    <div className="w-6 h-5 sm:w-8 sm:h-6 flex items-center justify-center text-[10px] font-bold rounded bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/25 text-zinc-700 dark:text-white/90">
                      {r}
                    </div>
                    <div
                      className={`w-6 h-6 sm:w-8 sm:h-7 flex items-center justify-center border-b-2 rounded font-bold ${found
                          ? "bg-blue-600 dark:bg-blue-500 border border-blue-500 dark:border-blue-400 text-white shadow-sm"
                          : "bg-black/5 dark:bg-white/5 border border-dashed border-black/10 dark:border-white/15 text-zinc-400 dark:text-white/40"
                        }`}
                    >
                      {found ? found.point : ""}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT SECTION */}
        <div
          className="flex flex-col items-center justify-between gap-1.5 sm:gap-2 pl-2 sm:pl-3 flex-shrink-0"
          style={{ borderLeft: "1px solid var(--best-board-border)" }}
        >
          {/* Total */}
          <div
            className="flex flex-col items-center justify-center rounded-lg sm:rounded-xl px-1 sm:px-2 py-1 sm:py-1.5 w-[48px] sm:w-[56px] md:w-[60px]"
            style={{
              background: "var(--best-board-accent-soft)",
              border: "1px solid var(--best-board-border-strong)",
            }}
          >
            <span
              className="text-sm sm:text-base md:text-lg font-black leading-none w-full text-center truncate"
              style={{ color: "var(--best-board-highlight)" }}
            >
              {player?.total_point || 0}
            </span>
            <span
              className="text-[8px] sm:text-[9px] font-semibold uppercase tracking-wider mt-0.5"
              style={{ color: "var(--best-board-muted)" }}
            >
              Points
            </span>
          </div>

          <div
            className="rounded-md sm:rounded-lg overflow-hidden flex-shrink-0 w-[52px] h-[52px] sm:w-16 sm:h-16 md:w-[72px] md:h-[72px]"
            style={{ border: "1px solid var(--best-board-border-strong)" }}
          >
            <Image
              src={src}
              alt={player?.name || "Player"}
              width={72}
              height={72}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-200"
              unoptimized
            />
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   3. SKILL / POSITIVE / NEGATIVE CARD
───────────────────────────────────────────── */
const SkillPlayerCard = ({ player, rank, showAgeRank, ageRank, showRanks = true, isNegative = false }) => {
  const src = player?.image ? `${IMAGE_BASE_URL}/${player.image}` : Logo;

  const getScore = (scores, skills, skillNumber, isInverted) => {
    const scoreObj = scores?.find(s => s.skill_number === skillNumber);
    const skillObj = skills?.find(s => s.skill_number === skillNumber);
    const score = scoreObj ? Number(scoreObj.best_score) : 0;
    const target = skillObj?.target != null ? Number(skillObj.target) : null;
    let isTargetAchieved = false;
    if (target && target !== 0 && score !== 0 && !isNaN(target) && !isNaN(score)) {
      if (isNegative) {
        isTargetAchieved = isInverted ? score <= target : score >= target;
      } else {
        isTargetAchieved = isInverted ? score >= target : score <= target;
      }
    }
    return { score: Math.abs(score), isTargetAchieved };
  };

  const getRank = (ranks, skillNumber) => {
    const r = ranks?.find(r => r.skill_number === skillNumber);
    return r ? r.rank : "-";
  };

  return (
    <div
      className="mb-3 rounded-xl transition-all duration-200 group overflow-hidden"
      style={{
        background: "var(--best-board-surface)",
        border: "1px solid var(--best-board-border-strong)",
        boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
      }}
    >
      {/* ── TOP STRIP ── */}
      <div
        className="flex items-center justify-between px-2 sm:px-3 py-1.5 gap-2"
        style={{
          borderBottom: "1px solid var(--best-board-border)",
          background: "var(--secondary)",
        }}
      >
        <PlayerStatusToggle player={player} user={true} viewOnly={true} />

        <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap justify-end">
          {player.age && (
            <span
              className="text-[9px] sm:text-[10px] font-semibold px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap"
              style={{
                background: "var(--best-board-accent-soft)",
                color: "white",
                border: "1px solid var(--best-board-border-strong)",
              }}
            >
              Age : {player.age}
            </span>
          )}
          {player.gender && (
            <span
              className="text-[9px] sm:text-[10px] font-semibold px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap"
              style={{
                background: "var(--best-board-accent-soft)",
                color: "white",
                border: "1px solid var(--best-board-border-strong)",
              }}
            >
              Gender: {player.gender === "male" ? "M" : "F"}
            </span>
          )}
          {player.country && (
            <span
              className="text-[9px] sm:text-[10px] font-semibold px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap"
              style={{
                background: "var(--best-board-accent-soft)",
                color: "white",
                border: "1px solid var(--best-board-border-strong)",
              }}
            >
              Country: {player.country}
            </span>
          )}
        </div>
      </div>

      {/* ── MAIN BODY ── */}
      <div className="flex items-stretch px-2 sm:px-3 py-2 sm:py-2.5 gap-2 sm:gap-3">
        {/* LEFT SECTION */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <div className="flex flex-col items-center gap-1 flex-shrink-0">
              <PlayerRankBadge
                rank={rank}
                sizeClass="h-10 w-10 sm:h-12 sm:w-12"
                imgSize={48}
                textClass="text-[9px] sm:text-xs"
              />
              {showAgeRank && (
                <div className="flex flex-col items-center">
                  <div
                    className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center font-bold text-white text-[9px] sm:text-[10px]"
                    style={{ background: "var(--best-board-success)" }}
                  >
                    {ageRank}
                  </div>
                  <p
                    className="text-[7px] sm:text-[8px] font-bold mt-0.5 whitespace-nowrap"
                    style={{ color: "var(--best-board-success)" }}
                  >
                    Age
                  </p>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[var(--best-board-text)] font-bold text-xs sm:text-sm truncate">
                {player?.name || "N/A"}
              </div>
              <div
                className="text-[10px] sm:text-xs truncate leading-tight"
                style={{ color: "var(--best-board-muted)" }}
              >
                {player?.phone || "N/A"}
              </div>
            </div>
          </div>

          {player.skills?.length > 0 ? (
            <>
              {/* ── SKILL NUMBER ROW ── */}
              <div className="flex gap-0.5 sm:gap-1 mb-1 overflow-x-auto pb-0.5 scrollbar-none">
                {player.skills.map((skill, i) => (
                  <div
                    key={i}
                    className="w-[46px] sm:w-[58px] h-5 sm:h-6 flex-shrink-0 flex items-center justify-center text-[9px] sm:text-[10px] font-bold rounded relative"
                    style={{
                      background: "var(--best-board-accent-soft)",
                      border: "1px solid var(--best-board-border-strong)",
                      color: "var(--best-board-highlight)",
                    }}
                  >
                    {skill.skill_sign === "-" && (
                      <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] font-extrabold leading-none" style={{ color: "var(--best-board-danger)" }}>
                        −
                      </span>
                    )}
                    {skill.skill_number}
                  </div>
                ))}
              </div>

              {/* ── SCORE ROW ── */}
              <div className="flex gap-0.5 sm:gap-1 mb-1 overflow-x-auto pb-0.5 scrollbar-none">
                {player.skills.map((skill, i) => {
                  const { score, isTargetAchieved } = getScore(
                    player.scores || [],
                    player.skills || [],
                    skill.skill_number,
                    player.isInverted
                  );
                  const scoreObj = player.scores?.find(s => s.skill_number === skill.skill_number);
                  const witnessBy = scoreObj?.witness_by || "";

                  return (
                    <div
                      key={i}
                      className={`w-[46px] sm:w-[58px] h-6 flex-shrink-0 flex items-center justify-center rounded text-[9px] sm:text-[10px] font-bold transition-all border
                        ${witnessBy
                          ? "bg-[var(--best-board-success)] text-white border-[var(--best-board-success)] underline decoration-white decoration-[2px]"
                          : isTargetAchieved
                            ? "bg-[var(--best-board-success)] text-white border-[var(--best-board-success)] shadow-md"
                            : "bg-[var(--best-board-warning)] text-[#0f172a] border-[var(--best-board-border-strong)] hover:brightness-95"
                        }`}
                      title={`Best Score: ${score} | Target: ${skill.target || "N/A"}${isTargetAchieved ? " ✓ ACHIEVED" : ""}`}
                    >
                      {Math.abs(score || 0).toFixed(2)}
                    </div>
                  );
                })}
              </div>

              {/* ── RANK ROW ── */}
              {showRanks && (
                <div className="flex gap-0.5 sm:gap-1 overflow-x-auto pb-0.5 scrollbar-none">
                  {player.skills.map((skill, i) => (
                    <div
                      key={i}
                      className="w-[46px] sm:w-[58px] h-5 sm:h-6 flex-shrink-0 flex items-center justify-center rounded font-bold text-[9px] sm:text-[10px] border"
                      style={{
                        background: "var(--best-board-accent-soft)",
                        borderColor: "var(--best-board-border)",
                        color: "var(--best-board-highlight)",
                      }}
                    >
                      {getRank(player.ranks || [], skill.skill_number)}
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="h-7 bg-[var(--best-board-surface-soft)] rounded text-xs text-[var(--best-board-muted)] flex items-center justify-center">
              No skills data
            </div>
          )}
        </div>

        {/* RIGHT SECTION */}
        <div
          className="flex flex-col items-center justify-between gap-1.5 sm:gap-2 pl-2 sm:pl-3 flex-shrink-0"
          style={{ borderLeft: "1px solid var(--best-board-border)" }}
        >
          {/* Total */}
          <div
            className="flex flex-col items-center justify-center rounded-lg sm:rounded-xl px-1 sm:px-2 py-1 sm:py-1.5 w-[48px] sm:w-[56px] md:w-[60px]"
            style={{
              background: "var(--best-board-accent-soft)",
              border: "1px solid var(--best-board-border-strong)",
            }}
          >
            <span
              className="text-sm sm:text-base md:text-lg font-black leading-none w-full text-center truncate"
              style={{ color: "var(--best-board-highlight)" }}
            >
              {isNegative ? formatSecondsToTime(player?.total_point) : Math.abs(player?.total_point || 0)}
            </span>
            <span
              className="text-[8px] sm:text-[9px] font-semibold uppercase tracking-wider mt-0.5"
              style={{ color: "var(--best-board-muted)" }}
            >
              Points
            </span>
          </div>

          <div
            className="rounded-md sm:rounded-lg overflow-hidden flex-shrink-0 w-[52px] h-[52px] sm:w-16 sm:h-16 md:w-[72px] md:h-[72px]"
            style={{ border: "1px solid var(--best-board-border-strong)" }}
          >
            <Image
              src={src}
              alt={player?.name || "Player"}
              width={72}
              height={72}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-200"
              unoptimized
            />
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   4. ROSTER CARD
───────────────────────────────────────────── */
const RosterPlayerCard = ({ player, rank }) => {
  const src = player.image ? `${IMAGE_BASE_URL}/${player.image}` : Logo;
  return (
    <div
      className="mb-3 rounded-xl transition-all duration-200 group overflow-hidden"
      style={{
        background: "var(--best-board-surface)",
        border: "1px solid var(--best-board-border-strong)",
        boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
      }}
    >
      {/* ── TOP STRIP ── */}
      <div
        className="flex items-center justify-between px-2 sm:px-3 py-1.5 gap-2"
        style={{
          borderBottom: "1px solid var(--best-board-border)",
          background: "var(--secondary)",
        }}
      >
        <PlayerStatusToggle player={player} user={true} viewOnly={true} />

        <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap justify-end">
          {player?.token_status && (
            <span className="text-[9px] sm:text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-[var(--best-board-surface-soft)] border-[var(--best-board-border)] text-[var(--best-board-text)]">
              Status: {player.token_status}
            </span>
          )}
          {player.age && (
            <span
              className="text-[9px] sm:text-[10px] font-semibold px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap"
              style={{
                background: "var(--best-board-accent-soft)",
                color: "white",
                border: "1px solid var(--best-board-border-strong)",
              }}
            >
              Age : {player.age}
            </span>
          )}
          {player.gender && (
            <span
              className="text-[9px] sm:text-[10px] font-semibold px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap"
              style={{
                background: "var(--best-board-accent-soft)",
                color: "white",
                border: "1px solid var(--best-board-border-strong)",
              }}
            >
              Gender: {player.gender === "male" ? "M" : "F"}
            </span>
          )}
          {player.country && (
            <span
              className="text-[9px] sm:text-[10px] font-semibold px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap"
              style={{
                background: "var(--best-board-accent-soft)",
                color: "white",
                border: "1px solid var(--best-board-border-strong)",
              }}
            >
              Country: {player.country}
            </span>
          )}
        </div>
      </div>

      {/* ── MAIN BODY ── */}
      <div className="flex items-stretch px-2 sm:px-3 py-2 sm:py-2.5 gap-2 sm:gap-3">
        {/* LEFT SECTION */}
        <div className="flex items-stretch sm:items-center gap-1.5 sm:gap-2.5 flex-1 min-w-0">
          <div className="flex flex-col items-center justify-center gap-1 flex-shrink-0">
            {/* MOBILE: flat color rank box, no icon/image */}
            <div
              className="sm:hidden flex items-center justify-center h-12 w-12 rounded-lg"
              style={{ background: "var(--best-board-highlight)" }}
            >
              <span
                className="text-xl font-black leading-none"
                style={{ color: "var(--best-board-surface)" }}
              >
                {rank}
              </span>
            </div>

            {/* DESKTOP/TABLET: original badge component, unchanged */}
            <div className="hidden sm:block">
              <PlayerRankBadge
                rank={rank}
                sizeClass="h-12 w-12 md:h-14 md:w-14"
                imgSize={56}
                textClass="text-xs md:text-sm"
              />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="text-[var(--best-board-text)] font-bold text-xs sm:text-sm truncate mb-0.5 leading-tight">
              {player?.name || "N/A"}
            </div>
            <div
              className="text-[10px] sm:text-xs truncate mb-1.5 sm:mb-2 leading-tight"
              style={{ color: "var(--best-board-muted)" }}
            >
              {player?.phone || "N/A"}
            </div>

            {/* Tokens — MOBILE: stacked Today + Today/total rows */}
            <div className="flex flex-col gap-1 sm:hidden">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px]" style={{ color: "var(--best-board-muted)" }}>Today:</span>
                <span className="text-xs font-bold text-[var(--best-board-text)] bg-[var(--best-board-surface-soft)] border border-[var(--best-board-border)] px-2 py-0.5 rounded">
                  {player?.today_token ?? "0"}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px]" style={{ color: "var(--best-board-muted)" }}>Today:</span>
                <span className="text-xs font-bold text-[var(--best-board-text)] bg-[var(--best-board-surface-soft)] border border-[var(--best-board-border)] px-2 py-0.5 rounded">
                  {player?.total_token ?? 0}
                </span>
                <span className="text-[10px]" style={{ color: "var(--best-board-muted)" }}>In Total</span>
              </div>
            </div>

            {/* Tokens — DESKTOP/TABLET: original single row */}
            <div className="hidden sm:flex sm:flex-wrap sm:items-center sm:gap-x-3 sm:gap-y-1.5">
              <div className="flex items-center gap-1.5">
                <span className="text-xs" style={{ color: "var(--best-board-muted)" }}>Today:</span>
                <span className="text-sm font-bold text-[var(--best-board-text)] bg-[var(--best-board-surface-soft)] border border-[var(--best-board-border)] px-2 py-0.5 rounded">
                  {player?.today_token ?? "0"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SECTION */}
        <div
          className="flex flex-col items-stretch sm:items-center justify-center sm:justify-between gap-1.5 sm:gap-2 pl-2 sm:pl-3 flex-shrink-0"
          style={{ borderLeft: "1px solid var(--best-board-border)" }}
        >
          {/* Total Tokens badge — desktop/tablet only, folded into the left rows on mobile */}
          <div
            className="hidden sm:flex flex-col items-center justify-center rounded-lg sm:rounded-xl px-1 sm:px-2 py-1 sm:py-1.5 w-[48px] sm:w-[56px] md:w-[60px]"
            style={{
              background: "var(--best-board-accent-soft)",
              border: "1px solid var(--best-board-border-strong)",
            }}
          >
            <span
              className="text-sm sm:text-base md:text-lg font-black leading-none w-full text-center truncate"
              style={{ color: "var(--best-board-highlight)" }}
            >
              {player?.total_token ?? 0}
            </span>
            <span
              className="text-[8px] sm:text-[9px] font-semibold uppercase tracking-wider mt-0.5"
              style={{ color: "var(--best-board-muted)" }}
            >
              Tokens
            </span>
          </div>

          <div
            className="rounded-md sm:rounded-lg overflow-hidden flex-shrink-0 w-20 h-full sm:w-16 sm:h-16 md:w-[72px] md:h-[72px]"
            style={{ border: "1px solid var(--best-board-border-strong)" }}
          >
            <Image
              src={src}
              alt={player?.name || "Player"}
              width={72}
              height={72}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-200"
              unoptimized
            />
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
export default function DummyPlayerList({ ladderId, ladderType: propLadderType }) {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");

  // Get ladder_type from URL
  const ladderTypeFromUrl = searchParams.get("ladder_type") || searchParams.get("type");

  // Redux data
  const ladderDetails = useSelector(state => state.player?.players?.[ladderId]?.ladderDetails || null);

  // Determine active type (Prop > URL param > API type > Default)
  const type = (propLadderType || ladderTypeFromUrl || ladderDetails?.type || "bestof5").toLowerCase();
  const ladderType = type;

  const preset = useSelector(state => state.gradebar?.preset || 10);
  const gradebarDetails = useSelector(state => state.gradebar?.gradebarDetails || []);

  // Standard leaderboard players (bestof5, minileague-mode, roster)
  const standardPlayers = useSelector(state => state.player?.players?.[ladderId]?.data || []);

  // Skill leaderboard
  const skillData = useSelector(state => state.skillLeaderboard?.data || []);

  // Positive leaderboard
  const positiveData = useSelector(state => state.positiveLeaderBoard?.data || []);

  // Negative leaderboard
  const negativeData = useSelector(state => state.negativeLeaderBoard?.data || []);

  // Roster leaderboard
  const rosterData = useSelector(state => state.rosterLeaderboard?.data || []);

  // Minileague
  const minileagueSections = useSelector(state => state.minileague?.data || []);
  const minileagueLadderDetails = useSelector(state => state.minileague?.ladderDetails || null);

  // Specific slice details
  const skillLadderDetails = useSelector(state => state.skillLeaderboard?.ladderDetails || null);
  const positiveLadderDetails = useSelector(state => state.positiveLeaderBoard?.ladderDetails || null);
  const negativeLadderDetails = useSelector(state => state.negativeLeaderBoard?.ladderDetails || null);
  const rosterLadderDetails = useSelector(state => state.rosterLeaderboard?.ladderDetails || null);

  const appliedAgeSkill = useSelector(state => state.skillLeaderboard?.appliedAge);
  const appliedAgePositive = useSelector(state => state.positiveLeaderBoard?.appliedAge);
  const appliedAgeNegative = useSelector(state => state.negativeLeaderBoard?.appliedAge);

  const displayLadderDetails =
    type === "minileague" ? minileagueLadderDetails :
      type === "skill" ? skillLadderDetails :
        type === "positive" ? positiveLadderDetails :
          type === "negative" ? negativeLadderDetails :
            type === "roster" ? rosterLadderDetails :
              ladderDetails;

  const totalPlayersCount =
    type === "minileague" ? minileagueSections.reduce((acc, sec) => acc + (sec?.users_record?.length || 0), 0) :
      type === "skill" ? skillData.length :
        type === "positive" ? positiveData.length :
          type === "negative" ? negativeData.length :
            type === "roster" ? rosterData.length :
              standardPlayers.length;

  useEffect(() => {
    if (!ladderId) return;

    if (type === "minileague") {
      dispatch(fetchMiniLeague({ ladder_id: ladderId }));
    } else if (type === "skill") {
      dispatch(fetchSkillLeaderboard({ ladder_id: ladderId, type: "skill" }));
      dispatch(fetchGradebars(ladderId));
    } else if (type === "positive") {
      dispatch(fetchPositiveLeaderboard({ ladder_id: ladderId, type: "positive" }));
      dispatch(fetchGradebars(ladderId));
    } else if (type === "negative") {
      dispatch(fetchNegativeLeaderboard({ ladder_id: ladderId, type: "negative" }));
      dispatch(fetchGradebars(ladderId));
    } else if (type === "roster") {
      dispatch(fetchRosterLeaderboard({ ladder_id: ladderId, type: "roster" }));
      dispatch(fetchGradebars(ladderId));
    } else {
      dispatch(fetchLeaderboard({ ladder_id: ladderId, type: ladderType }));
      dispatch(fetchGradebars(ladderId));
    }
  }, [ladderId, dispatch, type]);

  const generateGrades = (playersArr, gradebars, groupSize) => {
    if (!playersArr?.length) return [];
    const size = Number(groupSize) || 10;
    const out = [];
    for (let i = 0; i < playersArr.length; i += size) {
      const idx = Math.floor(i / size);
      out.push({
        label: gradebars?.[idx]?.gradebar_name || `Minileague ${idx + 1}`,
        players: playersArr.slice(i, i + size),
      });
    }
    return out;
  };



  /* ── MINILEAGUE ── */
  if (type === "minileague") {
    const groupSize = Number(preset) || 10;
    const filteredSections = minileagueSections.map(sec => ({
      label: sec?.section || `Section ${sec.id || ""}`,
      players: searchTerm
        ? (sec?.users_record || []).filter(p => p?.name?.toLowerCase().includes(searchTerm.toLowerCase()))
        : (sec?.users_record || []),
    }));

    return (
      <div>
        {displayLadderDetails?.name && (
          <div className="py-4 text-center sm:text-start px-4">
            <h2 className="text-2xl font-bold text-[var(--best-board-text)]">{displayLadderDetails.name}</h2>
            <p className="text-[var(--best-board-muted)] text-md border-b border-[var(--best-board-border)] py-1.5 font-semibold">
              Live Rankings · {totalPlayersCount} players
            </p>
          </div>
        )}
        <div className="mb-6 px-4">
          <input type="text" placeholder="Search players..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-[var(--best-board-border)] bg-[var(--best-board-surface)] text-[var(--best-board-text)] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] placeholder:text-[var(--best-board-muted)]" />
        </div>
        <div className="flex justify-start items-center gap-2 mt-4 px-4">
          <PlayerPerformationRanking ladderId={ladderId} />
        </div>
        {filteredSections.length === 0 ? (
          <div className="text-center py-10 text-[var(--best-board-muted)] font-bold">No players found</div>
        ) : (
          <div className="space-y-8 sm:px-4">
            {filteredSections.map((section, idx) => (
              <div key={idx} className="mt-4 px-4">
                <div className="mb-3 sticky top-0 best-board-section-banner flex items-center justify-between rounded-xl px-4 py-3 text-white font-bold tracking-wide z-10">
                  <span className="best-board-highlight uppercase tracking-[0.18em]">
                    {section.label}
                  </span>
                </div>
                <div className="space-y-3">
                  {section.players.map((player, pidx) => (
                    <MinileaguePlayerCard key={player.id || pidx} player={player} rank={player.rank || (idx * groupSize + pidx + 1)} groupSize={groupSize} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  /* ── SKILL ── */
  if (type === "skill") {
    const filtered = skillData.filter(p => p.name?.toLowerCase().includes(searchTerm.toLowerCase()));
    return (
      <div>
        {displayLadderDetails?.name && (
          <div className="py-4 text-center sm:text-start px-4">
            <h2 className="text-2xl font-bold text-[var(--best-board-text)]">{displayLadderDetails.name}</h2>
            <p className="text-[var(--best-board-muted)] text-md border-b border-[var(--best-board-border)] py-1.5 font-semibold">
              Live Rankings · {totalPlayersCount} players
            </p>
          </div>
        )}
        <div className="mb-6 px-4">
          <input type="text" placeholder="Search players..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-[var(--best-board-border)] bg-[var(--best-board-surface)] text-[var(--best-board-text)] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] placeholder:text-[var(--best-board-muted)]" />
        </div>
        {filtered.length === 0 ? (
          <div className="text-center py-10 text-[var(--best-board-muted)] font-bold">No players found</div>
        ) : (
          <div className="px-4 space-y-2">
            {filtered.map((player, idx) => {
              const showAgeRank = Number(appliedAgeSkill) > 0;
              return (
                <SkillPlayerCard
                  key={player.id || idx}
                  player={{ ...player, isInverted: displayLadderDetails?.inverted == 0 }}
                  rank={player.rank || idx + 1}
                  showAgeRank={showAgeRank}
                  ageRank={idx + 1}
                />
              );
            })}
          </div>
        )}
      </div>
    );
  }

  /* ── POSITIVE ── */
  if (type === "positive") {
    const filtered = positiveData.filter(p => p.name?.toLowerCase().includes(searchTerm.toLowerCase()));
    return (
      <div>
        {displayLadderDetails?.name && (
          <div className="py-4 text-center sm:text-start px-4">
            <h2 className="text-2xl font-bold text-[var(--best-board-text)]">{displayLadderDetails.name}</h2>
            <p className="text-[var(--best-board-muted)] text-md border-b border-[var(--best-board-border)] py-1.5 font-semibold">
              Live Rankings · {totalPlayersCount} players
            </p>
          </div>
        )}
        <div className="mb-6 px-4">
          <input type="text" placeholder="Search players..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-[var(--best-board-border)] bg-[var(--best-board-surface)] text-[var(--best-board-text)] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] placeholder:text-[var(--best-board-muted)]" />
        </div>
        {filtered.length === 0 ? (
          <div className="text-center py-10 text-[var(--best-board-muted)] font-bold">No players found</div>
        ) : (
          <div className="px-4 space-y-2">
            {filtered.map((player, idx) => {
              const showAgeRank = Number(appliedAgePositive) > 0;
              return (
                <SkillPlayerCard
                  key={player.id || idx}
                  player={{ ...player, isInverted: displayLadderDetails?.inverted == 0 }}
                  rank={player.rank || idx + 1}
                  showAgeRank={showAgeRank}
                  ageRank={idx + 1}
                  showRanks={false}
                />
              );
            })}
          </div>
        )}
      </div>
    );
  }

  /* ── NEGATIVE ── */
  if (type === "negative") {
    const filtered = negativeData.filter(p => p.name?.toLowerCase().includes(searchTerm.toLowerCase()));
    return (
      <div>
        {displayLadderDetails?.name && (
          <div className="py-4 text-center sm:text-start px-4">
            <h2 className="text-2xl font-bold text-[var(--best-board-text)]">{displayLadderDetails.name}</h2>
            <p className="text-[var(--best-board-muted)] text-md border-b border-[var(--best-board-border)] py-1.5 font-semibold">
              Live Rankings · {totalPlayersCount} players
            </p>
          </div>
        )}
        <div className="mb-6 px-4">
          <input type="text" placeholder="Search players..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-[var(--best-board-border)] bg-[var(--best-board-surface)] text-[var(--best-board-text)] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] placeholder:text-[var(--best-board-muted)]" />
        </div>
        {filtered.length === 0 ? (
          <div className="text-center py-10 text-[var(--best-board-muted)] font-bold">No players found</div>
        ) : (
          <div className="px-4 space-y-2">
            {filtered.map((player, idx) => {
              const showAgeRank = Number(appliedAgeNegative) > 0;
              return (
                <SkillPlayerCard
                  key={player.id || idx}
                  player={{ ...player, isInverted: displayLadderDetails?.inverted == 0 }}
                  rank={player.rank || idx + 1}
                  showAgeRank={showAgeRank}
                  ageRank={idx + 1}
                  showRanks={false}
                  isNegative={true}
                />
              );
            })}
          </div>
        )}
      </div>
    );
  }


  /* ── ROSTER ── */
  if (type === "roster") {
    const filtered = rosterData.filter(p => p.name?.toLowerCase().includes(searchTerm.toLowerCase()));
    return (
      <div>
        {displayLadderDetails?.name && (
          <div className="py-4 text-center sm:text-start px-4">
            <h2 className="text-2xl font-bold text-[var(--best-board-text)]">{displayLadderDetails.name}</h2>
            <p className="text-[var(--best-board-muted)] text-md border-b border-[var(--best-board-border)] py-1.5 font-semibold">
              Live Rankings · {totalPlayersCount} players
            </p>
          </div>
        )}
        <div className="mb-6 px-4">
          <input type="text" placeholder="Search players..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-[var(--best-board-border)] bg-[var(--best-board-surface)] text-[var(--best-board-text)] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] placeholder:text-[var(--best-board-muted)]" />
        </div>
        {filtered.length === 0 ? (
          <div className="text-center py-10 text-[var(--best-board-muted)] font-bold">No players found</div>
        ) : (
          <div className="px-4 space-y-3 mt-3">
            {filtered.map((player, idx) => (
              <RosterPlayerCard
                key={player.id || idx}
                player={player}
                rank={player.rank || idx + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  /* ── DEFAULT: bestof5 / best5 / best3 / winlose ── */
  const filteredPlayers = standardPlayers
    .filter(p => p.name?.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => a.rank - b.rank);

  const grades = generateGrades(filteredPlayers, gradebarDetails, preset);

  return (
    <div>
      {displayLadderDetails?.name && (
        <div className="py-4 text-center sm:text-start px-4">
          <h2 className="text-2xl font-bold text-[var(--best-board-text)]">{displayLadderDetails.name}</h2>
          <p className="text-[var(--best-board-muted)] text-md border-b border-[var(--best-board-border)] py-1.5 font-semibold">
            Live Rankings · {totalPlayersCount} players
          </p>
        </div>
      )}

      <div className="mb-6 px-4">
        <input type="text" placeholder="Search players..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
          className="w-full rounded-xl border border-[var(--best-board-border)] bg-[var(--best-board-surface)] text-[var(--best-board-text)] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] placeholder:text-[var(--best-board-muted)]" />
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mt-4 px-4">
        <PlayerPerformationRanking ladderId={ladderId} />
      </div>

      {grades.length === 0 ? (
        <div className="text-center py-10 text-[var(--best-board-muted)] font-bold">No players found</div>
      ) : (
        <div className="space-y-8 sm:px-4 md:px-4">
          {grades.map((grade, index) => (
            <div key={index}>
              <div className="mb-3 sticky top-0 best-board-section-banner flex items-center justify-between rounded-xl px-4 py-3 text-white font-bold tracking-wide z-10">
                <span className="best-board-highlight uppercase tracking-[0.18em]">
                  {grade.label}
                </span>
              </div>
              <div className="space-y-3">
                {grade.players.map((player, pidx) => (
                  <DefaultPlayerCard key={player.id || pidx} player={player} rank={player.rank || pidx + 1} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
