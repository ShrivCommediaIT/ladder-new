"use client";
import { IMAGE_BASE_URL } from "@/constants/api";

import { useEffect, useState, useCallback, useRef } from "react";
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
  const playerImageUrl = player?.image
    ? `${IMAGE_BASE_URL}/${player.image}`
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
      score !== 0 &&
      !isNaN(target) &&
      !isNaN(score)
    ) {
      isTargetAchieved = isInverted ? score <= target : score >= target;
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

  return (
    <Card className="w-full rounded-xl shadow-lg border border-[var(--best-board-border)] bg-[var(--best-board-surface)] hover:border-[var(--best-board-border-strong)] transition overflow-hidden relative gap-0 p-4 group">
      <div
        className="flex justify-between items-center px-4 py-2"
        onClick={(e) => e.stopPropagation()}
      >
        <PlayerStatusToggle player={player} user={true} />
      </div>
      <div className="flex-1 min-w-0 p-3">
        {/* Header */}
        <div className="flex items-center gap-2 sm:gap-3 mb-2">
          <div className="w-8 h-8 sm:w-10 sm:h-10 shrink-0">
            <Image
              src={playerImageUrl}
              alt={player?.name}
              width={80}
              height={80}
              className="object-cover rounded"
              unoptimized
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white flex items-center gap-2 text-sm sm:text-base font-semibold truncate">
              {player?.name || "N/A"}
              {player.age && (
                <p className="text-white border border-white px-2 py-0.5 text-xs font-semibold rounded shrink-0 w-fit ml-5">
                  {player.age}
                </p>
              )}
              {player.gender && (
                <p className="text-white border border-white px-2 py-0.5 text-xs font-semibold rounded shrink-0 w-fit ml-1">
                  {player.gender == "male" ? "M" : "F"}
                </p>
              )}
            </div>
            <div className="text-[#d4e5e8] text-xs truncate">
              {player?.phone || "N/A"}
            </div>
          </div>
          <div className="flex shrink-0 items-center justify-end gap-2 sm:gap-3">
            <div className="flex flex-col items-center">
              <span className="bg-yellow-200 text-black px-3 sm:px-4 py-0.5 sm:py-1 rounded-sm font-bold border text-xs sm:text-sm shadow-sm leading-none h-7 sm:h-auto flex items-center">
                {Math.abs(player.total_point || 0)}
              </span>
              <p className="text-[9px] text-white mt-1  font-semibold">Total Pts</p>
            </div>

            <div className="flex items-center gap-2 border-l border-white/20 pl-2 sm:pl-3">
              {Boolean(appliedAge) && (
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-emerald-400 border-2 border-white flex items-center justify-center font-bold text-black shadow-sm text-xs sm:text-sm">
                    {ageRank}
                  </div>
                  <p className="text-[8px] sm:text-[9px] text-emerald-400 font-bold mt-1 whitespace-nowrap">Age Rank</p>
                </div>
              )}
              <div className="flex flex-col items-center">
                <PlayerRankBadge rank={overallRank} />
                <p className="text-[8px] sm:text-[9px] text-white font-semibold mt-1 whitespace-nowrap">Overall Rank</p>
              </div>
            </div>
          </div>
        </div>

        {player.skills?.length > 0 ? (
          <>
            <div className="flex gap-[3px] overflow-y-visible pb-1 mb-1">
              {player.skills.map((skill, i) => {

                return (
                  <div
                    key={i}
                    onClick={() =>
                      isEditable && onSkillClick(player.id, skill.skill_number)
                    }
                    className={`relative min-w-[24px] h-6 flex items-center justify-center text-[10px] text-black rounded transition-all ${isEditable
                      ? "cursor-pointer bg-white hover:bg-emerald-500 hover:scale-110"
                      : "cursor-not-allowed bg-white opacity-40 text-gray-500"
                      }`}
                    title={
                      isEditable
                        ? `Edit Skill ${skill.skill_number}: ${skill.skill_description}`
                        : "Only own skills can be edited"
                    }
                  >
                    {/* Minus sign above number */}

                    {skill.skill_number}
                  </div>
                );
              })}
            </div>

            <div className="flex gap-[3px] overflow-x-auto pb-1 mb-1">
              {player.skills.map((skill, i) => {
                const scoreData = getScoreBySkillNumber(
                  player.scores || [],
                  player.skills || [],
                  skill.skill_number,
                );

                return (
                  <div
                    key={i}
                    className={`min-w-[24px] h-6 flex items-center justify-center text-[10px] rounded font-medium border shadow-sm transition-all duration-200 ${scoreData.isTargetAchieved
                      ? "bg-green-400 text-black shadow-md font-semibold"
                      : "bg-yellow-200 text-black font-semibold border-yellow-200/50 hover:bg-yellow-300 hover:shadow-md"
                      } ${scoreData.witnessBy ? "underline decoration-black decoration-[3px] bg-green-400" : ""}`}
                    title={`Score: ${scoreData.score || 0} | Target: ${scoreData.target || "N/A"
                      }${scoreData.isTargetAchieved ? " ACHIEVED!" : ""}`}
                  >
                    {Math.abs(scoreData.displayScore || 0)}
                  </div>
                );
              })}
            </div>

            <div className="flex gap-[3px] overflow-x-auto pb-1">
              {player.skills.map((skill, i) => (
                <div
                  key={i}
                  className="min-w-[24px] h-6 flex items-center justify-center rounded font-bold text-[10px] bg-blue-200 text-black shadow-sm border border-gray-200"
                >
                  {getRankBySkillNumber(player.ranks || [], skill.skill_number)}
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="h-7 bg-gray-800 rounded text-xs text-gray-400 flex items-center justify-center">
            No skills data
          </div>
        )}
      </div>
    </Card>
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

  const safeSkillsForPrint = rows.map((row) => ({
    id: row.id,
    description: String(row.description || ""),
    target: String(row.target || ""),
    unit: String(row.unit || ""),
    mode: row.mode,
  }));

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

  const handleAgeSearch = (age, ageType, gender) => {
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
  };

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

      onActionsChanged(actions);
    }
  }, [isSorted, appliedAge, appliedGender, playerSearchResetSignal, onActionsChanged, handleAgeSearch]);

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
