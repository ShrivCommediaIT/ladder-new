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
import { fetchPositiveLeaderboard, setAppliedAge } from "@/redux/slices/positiveLeaderBoardSlice";
import AgeFilter from "@/components/shared/AgeFilter";



/* ---------------- PLAYER CARD ---------------- */
const PlayerCard = ({
  player,
  overallRank,
  appliedAge,
  ageRank,
  onSkillClick,
  onTargetAchieved,
}) => {
  const playerImageUrl = player?.image
    ? `${IMAGE_BASE_URL}/${player.image}`
    : Logo;
  const getScoreBySkillNumber = (scores, skills, skillNumber) => {
    const scoreObj = scores?.find((s) => s.skill_number === skillNumber);
    const skillObj = skills?.find((s) => s.skill_number === skillNumber);

    const score = scoreObj ? Number(scoreObj.score) : 0; // 🔒 internal logic
    const inputScore =
      scoreObj?.input_score !== null && scoreObj?.input_score !== undefined
        ? Number(scoreObj.input_score)
        : null;

    const displayScore =
      inputScore !== null && !isNaN(inputScore) ? inputScore : score;

    const target =
      skillObj?.target !== null && skillObj?.target !== undefined
        ? Number(skillObj.target)
        : null;

    const mode = skillObj?.skill_sign || "+";

    let isTargetAchieved = false;

    if (
      target !== null &&
      target !== 0 &&
      score !== 0 && // still using real score
      !isNaN(target) &&
      !isNaN(score)
    ) {
      if (mode === "+") {
        isTargetAchieved = score >= target;
      } else {
        // minus mode → target negative stored hota hai
        isTargetAchieved = score >= Math.abs(target);
      }
    }

    return {
      score,
      displayScore,
      target,
      isTargetAchieved,
      input_score: inputScore,
      witnessBy: scoreObj?.witness_by || null,
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
  React.useEffect(() => {
    if (achievedTargets > 0) {
      onTargetAchieved(player.name, achievedTargets);
    }
  }, [player.scores, achievedTargets, player.name, onTargetAchieved]);
  

  return (
    <Card onClick={() => onSkillClick(player.id, player.skills[0].skill_number)} className="w-full rounded-2xl shadow-lg border border-teal-400/80 bg-[#163344] p-2 sm:p-3">
      <div    className="flex-1 min-w-0 curcer-pointer">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10">
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
              <p className="text-white border border-white px-2 py-0.5 text-xs font-semibold rounded shrink-0 w-fit">
                {player.age}
              </p>
            )}
            </div>
            <div className="text-[#d4e5e8] text-xs truncate">
              {player?.phone || "N/A"}
            </div>
          </div>
          <div className="flex shrink-0 items-center justify-end gap-2">
            {Boolean(appliedAge) && (
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-emerald-400 border-2 border-white flex items-center justify-center font-bold text-black shadow-sm text-xs sm:text-sm">
                  {ageRank}
                </div>
                <p className="text-[8px] sm:text-[9px] text-emerald-400 font-bold mt-0.5 whitespace-nowrap">Age Rank</p>
              </div>
            )}
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-blue-200 border-2 border-white flex items-center justify-center font-bold text-black shadow-sm text-xs sm:text-sm">
                {overallRank}
              </div>
              <p className="text-[8px] sm:text-[9px] text-white font-semibold mt-0.5 whitespace-nowrap">Overall Rank</p>
            </div>
          </div>
        </div>
      </div>
        <div  className="flex  justify-between mr-1">
          <div className="flex flex-col items-center mr-1">
            <span className={` flex  justify-center  w-20 text-black px-4 py-1 rounded-sm font-semibold border ${ 
              player?.skills?.length > 0 && getScoreBySkillNumber(player.scores || [], player.skills || [], player.skills[0].skill_number).isTargetAchieved 
              ? "bg-green-500" 
              : "bg-white" 
            } ${
              player?.skills?.length > 0 && getScoreBySkillNumber(player.scores || [], player.skills || [], player.skills[0].skill_number).witnessBy 
              ? "underline decoration-black decoration-[3px] bg-green-400" 
              : "" 
            }`}>
              {player?.skills?.length > 0 ? getScoreBySkillNumber(player.scores || [], player.skills || [], player.skills[0].skill_number).displayScore : 0}
            </span>
          </div>
            {player && player?.skills?.length > 0 ?null : (
            <div className="h-7 p-3 bg-gray-800 rounded text-xs text-gray-400 flex items-center justify-center">
                No skills data
            </div>
            )}  
        </div>
    </Card>
  );
};

/* ---------------- MAIN COMPONENT ---------------- */
const PositiveLeaderboard = ({ ladderId: propLadderId, onPlayerAdded }) => {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const ladderId = propLadderId || searchParams.get("ladder_id");
  const { data = [], loading, appliedAge } = useSelector(
    (state) => state.positiveLeaderBoard || {},
  );

  // CELEBRATION STATE ONLY
  const [showCelebration, setShowCelebration] = useState(false);

  const [openEdit, setOpenEdit] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);
  const [selectedSkillNumber, setSelectedSkillNumber] = useState(null);
  const [selectedSkillActivityId, setSelectedSkillActivityId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPositiveFilter, setSelectedPositiveFilter] = useState(0);
 const [currentUserId, setCurrentUserId] = useState(null);
  const handleTargetAchieved = useCallback(() => {
    setShowCelebration(true);
    setTimeout(
      () => {
        setShowCelebration(false);
      },
      4000 + Math.random() * 1000,
    );
  }, []);

  const refreshLeaderboard = useCallback(
    (skillNo = selectedPositiveFilter, age = appliedAge) => {
      if (ladderId) {
        const payload = {
          ladder_id: ladderId,
          type: "positive",
          sortbyskillnumber: skillNo,
        };

        if (age > 0) {
          payload.dob = age;
        }

        dispatch(fetchPositiveLeaderboard(payload));
      }
    },
    [dispatch, ladderId, selectedPositiveFilter, appliedAge],
  );

  const handleAgeSearch = (age) => {
    const ageNum = Number(age);
    dispatch(setAppliedAge(ageNum));
    refreshLeaderboard(selectedPositiveFilter, ageNum);
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
  }, [ladderId, refreshLeaderboard]);

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
          
          <div className="h-10 w-full">
            <AgeFilter onSearch={handleAgeSearch} user={false} />
          </div>

          <LadderLinkPanel ladderId={ladderId} ladderType="positive" />
          {loading && (
            <p className="text-white text-center hidden">Loading...</p>
          )}
          <div className="space-y-2 mt-2">
            {playerData.length === 0 ? (
              <div className="text-center py-10 text-gray-400 font-bold">No players found</div>
            ) : (
              playerData.map((player, index) => (
                <PlayerCard
                  key={player.id}
                  player={player}
                  overallRank={player.rank || index + 1}
                  appliedAge={appliedAge}
                  ageRank={index + 1}
                  onSkillClick={handleSkillClick}
                  onTargetAchieved={handleTargetAchieved}
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

export default PositiveLeaderboard;
