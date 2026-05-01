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

const getScoreBySkillNumber = (scores, skills, skillNumber) => {
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
   isTargetAchieved = isInverted ? score > target : score < target;
  }

  return {
    score,
    target,
    isTargetAchieved,
  };
};

const getRankBySkillNumber = (ranks, skillNumber) => {
  const rankObj = ranks.find((r) => r.skill_number === skillNumber);
  return rankObj ? rankObj.rank : "-";
};

/* ---------------- PLAYER CARD ---------------- */

const PlayerCard = ({ player, overallRank, onSkillClick, isEditable,isInverted }) => {
  const playerImageUrl = player?.image
    ? `${IMAGE_BASE_URL}/${player.image}`
    : Logo;

  return (
    <Card className="w-full rounded-2xl shadow-lg border border-teal-400/80 bg-[#163344] p-2 sm:p-3">
      <div className="flex-1 min-w-0">
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
            {isEditable && <p className="text-xs text-emerald-400">{}</p>}
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
            <div className="flex gap-[3px] overflow-y-visible pb-1 mb-1">
              {player.skills.map((skill, i) => {
                const isNegative = skill.skill_sign === "-";

                return (
                  <div
                    key={i}
                    onClick={() =>
                      isEditable && onSkillClick(player.id, skill.skill_number)
                    }
                    className={`relative min-w-[24px] h-6 flex items-center justify-center text-[10px] text-black rounded transition-all ${
                      isEditable
                        ? "cursor-pointer bg-white hover:bg-emerald-500"
                        : "cursor-not-allowed bg-white "
                    }`}
                    title={
                      isEditable
                        ? `Edit Skill ${skill.skill_number}: ${skill.skill_description}`
                        : "Only own skills can be edited"
                    }
                  >
                    {/* Minus sign above number */}
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

            <div className="flex gap-[3px] overflow-x-auto pb-1 mb-1">
              {player.skills.map((skill, i) => {
                const scoreData = getScoreBySkillNumber(
                  player.scores || [],
                  player.skills || [],
                  skill.skill_number
                );

                return (
                  <div
                    key={i}
                    className={`min-w-[24px] h-6 flex items-center justify-center text-[10px] rounded font-medium border shadow-sm transition-all duration-200 ${
                      scoreData.isTargetAchieved
                        ? "bg-green-400 hover:bg-green-400 text-black shadow-md border-green-300 ring-1 ring-green-400/50"
                        : "bg-yellow-200 text-black border-[#2a5a58] hover:bg-yellow-300"
                    }`}
                    title={`Score: ${scoreData.score || 0} | Target: ${
                      scoreData.target || "N/A"
                    }${scoreData.isTargetAchieved ? " ACHIEVED!" : ""}`}
                  >
                    {Math.abs(scoreData.score || 0)}
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
const DummyBasicLeaderboard = ({ ladderId: propLadderId }) => {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const ladderId = propLadderId || searchParams.get("ladder_id");
  const { data = [],ladderDetails, loading } = useSelector(
    (state) => state.skillLeaderboard || {}
  );
const isInverted = ladderDetails?.inverted == 0;;
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
    if (ladderId)
      dispatch(fetchSkillLeaderboard({ ladder_id: ladderId, type: "skill" }));
  }, [dispatch, ladderId]);

  useEffect(() => {
    if (ladderId)
      dispatch(fetchSkillLeaderboard({ ladder_id: ladderId, type: "skill" }));
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
            ) : filteredPlayers.map((player, index) => {
              const isEditablePlayer = player.id == 1; // Dummy editable player
              return (
                <PlayerCard
                  key={player.id}
                  player={player}
                  overallRank={player.rank || index + 1}
                  onSkillClick={handleSkillClick}
                  isEditable={isEditablePlayer}
                  isInverted={isInverted}
                />
              );
            })}
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
