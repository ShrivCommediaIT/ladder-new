"use client";
import { API_ENDPOINTS, IMAGE_BASE_URL } from "@/constants/api";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { Card } from "@/components/ui/card";
import { useSearchParams } from "next/navigation";
import Logo from "@/public/logo1.png";
import { BasicLeaderboardEdit } from "./BasicLeaderboardEdit";
import { fetchSkillLeaderboard } from "@/redux/slices/BasicLeaderboardSlice";
import { Button } from "@/components/ui/button";
import { ArrowDownUp, Eye, Funnel, Plus, RotateCcw, Zap, XCircle } from "lucide-react";
import BasicLeaderboardSetUpSkill from "@/components/pages/admin/BasicLeaderboardSetUpSkill";
import BasicLeaderboardShort from "@/components/pages/admin/BasicLeaderboardShort";
import AddRemoveBox from "@/components/pages/admin/AddRemoveBox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import PlayerSearchInput from "./PlayerSearchInput";
import { BasicLeaderboardUserEdit } from "@/components/shared/BasicLeaderboardUserEdit";
import { fetchPositiveLeaderboard, setAgeFilter } from "@/redux/slices/positiveLeaderBoardSlice";
import AgeFilter from "@/components/shared/AgeFilter";
import PlayerStatusToggle from "@/components/shared/PlayerStatusToggle";
import ControlsSection from "@/components/shared/ControlsSection";
import InfoSection from "@/components/shared/InfoSection";
import LadderPageLayout from "@/components/shared/LadderPageLayout";
import { fetchUserActivity } from "@/redux/slices/activitySlice";
import { getRequest } from "@/services/apiService";



