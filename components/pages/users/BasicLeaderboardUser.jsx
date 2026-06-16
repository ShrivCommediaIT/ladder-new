"use client";
import PlayerRankBadge from "@/components/shared/PlayerRankBadge";
import { IMAGE_BASE_URL } from "@/constants/api";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { Card } from "@/components/ui/card";
import { useSearchParams } from "next/navigation";
import Logo from "@/public/logo1.png";
import { BasicLeaderboardUserEdit } from "@/components/shared/BasicLeaderboardUserEdit";
import { fetchSkillLeaderboard, setAgeFilter } from "@/redux/slices/BasicLeaderboardSlice";
import PlayerSearch from "./PlayerSearch";
import BasicLeaderboardShort from "../admin/BasicLeaderboardShort";
import BasicLeaderboardUserRemove from "@/components/shared/BasicLeaderboardUserRemove";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Funnel, X } from "lucide-react";
import { getRequest } from "@/services/apiService";
import { API_ENDPOINTS } from "@/constants/api";
import BasicLeaderboardPrintSkillsSheet from "../admin/BasicLeaderboardPrintSkillsSheet";
import BasicLeaderboardActivityEntryCard from "../players/BasicLeaderboardActivityEntryCard";
import PlayerEditInfoModel from "@/components/shared/playerEditInfoModel";
import PlayerStatusToggle from "@/components/shared/PlayerStatusToggle";
import LeaderboardActionButtons from "@/components/shared/LeaderboardActionButtons";
import AgeFilter from "@/components/shared/AgeFilter";

/* ---------------- HELPER FUNCTIONS ---------------- */




const getRankBySkillNumber = (ranks, skillNumber) => {
  const rankObj = ranks.find((r) => r.skill_number === skillNumber);
  return rankObj ? rankObj.rank : "-";
};



