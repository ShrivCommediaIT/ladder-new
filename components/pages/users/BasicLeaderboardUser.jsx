"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { Card } from "@/components/ui/card";
import { useSearchParams } from "next/navigation";
import Logo from "@/public/logo1.png";
import { BasicLeaderboardUserEdit } from "@/components/shared/BasicLeaderboardUserEdit";
import { fetchSkillLeaderboard } from "@/redux/slices/BasicLeaderboardSlice";
import PlayerSearchInput from "../players/PlayerSearchInput";
import BasicLeaderboardShort from "../admin/BasicLeaderboardShort";
import BasicLeaderboardUserRemove from "@/components/shared/BasicLeaderboardUserRemove";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Funnel, X } from "lucide-react";
import axios from "axios";
import BasicLeaderboardPrintSkillsSheet from "../admin/BasicLeaderboardPrintSkillsSheet";
import BasicLeaderboardActivityEntryCard from "../players/BasicLeaderboardActivityEntryCard";

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


const getRankBySkillNumber = (ranks, skillNumber) => {
  const rankObj = ranks.find((r) => r.skill_number === skillNumber);
  return rankObj ? rankObj.rank : "-";
};

/* ---------------- PLAYER CARD ---------------- */
const PlayerCard = ({ player, overallRank, onSkillClick, isEditable }) => {
  const playerImageUrl = player?.image
    ? `https://ne-games.com/leaderBoard/public/admin/clip-one/assets/user/original/${player.image}`
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
                          ? "cursor-pointer bg-white hover:bg-emerald-500 hover:scale-110"
                          : "cursor-not-allowed bg-white opacity-40"
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
                    skill.skill_number,
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
const BasicLeaderboardUser = ({ ladderId: propLadderId }) => {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const ladderId = propLadderId || searchParams.get("ladder_id");
  const { data = [], loading } = useSelector(
    (state) => state.skillLeaderboard || {},
  );
const APPKEY = "Py9YJXgBecbbqxjRVaHarcSnJyuzhxGqJTkY6xKZRfrdXFy72HPXvFRvfEjy";
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
  
  const [currentUserId, setCurrentUserId] = useState(null);

  const currentUser = data.find((p) => p.id == currentUserId);
  const myRank = currentUser?.rank;

  // REFRESH KEY TO CONTROL RELOADS (STOPS INFINITE LOOP)
  const refreshKey = useRef(0);


    useEffect(() => {
    if (!ladderId) return;

    const fetchSkillSetup = async () => {
      try {
        const res = await axios.get(
          `https://ne-games.com/leaderBoard/api/user/getskillsetup?ladder_id=${ladderId}`,
          { headers: { APPKEY } },
        );

        const apiSkills = res.data?.data || [];

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
    (skillNo = 0) => {
      if (!ladderId || isRefreshing) return;

      setIsRefreshing(true);
      dispatch(
        fetchSkillLeaderboard({
          ladder_id: ladderId,
          type: "skill",
          sortbyskillnumber: skillNo,
        }),
      ).finally(() => {
        setIsRefreshing(false); // FIXED: was setIsRefreshing(true)
      });
    },
    [dispatch, ladderId, isRefreshing],
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
                  Sort by Activity
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

              <BasicLeaderboardPrintSkillsSheet
                skills={safeSkillsForPrint}
                ladderId={ladderId}
                className="hidden"
              />
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

export default BasicLeaderboardUser;
