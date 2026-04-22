"use client";
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
import { Skeleton } from "@/components/ui/skeleton";
import PlayerSearchInput from "../players/PlayerSearchInput";
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
}) => {
  if (isBlank) {
    return (
      <div
        className="flex items-center min-h-[18vh] justify-center px-2 py-2 mb-3 rounded-lg shadow"
        style={{ background: "#223848", border: "2px dashed #4eb0a2" }}
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onClick={canEdit ? onClick : undefined}
      className={`flex items-center justify-between px-2 py-2 mb-3 rounded-lg shadow transition-all font-sans sm:px-4 sm:py-3 relative ${
        canEdit
          ? "cursor-pointer hover:bg-[#143238]"
          : "opacity-60 cursor-not-allowed"
      }`}
      style={{
        background: "#223848",
        border: "2px solid #4eb0a2",
      }}
    >
      <div className="absolute top-2 left-2 z-20 group">
        <div className="bg-white rounded-full flex items-center justify-center cursor-pointer shadow-sm border border-gray-200" style={{ padding: '2px' }}>
          <input 
            type="radio" 
            name={`status_${player.id}`} 
            value={player.player_status} 
            checked 
            readOnly
            className={`w-3.5 h-3.5 outline-none cursor-pointer ${Number(player.player_status) === 1 ? 'accent-green-500' : 'accent-red-600'}`} 
          />
        </div>
        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 hidden group-hover:block bg-black/80 text-white text-[10px] font-semibold px-2 py-1 rounded whitespace-nowrap shadow border border-white/10 z-30 pointer-events-none">
          {Number(player.player_status) === 1 ? 'Active' : 'Inactive'}
        </div>
      </div>
      {/* LEFT */}
      <div className="flex-1 min-w-0 overflow-hidden mt-8">
        <div className="flex w-full items-center mb-2 min-w-0">
          <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#48aaa8] border-2 border-white text-lg sm:text-2xl font-bold text-white mr-2 shrink-0">
            {rank}
          </div>

          <div className="flex-1 min-w-0 overflow-hidden mb-3">
            <div className="text-white flex items-center align-center gap-2 text-sm sm:text-base font-semibold truncate max-w-[160px] sm:max-w-[240px]">
              {player?.name || "N/A"}   
              {player.age && (
              <p className="text-white ml-10 border border-white px-2 py-0.5 text-xs font-semibold rounded shrink-0 w-fit ml-8">
                {player.age}
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
                  className={`w-6 h-6 sm:w-8 sm:h-7 flex items-center justify-center border-b-2 rounded font-bold ${
                    found
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
    </motion.div>
  );
};

/* ---------------- MAIN COMPONENT ---------------- */

const MinileaguePlayers = ({ ladderId }) => {
  const dispatch = useDispatch();
  const sectionedPlayers =
    useSelector((state) => state.minileague?.data) || [];

  const user =
    typeof window !== "undefined"
      ? JSON.parse(sessionStorage.getItem("user") || "null")
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
    try {
      await dispatch(
        fetchMiniLeague({ ladder_id: ladderId, type: "minileague" })
      );
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
        <PlayerSearchInput value={searchQuery} onChange={setSearchQuery} />
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
            <div className="mb-3 sticky top-0 bg-[#223848] px-4 py-2 rounded-lg shadow-lg text-xl text-white font-bold tracking-wide z-10">
              {section.label}
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
          setLoading={() => {}}
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
