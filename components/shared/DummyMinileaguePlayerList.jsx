"use client";
import { IMAGE_BASE_URL } from "@/constants/api";
import Image from "next/image";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { fetchMiniLeague } from "@/redux/slices/minileagueSlice";
import { setSelectedPlayer } from "@/redux/slices/leaderboardSlice";
import { MinileagueEditPlayer } from "@/components/shared/MinileagueEditPlayer";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Logo from "@/public/logo1.png";
import PlayerPerformationRanking from "./PlayerPerformationRanking";

const PlayerCard = ({ player, rank, canEdit, isAllowed, isBlank, onClick, groupSize }) => {
  if (isBlank) {
    return (
      <div
        className="flex items-center min-h-[18vh] justify-center px-2 py-2 mb-3 rounded-lg shadow"
        style={{ background: "#223848", border: "2px dashed #4eb0a2" }}
      />
    );
  }

  const playerImageUrl = player?.image
    ? `${IMAGE_BASE_URL}/${player.image}?t=${Date.now()}`
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
      onClick={onClick}
      className={`flex items-center justify-between px-2 py-2 mb-3 rounded-lg shadow transition-all font-sans sm:px-4 sm:py-3 ${
        isAllowed && canEdit
          ? "cursor-pointer hover:bg-[#143238]"
          : "opacity-70 cursor-not-allowed"
      }`}
      style={{
        background: "#223848",
        border: "2px solid #4eb0a2",
      }}
    >
      {/* ✅ LEFT CONTENT – FIXED OVERFLOW */}
      <div className="flex-1 min-w-0 overflow-hidden">
        <div className="flex w-full items-center mb-2 min-w-0">

          {/* RANK */}
          <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#48aaa8] border-2 border-white text-lg sm:text-2xl font-bold text-white mr-2 shrink-0">
            {rank}
          </div>

          {/* NAME + PHONE */}
          <div className="flex-1 min-w-0 overflow-hidden">
            <div className="text-white flex items-center gap-2 text-sm sm:text-base font-semibold truncate max-w-[160px] sm:max-w-[240px]">
              {player?.name || "N/A"}   
              {player.age && (
              <p className="text-white border border-white px-2 py-0.5 text-xs font-semibold rounded shrink-0 w-fit">
                {player.age}
              </p>
            )}
            </div>
            <div className="text-[#d4e5e8] text-xs truncate">
              {player?.phone || "N/A"}
            </div>
          </div>

          {/* TOTAL POINT */}
          <div className="ml-2 w-14 sm:w-16 text-center flex-shrink-0">
            <span className="bg-[#1b4542] text-[#fdf7c3] px-2 sm:px-3 py-1 rounded-full font-extrabold text-lg sm:text-xl border border-white">
              {player?.total_point || 0}
            </span>
          </div>
        </div>

        {/* SCORE BOXES */}
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

      {/* ✅ IMAGE – LOCKED, NEVER OVERFLOWS */}
      <div className="w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center ml-3 flex-shrink-0">
        <Image
          src={playerImageUrl}
          alt={player?.name}
          width={96}
          height={96}
          className="object-cover w-full h-full rounded"
          unoptimized
        />
      </div>
    </motion.div>
  );
};

