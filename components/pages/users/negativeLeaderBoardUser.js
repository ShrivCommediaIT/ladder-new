"use client";
import PlayerRankBadge from "@/components/shared/PlayerRankBadge";
import { IMAGE_BASE_URL } from "@/constants/api";

import { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { Card } from "@/components/ui/card";
import { useSearchParams } from "next/navigation";
import Logo from "@/public/logo1.png";
import { BasicLeaderboardUserEdit } from "@/components/shared/BasicLeaderboardUserEdit";
import PlayerSearch from "./PlayerSearch";
import BasicLeaderboardShort from "../admin/BasicLeaderboardShort";
import BasicLeaderboardUserRemove from "@/components/shared/BasicLeaderboardUserRemove";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Funnel, X, XCircle } from "lucide-react";
import { fetchNegativeLeaderboard, setAgeFilter } from "@/redux/slices/negativeLeaderBoardSlice";
import PlayerEditInfoModel from "@/components/shared/playerEditInfoModel";
import PlayerStatusToggle from "@/components/shared/PlayerStatusToggle";
import { convertTimeToSeconds } from "@/helper/helperFunction";
import LeaderboardActionButtons from "@/components/shared/LeaderboardActionButtons";
import AgeFilter from "@/components/shared/AgeFilter";



/* ---------------- PLAYER CARD ---------------- */
const PlayerCard = ({
  player,
  overallRank,
  showAgeRank,
  rank,
  showGenderRank,
  showCountryRank,
  isInverted,
  onSkillClick,
  onTargetAchieved,
  isEditable,
  currentUser,
  selectedPositiveFilter,
}) => {
  const playerImageUrl =
    player?.image && player.image !== "null" && player.image !== "undefined" && player.image !== ""
      ? `${IMAGE_BASE_URL}/${player.image}?t=${Date.now()}`
      : Logo;
  const skillCellClass =
    "w-[46px] sm:w-[58px] h-6 shrink-0 px-1 flex items-center justify-center text-[9px] sm:text-[10px] rounded";
  const getScoreBySkillNumber = (scores, skills, skillNumber) => {
    const skillNumberKey = String(skillNumber);
    const scoreObj = scores?.find((s) => String(s.skill_number) === skillNumberKey);
    const skillObj = skills?.find((s) => String(s.skill_number) === skillNumberKey);
    const witnessBy = scoreObj?.witness_by || skillObj?.witness_by || "";
    const rawNegativeScore = scoreObj?.negative_ladder_score;
    const score = scoreObj && rawNegativeScore ? Number(convertTimeToSeconds(rawNegativeScore)) : 0;
    const rawBestScore = scoreObj?.negative_ladder_bestscore || "";
    const displayScore = rawBestScore ? convertTimeToSeconds(rawBestScore) : "0";
    const target =
      skillObj?.target !== null && skillObj?.target !== undefined
        ? Number(skillObj.target)
        : null;
    const bestScoreInSeconds = rawBestScore ? Number(convertTimeToSeconds(rawBestScore)) : 0;
    let isTargetAchieved = false;
    if (
      target !== null &&
      target !== 0 &&
      bestScoreInSeconds !== 0 &&
      !isNaN(target) &&
      !isNaN(bestScoreInSeconds)
    ) {
      isTargetAchieved = isInverted ? bestScoreInSeconds <= target : bestScoreInSeconds >= target;
    }
    return { witnessBy, score, displayScore, target, isTargetAchieved, input_score: rawBestScore };
  };

  const achievedTargets =
    player.skills
      ?.map((skill) => {
        const scoreData = getScoreBySkillNumber(
          player.scores || [],
          player.skills || [],
          skill.skill_number,
        );
        return scoreData.isTargetAchieved;
      })
      .filter(Boolean).length || 0;

  //  Trigger celebration when targets achieved
  useEffect(() => {
    if (achievedTargets > 0) {
      onTargetAchieved(player.name, achievedTargets);
    }
  }, [achievedTargets, player.name, onTargetAchieved]);

  const getRankBySkillNumber = (ranks, skillNumber) => {
    const rankObj = ranks?.find((r) => r.skill_number === skillNumber);
    return rankObj ? rankObj.rank : rank;
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
          <div className="flex flex-col items-center justify-center gap-1 flex-shrink-0">

            <PlayerRankBadge
              rank={selectedPositiveFilter > 0 ? getRankBySkillNumber(player.ranks, selectedPositiveFilter) : ((showAgeRank || showGenderRank || showCountryRank) ? rank : overallRank)}
              sizeClass="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14"
              imgSize={56}
              textClass="text-[10px] sm:text-xs md:text-sm"
            />
            {(showAgeRank || showGenderRank || showCountryRank) && (() => {
              const activeRankLabels = [
                showAgeRank && " Age ",
                showGenderRank && " Gender ",
                showCountryRank && " Country ",
              ].filter(Boolean);

              return (
                <div className="flex flex-col  mt-2">
                  <p
                    className="text-[7px] sm:text-[8px] font-bold mt-0.5 whitespace-nowrap text-foreground"

                  >
                    Rank By:-
                  </p>
                  <p
                    className="text-[7px] sm:text-[8px] font-bold mt-0.5 whitespace-nowrap text-foreground"
                  >
                    {`(${activeRankLabels.join(",")})`}
                  </p>
                </div>
              );
            })()}
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
                          ${scoreData.witnessBy && "underline decoration-dark decoration-[2px]"}
                            ${scoreData.isTargetAchieved
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
              {Math.abs(Number(player?.total_point || 0)).toFixed(2)}
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
const NegativeLeaderboardUser = ({ ladderId: propLadderId, onActionsChanged }) => {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const ladderId = propLadderId || searchParams.get("ladder_id");

  const { data = [], loading, ladderDetails, appliedAge, appliedAgeType, appliedGender, appliedCountry, appliedWitnessBy } = useSelector(
    (state) => state.negativeLeaderBoard || {},
  );
  const showAgeRank = Number(appliedAge) > 0;
  const showGenderRank = appliedGender != "";
  const showCountryRank = appliedCountry != "";
  const loggedInUser = useSelector((state) => state.user?.user);
  const isInverted = ladderDetails?.inverted == 0;
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
  const [isRefreshing, setIsRefreshing] = useState(false); // FIXED: UNCOMMENTED
  const [resetSignal, setResetSignal] = useState(0);
  const [showRemove, setShowRemove] = useState(false);
  const [selectedPositiveFilter, setSelectedPositiveFilter] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);

  const [currentUserId, setCurrentUserId] = useState(null);
  const [dialogMessage, setDialogMessage] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const currentUser = data.find((p) => p.id == currentUserId);
  const myRank = currentUser?.rank;

  const handleTargetAchieved = useCallback(() => {
    setShowCelebration(true);
    setTimeout(
      () => {
        setShowCelebration(false);
      },
      4000 + Math.random() * 1000,
    );
  }, []);

  // REFRESH KEY TO CONTROL RELOADS (STOPS INFINITE LOOP)
  const refreshKey = useRef(0);

  // REFRESH FUNCTION FIRST
  const refreshLeaderboard = useCallback(
    (skillNo = selectedPositiveFilter, age = appliedAge, ageType = appliedAgeType, gender = appliedGender, country = appliedCountry, witness = appliedWitnessBy) => {
      if (ladderId) {
        const payload = {
          ladder_id: ladderId,
          type: "negative",
          sortbyskillnumber: skillNo,
        };

        if (age > 0) {
          payload.dob = age;
          payload.age_type = ageType;
        }

        if (gender) {
          payload.gender = gender;
        }

        if (country) {
          payload.country = country;
        }

        if (witness === 1) {
          payload.witness_by = 1;
        }

        setIsRefreshing(true);
        dispatch(fetchNegativeLeaderboard(payload)).finally(() => {
          setIsRefreshing(false);
        });
      }
    },
    [dispatch, ladderId, selectedPositiveFilter, appliedAge, appliedAgeType, appliedGender, appliedCountry, appliedWitnessBy],
  );

  const handleAgeSearch = useCallback((age, ageType, gender, country, witness) => {
    const ageNum = age ? Number(age) : "";
    const witnessVal = witness !== undefined ? witness : 0;
    const isClearing = (age === null || age === "") && !country && !witnessVal;

    if (isClearing) {
      setIsSorted(false);
      setSelectedSkillFilter(0);
      setSelectedPositiveFilter(0);
    } else {
      setIsSorted(true);
    }

    dispatch(setAgeFilter({ age: ageNum, ageType, gender, country }));
    refreshLeaderboard(isClearing ? 0 : selectedPositiveFilter, ageNum, ageType, gender, country, witnessVal);
  }, [dispatch, selectedPositiveFilter, refreshLeaderboard]);

  const handleClearFilters = useCallback(() => {
    setSearchQuery("");
    setIsSorted(false);
    setSelectedSkillFilter(0);
    setSelectedPositiveFilter(0);
    dispatch(setAgeFilter({ age: 0, ageType: "under", gender: "", country: "" }));
    refreshLeaderboard(0, 0, "", "", "", 0);
    setResetSignal((p) => p + 1);
  }, [dispatch, refreshLeaderboard]);

  useEffect(() => {
    if (onActionsChanged) {
      const actions = [];

      // 1. Sort action
      actions.push({
        id: "sort-by-skill",
        label: selectedPositiveFilter > 0 ? "Sorted" : "Sort by Skill",
        icon: Funnel,
        onClick: handleSortBySkill,
      });

      // 2. Age filter
      actions.push({
        id: "age-filter",
        node: (
          <AgeFilter
            onSearch={handleAgeSearch}
            user={false}
            resetSignal={resetSignal}
            isActive={appliedAge > 0 || Boolean(appliedGender) || Boolean(appliedCountry) || appliedWitnessBy === 1}
            defaultAge={appliedAge}
            defaultAgeType={appliedAgeType}
            defaultGender={appliedGender}
            defaultCountry={appliedCountry}
            defaultWitness={appliedWitnessBy}
            showWitness={true}
          />
        )
      });

      // 3. Separate Clear All Filters action
      const hasActiveFilters = isSorted || selectedPositiveFilter > 0 || appliedAge > 0 || Boolean(appliedGender) || Boolean(appliedCountry) || appliedWitnessBy === 1;
      if (hasActiveFilters) {
        actions.push({
          id: "clear-all-filters",
          label: "Clear All Filters",
          icon: XCircle,
          onClick: handleClearFilters,
          tone: "danger",
        });
      }

      onActionsChanged(actions);
    }
  }, [isSorted, selectedPositiveFilter, appliedAge, appliedGender, appliedCountry, appliedWitnessBy, resetSignal, onActionsChanged, handleAgeSearch]);

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
      setSelectedPositiveFilter(skillNo);
      setSelectedSkillFilter(skillNo);
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
    setSelectedPositiveFilter(0);
    dispatch(setAgeFilter({ age: 0, ageType: "under", gender: "", country: "" }));
    refreshLeaderboard(0, 0, "under", "", "");
  }, [refreshLeaderboard, dispatch]);

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

  useEffect(() => {
    dispatch(setAgeFilter({ age: 0, ageType: "", gender: "", country: "" }));
  }, [dispatch]);

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

        {/* Search + Buttons */}
        <div className="flex flex-col sm:flex-col sm:items-start gap-2">
          {/* Search Input */}
          <div className="flex-1 w-full min-w-0">
            <PlayerSearch
              searchTerm={searchQuery}
              setSearchTerm={setSearchQuery}
              onClearFilters={handleClearFilters}
              activeFilters={Boolean(searchQuery) || appliedAge > 0 || Boolean(appliedGender) || Boolean(appliedCountry)}
            />
          </div>

          {/* Player Cards */}
          <div className="space-y-2 mt-2 w-full">
            {filteredPlayers.length === 0 ? (
              <div className="text-center py-10 text-gray-400 font-bold">No players found</div>
            ) : (
              filteredPlayers.map((player, index) => {
                const isEditablePlayer = player.id === currentUserId;
                return (
                  <PlayerCard
                    key={player.id}
                    player={player}
                    overallRank={player.rank || index + 1}
                    showAgeRank={showAgeRank}
                    showGenderRank={showGenderRank}
                    showCountryRank={showCountryRank}
                    rank={index + 1}
                    isInverted={isInverted}
                    onSkillClick={handleSkillClick}
                    onTargetAchieved={handleTargetAchieved} // No-op since celebration is handled inside PlayerCard
                    isEditable={isEditablePlayer}
                    loggedInUser={loggedInUser}
                    selectedPositiveFilter={selectedPositiveFilter}
                  />
                );
              })
            )}
          </div>
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

          {/* <BasicLeaderboardUserRemove
            ladderId={ladderId}
            myRank={myRank}
            onClose={handleRemoveClose}
            onSuccessRefresh={handleRemoveSuccess}
          /> */}
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

export default NegativeLeaderboardUser;
