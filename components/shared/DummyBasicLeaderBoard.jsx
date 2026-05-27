"use client";
import { IMAGE_BASE_URL } from "@/constants/api";

import { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { Card } from "@/components/ui/card";
import { useSearchParams } from "next/navigation";
import Logo from "@/public/logo1.png";
import { fetchSkillLeaderboard } from "@/redux/slices/BasicLeaderboardSlice";
import PlayerSearchInput from "../pages/players/PlayerSearchInput";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Funnel, X } from "lucide-react";

/* ---------------- HELPER FUNCTIONS ---------------- */

const getScoreBySkillNumber = (scores, skills, skillNumber, isInverted) => {
  const scoreObj = scores?.find((s) => s.skill_number === skillNumber);
  const skillObj = skills?.find((s) => s.skill_number === skillNumber);

  const score = scoreObj ? Number(scoreObj.best_score) : 0;
  const target =
    skillObj?.target !== null && skillObj?.target !== undefined
      ? Number(skillObj.target)
      : null;

  let isTargetAchieved = false;

  // target valid ho AND score 0 na ho (matlab actually entry hui ho)
  if (
    target !== null &&
    target !== 0 &&
    score !== 0 &&
    !isNaN(target) &&
    !isNaN(score)
  ) {
    isTargetAchieved = isInverted ? score <= target : score >= target;
  }

  const witnessBy = scoreObj?.witness_by || "";

  return {
    score,
    target,
    isTargetAchieved,
    witnessBy,
  };
};

const getRankBySkillNumber = (ranks, skillNumber) => {
  const rankObj = ranks.find((r) => r.skill_number === skillNumber);
  return rankObj ? rankObj.rank : "-";
};

const PlayerRankBadge = ({ rank, sizeClass = "h-12 w-12 sm:h-16 sm:w-16", imgSize = 64, textClass = "text-xs sm:text-sm" }) => {
  const rankNum = Number(rank);
  let src = "/ranksImg/rank.png";
  let scaleClass = "scale-[1.22] group-hover:scale-[1.34]";
  if (rankNum === 1) {
    src = "/ranksImg/rank-1.png";
    scaleClass = "scale-100 group-hover:scale-110";
  } else if (rankNum === 2) {
    src = "/ranksImg/rank-2.png";
    scaleClass = "scale-[1.15] group-hover:scale-[1.26]";
  } else if (rankNum === 3) {
    src = "/ranksImg/rank-3.png";
    scaleClass = "scale-[1.15] group-hover:scale-[1.26]";
  }

  return (
    <div className={`relative flex shrink-0 items-center justify-center select-none ${sizeClass}`}>
      <Image
        src={src}
        alt={`Rank ${rank}`}
        width={imgSize}
        height={imgSize}
        className={`object-contain transition-transform duration-200 ${scaleClass} ${sizeClass}`}
        unoptimized
      />
      <span className={`absolute inset-0 flex items-center justify-center font-black text-white drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.95)] ${textClass}`}>
        {rank}
      </span>
    </div>
  );
};

/* ---------------- PLAYER CARD ---------------- */

