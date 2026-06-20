"use client";
import PlayerRankBadge from "@/components/shared/PlayerRankBadge";
import { IMAGE_BASE_URL } from "@/constants/api";
import {
  PLAYER_COLOR_CLASSES,
  getPlayerInitials,
  getPhoneText,
} from "@/components/shared/ladderUtils";
import Image from "next/image";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { fetchLeaderboard, setAgeFilter } from "@/redux/slices/leaderboardSlice";
import { fetchGradebars } from "@/redux/slices/gradebarSlice";
import { EditPlayer } from "@/components/shared/EditPlayer";
import PlayerStatusToggle from "@/components/shared/PlayerStatusToggle";
import PlayerSearch from "./PlayerSearch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";
import LeaderboardActionButtons from "@/components/shared/LeaderboardActionButtons";
import BasicLeaderboardUserRemove from "@/components/shared/BasicLeaderboardUserRemove";
import AgeFilter from "@/components/shared/AgeFilter";



import { Funnel } from "lucide-react";

export default function PlayersList({ ladderId: propLadderId, ladderType: propLadderType, onActionsChanged }) {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();

  /* ------------------ GET FROM SEARCH PARAMS ------------------ */

  const ladderId = Number(propLadderId || searchParams.get("ladder_id"));
  const ladderTypeFromParams = propLadderType || searchParams.get("ladder_type");

  /* ------------------ LOGGED IN USER (LOCALSTORAGE) ------------------ */

  const reduxUser = useSelector((state) => state.user?.user);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = sessionStorage.getItem("user") || sessionStorage.getItem("userData");
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          const uid = parsed?.id || parsed?.user_id;
          if (uid) {
            setCurrentUserId(Number(uid));
          }
        } catch (err) {
          console.error("Failed to parse user from session", err);
        }
      }
    }
  }, []);

  const loggedInUserId = reduxUser?.id || reduxUser?.user_id ? Number(reduxUser.id || reduxUser.user_id) : currentUserId;

  /* ------------------ REDUX ------------------ */

  const players =
    useSelector((state) => state.player?.players?.[ladderId]?.data) || [];

  const gradebarDetails =
    useSelector((state) => state.gradebar?.gradebarDetails) || [];

  const preset = useSelector((state) => state.gradebar?.preset || 7);

  const ladderDetails =
    useSelector((state) => state.player?.players?.[ladderId]?.ladderDetails) ||
    {};

  const { appliedAge, appliedAgeType, appliedGender, appliedCountry } = useSelector((state) => state.player || {});

  const ladderType =
    ladderTypeFromParams ||
    ladderDetails?.type?.toLowerCase() ||
    "bestof5";

  /* ------------------ STATES ------------------ */

  const [cacheBuster, setCacheBuster] = useState(Date.now());
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [initialTab, setInitialTab] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [showRemove, setShowRemove] = useState(false);
  const [resetSignal, setResetSignal] = useState(0);

  useEffect(() => {
    dispatch(setAgeFilter({ age: 0, ageType: "", gender: "", country: "" }));
  }, [dispatch]);

  const handleClearFilters = useCallback(() => {
    setSearchTerm("");
    dispatch(setAgeFilter({ age: 0, ageType: "under", gender: "", country: "" }));
    setResetSignal((p) => p + 1);
  }, [dispatch]);

  useEffect(() => {
    if (onActionsChanged) {
      const actions = [];
      
      if (appliedAge > 0 || Boolean(appliedGender) || Boolean(appliedCountry)) {
        actions.push({
          id: "clear-all-filters",
          label: "Clear All Filters",
          icon: Funnel,
          onClick: handleClearFilters,
          tone: "danger",
        });
      }

      actions.push({
        id: "age-filter",
        node: (
          <AgeFilter
            onSearch={(age, ageType, gender, country) => {
              const ageNum = age ? Number(age) : "";
              dispatch(setAgeFilter({ age: ageNum, ageType, gender, country }));
            }}
            user={false}
            resetSignal={resetSignal}
            isActive={appliedAge > 0 || Boolean(appliedGender) || Boolean(appliedCountry)}
            defaultAge={appliedAge}
            defaultAgeType={appliedAgeType}
            defaultGender={appliedGender}
            defaultCountry={appliedCountry}
          />
        )
      });

      onActionsChanged(actions);
    }
  }, [resetSignal, onActionsChanged, dispatch, appliedAge, appliedGender, appliedCountry, handleClearFilters]);

  const currentUser = players.find(
    (p) =>
      Number(p.id) === Number(loggedInUserId) ||
      (p.user_id && Number(p.user_id) === Number(loggedInUserId))
  );
  const myRank = currentUser?.rank || "-";

  /* ------------------ FETCH DATA ------------------ */

  const refreshData = useCallback(() => {
    if (ladderId && ladderType) {
      const payload = {
        ladder_id: ladderId,
        type: ladderType
      };
      if (appliedAge > 0) {
        payload.dob = appliedAge;
        payload.age_type = appliedAgeType;
      }
      if (appliedGender) {
        payload.gender = appliedGender;
      }
      if (appliedCountry) {
        payload.country = appliedCountry;
      }
      dispatch(fetchLeaderboard(payload));
      dispatch(fetchGradebars(ladderId));
      setCacheBuster(Date.now());
    }
  }, [dispatch, ladderId, ladderType, appliedAge, appliedAgeType, appliedGender, appliedCountry]);

  const handleSelfRemove = useCallback(() => {
    setShowRemove(true);
  }, []);

  const handleRemoveClose = useCallback(() => {
    setShowRemove(false);
  }, []);

  const handleRemoveSuccess = useCallback(() => {
    setShowRemove(false);
    refreshData();
  }, [refreshData]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  /* ------------------ FILTER ------------------ */

  const filteredPlayers = searchTerm
    ? players.filter((p) =>
      p.name?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    : players;

  /* ------------------ MINILEAGUE GROUP ------------------ */

  const generateGrades = (playersArr, gradebars, presetVal) => {
    if (!playersArr || playersArr.length === 0) return [];
    const groupSize = Number(presetVal) || 7;
    const out = [];

    for (let i = 0; i < playersArr.length; i += groupSize) {
      const groupPlayers = playersArr.slice(i, i + groupSize);
      const gradeIdx = Math.floor(i / groupSize);
      const gradeLabel =
        gradebars?.[gradeIdx]?.gradebar_name || `Minileague ${gradeIdx + 1}`;

      out.push({
        label: gradeLabel,
        players: groupPlayers,
      });
    }
    return out;
  };

  const grades = generateGrades(filteredPlayers, gradebarDetails, preset);

  /* ------------------ CLICK HANDLER (STRICT) ------------------ */

  const handlePlayerClick = (player) => {
    if (!loggedInUserId) {
      setDialogMessage("Please login first");
      setIsDialogOpen(true);
      return;
    }

    setSelectedPlayerId(player.id);
    const isCurrentUser =
      String(loggedInUserId) === String(player.id) ||
      (player.user_id && String(loggedInUserId) === String(player.user_id));
    setInitialTab(isCurrentUser ? null : "stats");
    setIsModalOpen(true);
  };

  const handleChallengeClick = (player) => {
    if (!loggedInUserId) {
      setDialogMessage("Please login first");
      setIsDialogOpen(true);
      return;
    }
    setSelectedPlayerId(player.id);
    setInitialTab("challenge");
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedPlayerId(null);
    setInitialTab(null);
    setTimeout(() => {
      refreshData();
    }, 500);
  };

  /* ------------------ UI ------------------ */

  return (
    <div className="w-full relative">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />

      {/* SEARCH */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mt-4 px-4">
        <PlayerSearch
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onClearFilters={() => {
            dispatch(setAgeFilter({ age: 0, ageType: "under", gender: "", country: "" }));
            setResetSignal((p) => p + 1);
          }}
          activeFilters={
            Boolean(searchTerm) ||
            appliedAge > 0 ||
            Boolean(appliedGender) ||
            Boolean(appliedCountry)
          }
        />
      </div>

      {/* NO PLAYERS */}
      {grades.length === 0 && (
        <div className="text-center py-10 text-gray-400 font-bold">No players found</div>
      )}

      {/* PLAYERS LIST */}
      {grades.map((grade, gradeIndex) => (
        <div key={gradeIndex} className="mt-8 px-4">
          <div className="mb-3 sticky top-0 best-board-section-banner flex items-center justify-between rounded-xl px-4 py-3 text-white font-bold tracking-wide z-10">
            <span className="best-board-highlight uppercase tracking-[0.18em]">
              {grade.label}
            </span>
            <span className="rounded bg-[var(--best-board-surface-soft)] border border-[var(--best-board-border)] px-2 py-1 text-[11px] font-medium text-[var(--best-board-muted)]">
              {grade.players.length} players
            </span>
          </div>

          <div className="space-y-3">
            {grade.players.map((player, pidx) => {
              const rank = player.rank || gradeIndex * preset + pidx + 1;
              const playerImageUrl = player.image
                ? `${IMAGE_BASE_URL}/${player.image}?t=${cacheBuster}`
                : null;

              const isCurrentUser =
                String(loggedInUserId) === String(player.id) ||
                (player.user_id && String(loggedInUserId) === String(player.user_id));

              return (
                <motion.div
                  key={`${player.id}-${cacheBuster}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: pidx * 0.03 }}
                >
                  <div
                    onClick={() => handlePlayerClick(player)}
                    className="group flex flex-col rounded-xl border border-[var(--best-board-border)] bg-[var(--best-board-surface)] transition hover:border-[var(--best-board-border-strong)] cursor-pointer overflow-hidden"
                  >
                    {/* ── TOP STRIP ── */}
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center justify-between px-4 py-1.5 gap-2 border-b border-[var(--best-board-border)] bg-[var(--best-board-surface-soft)]"
                    >
                      {/* Active Toggle Button (PlayerStatusToggle) */}
                      <PlayerStatusToggle player={player} user={true} />

                      {/* Age and Gender Badges */}
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {player?.age ? (
                          <span className="text-[9px] sm:text-[10px] font-semibold px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap bg-[var(--best-board-accent-soft)] border border-[var(--best-board-border-strong)] text-[var(--best-board-highlight)]">
                            Age : {player.age}
                          </span>
                        ) : null}
                        {player?.gender !== undefined && player?.gender !== null && player?.gender !== "" ? (
                          <span className="text-[9px] sm:text-[10px] font-semibold px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap bg-[var(--best-board-accent-soft)] border border-[var(--best-board-border-strong)] text-[var(--best-board-highlight)]">
                            Gender: {player.gender === "male" || player.gender === "Male" ? "M" : "F"}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    {/* ── MAIN BODY ── */}
                    <div className="flex items-center justify-between px-4 py-3 sm:py-4 gap-3">
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        <PlayerRankBadge rank={rank} />
                        
                        {/* Avatar */}
                        {player.image ? (
                          <Image
                            src={playerImageUrl}
                            alt={player.name}
                            width={64}
                            height={64}
                            className="h-12 w-12 sm:h-16 sm:w-16 rounded-full object-cover shrink-0"
                            unoptimized
                          />
                        ) : (
                          <div className={`flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-gradient-to-br ${PLAYER_COLOR_CLASSES[(Number(rank) - 1) % PLAYER_COLOR_CLASSES.length]} text-sm sm:text-base font-bold text-white shrink-0`}>
                            {getPlayerInitials(player?.name)}
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-h5 font-semibold text-[var(--best-board-text)] mb-0.5">{player?.name || "N/A"}</p>
                          <p className="truncate text-sm text-[var(--best-board-muted)]">{getPhoneText(player?.phone)}</p>
                        </div>
                      </div>

                      {/* Challenge Button */}
                      {loggedInUserId && isCurrentUser && (
                        <div className="flex items-center shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleChallengeClick(player);
                            }}
                            className="rounded-lg border border-[var(--best-board-border-strong)] bg-[var(--best-board-accent-soft)] px-3 py-1.5 sm:px-4 sm:py-2 text-[11px] sm:text-xs font-semibold text-[var(--best-board-text)] transition cursor-pointer hover:bg-[var(--best-board-border-strong)]/30"
                          >
                            Challenge
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      ))}

      {/* EDIT MODAL */}
      {isModalOpen && (
        <EditPlayer
          open={isModalOpen}
          onClose={handleModalClose}
          currentId={selectedPlayerId}
          ladder_id={ladderId}
          ladder_type={ladderType}
          userLevel={true}
          initialTab={initialTab}
        />
      )}


      {/* NOTICE */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">Notice</DialogTitle>
          </DialogHeader>
          <p className="py-2 text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{dialogMessage}</p>
          <DialogFooter className="mt-4">
            <Button onClick={() => setIsDialogOpen(false)} className="rounded-xl px-5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold shadow-md transition-all duration-200">OK</Button>
          </DialogFooter>
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
    </div>
  );
}
