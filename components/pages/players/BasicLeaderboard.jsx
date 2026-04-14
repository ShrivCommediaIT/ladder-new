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
import { getRequest } from "@/services/apiService";
import PlayerSearchInput from "./PlayerSearchInput";



/* ---------------- PLAYER CARD ---------------- */
const PlayerCard = ({
  player,
  overallRank,
  onSkillClick,
  onTargetAchieved,
}) => {
  const playerImageUrl = player?.image
    ? `${IMAGE_BASE_URL}/${player.image}`
    : Logo;

  const getScoreBySkillNumber = (scores, skills, skillNumber) => {
    const scoreObj = scores?.find((s) => s.skill_number === skillNumber);
    const skillObj = skills?.find((s) => s.skill_number === skillNumber);
    const witnessBy =
    scoreObj?.witness_by ||
    skillObj?.witness_by ||
    "";
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
      witnessBy,
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

  const getRankBySkillNumber = (ranks, skillNumber) => {
    const rankObj = ranks?.find((r) => r.skill_number === skillNumber);
    return rankObj ? rankObj.rank : "-";
  };

  return (
    <Card className="w-full rounded-2xl shadow-lg border border-teal-400/80 bg-[#163344] p-2 sm:p-3">
      <div className="flex-1 min-w-0">
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
          <div className="flex flex-col items-center mr-1">
            <span className="bg-yellow-200 text-black px-4 py-1 rounded-sm font-semibold border">
              {Math.abs(player.total_point || 0)}
            </span>
            <p className="text-[10px] text-white mt-1">Total Pts</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-9 h-9 rounded-full bg-blue-200 border-2 border-white flex items-center justify-center font-bold text-black">
              {overallRank}
            </div>
            <p className="text-[10px] text-white mt-1">Overall Rank</p>
          </div>
        </div>

        {player.skills?.length > 0 ? (
          <>
            <div className="flex gap-[3px] overflow-y-visible pb-2 mb-1">
              {player.skills.map((skill, i) => {
                const isNegative = skill.skill_sign === "-";

                return (
                  <div
                    key={i}
                    onClick={() => onSkillClick(player.id, skill.skill_number)}
                    className="cursor-pointer min-w-[24px] h-6 flex items-center justify-center text-[10px] text-black rounded bg-white hover:bg-emerald-500 transition-all hover:scale-110 relative"
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
                    className={`min-w-[24px] h-6 flex items-center justify-center text-[10px] rounded font-medium border shadow-sm transition-all duration-200 group relative ${
                      scoreData.isTargetAchieved
                        ? "bg-green-400 text-black shadow-md font-semibold"
                        : "bg-yellow-200 text-black font-semibold border-yellow-200/50 hover:bg-yellow-300 hover:shadow-md"
                    } ${scoreData.witnessBy ? "underline decoration-black decoration-[3px] bg-green-400" : ""}`}
                    title={`Score: ${scoreData.score} | Target: ${
                      scoreData.target || "N/A"
                    }${scoreData.isTargetAchieved ? " ACHIEVED!" : ""}`}
                  >
                    {Math.abs(scoreData.displayScore || 0)}
                  </div>
                );
              })}
            </div>

            {/* Ranks */}
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
const BasicLeaderboard = ({ ladderId: propLadderId, onPlayerAdded }) => {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const ladderId = propLadderId || searchParams.get("ladder_id");
  const { data = [], loading } = useSelector(
    (state) => state.skillLeaderboard || {},
  );

  // CELEBRATION STATE ONLY
  const [showCelebration, setShowCelebration] = useState(false);

  const [openEdit, setOpenEdit] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);
  const [selectedSkillNumber, setSelectedSkillNumber] = useState(null);
  const [selectedSkillActivityId, setSelectedSkillActivityId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkillFilter, setSelectedSkillFilter] = useState(0);

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
    (skillNo = selectedSkillFilter) => {
      if (ladderId) {
        dispatch(
          fetchSkillLeaderboard({
            ladder_id: ladderId,
            type: "skill",
            sortbyskillnumber: skillNo,
          }),
        );
      }
    },
    [dispatch, ladderId, selectedSkillFilter],
  );

  useEffect(() => {
    if (onPlayerAdded) {
      refreshLeaderboard();
    }
  }, [onPlayerAdded, refreshLeaderboard]);

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


  const invertRanking = useSelector((state) => state.player.invertRanking);

  const processedPlayers = invertRanking
    ? [...filteredPlayers].reverse()
    : filteredPlayers;

  return (
    <>
      
      <main className="min-h-screen flex justify-center relative">
        <div className="w-full max-w-2xl px-2 space-y-4">
          <PlayerSearchInput value={searchQuery} onChange={setSearchQuery} />
          <LadderLinkPanel ladderId={ladderId} ladderType="skill" />
          {loading && (
            <p className="text-white text-center hidden">Loading...</p>
          )}
          <div className="space-y-2 mt-2">
            {processedPlayers.map((player, index) => (
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
        <BasicLeaderboardEdit
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

export default BasicLeaderboard;