/* ---------------- PLAYER CARD ---------------- */
const PlayerCard = ({
  player,
  overallRank,
  appliedAge,
  ageRank,
  onSkillClick,
  isInverted,
  isEditable,
  loggedInUser,
}) => {
  const playerImageUrl =
    player?.image && player.image !== "null" && player.image !== "undefined" && player.image !== ""
      ? `${IMAGE_BASE_URL}/${player.image}?t=${Date.now()}`
      : Logo;

  const getScoreBySkillNumber = (scores, skills, skillNumber) => {
    const scoreObj = scores?.find((s) => s.skill_number === skillNumber);
    const skillObj = skills?.find((s) => s.skill_number === skillNumber);

    const witnessBy = scoreObj?.witness_by || skillObj?.witness_by || "";
    const score = scoreObj ? Number(scoreObj.best_score) : 0;
    const bestScore = scoreObj ? Number(scoreObj.best_score) : 0;
    const inputScore =
      scoreObj?.input_score !== null && scoreObj?.input_score !== undefined
        ? Number(scoreObj.input_score)
        : null;

    const displayScore = bestScore;

    const target =
      skillObj?.target !== null && skillObj?.target !== undefined
        ? Number(skillObj.target)
        : null;

    const mode = skillObj?.skill_sign || "+";

    let isTargetAchieved = false;

    if (
      target !== null &&
      target !== 0 &&
      bestScore !== 0 &&
      !isNaN(target) &&
      !isNaN(bestScore)
    ) {
      isTargetAchieved = isInverted ? bestScore >= target : bestScore <= target;
    }

    return {
      witnessBy,
      score,
      displayScore,
      target,
      isTargetAchieved,
      input_score: inputScore,
    };
  };

  const showAgeRank = Boolean(appliedAge);

  const getRankBySkillNumber = (ranks, skillNumber) => {
    const rankObj = ranks?.find((r) => r.skill_number === skillNumber);
    return rankObj ? rankObj.rank : "-";
  };

  return (
    <div
      className="mb-3 rounded-xl transition-all duration-200 group overflow-hidden cursor-default"
      style={{
        background: "var(--best-board-surface)",
        border: "1px solid var(--best-board-border-strong)",
        boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
      }}
    >
      {/* ── TOP STRIP: toggle + age/gender chips ── */}
      <div
        className="flex items-center justify-between px-2 sm:px-3 py-1.5 gap-2"
        style={{
          borderBottom: "1px solid var(--best-board-border)",
          background: "var(--secondary)",
        }}
      >
        {/* Toggle on the left */}
        <PlayerStatusToggle player={player} user={true} />

        <div className="flex items-center gap-1 flex-shrink-0 flex-wrap justify-end">
          {player.age !== null && player.age !== undefined && player.age !== "" && (
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
        </div>
      </div>

      {/* ── MAIN BODY ── */}
      <div className="flex items-stretch px-2 sm:px-3 py-2 sm:py-2.5 gap-2 sm:gap-3">

        {/* LEFT SECTION: rank badge + name/phone/skills */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 flex-1 min-w-0">

          {/* Rank badge + optional age rank below */}
          <div className="flex flex-col items-center gap-1 flex-shrink-0">
            <PlayerRankBadge
              rank={overallRank}
              sizeClass="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14"
              imgSize={56}
              textClass="text-[10px] sm:text-xs md:text-sm"
            />
          </div>

          {/* Info block */}
          <div className="flex-1 min-w-0">
            <div className="flex gap-6 justify-between">
              <div>
                {/* Player name */}
                <div
                  className="text-xs sm:text-sm font-bold truncate mb-0.5 leading-tight"
                  style={{ color: "var(--best-board-text)" }}
                >
                  {player?.name || "N/A"}
                </div>

                {/* Phone */}
                <div
                  className="text-[10px] sm:text-xs truncate mb-1.5 sm:mb-2 leading-tight"
                  style={{ color: "var(--best-board-muted)" }}
                >
                  {player?.phone || "N/A"}
                </div>
              </div>
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
                    Age Rank
                  </p>
                </div>
              )}
            </div>


            {/* Skills section */}
            {player.skills?.length > 0 ? (
              <>
                {/* ── SKILL NUMBER ROW ── */}
                <div className="flex gap-0.5 sm:gap-1 mb-1 overflow-x-auto pb-0.5 scrollbar-none">
                  {player.skills.map((skill, i) => {
                    const isNeg = skill.skill_sign === "-";
                    return (
                      <div
                        key={i}
                        onClick={() => onSkillClick(player.id, skill.skill_number)}
                        className="w-[46px] sm:w-[58px] h-5 sm:h-6 flex-shrink-0 flex items-center justify-center text-[9px] sm:text-[10px] font-bold rounded transition-colors cursor-pointer relative"
                        style={{
                          background: "var(--best-board-accent-soft)",
                          border: "1px solid var(--best-board-border-strong)",
                          color: "var(--best-board-highlight)",
                        }}
                        title={`Edit Skill ${skill.skill_number}: ${skill.skill_description}`}
                      >
                        {isNeg && (
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
                <div className="flex gap-0.5 sm:gap-1 overflow-x-auto pb-0.5 scrollbar-none">
                  {player.skills.map((skill, i) => {
                    const scoreData = getScoreBySkillNumber(
                      player.scores || [],
                      player.skills || [],
                      skill.skill_number
                    );
                    return (
                      <div
                        key={i}
                        className={`w-[46px] sm:w-[58px] h-6 flex-shrink-0 flex items-center justify-center rounded text-[9px] sm:text-[10px] font-bold transition-all
                          ${scoreData.witnessBy
                            ? "bg-[var(--best-board-success)] text-white border border-[var(--best-board-success)] underline decoration-white decoration-[2px]"
                            : scoreData.isTargetAchieved
                              ? "bg-[var(--best-board-success)] text-white border border-[var(--best-board-success)] shadow-md"
                              : "bg-[var(--best-board-warning)] text-dark border border-[var(--best-board-border-strong)] hover:brightness-95"
                          }`}
                        title={`Best Score: ${scoreData.displayScore} | Target: ${scoreData.target || "N/A"}${scoreData.isTargetAchieved ? " ✓ ACHIEVED" : ""}`}
                      >
                        {scoreData.displayScore}
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div
                className="h-6 rounded text-[10px] flex items-center justify-center"
                style={{
                  background: "var(--best-board-surface-soft)",
                  border: "1px solid var(--best-board-border)",
                  color: "var(--best-board-muted)",
                }}
              >
                No skills
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT SECTION: points badge + avatar ── */}
        <div
          className="flex flex-col items-center justify-between gap-1.5 sm:gap-2 pl-2 sm:pl-3 flex-shrink-0"
          style={{ borderLeft: "1px solid var(--best-board-border)" }}
        >
          {/* Total Points badge */}
          <span
            className="text-[8px] sm:text-[9px] font-semibold uppercase tracking-wider mt-0.5"
            style={{ color: "var(--best-board-muted)" }}
          >
            Total Points
          </span>
          <div
            className="flex flex-col items-center justify-center rounded-lg sm:rounded-xl px-1 sm:px-2 py-1 sm:py-1.5 w-[44px] sm:w-[52px] md:w-[72px] h-10"
            style={{
              background: "var(--best-board-accent-soft)",
              border: "1px solid var(--best-board-border-strong)",
            }}
          >
            <span
              className="text-[7px]  md:text-[10px] font-black leading-none w-full text-center"
              style={{ color: "var(--best-board-highlight)" }}
            >
              {player?.total_point || 0}
            </span>
          </div>

          {/* Player avatar */}
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
const BasicLeaderboardUser = ({ ladderId: propLadderId, onActionsChanged }) => {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const ladderId = propLadderId || searchParams.get("ladder_id");
  const laddartype = searchParams.get("ladder_type");
  const { data = [], loading } = useSelector(
    (state) => state.skillLeaderboard || {},
  );
  const loggedInUser = useSelector((state) => state.user?.user);

  const initialRows = Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    description: "",
    target: "",
    mode: "plus",
    unit: "",
  }));
  const [rows, setRows] = useState(initialRows);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = sessionStorage.getItem("user") || sessionStorage.getItem("userData");
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          if (parsedUser && parsedUser.id) {
            setCurrentUserId(Number(parsedUser.id));
          }
        } catch (err) {
          console.error("Failed to parse user from sessionStorage", err);
        }
      }
    }
  }, []);

  // ALL STATES FIRST
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);
  const [selectedSkillNumber, setSelectedSkillNumber] = useState(null);
  const [selectedSkillActivityId, setSelectedSkillActivityId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [openSort, setOpenSort] = useState(false);
  const [isSorted, setIsSorted] = useState(false);
  const [selectedSkillFilter, setSelectedSkillFilter] = useState(0);
  const { appliedAge, ladderDetails, appliedAgeType, appliedGender } = useSelector((state) => state.skillLeaderboard || {});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showRemove, setShowRemove] = useState(false);
  const [playerSearchResetSignal, setPlayerSearchResetSignal] = useState(0);

  const [currentUserId, setCurrentUserId] = useState(null);
  const [dialogMessage, setDialogMessage] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const currentUser = data.find((p) => p.id == currentUserId);
  const myRank = currentUser?.rank;

  // REFRESH KEY TO CONTROL RELOADS (STOPS INFINITE LOOP)
  const refreshKey = useRef(0);

  const isInverted = ladderDetails?.inverted == 0;

  useEffect(() => {
    dispatch(setAgeFilter({ age: 0, ageType: "", gender: "" }));
  }, [dispatch]);

  useEffect(() => {
    if (!ladderId) return;

    const fetchSkillSetup = async () => {
      try {
        const res = await getRequest(API_ENDPOINTS.GET_SKILL_SETUP, { ladder_id: ladderId });

        const apiSkills = res?.data || [];

        setRows((prevRows) =>
          prevRows.map((row) => {
            const found = apiSkills.find(
              (s) => Number(s.skill_number) === row.id,
            );
            return found
              ? {
                ...row,
                description: String(found.skill_description || ""),
                target: String(found.target || ""),
                unit: String(found.unit || ""),
                mode: found.skill_sign === "-" ? "minus" : "plus",
              }
              : row;
          }),
        );
      } catch (error) {
        console.error("Failed to fetch skill setup", error);
      }
    };

    fetchSkillSetup();
  }, []);

  const safeSkillsForPrint = useMemo(() => {
    return rows.map((row) => ({
      id: row.id,
      description: String(row.description || ""),
      target: String(row.target || ""),
      unit: String(row.unit || ""),
      mode: row.mode,
    }));
  }, [rows]);

  // REFRESH FUNCTION FIRST
  const refreshLeaderboard = useCallback(
    (skillNo = 0, age = appliedAge, ageType = appliedAgeType, gender = appliedGender) => {
      if (!ladderId || isRefreshing) return;

      setIsRefreshing(true);
      const payload = {
        ladder_id: ladderId,
        type: "skill",
        sortbyskillnumber: skillNo,
        age: age,
        age_type: ageType,
        gender: gender,
      };
      dispatch(fetchSkillLeaderboard(payload)).finally(() => {
        setIsRefreshing(false);
      });
    },
    [dispatch, ladderId, isRefreshing, appliedAge, appliedAgeType, appliedGender],
  );

  const handleAgeSearch = useCallback((age, ageType, gender) => {
    const ageNum = age ? Number(age) : "";
    const isClearing = age === null || age === "";

    if (isClearing) {
      setIsSorted(false);
      setSelectedSkillFilter(0);
    } else {
      setIsSorted(true);
    }

    dispatch(setAgeFilter({ age: ageNum, ageType, gender }));
    refreshLeaderboard(isClearing ? 0 : selectedSkillFilter, ageNum, ageType, gender);
  }, [dispatch, selectedSkillFilter, refreshLeaderboard]);

  const handleClearFilters = useCallback(() => {
    setSearchQuery("");
  }, []);

  const hasFiltersApplied =
    Boolean(searchQuery) ||
    appliedAge > 0 ||
    Boolean(appliedGender);

  // MANUAL REFRESH HANDLERS (only when explicitly called)
  const handleSelfRemove = useCallback(() => {
    setShowRemove(true);
  }, []);

  const handleRemoveClose = useCallback(() => {
    setShowRemove(false);
  }, []);

  const handleRemoveSuccess = useCallback(() => {
    setShowRemove(false);
    refreshLeaderboard(selectedSkillFilter);
  }, [refreshLeaderboard, selectedSkillFilter]);

  const handleSkillsUpdated = useCallback(
    (skillNo) => {
      setOpenSort(false);
      setIsSorted(true);
      setSelectedSkillFilter(skillNo);
      console.log("setSelectedSkillFilter", skillNo);

      refreshLeaderboard(skillNo);
    },
    [refreshLeaderboard],
  );

  const handleSortBySkill = useCallback(() => {
    setOpenSort(true);
  }, []);

  const handleClearAll = useCallback(() => {
    setIsSorted(false);
    setSelectedSkillFilter(0);
    setSearchQuery("");
    setPlayerSearchResetSignal((prev) => prev + 1);
    dispatch(setAgeFilter({ age: 0, ageType: "", gender: "" }));
    refreshLeaderboard(0, 0, "", "");
  }, [refreshLeaderboard]);

  useEffect(() => {
    if (onActionsChanged) {
      const actions = [];

      // 1. Sort / Clear filters
      if (!isSorted && appliedAge === 0) {
        actions.push({
          id: "sort-by-activity",
          label: "Sort by Activity",
          icon: Funnel,
          onClick: handleSortBySkill,
        });
      } else {
        actions.push({
          id: "clear-all-filters",
          label: "Clear All Filters",
          icon: Funnel,
          onClick: handleClearAll,
          tone: "danger",
        });
      }

      // 2. Age filter
      actions.push({
        id: "age-filter",
        node: (
          <AgeFilter
            onSearch={handleAgeSearch}
            user={false}
            resetSignal={playerSearchResetSignal}
            isActive={appliedAge > 0 || Boolean(appliedGender)}
          />
        )
      });

      // 3. Print Skills sheet action
      const hasSkills = rows.some((r) => r.description && r.description.trim() !== "");
      if (hasSkills) {
        actions.push({
          id: "print-skills",
          node: (
            <BasicLeaderboardPrintSkillsSheet
              skills={safeSkillsForPrint}
              ladderId={ladderId}
              className="rounded-lg h-16 w-full border px-4 text-[var(--best-board-text)] shadow-none transition hover:-translate-y-0.5 flex flex-col items-center justify-center gap-1 text-[10px] font-bold uppercase leading-tight disabled:cursor-not-allowed disabled:opacity-60 best-board-card-soft border-[var(--best-board-border)] hover:bg-[var(--best-board-surface)]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6" />
                <rect x="6" y="14" width="12" height="8" rx="1" />
              </svg>
              <span>Print Skills</span>
            </BasicLeaderboardPrintSkillsSheet>
          ),
        });
      }

      onActionsChanged(actions);
    }

    return () => {
      if (onActionsChanged) {
        onActionsChanged([]);
      }
    };
  }, [
    isSorted,
    appliedAge,
    appliedGender,
    playerSearchResetSignal,
    onActionsChanged,
    handleAgeSearch,
    handleSortBySkill,
    handleClearAll,
    rows,
    ladderId,
    safeSkillsForPrint,
  ]);

  const handleSkillClick = useCallback(
    (playerId, skillNumber) => {
      if (playerId != currentUserId) {
        setDialogMessage("You can only edit your own profile");
        setIsDialogOpen(true);
        return
      }

      const player = data.find((p) => p.id === playerId);
      if (!player) return;
      const skillObj = player.skills.find(
        (s) => s.skill_number === skillNumber,
      );
      if (!skillObj) return;
      setSelectedPlayerId(playerId);
      setSelectedSkillNumber(skillNumber);
      setSelectedSkillActivityId(skillObj.id);
      setOpenEdit(true);
    },
    [data, currentUserId],
  );

  const handleEditClose = useCallback(() => {
    setOpenEdit(false);
    setSelectedPlayerId(null);
    setSelectedSkillNumber(null);
    setSelectedSkillActivityId(null);
    refreshLeaderboard(selectedSkillFilter);
  }, [refreshLeaderboard, selectedSkillFilter]);

  // FIXED: ONLY LOAD ONCE WHEN ladderId CHANGES (NO INFINITE LOOP)
  useEffect(() => {
    if (ladderId) {
      refreshLeaderboard(0);
    }
  }, [ladderId]); // REMOVED refreshLeaderboard from deps

  const filteredPlayers = data.filter((player) => {
    if (!searchQuery) return true;
    const cleanName = player.name.replace(/\s+/g, "").toLowerCase();
    return cleanName.includes(searchQuery);
  });

  return (
    <>
      <div className="w-full space-y-4 mt-4">
        {/* {loading && <p className="text-white text-center py-8"></p>} */}

        <div className="flex flex-col sm:flex-col sm:items-start gap-2">
          {/* Search Input */}
          <div className="flex-1 w-full min-w-0">
            <PlayerSearch
              searchTerm={searchQuery}
              setSearchTerm={setSearchQuery}
              onClearFilters={handleClearFilters}
              activeFilters={hasFiltersApplied}
              resetSignal={playerSearchResetSignal}
            />
          </div>

          <BasicLeaderboardPrintSkillsSheet
            skills={safeSkillsForPrint}
            ladderId={ladderId}
            className="hidden"
          />
        </div>

        {/* Player Cards */}
        <div className="space-y-2 mt-2">
          {filteredPlayers.length === 0 ? (
            <div className="text-center py-10 text-gray-400 font-bold">No players found</div>
          ) : filteredPlayers.map((player, index) => {
            const isEditablePlayer = player.id === currentUserId;
            return (
              <PlayerCard
                key={player.id}
                player={player}
                overallRank={player.rank || index + 1}
                appliedAge={appliedAge}
                ageRank={index + 1}
                isInverted={isInverted}
                onSkillClick={handleSkillClick}
                isEditable={isEditablePlayer}
                loggedInUser={loggedInUser}
              />
            );
          })}
        </div>
      </div>

      <Dialog open={openSort} onOpenChange={setOpenSort}>
        <DialogContent className="bg-transparent border-none shadow-none flex items-center justify-center max-w-md">
          <BasicLeaderboardShort
            ladderId={ladderId}
            onClose={() => {
              setOpenSort(false);
              setIsSorted(false);
            }}
            onSkillsUpdated={handleSkillsUpdated}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showRemove} onOpenChange={setShowRemove}>
        <DialogContent className="bg-transparent border-none shadow-none flex items-center justify-center max-w-md">
          <BasicLeaderboardUserRemove
            ladderId={ladderId}
            myRank={myRank}
            onClose={handleRemoveClose}
            onSuccessRefresh={handleRemoveSuccess}
          />
        </DialogContent>
      </Dialog>

      <PlayerEditInfoModel
        isDialogOpen={isDialogOpen}
        dialogMessage={dialogMessage}
        setIsDialogOpen={setIsDialogOpen}
      />

      {openEdit && selectedPlayerId && selectedSkillNumber && (
        <BasicLeaderboardUserEdit
          open={openEdit}
          onClose={handleEditClose}
          currentId={selectedPlayerId}
          ladderId={ladderId}
          skillNumber={selectedSkillNumber}
          skillActivityId={selectedSkillActivityId}
        />
      )}
    </>
  );
};

export default BasicLeaderboardUser;
