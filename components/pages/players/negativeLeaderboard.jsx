"use client";
import { IMAGE_BASE_URL } from "@/constants/api";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { Card } from "@/components/ui/card";
import { useSearchParams } from "next/navigation";
import Logo from "@/public/logo1.png";
import { BasicLeaderboardEdit } from "./BasicLeaderboardEdit";
import LadderLinkPanel from "./LadderLinkPanel";
import { fetchSkillLeaderboard } from "@/redux/slices/BasicLeaderboardSlice";
import { Button } from "@/components/ui/button";
import { X, Trophy, ListOrdered } from "lucide-react";

import PlayerSearchInput from "./PlayerSearchInput";
import { BasicLeaderboardUserEdit } from "@/components/shared/BasicLeaderboardUserEdit";
import { fetchNegativeLeaderboard, setAppliedAge, setAgeFilter } from "@/redux/slices/negativeLeaderBoardSlice";
import AgeFilter from "@/components/shared/AgeFilter";
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

    const rawNegativeScore = scoreObj?.negative_ladder_score;
    const score = scoreObj ? Number(convertTimeToSeconds(rawNegativeScore)) : 0;

    const rawBestScore = scoreObj?.negative_ladder_bestscore || "";
    const rawDisplayScore = rawBestScore
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
      console.log("Setting isInverted to 11:", isInverted);
      isTargetAchieved = isInverted ? score <= target : score >= target;
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


  return (
    <Card className="w-full rounded-2xl shadow-lg border border-teal-400/80 bg-[#163344] p-2 sm:p-3 relative">
      <div className="flex justify-between items-start mb-1 px-1">
        <PlayerStatusToggle player={player} user={false} />
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
                        onClick={() => onSkillClick(player.id, skill.skill_number)}
                        className={`${skillCellClass} cursor-pointer text-black bg-white hover:bg-emerald-500 relative`}
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
                        title={`Best Score: ${scoreData.displayScore}s | Target: ${scoreData.target || "N/A"
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
const NegativeLeaderboard = ({ ladderId: propLadderId, onPlayerAdded }) => {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const ladderId = propLadderId || searchParams.get("ladder_id");
  const { data = [], loading, ladderDetails, appliedAge, appliedAgeType, appliedGender } = useSelector(
    (state) => state.negativeLeaderBoard || {},
  );
  const showAgeRank = Number(appliedAge) > 0;

  const isInvertedNum = ladderDetails?.inverted == 0;


  const currentUser = useSelector((state) => state.user?.user);

  // CELEBRATION STATE ONLY
  const [showCelebration, setShowCelebration] = useState(false);

  const [openEdit, setOpenEdit] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);
  const [selectedSkillNumber, setSelectedSkillNumber] = useState(null);
  const [selectedSkillActivityId, setSelectedSkillActivityId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPositiveFilter, setSelectedPositiveFilter] = useState(0);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isInverted, setIsInverted] = useState(false);

  const handleTargetAchieved = useCallback(() => {
    setShowCelebration(true);
    setTimeout(
      () => {
        setShowCelebration(false);
      },
      4000 + Math.random() * 1000,
    );
  }, []);



  useEffect(() => {
    // On component mount, read the inverted state from URL and set local order state
    let Inverted
    if ((searchParams.get('type') === 'negative' && searchParams.get('inverted') === '0')) {
      Inverted = true
      console.log("Setting isInverted to:", true);
    } else if (searchParams.get('type') !== 'negative') {
      Inverted = searchParams.get('inverted') === '1';
      console.log("Setting isInverted to:", false);

    }
    setIsInverted(Inverted);
  }, []);

  const refreshLeaderboard = useCallback(
    (skillNo = selectedPositiveFilter, age = appliedAge, ageType = appliedAgeType, gender = appliedGender) => {
      if (ladderId) {
        const payload = {
          ladder_id: ladderId,
          type: "negative",
        };
        dispatch(fetchNegativeLeaderboard(payload));
      }
    },
    [dispatch, ladderId, selectedPositiveFilter, appliedAge, appliedAgeType, appliedGender],
  );

  const handleAgeSearch = (age, ageType, gender) => {
    const ageNum = age ? Number(age) : "";
    dispatch(setAgeFilter({ age: ageNum, ageType, gender }));
    refreshLeaderboard(selectedPositiveFilter, ageNum, ageType, gender);
  };


  useEffect(() => {
    if (onPlayerAdded) {
      refreshLeaderboard();
    }
  }, [onPlayerAdded, refreshLeaderboard]);

  useEffect(() => {
    if (ladderId) {
      refreshLeaderboard();
    }
  }, [ladderId]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = sessionStorage.getItem("user");
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          if (parsedUser && parsedUser.id) {
            setCurrentUserId(Number(parsedUser.id));
          }
        } catch (err) {
          console.error("Failed to parse user from localStorage", err);
        }
      }
    }
  }, []);


  const handleSkillClick = useCallback(

    (playerId, skillNumber) => {


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
    refreshLeaderboard();
  }, [refreshLeaderboard]);

  const filteredPlayers = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return data;

    const clean = (name = "") =>
      name.replace(/\s+/g, "").toLowerCase();

    const startsWith = data
      .filter((p) => clean(p.name).startsWith(q))
      .sort((a, b) => a.name.localeCompare(b.name));

    const contains = data
      .filter(
        (p) =>
          !clean(p.name).startsWith(q) &&
          clean(p.name).includes(q)
      )
      .sort((a, b) => a.name.localeCompare(b.name));

    return [...startsWith, ...contains];
  }, [data, searchQuery]);


  const playerData = data; // use data from selector
  return (
    <>
      <main className="min-h-screen flex justify-start md:justify-center relative">
        <div className="w-full max-w-2xl px-2 space-y-4">
          <PlayerSearchInput value={searchQuery} onChange={setSearchQuery} />
          <LadderLinkPanel ladderId={ladderId} ladderType="negative" />
          {loading && (
            <p className="text-white text-center hidden">Loading...</p>
          )}
          <div className="space-y-2 mt-2">
            {filteredPlayers.length === 0 ? (
              <div className="text-center py-10 text-gray-400 font-bold">No players found</div>
            ) : (
              filteredPlayers.map((player, index) => (
                <PlayerCard
                  key={player.id}
                  player={player}
                  overallRank={player.rank || index + 1}
                  showAgeRank={showAgeRank}
                  ageRank={index + 1}
                  isInverted={isInverted}
                  onSkillClick={handleSkillClick}
                  onTargetAchieved={handleTargetAchieved}
                  currentUser={currentUser}
                />
              ))
            )}
          </div>
        </div>
      </main>
      {openEdit && selectedPlayerId && selectedSkillNumber && (
        <BasicLeaderboardUserEdit
          open={openEdit}
          onClose={handleEditClose}
          currentId={selectedPlayerId && selectedPlayerId}
          ladderId={ladderId}
          skillNumber={selectedSkillNumber}
          skillActivityId={selectedSkillActivityId}
        />
      )}
    </>
  );
};

export default NegativeLeaderboard;
