"use client";
import PlayerRankBadge from "@/components/shared/PlayerRankBadge";
import { IMAGE_BASE_URL } from "@/constants/api";

import Image from "next/image";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { fetchMiniLeague } from "@/redux/slices/minileagueSlice";
import { setSelectedPlayer } from "@/redux/slices/leaderboardSlice";
import { MinileagueEditPlayer } from "@/components/shared/MinileagueEditPlayer";
import PlayerStatusToggle from "@/components/shared/PlayerStatusToggle";
import { Skeleton } from "@/components/ui/skeleton";
import PlayerSearch from "./PlayerSearch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Logo from "@/public/logo1.png";



/* ---------------- PLAYER CARD ---------------- */

const PlayerCard = ({
  player,
  rank,
  canEdit,
  isBlank,
  onClick,
  groupSize,
  loggedInUser,
}) => {
  if (isBlank) {
    return (
      <div className="flex items-center justify-center min-h-[12vh] sm:min-h-[15vh] px-2 py-2 mb-3 rounded-xl bg-[var(--best-board-surface)] border-2 border-dashed border-[var(--best-board-border-strong)]" />
    );
  }

  const cacheBust = React.useMemo(() => Date.now(), [player?.image]);

  const playerImageUrl = player?.image
    ? `${IMAGE_BASE_URL}/${player.image}?t=${cacheBust}`
    : Logo;

  const sectionStartRank = Math.floor((rank - 1) / groupSize) * groupSize + 1;
  const currentSectionRanks = Array.from(
    { length: groupSize },
    (_, i) => sectionStartRank + i
  );

  const isCurrentUser = canEdit;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onClick={() => onClick()}
      className={`mb-3 rounded-xl transition-all duration-200 group overflow-hidden bg-[var(--best-board-surface)] border border-[var(--best-board-border-strong)] shadow-[0_4px_16px_rgba(0,0,0,0.18)] ${isCurrentUser ? "cursor-pointer" : "opacity-60 cursor-not-allowed"
        }`}
    >
      {/* ── TOP STRIP: toggle + age/gender chips ── */}
      <div className="flex items-center justify-between px-2 sm:px-3 py-1.5 gap-2 border-b border-[var(--best-board-border)] bg-primary">
        {/* PlayerStatusToggle - DO NOT CHANGE USER=TRUE */}
        <div onClick={(e) => e.stopPropagation()}>
          <PlayerStatusToggle player={player} user={true} />
        </div>

        {/* Age + gender chips */}
        <div className="flex items-center gap-1 flex-shrink-0 flex-wrap justify-end">
          {player.age !== null && player.age !== undefined && player.age !== "" && (
            <span
              className="text-[9px] sm:text-[10px] font-semibold px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap bg-white text-dark-theme border border-white/20"
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
              className="text-[9px] sm:text-[10px] font-semibold px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap bg-white text-dark-theme border border-white/20"
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

        {/* LEFT SECTION */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 flex-1 min-w-0">

          <PlayerRankBadge
            rank={rank}
            sizeClass="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14"
            imgSize={56}
            textClass="text-[10px] sm:text-xs md:text-sm"
          />

          <div className="flex-1 min-w-0">
            {/* Player name */}
            <div className="text-xs sm:text-sm font-bold truncate mb-0.5 leading-tight text-[var(--best-board-text)]">
              {player?.name || "N/A"}
            </div>

            <div className="text-[10px] sm:text-xs truncate mb-1.5 sm:mb-2 leading-tight text-[var(--best-board-muted)]">
              {player?.phone || "N/A"}
            </div>

            {/* GW RANKS & POINTS COLUMNS */}
            <div className="flex gap-0.5 sm:gap-1 overflow-x-auto pb-0.5 scrollbar-none">
              {currentSectionRanks.map((r) => {
                const found = player.result_details?.find(
                  (i) => Number(i.rank) === Number(r)
                );
                return (
                  <div key={r} className="flex flex-col items-center gap-1 flex-shrink-0">
                    <div className="w-6 h-5 sm:w-7 sm:h-6 flex items-center justify-center text-[9px] sm:text-[10px] font-bold rounded bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/25 text-zinc-700 dark:text-white/90">
                      {r}
                    </div>
                    <div
                      className={`w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0 flex items-center justify-center rounded text-[9px] sm:text-xs font-bold transition-all ${found
                        ? "bg-blue-600 dark:bg-blue-500 border border-blue-500 dark:border-blue-400 text-white shadow-sm"
                        : "bg-black/5 dark:bg-white/5 border border-dashed border-black/10 dark:border-white/15 text-zinc-400 dark:text-white/40"
                        }`}
                    >
                      {found?.point ?? ""}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT SECTION: points badge + avatar */}
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
              className="text-[7px]  md:text-[10px] font-black leading-none w-full text-center"
              style={{ color: "var(--best-board-highlight)" }}
            >
              {player?.total_point || 0}
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
    </motion.div>
  );
};

/* ---------------- MAIN COMPONENT ---------------- */

const MinileaguePlayers = ({ ladderId }) => {
  const dispatch = useDispatch();
  const { data: sectionedPlayers } =
    useSelector((state) => state.minileague || {});
  const loggedInUser = useSelector((state) => state.user?.user);

  const user =
    typeof window !== "undefined"
      ? JSON.parse(sessionStorage.getItem("user") || sessionStorage.getItem("userData") || "null")
      : null;

  const [loadingPlayers, setLoadingPlayers] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);
  const [selectedSectionIndex, setSelectedSectionIndex] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");

  const isRefreshingRef = useRef(false);
  const totalSlots = 7;

  const refreshLeaderboard = useCallback(async () => {
    if (!ladderId || isRefreshingRef.current) return;
    isRefreshingRef.current = true;
    setLoadingPlayers(true);
    const payload = { ladder_id: ladderId, type: "minileague" };
    try {
      await dispatch(fetchMiniLeague(payload));
    } finally {
      setLoadingPlayers(false);
      isRefreshingRef.current = false;
    }
  }, [ladderId, dispatch]);

  useEffect(() => {
    refreshLeaderboard();
  }, [refreshLeaderboard]);

  const handlePlayerClick = (player, globalIndex, sectionIdx) => {
    if (!user) {
      setDialogMessage("Please login first");
      setIsDialogOpen(true);
      return;
    }

    const isCurrentUser =
      String(user?.id) === String(player.id || player.user_id);

    if (!isCurrentUser) {
      setDialogMessage("You can only edit your own profile");
      setIsDialogOpen(true);
      return;
    }

    const normalizedId = Number(player.id || player.user_id);

    const playerWithSection = {
      ...player,
      id: normalizedId,
      rank: Number(player.rank || globalIndex + 1),
      sectionIndex: sectionIdx ?? 0,
      ladder_id: Number(ladderId),
    };

    setSelectedPlayerId(normalizedId);
    setSelectedSectionIndex(playerWithSection.sectionIndex);
    dispatch(setSelectedPlayer(playerWithSection));
    setIsModalOpen(true);
  };

  const finalSections = sectionedPlayers.map((sec) => {
    const filteredPlayers = searchQuery
      ? (sec?.users_record || []).filter((p) =>
        p?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      : sec?.users_record || [];

    const blankCount = Math.max(0, totalSlots - filteredPlayers.length);

    return {
      label: sec?.section,
      players: filteredPlayers,
      blankCount,
    };
  });

  return (
    <div className="w-full relative">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mt-4 px-4">
        <PlayerSearch
          searchTerm={searchQuery}
          setSearchTerm={setSearchQuery}
          onClearFilters={() => {
            setSearchQuery("");
          }}
          activeFilters={Boolean(searchQuery)}
        />
      </div>

      {loadingPlayers ? (
        Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))
      ) : finalSections.length === 0 ? (
        <div className="text-center py-10 text-gray-400 font-bold">No players found</div>
      ) : (
        finalSections.map((section, idx) => (
          <div key={idx} className="mt-8">
            <div className="mb-3 sticky top-0 best-board-section-banner flex items-center justify-between rounded-xl px-4 py-3 text-white font-bold tracking-wide z-10">
              <span className="best-board-highlight uppercase tracking-[0.18em]">
                {section.label}
              </span>
              <span className="rounded bg-white/5 px-2 py-1 text-[11px] font-medium text-[var(--best-board-muted)]">
                {section.players.length} players
              </span>
            </div>

            <div className="space-y-3">
              {section.players.map((player, pidx) => {
                const globalIndex = idx * totalSlots + pidx;
                const canEdit =
                  String(user?.id) ===
                  String(player.id || player.user_id);

                return (
                  <PlayerCard
                    key={player.id || pidx}
                    player={player}
                    rank={player.rank || globalIndex + 1}
                    canEdit={canEdit}
                    groupSize={totalSlots}
                    loggedInUser={loggedInUser}
                    onClick={() =>
                      handlePlayerClick(player, globalIndex, idx)
                    }
                  />
                );
              })}

              {Array.from({ length: section.blankCount }).map((_, i) => (
                <PlayerCard key={`blank-${i}`} isBlank />
              ))}
            </div>
          </div>
        ))
      )}

      {isModalOpen && selectedPlayerId != null && (
        <MinileagueEditPlayer
          open={isModalOpen}
          currentId={selectedPlayerId}
          sectionIndex={selectedSectionIndex ?? 0}
          ladderId={ladderId}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedPlayerId(null);
            setSelectedSectionIndex(null);
          }}
          setLoading={() => { }}
          userLevel={true}
        />
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md w-full">
          <DialogHeader>
            <DialogTitle>Notice</DialogTitle>
          </DialogHeader>
          <p className="py-2 text-primary">{dialogMessage}</p>
          <DialogFooter>
            <Button onClick={() => setIsDialogOpen(false)}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MinileaguePlayers;
