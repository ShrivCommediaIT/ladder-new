"use client";
import { IMAGE_BASE_URL } from "@/constants/api";

import Image from "next/image";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { fetchMiniLeague, setAgeFilter } from "@/redux/slices/minileagueSlice";
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
  rank,
  canEdit,
  isBlank,
  onClick,
  groupSize,
  loggedInUser,
}) => {
  if (isBlank) {
    return (
      <div
        className="flex items-center min-h-[18vh] justify-center px-2 py-2 mb-3 rounded-xl border border-dashed border-[var(--best-board-border)] bg-[var(--best-board-surface)]"
      />
    );
  }

  const cacheBust = React.useMemo(() => Date.now(), [player?.image]);

  const playerImageUrl = player?.image
    ? `${IMAGE_BASE_URL}/${player.image}?t=${cacheBust}`
    : Logo;

  const sectionStartRank =
    Math.floor((rank - 1) / groupSize) * groupSize + 1;

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
      className={`group flex flex-col mb-3 rounded-xl border border-[var(--best-board-border)] bg-[var(--best-board-surface)] px-4 py-4 transition hover:border-[var(--best-board-border-strong)] ${
        isCurrentUser ? "cursor-pointer" : "opacity-60 cursor-not-allowed"
      }`}
    >
      <div
        className="flex justify-between items-center px-2 py-1"
        onClick={(e) => e.stopPropagation()}
      >
        <PlayerStatusToggle player={player} user={true} />
      </div>

      <div className="flex items-center justify-between mt-2">
        <div className="flex-1 min-w-0 overflow-hidden">
          <div className="flex w-full items-center mb-2 min-w-0">
            <PlayerRankBadge rank={rank} sizeClass="h-12 w-12 sm:h-16 sm:w-16 mr-2" imgSize={64} textClass="text-xs sm:text-sm" />

            <div className="flex-1 min-w-0 overflow-hidden mb-3">
              <div className="text-white flex items-center align-center gap-2 text-sm sm:text-base font-semibold truncate max-w-[160px] sm:max-w-[240px]">
                {player?.name || "N/A"}
                {player.age && (
                  <p className="text-white border border-white px-2 py-0.5 text-xs font-semibold rounded shrink-0 w-fit ml-8">
                    {player.age}
                  </p>
                )}
                {player.gender && (
                  <p className="text-white border border-white px-2 py-0.5 text-xs font-semibold rounded shrink-0 w-fit ml-1">
                    {player.gender == "male" ? "M" : "F"}
                  </p>
                )}
              </div>
              <div className="text-[#d4e5e8] text-xs truncate">
                {player?.phone || "N/A"}
              </div>
            </div>

            <div className="ml-2 w-14 sm:w-16 text-center flex-shrink-0">
              <span className="bg-[#1b4542] text-[#fdf7c3] px-2 sm:px-3 py-1 rounded-full font-extrabold text-lg sm:text-xl border border-white">
                {player?.total_point || 0}
              </span>
            </div>
          </div>

          <div className="mt-1">
            <div className="flex gap-1 mb-1 overflow-x-auto">
              {currentSectionRanks.map((headerRank) => (
                <div
                  key={headerRank}
                  className="w-6 h-5 sm:w-8 sm:h-6 flex items-center justify-center text-xs sm:text-sm font-bold text-white rounded bg-[#28495e] border border-[#4eb0a2]"
                >
                  {headerRank}
                </div>
              ))}
            </div>

            <div className="flex gap-1 overflow-x-auto">
              {currentSectionRanks.map((r) => {
                const found = player.result_details?.find(
                  (i) => Number(i.rank) === Number(r)
                );
                return (
                  <div
                    key={r}
                    className={`w-6 h-6 sm:w-8 sm:h-7 flex items-center justify-center border-b-2 rounded font-bold ${found
                      ? "bg-white text-[#092733] border-[#7ea1af]"
                      : "bg-[#7ea1af] bg-opacity-50 border-[#528189] text-xs"
                      }`}
                  >
                    {found ? found.point : ""}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* IMAGE */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center ml-3 flex-shrink-0">
          <Image
            src={playerImageUrl}
            alt={player?.name || "Player"}
            width={96}
            height={96}
            className="object-cover w-full h-full rounded-lg shadow-md"
            unoptimized
            onError={(e) => (e.currentTarget.src = Logo.src)}
          />
        </div>
      </div>
    </motion.div>
  );
};

/* ---------------- MAIN COMPONENT ---------------- */

const MinileaguePlayers = ({ ladderId }) => {
  const dispatch = useDispatch();
  const { data: sectionedPlayers, appliedAge, appliedAgeType, appliedGender } =
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
    if (appliedAge > 0) {
      payload.dob = appliedAge;
      payload.age_type = appliedAgeType;
    }
    if (appliedGender) {
      payload.gender = appliedGender;
    }
    try {
      await dispatch(fetchMiniLeague(payload));
    } finally {
      setLoadingPlayers(false);
      isRefreshingRef.current = false;
    }
  }, [ladderId, dispatch, appliedAge, appliedAgeType, appliedGender]);

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
          onAgeSearch={(age, ageType, gender) => {
            const ageNum = age ? Number(age) : "";
            dispatch(setAgeFilter({ age: ageNum, ageType, gender }));
          }}
          onClearFilters={() => {
            dispatch(setAgeFilter({ age: 0, ageType: "under", gender: "" }));
          }}
          activeFilters={
            Boolean(searchQuery) ||
            appliedAge > 0 ||
            Boolean(appliedGender)
          }
          defaultAge={appliedAge}
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
        />
      )}

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
};

export default MinileaguePlayers;