const PlayerCard = ({ player, overallRank, showAgeRank, ageRank, onSkillClick, isEditable, isInverted }) => {
  const playerImageUrl = player?.image
    ? `${IMAGE_BASE_URL}/${player.image}`
    : Logo;

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
        <div className="flex items-center gap-2">
          <span className="text-[10px] sm:text-xs text-white bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">
            {isEditable ? "My Profile" : "View Profile"}
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap justify-end">
          {player.age && (
            <span
              className="text-[9px] sm:text-[10px] font-semibold px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap"
              style={{
                background: "var(--best-board-accent-soft)",
                color: "var(--best-board-highlight)",
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
                color: "var(--best-board-highlight)",
                border: "1px solid var(--best-board-border-strong)",
              }}
            >
              Gender: {player.gender === "male" ? "M" : "F"}
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
                rank={overallRank}
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
                className="text-[10px] sm:text-xs truncate leading-tight mb-2"
                style={{ color: "var(--best-board-muted)" }}
              >
                {player?.phone || "N/A"}
              </div>
              {player.skills?.length > 0 ? (
              <>
                {/* ── SKILL NUMBER ROW ── */}
                <div className="flex gap-0.5 sm:gap-1 mb-1 overflow-x-auto pb-0.5 scrollbar-none">
                  {player.skills.map((skill, i) => {
                    const isNegative = skill.skill_sign === "-";
                    return (
                      <div
                        key={i}
                        onClick={() =>
                          isEditable && onSkillClick(player.id, skill.skill_number)
                        }
                        className={`w-[46px] sm:w-[58px] h-5 sm:h-6 flex-shrink-0 flex items-center justify-center text-[9px] sm:text-[10px] font-bold rounded transition-colors relative
                        ${isEditable
                            ? "cursor-pointer"
                            : "cursor-not-allowed opacity-50"
                          }`}
                        style={{
                          background: "var(--best-board-accent-soft)",
                          border: "1px solid var(--best-board-border-strong)",
                          color: "var(--best-board-highlight)",
                        }}
                        title={
                          isEditable
                            ? `Edit Skill ${skill.skill_number}: ${skill.skill_description}`
                            : "Only own skills can be edited"
                        }
                      >
                        {isNegative && (
                          <span
                            className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] font-extrabold leading-none"
                            style={{ color: "var(--best-board-danger)" }}
                          >
                            −
                          </span>
                        )}
                        {skill.skill_number}
                      </div>
                    );
                  })}
                </div>

                {/* ── SCORE ROW ── */}
                <div className="flex gap-0.5 sm:gap-1 mb-1 overflow-x-auto pb-0.5 scrollbar-none">
                  {player.skills.map((skill, i) => {
                    const scoreData = getScoreBySkillNumber(
                      player.scores || [],
                      player.skills || [],
                      skill.skill_number,
                      isInverted
                    );

                    return (
                      <div
                        key={i}
                        className={`w-[46px] sm:w-[58px] h-6 flex-shrink-0 flex items-center justify-center rounded text-[9px] sm:text-[10px] font-bold transition-all border
                        ${scoreData.witnessBy
                            ? "bg-[var(--best-board-success)] text-white border-[var(--best-board-success)] underline decoration-white decoration-[2px]"
                            : scoreData.isTargetAchieved
                              ? "bg-[var(--best-board-success)] text-white border-[var(--best-board-success)] shadow-md"
                              : "bg-[var(--best-board-warning)] text-[#0f172a] border-[var(--best-board-border-strong)] hover:brightness-95"
                          }`}
                        title={`Score: ${scoreData.score || 0} | Target: ${scoreData.target || "N/A"
                          }${scoreData.isTargetAchieved ? " ACHIEVED!" : ""}`}
                      >
                        {Math.abs(scoreData.score || 0).toFixed(2)}
                      </div>
                    );
                  })}
                </div>

                {/* ── RANK ROW ── */}
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
                      {getRankBySkillNumber(player.ranks || [], skill.skill_number)}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-7 bg-[var(--best-board-surface-soft)] rounded text-xs text-[var(--best-board-muted)] flex items-center justify-center">
                No skills data
              </div>
            )}
          </div>
        </div>
      </div>

          {/* RIGHT SECTION */}
          <div
            className="flex flex-col items-center justify-between gap-1.5 sm:gap-2 pl-2 sm:pl-3 flex-shrink-0"
            style={{ borderLeft: "1px solid var(--best-board-border)" }}
          >
            {/* Total Points */}
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
                {Math.abs(player.total_point || 0)}
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
                src={playerImageUrl}
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

/* ---------------- MAIN COMPONENT ---------------- */
const DummyBasicLeaderboard = ({ ladderId: propLadderId }) => {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const ladderId = propLadderId || searchParams.get("ladder_id");
  const { data = [], ladderDetails, loading, appliedAge } = useSelector(
    (state) => state.skillLeaderboard || {}
  );
  const showAgeRank = Number(appliedAge) > 0;
  const isInverted = ladderDetails?.inverted == 0;
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);
  const [selectedSkillNumber, setSelectedSkillNumber] = useState(null);
  const [selectedSkillActivityId, setSelectedSkillActivityId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [openSort, setOpenSort] = useState(false);
  const [isSorted, setIsSorted] = useState(false);
  const [selectedSkillFilter, setSelectedSkillFilter] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showRemove, setShowRemove] = useState(false);

  const refreshLeaderboard = useCallback(() => {
    if (ladderId) {
      dispatch(fetchSkillLeaderboard({ ladder_id: ladderId, type: "skill" }));
    }
  }, [dispatch, ladderId]);

  useEffect(() => {
    if (ladderId) {
      dispatch(fetchSkillLeaderboard({ ladder_id: ladderId, type: "skill" }));
    }
  }, [dispatch, ladderId]);

  const handleSkillClick = useCallback(
    (playerId, skillNumber) => {
      const player = data.find((p) => p.id === playerId);
      if (!player) return;
      const skillObj = player.skills.find(
        (s) => s.skill_number === skillNumber
      );
      if (!skillObj) return;

      setSelectedPlayerId(playerId);
      setSelectedSkillNumber(skillNumber);
      setSelectedSkillActivityId(skillObj.id);
      setOpenEdit(true);
    },
    [data]
  );

  const handleEditClose = useCallback(() => {
    setOpenEdit(false);
    setSelectedPlayerId(null);
    setSelectedSkillNumber(null);
    setSelectedSkillActivityId(null);
    refreshLeaderboard();
  }, [refreshLeaderboard]);

  // 🔹 FILTER PLAYERS BASED ON SEARCH
  const filteredPlayers = data.filter((player) => {
    if (!searchQuery) return true;
    const cleanName = player.name.replace(/\s+/g, "").toLowerCase();
    return cleanName.includes(searchQuery);
  });

  return (
    <>
      <main className="min-h-screen flex justify-center">
        <div className="w-full max-w-2xl px-2 space-y-4">
          {loading && <p className="text-white text-center py-8">Loading...</p>}

          <div className="flex mb-4 items-center gap-2 mt-4">
            <div className="text-white w-full max-w-md">
              <PlayerSearchInput
                value={searchQuery}
                onChange={setSearchQuery}
              />
            </div>
          </div>

          <div className="space-y-2 mt-2">
            {filteredPlayers.length === 0 ? (
              <div className="text-center py-10 text-gray-400 font-bold">No players found</div>
            ) : (
              filteredPlayers.map((player, index) => {
                const isEditablePlayer = player.id == 1; // Dummy editable player
                return (
                  <PlayerCard
                    key={player.id}
                    player={player}
                    overallRank={player.rank || index + 1}
                    showAgeRank={showAgeRank}
                    ageRank={index + 1}
                    onSkillClick={handleSkillClick}
                    isEditable={isEditablePlayer}
                    isInverted={isInverted}
                  />
                );
              })
            )}
          </div>
        </div>
      </main>

      {/* Dummy Dialogs - Just for UI */}
      <Dialog open={openSort} onOpenChange={setOpenSort}>
        <DialogContent className="bg-transparent border-none shadow-none flex items-center justify-center max-w-md">
          <div className="bg-white p-6 rounded-lg text-center">
            <p className="text-gray-800 mb-4">
              Sort functionality would open here
            </p>
            <Button onClick={() => setOpenSort(false)} className="bg-gray-500">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showRemove} onOpenChange={setShowRemove}>
        <DialogContent className="bg-transparent border-none shadow-none flex items-center justify-center max-w-md">
          <div className="bg-white p-6 rounded-lg text-center">
            <p className="text-gray-800 mb-4">
              Remove functionality would open here
            </p>
            <Button
              onClick={() => setShowRemove(false)}
              className="bg-gray-500"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {openEdit && selectedPlayerId && selectedSkillNumber && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <p className="text-gray-800 mb-4">
              Edit functionality would open here
            </p>
            <Button onClick={handleEditClose} className="bg-gray-500">
              Close
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default DummyBasicLeaderboard;
