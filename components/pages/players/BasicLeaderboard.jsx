"use client";
import { API_ENDPOINTS, IMAGE_BASE_URL } from "@/constants/api";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { Card } from "@/components/ui/card";
import { useSearchParams } from "next/navigation";
import Logo from "@/public/logo1.png";
import { BasicLeaderboardEdit } from "./BasicLeaderboardEdit";
import LadderLinkPanel from "./LadderLinkPanel";
import { fetchSkillLeaderboard } from "@/redux/slices/BasicLeaderboardSlice";
import PlayerSearchInput from "./PlayerSearchInput";
import PlayerStatusToggle from "@/components/shared/PlayerStatusToggle";
import ControlsSection from "@/components/shared/ControlsSection";
import InfoSection from "@/components/shared/InfoSection";
import LadderPageLayout from "@/components/shared/LadderPageLayout";
import { fetchUserActivity } from "@/redux/slices/activitySlice";
import { getRequest } from "@/services/apiService";
import { ArrowDownUp, Plus, RotateCcw } from "lucide-react";



/* ---------------- PLAYER CARD ---------------- */
const PlayerCard = ({
  player,
  overallRank,
  showAgeRank,
  ageRank,
  onSkillClick,
  onTargetAchieved,
  currentUser,
  isInverted,
  appliedWitnessBy,
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
    const score = scoreObj ? Number(scoreObj.best_score) : 0; // 🔒 internal logic
    const bestScore = scoreObj ? Number(scoreObj.best_score) : 0; 
    const inputScore =
      scoreObj?.input_score !== null && scoreObj?.input_score !== undefined
        ? Number(scoreObj.input_score)
        : null;

    const displayScore = bestScore; // Always show best score
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

  const skillsToRender = appliedWitnessBy === 1
    ? (player.skills || []).filter(skill => player.scores?.some(s => Number(s.skill_number) === Number(skill.skill_number)))
    : (player.skills || []);

  return (
    <Card className="best-board-card w-full rounded-2xl border border-[var(--best-board-border-strong)] bg-[var(--best-board-surface)] p-2 shadow-lg sm:p-3 relative">
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
                <p className="text-white border border-white px-2 py-0.5 text-xs font-semibold rounded shrink-0 w-fit  ml-5">
                  {player.age}
                </p>
              )}
              {player.gender && (
                  <p className="text-white border border-white px-2 py-0.5 text-xs font-semibold rounded shrink-0 w-fit ml-1">
                    {player.gender == "male" ?"M":"F"}
                  </p>
                )}
            </div>
            <div className="text-[#d4e5e8] text-xs truncate">
              {player?.phone || "N/A"}
            </div>
          </div>
          <div className="flex shrink-0 items-center justify-end gap-2 sm:gap-3">
            <div className="flex flex-col items-center">
              <span className="flex h-7 items-center rounded-sm border border-[var(--best-board-border)] bg-[var(--best-board-warning)] px-3 py-0.5 text-xs font-bold leading-none text-black shadow-sm sm:h-auto sm:px-4 sm:py-1 sm:text-sm">
                {Math.abs(player.total_point || 0)}
              </span>
              <p className="text-[9px] text-white mt-1  font-semibold">Total Pts</p>
            </div>

            <div className="flex items-center gap-2 border-l border-white/20 pl-2 sm:pl-3">
              {showAgeRank && (
                <div className="flex flex-col items-center">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[var(--best-board-success)] text-xs font-bold text-black shadow-sm sm:h-9 sm:w-9 sm:text-sm">
                    {ageRank}
                  </div>
                  <p className="text-[8px] sm:text-[9px] text-emerald-400 font-bold mt-1 whitespace-nowrap">Age Rank</p>
                </div>
              )}
              <div className="flex flex-col items-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[var(--best-board-accent)] text-xs font-bold text-black shadow-sm sm:h-9 sm:w-9 sm:text-sm">
                  {overallRank}
                </div>
                <p className="text-[8px] sm:text-[9px] text-white font-semibold mt-1 whitespace-nowrap">Overall Rank</p>
              </div>
            </div>
          </div>
        </div>

        {skillsToRender.length > 0 ? (
          <>
            <div className="flex gap-[3px] overflow-y-visible pb-2 mb-1">
              {skillsToRender.map((skill, i) => {
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
              {skillsToRender.map((skill, i) => {
                const scoreData = getScoreBySkillNumber(
                  player.scores || [],
                  player.skills || [],
                  skill.skill_number,
                );
                return (
                  <div
                    key={i}
                    className={`min-w-[24px] h-6 flex items-center justify-center text-[10px] rounded font-medium border shadow-sm transition-all duration-200 group relative ${scoreData.isTargetAchieved
                      ? "bg-green-400 text-black shadow-md font-semibold"
                      : "bg-yellow-200 text-black font-semibold border-yellow-200/50 hover:bg-yellow-300 hover:shadow-md"
                      } ${scoreData.witnessBy ? "underline decoration-black decoration-[3px] bg-green-400" : ""}`}
                    title={`Score: ${scoreData.score} | Target: ${scoreData.target || "N/A"
                      }${scoreData.isTargetAchieved ? " ACHIEVED!" : ""}`}
                  >
                    {Math.abs(scoreData.displayScore || 0)}
                  </div>
                );
              })}
            </div>

            {/* Ranks */}
            <div className="flex gap-[3px] overflow-x-auto pb-1">
              {skillsToRender.map((skill, i) => (
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
  const { data = [], loading, appliedWitnessBy } = useSelector(
    (state) => state.skillLeaderboard || {},
  );
  const currentUser = useSelector((state) => state.user?.user);
  const activityState = useSelector((state) => state.activity);

  // CELEBRATION STATE ONLY
  const [showCelebration, setShowCelebration] = useState(false);

  const [openEdit, setOpenEdit] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);
  const [selectedSkillNumber, setSelectedSkillNumber] = useState(null);
  const [selectedSkillActivityId, setSelectedSkillActivityId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkillFilter, setSelectedSkillFilter] = useState(0);
  const { appliedAge,ladderDetails, appliedAgeType, appliedGender } = useSelector((state) => state.skillLeaderboard || {});
  const showAgeRank = Number(appliedAge) > 0;
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [mobileSection, setMobileSection] = useState("players");
  const [contactOpen, setContactOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [addRemoveOpen, setAddRemoveOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [sortMode, setSortMode] = useState("rank");
  const isInverted = ladderDetails?.inverted == 0;
  const inviteUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/login-user?ladder_id=${ladderId}&ladder_type=skill`
      : "";
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
    (skillNo = selectedSkillFilter, age = appliedAge, ageType = appliedAgeType, gender = appliedGender) => {
      if (ladderId) {
        setIsRefreshing(true);
        const params = {
          ladder_id: ladderId,
          type: "skill",
        };
        Promise.all([
          dispatch(fetchSkillLeaderboard(params)),
          dispatch(fetchUserActivity({ ladder_id: Number(ladderId) })),
        ]).finally(() => {
          setIsRefreshing(false);
        });
      }
    },
    [dispatch, ladderId, selectedSkillFilter, appliedAge, appliedAgeType, appliedGender],
  );


  useEffect(() => {
    if (onPlayerAdded) {
      refreshLeaderboard();
    }
  }, [onPlayerAdded, refreshLeaderboard]);

  useEffect(() => {
    if (ladderId) {
      dispatch(fetchSkillLeaderboard({ ladder_id: ladderId, type: "skill" }));
      dispatch(fetchUserActivity({ ladder_id: Number(ladderId) }));
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
    const clean = (name = "") => name.replace(/\s+/g, "").toLowerCase();
    const baseList = !q ? data : [
      ...data
        .filter((p) => clean(p.name).startsWith(q))
        .sort((a, b) => a.name.localeCompare(b.name)),
      ...data
        .filter(
          (p) =>
            !clean(p.name).startsWith(q) &&
            clean(p.name).includes(q)
        )
        .sort((a, b) => a.name.localeCompare(b.name)),
    ];

    return [...baseList].sort((a, b) => {
      if (sortMode === "name") {
        return (a?.name || "").localeCompare(b?.name || "");
      }
      return Number(a?.rank || 0) - Number(b?.rank || 0);
    });
  }, [data, searchQuery, sortMode]);

  const handleDeleteActivity = useCallback(
    async (id) => {
      try {
        await getRequest(API_ENDPOINTS.ACTIVITY_DELETE, { id });
        dispatch(fetchUserActivity({ ladder_id: Number(ladderId) }));
      } catch (error) {
        console.error("Failed to delete activity", error);
      }
    },
    [dispatch, ladderId],
  );

  const handleResetBoard = useCallback(
    async () => {
      try {
        await getRequest(API_ENDPOINTS.RESET_LEADERBOARD, { ladder_id: ladderId });
        setResetOpen(false);
        refreshLeaderboard();
      } catch (error) {
        console.error("Failed to reset leaderboard", error);
      }
    },
    [ladderId, refreshLeaderboard],
  );

  const activityItems = activityState?.data?.data || [];
  const quickActions = [
    { id: "reset", label: "Reset", icon: RotateCcw, onClick: () => setResetOpen(true) },
    { id: "add-remove", label: "Add / Remove", icon: Plus, onClick: () => setAddRemoveOpen(true) },
    { id: "sort", label: "Sort", icon: ArrowDownUp, onClick: () => setSortOpen(true) },
  ];


  // Server now handles ordering via orderBy parameter in the API call
  const processedPlayers = filteredPlayers;

  return (
    <>
      <LadderPageLayout
        controls={
          <ControlsSection
            mobileSection={mobileSection}
            setMobileSection={setMobileSection}
            mobileSections={[
              { id: "toolbar", label: "Tools" },
              { id: "players", label: "Players" },
              { id: "info", label: "Info" },
            ]}
            resetOpen={resetOpen}
            setResetOpen={setResetOpen}
            addRemoveOpen={addRemoveOpen}
            setAddRemoveOpen={setAddRemoveOpen}
            refreshLeaderboard={refreshLeaderboard}
            ladderId={ladderId}
            sortMode={sortMode}
            setSortMode={setSortMode}
            sortOpen={sortOpen}
            setSortOpen={setSortOpen}
            filterOpen={false}
            setFilterOpen={() => {}}
            appliedAge={0}
            appliedGender=""
            groupSize={1}
            showFilter={false}
            showSectionSize={false}
          />
        }
        sidebar={
          <InfoSection
            mobileSection={mobileSection}
            ladderType="skill"
            user={currentUser}
            inviteUrl={inviteUrl}
            setContactOpen={setContactOpen}
            setResetOpen={setResetOpen}
            setAddRemoveOpen={setAddRemoveOpen}
            setSortOpen={setSortOpen}
            setFilterOpen={() => {}}
            activityItems={activityItems}
            handleDeleteActivity={handleDeleteActivity}
            contactOpen={contactOpen}
            resetOpen={resetOpen}
            handleResetBoard={handleResetBoard}
            resetDescription="This will reset the current skill ladder data."
            quickActions={quickActions}
          />
        }
      >
        <div className={`${mobileSection === "info" ? "hidden" : "block"} min-w-0`}>
          <div className="flex flex-col gap-2">
            <PlayerSearchInput value={searchQuery} onChange={setSearchQuery} />
          </div>
          <LadderLinkPanel ladderId={ladderId} ladderType="skill" />
          {(loading || isRefreshing) && (
            <p className="text-center text-xs opacity-70 text-[var(--best-board-muted)]">Updating list...</p>
          )}
          <div className="mt-2 space-y-2">
            {processedPlayers.length === 0 ? (
              <div className="best-board-card rounded-xl px-6 py-10 text-center font-bold text-[var(--best-board-muted)]">No players found</div>
            ) : (
              processedPlayers.map((player, index) => (
                <PlayerCard
                  key={player.id}
                  player={player}
                  overallRank={player.rank || index + 1}
                  showAgeRank={showAgeRank}
                  ageRank={index + 1}
                  onSkillClick={handleSkillClick}
                  onTargetAchieved={handleTargetAchieved}
                  currentUser={currentUser}
                  isInverted={isInverted}
                  appliedWitnessBy={appliedWitnessBy}
                />
              ))
            )}
          </div>
        </div>
      </LadderPageLayout>

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
