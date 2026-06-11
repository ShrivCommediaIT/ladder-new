"use client";
import { API_ENDPOINTS, IMAGE_BASE_URL } from "@/constants/api";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { Card } from "@/components/ui/card";
import { useSearchParams } from "next/navigation";
import Logo from "@/public/logo1.png";
import { BasicLeaderboardEdit } from "./BasicLeaderboardEdit";
import { fetchSkillLeaderboard, setAgeFilter as setSkillAgeFilter } from "@/redux/slices/BasicLeaderboardSlice";
import PlayerSearchInput from "./PlayerSearchInput";
import PlayerStatusToggle from "@/components/shared/PlayerStatusToggle";
import ControlsSection from "@/components/shared/ControlsSection";
import InfoSection from "@/components/shared/InfoSection";
import LadderPageLayout from "@/components/shared/LadderPageLayout";
import { fetchUserActivity } from "@/redux/slices/activitySlice";
import { getRequest } from "@/services/apiService";
import { ArrowDownUp, Eye, Funnel, Plus, RotateCcw, Zap, XCircle } from "lucide-react";
import BasicLeaderboardSetUpSkill from "@/components/pages/admin/BasicLeaderboardSetUpSkill";
import BasicLeaderboardShort from "@/components/pages/admin/BasicLeaderboardShort";
import AddRemoveBox from "@/components/pages/admin/AddRemoveBox";
import AgeFilter from "@/components/shared/AgeFilter";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import MobileQuickActionsAndInvite from "@/components/shared/MobileQuickActionsAndInvite";
import PlayerRankBadge from "@/components/shared/PlayerRankBadge";


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
  const playerImageUrl =
    player?.image && player.image !== "null" && player.image !== "undefined" && player.image !== ""
      ? `${IMAGE_BASE_URL}/${player.image}?t=${Date.now()}`
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
      bestScore !== 0 && // still using real score
      !isNaN(target) &&
      !isNaN(bestScore)
    ) {
      isTargetAchieved = isInverted ? bestScore >= target : bestScore <= target;
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
        <PlayerStatusToggle player={player} user={false} />

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
          <div className="flex flex-col items-center gap-1 flex-shrink-0">
            <PlayerRankBadge
              rank={overallRank}
              sizeClass="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14"
              imgSize={56}
              textClass="text-[10px] sm:text-xs md:text-sm"
            />
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
              {showAgeRank && (
              <div className="flex flex-col items-center">
                <div
                  className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center font-bold text-white text-[9px] sm:text-[10px]"
                  style={{ background: "var(--best-board-success)" }}
                >
                  {ageRank}
                </div>
                <p
                  className="text-[7px] sm:text-[8px] font-bold mt-0.5 whitespace-nowrap"
                  style={{ color: "var(--best-board-success)" }}
                >
                  Age Rank
                </p>
              </div>
            )}
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
                          ${
                            scoreData.witnessBy
                              ? "bg-[var(--best-board-success)] text-white border border-[var(--best-board-success)] underline decoration-white decoration-[2px]"
                              : scoreData.isTargetAchieved
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
              className="text-[7px]  md:text-[10px] font-black leading-none w-full text-center truncate "
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
  const { appliedAge, ladderDetails, appliedAgeType, appliedGender } = useSelector((state) => state.skillLeaderboard || {});
  const showAgeRank = Number(appliedAge) > 0;
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [mobileSection, setMobileSection] = useState("players");
  const [contactOpen, setContactOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [addRemoveOpen, setAddRemoveOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [sortMode, setSortMode] = useState("rank");
  const [openSkillSetupDialog, setOpenSkillSetupDialog] = useState(false);
  const [openSkillSortDialog, setOpenSkillSortDialog] = useState(false);
  const [localWitnessBy, setLocalWitnessBy] = useState(0);
  const [ageFilterResetSignal, setAgeFilterResetSignal] = useState(0);
  const [isSorted, setIsSorted] = useState(false);
  const hasFilters = (appliedAge && appliedAge !== 0) || (appliedGender && appliedGender !== "");
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
    (skillNo = selectedSkillFilter, age = appliedAge, ageType = appliedAgeType, gender = appliedGender, witness = localWitnessBy) => {
      if (ladderId) {
        setIsRefreshing(true);
        const params = {
          ladder_id: ladderId,
          type: "skill",
        };
        if (skillNo && skillNo !== 0) {
          params.sortbyskillnumber = skillNo;
        }

        if (witness === 1) {
          params.witness_by = 1;
        } else {
          if (age && age > 0) {
            params.dob = age;
            if (ageType) params.age_type = ageType;
          }
          if (gender) {
            params.gender = gender;
          }
        }

        Promise.all([
          dispatch(fetchSkillLeaderboard(params)),
          dispatch(fetchUserActivity({ ladder_id: Number(ladderId) })),
        ]).finally(() => {
          setIsRefreshing(false);
        });
      }
    },
    [dispatch, ladderId, selectedSkillFilter, appliedAge, appliedAgeType, appliedGender, localWitnessBy],
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
        await getRequest(API_ENDPOINTS.RESET_SKILLBOARD, { ladder_id: ladderId });
        setResetOpen(false);
        setOpenSkillSetupDialog(true);
        refreshLeaderboard();
      } catch (error) {
        console.error("Failed to reset skill leaderboard", error);
      }
    },
    [ladderId, refreshLeaderboard],
  );

  const activityItems = activityState?.data?.data || [];

  const handleAgeSearch = (age, ageType, gender) => {
    const ageNum = age ? Number(age) : "";
    dispatch(setSkillAgeFilter({ age: ageNum, ageType, gender }));
    refreshLeaderboard(selectedSkillFilter, ageNum, ageType, gender, 0);
  };

  const handleClearAll = () => {
    setIsSorted(false);
    setLocalWitnessBy(0);
    dispatch(setSkillAgeFilter({ age: 0, ageType: "", gender: "" }));
    setAgeFilterResetSignal((p) => p + 1);
    refreshLeaderboard(0, 0, "", "", 0);
  };

  const quickActions = [
    { id: "reset", label: "Zero All", icon: RotateCcw, onClick: () => setResetOpen(true) },
    { id: "add-remove", label: "Add / Remove", icon: Plus, onClick: () => setAddRemoveOpen(true) },
    { id: "skill-sort", label: isSorted ? "Sorted" : "Skill Sort", icon: Funnel, onClick: () => setOpenSkillSortDialog(true) },
    { id: "setup", label: "Setup", icon: Zap, onClick: () => setOpenSkillSetupDialog(true) },
    {
      id: "witnessed",
      label: localWitnessBy === 1 ? "Witnessed" : "Witnessed Only",
      icon: Eye,
      tone: localWitnessBy === 1 ? "success" : "default",
      onClick: () => {
        const next = localWitnessBy === 1 ? 0 : 1;
        setLocalWitnessBy(next);
        if (next === 1) {
          dispatch(setSkillAgeFilter({ age: 0, ageType: "", gender: "" }));
          setAgeFilterResetSignal((p) => p + 1);
          setIsSorted(false);
          refreshLeaderboard(0, 0, "", "", 1);
        } else {
          refreshLeaderboard(0, appliedAge, appliedAgeType, appliedGender, 0);
        }
      },
    },
    { id: "age-filter", node: <AgeFilter onSearch={handleAgeSearch} user={false} resetSignal={ageFilterResetSignal} isActive={hasFilters} /> },
    { id: "clear", label: "Clear All", icon: XCircle, tone: "danger", onClick: handleClearAll, hidden: !isSorted && !hasFilters && localWitnessBy !== 1 },
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
            setFilterOpen={() => { }}
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
            ladderType="skills"
            user={currentUser}
            inviteUrl={inviteUrl}
            setContactOpen={setContactOpen}
            setResetOpen={setResetOpen}
            setAddRemoveOpen={setAddRemoveOpen}
            setSortOpen={setSortOpen}
            setFilterOpen={() => { }}
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
          <MobileQuickActionsAndInvite inviteUrl={inviteUrl} quickActions={quickActions} />
          <div className="flex flex-col gap-2">
            <PlayerSearchInput value={searchQuery} onChange={setSearchQuery} />
          </div>
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

      {/* Skill Setup Dialog */}
      <Dialog open={openSkillSetupDialog} onOpenChange={setOpenSkillSetupDialog}>
        <DialogContent showCloseButton={false} className="bg-transparent border-none shadow-none flex items-center justify-center">
          <BasicLeaderboardSetUpSkill
            onClose={() => setOpenSkillSetupDialog(false)}
            onSkillsUpdated={refreshLeaderboard}
          />
        </DialogContent>
      </Dialog>

      {/* Skill Sort Dialog */}
      <Dialog open={openSkillSortDialog} onOpenChange={setOpenSkillSortDialog}>
        <DialogContent showCloseButton={false} className="bg-transparent border-none shadow-none flex items-center justify-center">
          <BasicLeaderboardShort
            ladderId={ladderId}
            onClose={() => { setOpenSkillSortDialog(false); setIsSorted(false); }}
            onSkillsUpdated={(skillNo) => {
              dispatch(setSkillAgeFilter({ age: 0, ageType: "", gender: "" }));
              setAgeFilterResetSignal((p) => p + 1);
              setLocalWitnessBy(0);
              refreshLeaderboard(skillNo, 0, "", "", 0);
              setIsSorted(true);
              setOpenSkillSortDialog(false);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Add / Remove Dialog */}
      <Dialog open={addRemoveOpen} onOpenChange={setAddRemoveOpen}>
        <DialogContent className="best-board-card border-[var(--best-board-border)] text-white sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add / Remove Players</DialogTitle>
          </DialogHeader>
          <AddRemoveBox
            ladderId={ladderId}
            onSuccessRefresh={() => {
              setAddRemoveOpen(false);
              refreshLeaderboard();
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BasicLeaderboard;