export default function DummyPlayerList({ ladderId }) {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user?.user);
  const subscription = useSelector((state) => state.user?.subscription);

  // ✅ Minileague slice data
  const sectionedPlayers = useSelector((state) => state.minileague?.data) || [];
  const minileagueLoading = useSelector((state) => state.minileague?.loading) || false;
  const ladderDetails = useSelector((state) => state.minileague?.ladderDetails) || {};
  const ladderType = ladderDetails?.type || "minileague";
  const gradebarDetails = useSelector((state) => state.minileague?.gradebars) || [];
  const preset = 7; // Fixed for minileague or get from gradebar

  // ✅ All states from MinileaguePlayers
  const [allowedUsers, setAllowedUsers] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const isRefreshingRef = useRef(false);

  const totalSlots = 7;

  // ✅ SAME SUBSCRIPTION LOGIC
  useEffect(() => {
    const baseUsers = 10;
    if (subscription) {
      const expiry = new Date(subscription?.subscription_expired_date);
      const now = new Date();
      if (expiry > now) {
        const extraUsers = subscription?.no_of_users ? Number(subscription.no_of_users) : 0;
        setAllowedUsers(baseUsers + extraUsers);
      } else {
        setAllowedUsers(baseUsers);
      }
    } else {
      setAllowedUsers(baseUsers);
    }
  }, [subscription]);

  // ✅ Fetch minileague data
  const refreshLeaderboard = useCallback(async () => {
    if (!ladderId || isRefreshingRef.current) return;
    isRefreshingRef.current = true;
    try {
      await dispatch(fetchMiniLeague({ ladder_id: ladderId }));
    } finally {
      isRefreshingRef.current = false;
    }
  }, [ladderId, dispatch]);

  useEffect(() => {
    refreshLeaderboard();
  }, [refreshLeaderboard]);

  // ✅ SAME HANDLE PLAYER CLICK LOGIC
  const handlePlayerClick = (player, globalIndex) => {
    if (!user) {
      setDialogMessage("Please login first");
      setIsDialogOpen(true);
      return;
    }

    const isAdmin = user?.user_type?.toLowerCase() === "admin";
    const isCurrentUser = String(user?.id) === String(player.id || player.user_id);
    const isAllowed = globalIndex < allowedUsers || isAdmin;

    if (!isAllowed) {
      toast.warning("Upgrade your subscription to access more players.");
      return;
    }

    if (isAdmin || isCurrentUser) {
      let sectionIndex = -1;
      for (let i = 0; i < sectionedPlayers.length; i++) {
        const users = sectionedPlayers[i]?.users_record || sectionedPlayers[i]?.users || [];
        if (users.some(p => Number(p.id) === Number(player.id || player.user_id))) {
          sectionIndex = i;
          break;
        }
      }

      const playerWithSection = {
        ...player,
        sectionIndex: sectionIndex >= 0 ? sectionIndex : 0,
        ladder_id: Number(ladderId)
      };

      setSelectedPlayerId(playerWithSection.id || playerWithSection.user_id);
      dispatch(setSelectedPlayer(playerWithSection));
      setIsModalOpen(true);
    } else {
      setDialogMessage("You can only edit your own profile");
      setIsDialogOpen(true);
    }
  };

  // ✅ Generate sections from minileague data (same as MinileaguePlayers)
  const finalSections = sectionedPlayers.map((sec) => {
    const filteredPlayers = searchTerm
      ? (sec?.users_record || []).filter((p) =>
          p?.name?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : sec?.users_record || [];

    const blankCount = Math.max(0, totalSlots - filteredPlayers.length);

    return {
      label: sec?.section || `Section ${sec.id || ''}`,
      players: filteredPlayers,
      blankCount,
    };
  });

  return (
    <div className="w-full relative">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />

      {/* ✅ LADDER TITLE - From DummyPlayerList */}
      {ladderDetails?.name && (
        <div className="py-4 text-center sm:text-left px-4">
          <h2 className="text-2xl font-bold text-white">{ladderDetails.name}</h2>
          <p className="text-gray-200 text-md border-b-2 border-amber-500 py-1 font-semibold">
            Admin: {ladderDetails.admin_name} ({ladderDetails.admin_phone})
          </p>
        </div>
      )}

      {/* ✅ SEARCH - Enhanced from DummyPlayerList */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mt-4 px-4">
        <input
          type="text"
          placeholder="Search players..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value.trimStart())}
          className="w-full rounded-md border border-gray-600 bg-[#223848] text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#4eb0a2]"
        />
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mt-4 px-4">
        <PlayerPerformationRanking ladderId={ladderId} />
      </div>

      {/* ✅ LOADING & NO PLAYERS */}
      {minileagueLoading ? (
        Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-16 w-full mx-4" />)
      ) : finalSections.length === 0 ? (
        <div className="text-center py-10 text-gray-400 font-bold">No players found</div>
      ) : (
        finalSections.map((section, idx) => (
          <div key={idx} className="mt-8 px-4">
            {/* ✅ SECTION HEADER */}
            <div className="mb-3 sticky top-0 bg-[#223848] px-4 py-2 rounded-lg shadow-lg text-xl text-white font-bold tracking-wide z-10">
              {section.label}
            </div>

            <div className="space-y-3">
              {section.players.map((player, pidx) => {
                const globalIndex = idx * totalSlots + pidx;
                const canEdit = user?.user_type?.toLowerCase() === "admin" || 
                                String(user?.id) === String(player.id || player.user_id);
                const isAllowed = globalIndex < allowedUsers || canEdit;

                return (
                  <PlayerCard
                    key={player.id || pidx}
                    player={player}
                    rank={player.rank || globalIndex + 1}
                    isAllowed={isAllowed}
                    canEdit={canEdit}
                    ladderType={ladderType}
                    preset={preset}
                    groupSize={totalSlots}
                    onClick={() => handlePlayerClick(player, globalIndex)}
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

      {/* ✅ MODAL & DIALOG */}
      {isModalOpen && (
        <MinileagueEditPlayer
          open={isModalOpen}
          currentId={selectedPlayerId}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedPlayerId(null);
          }}
          setLoading={() => {}}
        />
      )}

      <div className="flex justify-center items-center">
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md w-[80vw]">
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
    </div>
  );
}
