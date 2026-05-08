"use client";
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
import { Funnel, X } from "lucide-react";
import { fetchNegativeLeaderboard, setAgeFilter } from "@/redux/slices/negativeLeaderBoardSlice";
import PlayerEditInfoModel from "@/components/shared/playerEditInfoModel";
import PlayerStatusToggle from "@/components/shared/PlayerStatusToggle";
import { convertTimeToSeconds } from "@/helper/helperFunction";

/* ---------------- PLAYER CARD ---------------- */
const PlayerCard = ({
  player,
  overallRank,
  showAgeRank,
  ageRank,
  isInverted,
  onSkillClick,
  onTargetAchieved,
  isEditable,
  currentUser,
}) => {
  const playerImageUrl = player?.image
    ? `${IMAGE_BASE_URL}/${player.image}`
    : Logo;
  const skillCellClass =
    "w-[46px] sm:w-[58px] h-6 shrink-0 px-1 flex items-center justify-center text-[9px] sm:text-[10px] rounded";
  const getScoreBySkillNumber = (scores, skills, skillNumber) => {
    const skillNumberKey = String(skillNumber);
    const scoreObj = scores?.find((s) => String(s.skill_number) === skillNumberKey);
    const skillObj = skills?.find((s) => String(s.skill_number) === skillNumberKey);
    const witnessBy =
      scoreObj?.witness_by ||
      skillObj?.witness_by ||
      "";

    const rawNegativeScore = scoreObj?.negative_ladder_bestscore;
    const score = scoreObj ? Number(convertTimeToSeconds(rawNegativeScore)) : 0;

    const rawBestScore = scoreObj?.negative_ladder_bestscore || "";
    const rawDisplayScore = rawBestScore || rawNegativeScore || "";
    const displayScore = rawDisplayScore
      ? convertTimeToSeconds(rawDisplayScore)
      : "0";

    const target =
      skillObj?.target !== null && skillObj?.target !== undefined
        ? Number(skillObj.target)
        : null;

    let isTargetAchieved = false;

    if (
      target !== null &&
      target !== 0 &&
      score !== 0 &&
      !isNaN(target) &&
      !isNaN(score)
    ) {
      isTargetAchieved = isInverted ? score >= target : score <= target;
    }

    return {
      witnessBy,
      score,
      displayScore,
      target,
      isTargetAchieved,
      input_score: rawBestScore,
    };
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
  }, [player.scores, achievedTargets, player.name, onTargetAchieved]);

  const getRankBySkillNumber = (ranks, skillNumber) => {
    const rankObj = ranks?.find((r) => r.skill_number === skillNumber);
    return rankObj ? rankObj.rank : "-";
  };

  return (
    <Card className="w-full rounded-2xl shadow-lg border border-teal-400/80 bg-[#163344] p-2 sm:p-3 relative">
      <div className="flex justify-between items-start mb-1 px-1">
        <PlayerStatusToggle player={player} user={true} />
      </div>
      <div className="flex-1 min-w-0">
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
                <p className="text-white border border-white px-2 py-0.5 text-xs font-semibold rounded shrink-0 w-fit ml-3">
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
              {showAgeRank && (
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-emerald-400 border-2 border-white flex items-center justify-center font-bold text-black shadow-sm text-xs sm:text-sm">
                    {ageRank}
                  </div>
                  <p className="text-[8px] sm:text-[9px] text-emerald-400 font-bold mt-1 whitespace-nowrap">Age Rank</p>
                </div>
              )}
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-blue-200 border-2 border-white flex items-center justify-center font-bold text-black shadow-sm text-xs sm:text-sm">
                  {overallRank}
                </div>
                <p className="text-[8px] sm:text-[9px] text-white font-semibold mt-1 whitespace-nowrap">Overall Rank</p>
              </div>
            </div>
          </div>
        </div>

        {player.skills?.length > 0 ? (
          <>
            <div className="-mx-1 overflow-x-auto pb-1 mb-1 px-1 scrollbar-thin">
              <div className="w-max min-w-full">
                <div className="flex gap-[3px] overflow-y-visible pb-2">
                  {player.skills.map((skill, i) => {
                    const isNegative = skill.skill_sign === "-";

                    return (
                      <div
                        key={i}
                        onClick={() => isEditable && onSkillClick(player.id, skill.skill_number)}
                        className={`${skillCellClass}  text-black relative ${isEditable
                          ? "cursor-pointer bg-white hover:bg-emerald-500 hover:scale-110"
                          : "cursor-not-allowed bg-white opacity-40 text-gray-500"
                          }`}
                        title={`Edit Skill ${skill.skill_number}: ${skill.skill_description}`}
                      >
                        {/* minus sign box ke upar */}
                        {isNegative && (
                          <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[12px] font-extrabold text-white leading-none">
                            −
                          </span>
                        )}

                        {skill.skill_number}
                      </div>
                    );
                  })}
                </div>

                {/* ✅ SCORES - YELLOW by default, GREEN when target achieved */}
                <div className="flex gap-[3px]">
                  {player.skills.map((skill, i) => {
                    const scoreData = getScoreBySkillNumber(
                      player.scores || [],
                      player.skills || [],
                      skill.skill_number,
                    );
                    return (
                      <div
                        key={i}
                        className={`${skillCellClass} font-medium border shadow-sm transition-all duration-200 group relative ${scoreData.isTargetAchieved
                          ? "bg-green-400 text-black shadow-md font-semibold"
                          : "bg-yellow-200 text-black font-semibold border-yellow-200/50 hover:bg-yellow-300 hover:shadow-md"
                          } ${scoreData.witnessBy ? "underline decoration-black decoration-[3px] bg-green-400" : ""}`}
                        title={`Score: ${scoreData.score} | Target: ${scoreData.target || "N/A"
                          }${scoreData.isTargetAchieved ? " ACHIEVED!" : ""}`}
                      >
                        {scoreData.displayScore}
                      </div>
                    );
                  })}
                </div>
              </div>
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
const NegativeLeaderboardUser = ({ ladderId: propLadderId }) => {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const ladderId = propLadderId || searchParams.get("ladder_id");

  const { data = [], loading, ladderDetails, appliedAge, appliedAgeType, appliedGender } = useSelector(
    (state) => state.negativeLeaderBoard || {},
  );
  const showAgeRank = Number(appliedAge) > 0;
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
    (skillNo = selectedPositiveFilter, age = appliedAge, ageType = appliedAgeType, gender = appliedGender) => {
      if (ladderId) {
        const payload = {
          ladder_id: ladderId,
          type: "negative",
        };

        if (age > 0) {
          payload.dob = age;
          payload.age_type = ageType;
        }

        if (gender) {
          payload.gender = gender;
        }

        setIsRefreshing(true);
        dispatch(fetchNegativeLeaderboard(payload)).finally(() => {
          setIsRefreshing(false);
        });
      }
    },
    [dispatch, ladderId, selectedPositiveFilter, appliedAge, appliedAgeType, appliedGender],
  );

  const handleAgeSearch = (age, ageType, gender) => {
    const ageNum = age ? Number(age) : "";
    const isClearing = age === null || age === "";

    if (isClearing) {
      setIsSorted(false);
      setSelectedSkillFilter(0);
      setSelectedPositiveFilter(0);
    } else {
      setIsSorted(true);
    }

    dispatch(setAgeFilter({ age: ageNum, ageType, gender }));
    refreshLeaderboard(isClearing ? 0 : selectedPositiveFilter, ageNum, ageType, gender);
  };

  const handleClearFilters = useCallback(() => {
    setSearchQuery("");
    setIsSorted(false);
    setSelectedSkillFilter(0);
    setSelectedPositiveFilter(0);
  }, []);

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
    dispatch(setAgeFilter({ age: 0, ageType: "under", gender: "" }));
    refreshLeaderboard(0, 0, "under", "");
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
      <main className="min-h-screen flex justify-center ">
        <div className="w-full max-w-2xl px-4 py-4 space-y-4">
          {/* {loading && <p className="text-white text-center py-8"></p>} */}

          {/* Search + Buttons */}
          <div className="flex flex-col sm:flex-col sm:items-start gap-2">
            {/* Search Input */}
            <div className="flex-1 w-full min-w-0">
              <PlayerSearch
                searchTerm={searchQuery}
                setSearchTerm={setSearchQuery}
                onAgeSearch={handleAgeSearch}
                onClearFilters={handleClearFilters}
                activeFilters={Boolean(searchQuery) || appliedAge > 0 || Boolean(appliedGender)}
                defaultAge={appliedAge}
              />
            </div>

            <div className="flex-1 w-full min-w-0">


              {/* Buttons */}
              <div className="flex flex-wrap sm:flex-nowrap gap-2 mt-2 sm:mt-0">
                {!isSorted ? (
                  <Button
                    onClick={handleSortBySkill}
                    disabled={isRefreshing}
                    className="bg-[#005F5A] text-white font-bold rounded-md px-4 py-2 flex items-center gap-2"
                  >
                    <Funnel size={16} />
                    Sort by Skill
                  </Button>
                ) : (
                  <Button
                    onClick={handleClearAll}
                    disabled={isRefreshing}
                    className="bg-red-600 text-white font-bold rounded-md px-4 py-2 flex items-center gap-2"
                  >
                    <Funnel size={16} />
                    Clear All
                  </Button>
                )}

                {currentUserId && (
                  <Button
                    onClick={handleSelfRemove}
                    disabled={isRefreshing}
                    className="bg-gradient-to-r from-red-500 to-red-500 hover:from-orange-600 hover:to-red-600 
                       text-white font-bold rounded-md px-4 py-2 flex items-center gap-2 shadow-lg"
                  >
                    <X size={16} className="w-4 h-4" />
                    Click here to leave this solution
                  </Button>
                )}
              </div>
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
                      ageRank={index + 1}
                      isInverted={isInverted}
                      onSkillClick={handleSkillClick}
                      onTargetAchieved={handleTargetAchieved} // No-op since celebration is handled inside PlayerCard
                      isEditable={isEditablePlayer}
                      loggedInUser={loggedInUser}
                    />
                  );
                })
              )}
            </div>
          </div>
        </div>
      </main>

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

export default NegativeLeaderboardUser;
