"use client";
import PlayerRankBadge from "@/components/shared/PlayerRankBadge";
import { IMAGE_BASE_URL } from "@/constants/api";
import {
  PLAYER_COLOR_CLASSES,
  getPlayerInitials,
  getPhoneText,
} from "@/components/shared/ladderUtils";
import Image from "next/image";
import React, { useEffect, useState } from "react";
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



export default function Bestof5Players({ ladderId: propLadderId, ladderType: propLadderType }) {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();

  // ✅ ladder params
  const ladderId = propLadderId || searchParams.get("ladder_id");
  const ladderTypeFromParams = propLadderType || searchParams.get("type");

  // ✅ user from localStorage
  const [currentUser, setCurrentUser] = useState(null);
  const reduxUser = useSelector((state) => state.user?.user);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("user") || sessionStorage.getItem("userData");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed && (parsed.id || parsed.user_id)) {
            setCurrentUser(parsed);
          }
        } catch (e) {
          console.error("Failed to parse user session", e);
        }
      }
    }
  }, []);

  const user = reduxUser?.id || reduxUser?.user_id ? reduxUser : currentUser;
  const loggedInUserId = user?.id || user?.user_id || null;
  const loggedInUser = user; // for toggle context

  // ✅ redux data
  const players =
    useSelector((state) => state.player?.players?.[ladderId]?.data) || [];

  const gradebarDetails =
    useSelector((state) => state.gradebar?.gradebarDetails) || [];

  const preset = useSelector((state) => state.gradebar?.preset || 7);

  const ladderDetails =
    useSelector(
      (state) => state.player?.players?.[ladderId]?.ladderDetails
    ) || {};

  const ladderType = ladderTypeFromParams || ladderDetails?.type;

  const [cacheBuster, setCacheBuster] = useState(Date.now());
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [initialTab, setInitialTab] = useState("stats");
  const { appliedAge, appliedAgeType, appliedGender } = useSelector((state) => state.player || {});

  const hasFiltersApplied =
    Boolean(searchTerm) ||
    appliedAge > 0 ||
    Boolean(appliedGender);

  // ================== FETCH DATA ==================
  useEffect(() => {
    if (ladderId) {
      const payload = { ladder_id: Number(ladderId), type: ladderType };
      if (appliedAge > 0) {
        payload.dob = appliedAge;
        payload.age_type = appliedAgeType;
      }
      if (appliedGender) {
        payload.gender = appliedGender;
      }
      dispatch(fetchLeaderboard(payload));
      dispatch(fetchGradebars(Number(ladderId)));
    }
  }, [dispatch, ladderId, ladderType, appliedAge, appliedAgeType, appliedGender]);

  // ================== FILTER ==================
  const filteredPlayers = searchTerm
    ? players.filter((p) =>
      p.name?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    : players;

  // ================== GRADES ==================
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

  // ================== CLICK ==================
  const handlePlayerClick = (player) => {
    if (!user?.id) {
      setDialogMessage("Please login first");
      setIsDialogOpen(true);
      return;
    }

    const isCurrentUser =
      String(user?.id) === String(player.id) ||
      (player.user_id && String(user?.id) === String(player.user_id));

    if (!isCurrentUser) {
      setDialogMessage("You cannot view or edit other players' control panels. You can only manage your own card.");
      setIsDialogOpen(true);
      return;
    }

    setSelectedPlayerId(player.id);
    setInitialTab(null);
    setIsModalOpen(true);
  };

  const handleChallengeClick = (player) => {
    if (!user?.id) {
      setDialogMessage("Please login first");
      setIsDialogOpen(true);
      return;
    }

    setSelectedPlayerId(player.id);
    setInitialTab("challenge");
    setIsModalOpen(true);
  };

  return (
    <div className="w-full relative">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />

      {/* TITLE */}
      {ladderDetails?.name && (
        <div className="py-4 text-center sm:text-left px-4">
          <h2 className="text-2xl font-bold text-white">
            {ladderDetails.name}
          </h2>
        </div>
      )}

      {/* SEARCH */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mt-4 px-4">
        <PlayerSearch
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onAgeSearch={(age, ageType, gender) => {
            const ageNum = age ? Number(age) : "";
            dispatch(setAgeFilter({ age: ageNum, ageType, gender }));
          }}
          onClearFilters={() => {
            dispatch(setAgeFilter({ age: 0, ageType: "under", gender: "" }));
          }}
          activeFilters={hasFiltersApplied}
          defaultAge={appliedAge}
        />
      </div>

      {grades.length === 0 && (
        <p className="text-gray-500 text-center mt-6">No players found</p>
      )}

      {/* PLAYERS */}
      {grades.map((grade, gradeIndex) => (
        <div key={gradeIndex} className="mt-8 px-4">
          <div className="mb-3 sticky top-0 bg-[#223848] px-4 py-2 rounded-lg shadow-lg text-xl text-white font-bold">
            {grade.label}
          </div>

          <div className="space-y-3">
            {grade.players.map((player, pidx) => {
              const rank = player.rank || gradeIndex * Number(preset) + pidx + 1;
              const playerImageUrl = player.image
                ? `${IMAGE_BASE_URL}/${player.image}?t=${cacheBuster}`
                : null;

              const isCurrentUser =
                loggedInUserId &&
                (String(loggedInUserId) === String(player.id) ||
                 (player.user_id && String(loggedInUserId) === String(player.user_id)));

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
                      {loggedInUserId && !isCurrentUser && (
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

      {/* EDIT */}
      {isModalOpen && (
        <EditPlayer
          open={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedPlayerId(null);
            setInitialTab("stats");
          }}
          currentId={selectedPlayerId}
          ladder_id={ladderId}
          ladder_type={ladderType}
          userLevel={true}
          initialTab={initialTab}
        />
      )}

      {/* DIALOG */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md w-full">
          <DialogHeader>
            <DialogTitle>Notice</DialogTitle>
          </DialogHeader>
          <p className="py-2 text-gray-800">{dialogMessage}</p>
          <DialogFooter>
            <Button onClick={() => setIsDialogOpen(false)}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

