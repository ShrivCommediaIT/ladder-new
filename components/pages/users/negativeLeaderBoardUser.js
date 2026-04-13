"use client";
import { IMAGE_BASE_URL } from "@/constants/api";

import { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { Card } from "@/components/ui/card";
import { useSearchParams } from "next/navigation";
import Logo from "@/public/logo1.png";
import { BasicLeaderboardUserEdit } from "@/components/shared/BasicLeaderboardUserEdit";
import PlayerSearchInput from "../players/PlayerSearchInput";
import BasicLeaderboardShort from "../admin/BasicLeaderboardShort";
import BasicLeaderboardUserRemove from "@/components/shared/BasicLeaderboardUserRemove";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Funnel, X } from "lucide-react";
import { fetchNegativeLeaderboard } from "@/redux/slices/negativeLeaderBoardSlice";

/* ---------------- HELPER FUNCTIONS ---------------- */

const getScoreBySkillNumber = (scores, skills, skillNumber) => {
  const scoreObj = scores?.find((s) => s.skill_number === skillNumber);
  const skillObj = skills?.find((s) => s.skill_number === skillNumber);

  const score = scoreObj ? Number(scoreObj.score) : 0;

  const inputScore =
    scoreObj?.input_score !== null && scoreObj?.input_score !== undefined
      ? Number(scoreObj.input_score)
      : null;

  // display priority = input_score first
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
    score !== 0 &&
    !isNaN(target) &&
    !isNaN(score)
  ) {
    if (mode === "+") {
      isTargetAchieved = score >= target;
    } else {
      // SAME as working component
      isTargetAchieved = score >= Math.abs(target);
    }
  }

  return {
    score,
    displayScore,
    target,
    isTargetAchieved,
  };
};


/* ---------------- PLAYER CARD ---------------- */
const PlayerCard = ({ player, overallRank, onSkillClick, isEditable }) => {
  const playerImageUrl = player?.image
    ? `${IMAGE_BASE_URL}/${player.image}`
    : Logo;

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
        <Card onClick={() => {onSkillClick(player.id, player.skills[0].skill_number)}} className="w-full rounded-2xl     shadow-lg border border-teal-400/80 bg-[#163344] p-2 sm:p-3">
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
const NegativeLeaderboardUser = ({ ladderId: propLadderId }) => {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const ladderId = propLadderId || searchParams.get("ladder_id");
  const { data = [], loading } = useSelector(
      (state) => state.negativeLeaderBoard || {},
    );

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
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

  const [currentUserId, setCurrentUserId] = useState(null);

  const currentUser = data.find((p) => p.id == currentUserId);
  const myRank = currentUser?.rank;

  // REFRESH KEY TO CONTROL RELOADS (STOPS INFINITE LOOP)
  const refreshKey = useRef(0);

  // REFRESH FUNCTION FIRST
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
    refreshLeaderboard(0);
  }, [refreshLeaderboard]);

  const handleSkillClick = useCallback(
    (playerId, skillNumber) => {
        
      if (playerId != currentUserId) return;

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
              <PlayerSearchInput
                value={searchQuery}
                onChange={setSearchQuery}
              />
            </div>

            {/* Buttons */}
            <div className="flex flex-wrap sm:flex-nowrap gap-2 mt-2 sm:mt-0">
              {!isSorted ? (
                <Button
                  onClick={handleSortBySkill}
                  disabled={isRefreshing}
                  className="bg-[#005F5A] text-white font-bold rounded-md px-4 py-2 flex items-center gap-2"
                >
                  <Funnel size={16} />
                  Sort Performance
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
          <div className="space-y-2 mt-2">
            {filteredPlayers.map((player, index) => {
              const isEditablePlayer = player.id === currentUserId;
              return (
                <PlayerCard
                  key={player.id}
                  player={player}
                  overallRank={player.rank || index + 1}
                  onSkillClick={handleSkillClick}
                  isEditable={isEditablePlayer}
                />
              );
            })}
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
