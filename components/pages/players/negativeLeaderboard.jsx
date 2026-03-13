"use client";

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
import axios from "axios";
import PlayerSearchInput from "./PlayerSearchInput";
import { BasicLeaderboardUserEdit } from "@/components/shared/BasicLeaderboardUserEdit";
import { fetchPositiveLeaderboard } from "@/redux/slices/positiveLeaderBoardSlice";
import { fetchNegativeLeaderboard } from "@/redux/slices/negativeLeaderBoardSlice";

const APPKEY = "Py9YJXgBecbbqxjRVaHarcSnJyuzhxGqJTkY6xKZRfrdXFy72HPXvFRvfEjy";

/* ---------------- PLAYER CARD ---------------- */
const PlayerCard = ({
  player,
  overallRank,
  onSkillClick,
  onTargetAchieved,
}) => {
  const playerImageUrl = player?.image
    ? `https://ne-games.com/leaderBoard/public/admin/clip-one/assets/user/original/${player.image}`
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

  const toTotalSeconds = (score) => {
    if (!score) return 0;

    const [hh, mm, secMs] = score.split(":");
    const [ss, ms = "0"] = secMs.split(".");

    const total =
      Number(hh) * 3600 +
      Number(mm) * 60 +
      Number(ss) +
      Number(ms) / 100;

    return total;
  };


  return (
    <Card onClick={() => {
    const skillNumber = player.skills?.[0]?.skill_number;
    if (!skillNumber) return;
    onSkillClick(player.id, skillNumber);
  }} className="w-full rounded-2xl shadow-lg border border-teal-400/80 bg-[#163344] p-2 sm:p-3">
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
          <div className="flex-1 min-w-0 space-y-1">
            <p className="text-white font-semibold truncate">{player.name}</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-9 h-9 rounded-full bg-[#01ffff] border-2 border-white flex items-center justify-center font-bold text-black">
              {overallRank}
            </div>
          </div>
        </div>
      </div>
        <div  className="flex  justify-between mr-1">
          <div className="flex flex-col items-center mr-1">
            <span className="bg-white flex  justify-center  w-20 text-black px-4 py-1 rounded-sm font-semibold border">
              {toTotalSeconds(player && player?.scores[0]?.negative_ladder_score) || 0}
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
const NegativeLeaderboard = ({ ladderId: propLadderId, onPlayerAdded }) => {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const ladderId = propLadderId || searchParams.get("ladder_id");
  const { data = [], loading } = useSelector(
    (state) => state.negativeLeaderBoard || {},
  );

  // CELEBRATION STATE ONLY
  const [showCelebration, setShowCelebration] = useState(false);

  const [openEdit, setOpenEdit] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);
  const [selectedSkillNumber, setSelectedSkillNumber] = useState(null);
  const [selectedSkillActivityId, setSelectedSkillActivityId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPositiveFilter, setSelectedPositiveFilter] = useState(0);

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
    (skillNo = selectedPositiveFilter) => {
      if (ladderId) {
        dispatch(
          fetchNegativeLeaderboard({
            ladder_id: ladderId,
            type: "negative",
            sortbyskillnumber: skillNo,
          }),
        );
      }
    },
    [dispatch, ladderId, selectedPositiveFilter],
  );

  useEffect(() => {
    if (onPlayerAdded) {
      refreshLeaderboard();
    }
  }, [onPlayerAdded, refreshLeaderboard]);

  useEffect(() => {
    if (ladderId) {
      dispatch(fetchNegativeLeaderboard({ ladder_id: ladderId, type: "negative" }));
    }
  }, [dispatch, ladderId]);


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
    [data],
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


  const playerData = useSelector((state) => state.negativeLeaderBoard.data);
  return (
    <>
      
      <main className="min-h-screen flex justify-center relative">
        <div className="w-full max-w-2xl px-2 space-y-4">
          <PlayerSearchInput value={searchQuery} onChange={setSearchQuery} />
          <LadderLinkPanel ladderId={ladderId} ladderType="negative" />
          {loading && (
            <p className="text-white text-center hidden">Loading...</p>
          )}
          <div className="space-y-2 mt-2">
            {playerData.map((player, index) => (
              <PlayerCard
                key={player.id}
                player={player}
                overallRank={player.rank || index + 1}
                onSkillClick={handleSkillClick}
                onTargetAchieved={handleTargetAchieved}
              />
            ))}
          </div>
        </div>
      </main>

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

export default NegativeLeaderboard;