const PlayerRankBadge = ({ rank, sizeClass = "h-12 w-12 sm:h-16 sm:w-16", imgSize = 64, textClass = "text-xs sm:text-sm" }) => {
  const rankNum = Number(rank);
  let src = "/ranksImg/rank.png";
  let scaleClass = "scale-[1.22] group-hover:scale-[1.34]";
  if (rankNum === 1) {
    src = "/ranksImg/rank-1.png";
    scaleClass = "scale-100 group-hover:scale-110";
  } else if (rankNum === 2) {
    src = "/ranksImg/rank-2.png";
    scaleClass = "scale-[1.15] group-hover:scale-[1.26]";
  } else if (rankNum === 3) {
    src = "/ranksImg/rank-3.png";
    scaleClass = "scale-[1.15] group-hover:scale-[1.26]";
  }

  return (
    <div className={`relative flex shrink-0 items-center justify-center select-none ${sizeClass}`}>
      <Image
        src={src}
        alt={`Rank ${rank}`}
        width={imgSize}
        height={imgSize}
        className={`object-contain transition-transform duration-200 ${scaleClass} ${sizeClass}`}
        unoptimized
      />
      <span className={`absolute inset-0 flex items-center justify-center font-black text-white drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.95)] ${textClass}`}>
        {rank}
      </span>
    </div>
  );
};

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
  const getScoreBySkillNumber = (scores, skills, skillNumber) => {
    const scoreObj = scores?.find((s) => s.skill_number === skillNumber);
    const skillObj = skills?.find((s) => s.skill_number === skillNumber);
    const witnessBy = scoreObj?.witness_by || skillObj?.witness_by || "";
    const score = scoreObj ? Number(scoreObj.best_score) : 0;
    const bestScore = scoreObj ? Number(scoreObj.best_score) : 0;
    const inputScore = scoreObj?.input_score !== null && scoreObj?.input_score !== undefined ? Number(scoreObj.input_score) : null;
    const displayScore = bestScore;
    const target = skillObj?.target !== null && skillObj?.target !== undefined ? Number(skillObj.target) : null;
    const mode = skillObj?.skill_sign || "+";
    let isTargetAchieved = false;
    if (target !== null && target !== 0 && score !== 0 && !isNaN(target) && !isNaN(score)) {
      isTargetAchieved = isInverted ? score >= target : score <= target;
    }
    return { witnessBy, score, displayScore, target, isTargetAchieved, input_score: inputScore };
  };

  const achievedTargets = player.skills?.map((skill) => {
    const scoreData = getScoreBySkillNumber(player.scores || [], player.skills || [], skill.skill_number);
    return scoreData.isTargetAchieved;
  }).filter(Boolean).length || 0;

  React.useEffect(() => {
    if (achievedTargets > 0) onTargetAchieved(player.name, achievedTargets);
  }, [player.scores, achievedTargets, player.name, onTargetAchieved]);

  return (
    <Card className="best-board-card group w-full rounded-2xl border border-[var(--best-board-border-strong)] bg-[var(--best-board-surface)] p-2 shadow-lg sm:p-3 relative">
      <div className="flex justify-between items-start mb-1 px-1">
        <PlayerStatusToggle player={player} user={false} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 sm:gap-3 mb-2">
          <div className="w-8 h-8 sm:w-10 sm:h-10 shrink-0">
            <Image src={playerImageUrl} alt={player?.name} width={80} height={80} className="object-cover rounded" unoptimized />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white flex items-center gap-2 text-sm sm:text-base font-semibold truncate">
              {player?.name || "N/A"}
              {player.age && <p className="text-white border border-white px-2 py-0.5 text-xs font-semibold rounded shrink-0 w-fit ml-5">{player.age}</p>}
              {player.gender && <p className="text-white border border-white px-2 py-0.5 text-xs font-semibold rounded shrink-0 w-fit ml-1">{player.gender == "male" ? "M" : "F"}</p>}
            </div>
            <div className="text-[#d4e5e8] text-xs truncate">{player?.phone || "N/A"}</div>
          </div>
          <div className="flex shrink-0 items-center justify-end gap-2 sm:gap-3">
            <div className="flex flex-col items-center">
              <span className="bg-yellow-200 text-black px-3 sm:px-4 py-0.5 sm:py-1 rounded-sm font-bold border text-xs sm:text-sm shadow-sm leading-none h-7 sm:h-auto flex items-center">{Math.abs(player.total_point || 0)}</span>
              <p className="text-[9px] text-white mt-1 font-semibold">Total Pts</p>
            </div>
            <div className="flex items-center gap-2 border-l border-white/20 pl-2 sm:pl-3">
              {showAgeRank && (
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-emerald-400 border-2 border-white flex items-center justify-center font-bold text-black shadow-sm text-xs sm:text-sm">{ageRank}</div>
                  <p className="text-[8px] sm:text-[9px] text-emerald-400 font-bold mt-1 whitespace-nowrap">Age Rank</p>
                </div>
              )}
              <div className="flex flex-col items-center">
                <PlayerRankBadge rank={overallRank} />
                <p className="text-[8px] sm:text-[9px] text-white font-semibold mt-1 whitespace-nowrap">Overall Rank</p>
              </div>
            </div>
          </div>
        </div>

        {player.skills?.length > 0 ? (
          <>
            <div className="flex gap-[3px] overflow-y-visible pb-2 mb-1">
              {player.skills.map((skill, i) => {
                const isNegative = skill.skill_sign === "-";
                return (
                  <div key={i} onClick={() => onSkillClick(player.id, skill.skill_number)} className="cursor-pointer min-w-[24px] h-6 flex items-center justify-center text-[10px] text-black rounded bg-white hover:bg-emerald-500 transition-all hover:scale-110 relative" title={`Edit Skill ${skill.skill_number}: ${skill.skill_description}`}>
                    {isNegative && <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[12px] font-extrabold text-white leading-none">−</span>}
                    {skill.skill_number}
                  </div>
                );
              })}
            </div>
            <div className="flex gap-[3px] overflow-x-auto pb-1 mb-1">
              {player.skills.map((skill, i) => {
                const scoreData = getScoreBySkillNumber(player.scores || [], player.skills || [], skill.skill_number);
                return (
                  <div key={i} className={`min-w-[24px] h-6 flex items-center justify-center text-[10px] rounded font-medium border shadow-sm transition-all duration-200 group relative ${scoreData.isTargetAchieved ? "bg-green-400 text-black shadow-md font-semibold" : "bg-yellow-200 text-black font-semibold border-yellow-200/50 hover:bg-yellow-300 hover:shadow-md"} ${scoreData.witnessBy ? "underline decoration-black decoration-[3px] bg-green-400" : ""}`} title={`Score: ${scoreData.score} | Target: ${scoreData.target || "N/A"}${scoreData.isTargetAchieved ? " ACHIEVED!" : ""}`}>
                    {Math.abs(scoreData.displayScore || 0)}
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="h-7 bg-gray-800 rounded text-xs text-gray-400 flex items-center justify-center">No skills data</div>
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
  const { data = [], loading, ladderDetails, appliedAge, appliedAgeType, appliedGender, appliedWitnessBy } = useSelector((state) => state.positiveLeaderBoard || {});
  const showAgeRank = Number(appliedAge) > 0;
  const isInverted = ladderDetails?.inverted == 0;
  const hasFilters = (appliedAge && appliedAge !== 0) || (appliedGender && appliedGender !== "");

  const currentUser = useSelector((state) => state.user?.user);
  const activityState = useSelector((state) => state.activity);

  const [showCelebration, setShowCelebration] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);
  const [selectedSkillNumber, setSelectedSkillNumber] = useState(null);
  const [selectedSkillActivityId, setSelectedSkillActivityId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPositiveFilter, setSelectedPositiveFilter] = useState(0);
  const [currentUserId, setCurrentUserId] = useState(null);
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

  const inviteUrl = typeof window !== "undefined" ? `${window.location.origin}/login-user?ladder_id=${ladderId}&ladder_type=positive` : "";

  const handleTargetAchieved = useCallback(() => {
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 4000 + Math.random() * 1000);
  }, []);

  const refreshLeaderboard = useCallback((skillNo = selectedPositiveFilter, age = appliedAge, ageType = appliedAgeType, gender = appliedGender, witness = localWitnessBy) => {
    if (ladderId) {
      const payload = {
        ladder_id: ladderId,
        type: "positive",
      };
      if (skillNo && skillNo !== 0) {
        payload.sortbyskillnumber = skillNo;
      }

      if (witness === 1) {
        payload.witness_by = 1;
      } else {
        if (age && age > 0) {
          payload.dob = age;
          if (ageType) payload.age_type = ageType;
        }
        if (gender) {
          payload.gender = gender;
        }
      }

      Promise.all([
        dispatch(fetchPositiveLeaderboard(payload)),
        dispatch(fetchUserActivity({ ladder_id: Number(ladderId) }))
      ]);
    }
  }, [dispatch, ladderId, selectedPositiveFilter, appliedAge, appliedAgeType, appliedGender, localWitnessBy]);

  const handleAgeSearch = (age, ageType, gender) => {
    const ageNum = age ? Number(age) : "";
    dispatch(setAgeFilter({ age: ageNum, ageType, gender }));
    refreshLeaderboard(selectedPositiveFilter, ageNum, ageType, gender, 0);
  };

  useEffect(() => { if (onPlayerAdded) refreshLeaderboard(); }, [onPlayerAdded, refreshLeaderboard]);
  useEffect(() => { if (ladderId) refreshLeaderboard(); }, [ladderId]);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = sessionStorage.getItem("user");
      if (storedUser) {
        try { const p = JSON.parse(storedUser); if (p?.id) setCurrentUserId(Number(p.id)); } catch {}
      }
    }
  }, []);

  const handleSkillClick = useCallback((playerId, skillNumber) => {
    const player = data.find((p) => p.id === playerId);
    if (!player) return;
    const skillObj = player.skills.find((s) => s.skill_number === skillNumber);
    if (!skillObj) return;
    setSelectedPlayerId(playerId);
    setSelectedSkillNumber(skillNumber);
    setSelectedSkillActivityId(skillObj.id);
    setOpenEdit(true);
  }, [data, currentUserId]);

  const handleEditClose = useCallback(() => {
    setOpenEdit(false); setSelectedPlayerId(null); setSelectedSkillNumber(null); setSelectedSkillActivityId(null);
    refreshLeaderboard();
  }, [refreshLeaderboard]);

  const filteredPlayers = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const clean = (name = "") => name.replace(/\s+/g, "").toLowerCase();
    const baseList = !q ? data : [
      ...data.filter((p) => clean(p.name).startsWith(q)).sort((a, b) => a.name.localeCompare(b.name)),
      ...data.filter((p) => !clean(p.name).startsWith(q) && clean(p.name).includes(q)).sort((a, b) => a.name.localeCompare(b.name)),
    ];
    return [...baseList].sort((a, b) => sortMode === "name" ? (a?.name || "").localeCompare(b?.name || "") : Number(a?.rank || 0) - Number(b?.rank || 0));
  }, [data, searchQuery, sortMode]);

  const handleDeleteActivity = useCallback(async (id) => {
    try { await getRequest(API_ENDPOINTS.ACTIVITY_DELETE, { id }); dispatch(fetchUserActivity({ ladder_id: Number(ladderId) })); }
    catch (error) { console.error("Failed to delete activity", error); }
  }, [dispatch, ladderId]);

  const handleResetBoard = useCallback(async () => {
    try { await getRequest(API_ENDPOINTS.RESET_LEADERBOARD, { ladder_id: ladderId }); setResetOpen(false); refreshLeaderboard(); }
    catch (error) { console.error("Failed to reset leaderboard", error); }
  }, [ladderId, refreshLeaderboard]);

  const activityItems = activityState?.data?.data || [];
  const quickActions = [
    { id: "reset", label: "Reset", icon: RotateCcw, onClick: () => setResetOpen(true) },
    { id: "add-remove", label: "Add / Remove", icon: Plus, onClick: () => setAddRemoveOpen(true) },
    { id: "skill-sort", label: isSorted ? "Sorted" : "Skill Sort", icon: Funnel, onClick: () => setOpenSkillSortDialog(true) },
    { id: "setup", label: "Setup", icon: Zap, onClick: () => setOpenSkillSetupDialog(true) },
    {
      id: "witnessed", label: localWitnessBy === 1 ? "Witnessed" : "Witnessed Only", icon: Eye,
      tone: localWitnessBy === 1 ? "success" : "default",
      onClick: () => {
        const next = localWitnessBy === 1 ? 0 : 1; setLocalWitnessBy(next);
        if (next === 1) {
          dispatch(setAgeFilter({ age: 0, ageType: "", gender: "" }));
          setAgeFilterResetSignal((p) => p + 1);
          setIsSorted(false);
          refreshLeaderboard(0, 0, "", "", 1);
        } else {
          refreshLeaderboard(0, appliedAge, appliedAgeType, appliedGender, 0);
        }
      },
    },
    { id: "age-filter", node: <AgeFilter onSearch={handleAgeSearch} user={false} resetSignal={ageFilterResetSignal} isActive={hasFilters} /> },
    {
      id: "clear", label: "Clear All", icon: XCircle, tone: "danger",
      onClick: () => {
        setIsSorted(false);
        setLocalWitnessBy(0);
        dispatch(setAgeFilter({ age: 0, ageType: "", gender: "" }));
        setAgeFilterResetSignal((p) => p + 1);
        refreshLeaderboard(0, 0, "", "", 0);
      },
      hidden: !isSorted && !hasFilters && localWitnessBy !== 1
    },
  ];

  return (
    <>
      <LadderPageLayout
        controls={
          <ControlsSection
            mobileSection={mobileSection}
            setMobileSection={setMobileSection}
            mobileSections={[{ id: "toolbar", label: "Tools" }, { id: "players", label: "Players" }, { id: "info", label: "Info" }]}
            resetOpen={resetOpen} setResetOpen={setResetOpen}
            addRemoveOpen={addRemoveOpen} setAddRemoveOpen={setAddRemoveOpen}
            refreshLeaderboard={refreshLeaderboard} ladderId={ladderId}
            sortMode={sortMode} setSortMode={setSortMode}
            sortOpen={sortOpen} setSortOpen={setSortOpen}
            filterOpen={false} setFilterOpen={() => {}}
            appliedAge={0} appliedGender="" groupSize={1}
            showFilter={false} showSectionSize={false}
          />
        }
        sidebar={
          <InfoSection
            mobileSection={mobileSection} ladderType="positive" user={currentUser}
            inviteUrl={inviteUrl} setContactOpen={setContactOpen}
            setResetOpen={setResetOpen} setAddRemoveOpen={setAddRemoveOpen}
            setSortOpen={setSortOpen} setFilterOpen={() => {}}
            activityItems={activityItems} handleDeleteActivity={handleDeleteActivity}
            contactOpen={contactOpen} resetOpen={resetOpen}
            handleResetBoard={handleResetBoard}
            resetDescription="This will reset the current positive ladder data."
            quickActions={quickActions}
          />
        }
      >
        <div className={`${mobileSection === "info" ? "hidden" : "block"} min-w-0`}>
          <PlayerSearchInput value={searchQuery} onChange={setSearchQuery} />
          {loading && <p className="hidden text-center text-white">Loading...</p>}
          <div className="mt-2 space-y-2">
            {filteredPlayers.length === 0 ? (
              <div className="best-board-card rounded-xl px-6 py-10 text-center font-bold text-[var(--best-board-muted)]">No players found</div>
            ) : (
              filteredPlayers.map((player, index) => (
                <PlayerCard key={player.id} player={player} overallRank={player.rank || index + 1} showAgeRank={showAgeRank} ageRank={index + 1} isInverted={isInverted} onSkillClick={handleSkillClick} onTargetAchieved={handleTargetAchieved} currentUser={currentUser} appliedWitnessBy={appliedWitnessBy} />
              ))
            )}
          </div>
        </div>
      </LadderPageLayout>

      {openEdit && selectedPlayerId && selectedSkillNumber && (
        <BasicLeaderboardUserEdit open={openEdit} onClose={handleEditClose} currentId={selectedPlayerId} ladderId={ladderId} skillNumber={selectedSkillNumber} skillActivityId={selectedSkillActivityId} />
      )}

      <Dialog open={openSkillSetupDialog} onOpenChange={setOpenSkillSetupDialog}>
        <DialogContent className="bg-transparent border-none shadow-none flex items-center justify-center">
          <BasicLeaderboardSetUpSkill onClose={() => setOpenSkillSetupDialog(false)} onSkillsUpdated={refreshLeaderboard} />
        </DialogContent>
      </Dialog>

      <Dialog open={openSkillSortDialog} onOpenChange={setOpenSkillSortDialog}>
        <DialogContent className="bg-transparent border-none shadow-none flex items-center justify-center">
          <BasicLeaderboardShort ladderId={ladderId}
            onClose={() => { setOpenSkillSortDialog(false); setIsSorted(false); }}
            onSkillsUpdated={(skillNo) => {
              dispatch(setAgeFilter({ age: 0, ageType: "", gender: "" }));
              setAgeFilterResetSignal((p) => p + 1); setLocalWitnessBy(0);
              refreshLeaderboard(skillNo, 0, "", "", 0); setIsSorted(true); setOpenSkillSortDialog(false);
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

export default PositiveLeaderboard;
