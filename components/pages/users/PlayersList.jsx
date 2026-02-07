
// ============================== 16-12-2025 wihout score boxes ====================

"use client";
import Image from "next/image";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { fetchLeaderboard } from "@/redux/slices/leaderboardSlice";
import { fetchGradebars } from "@/redux/slices/gradebarSlice";
import { EditPlayer } from "@/components/shared/EditPlayer";
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

export default function PlayersList() {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();

  /* ------------------ GET FROM SEARCH PARAMS ------------------ */

  const ladderId = Number(searchParams.get("ladder_id"));
  const ladderTypeFromParams = searchParams.get("ladder_type");

  /* ------------------ LOGGED IN USER (LOCALSTORAGE) ------------------ */

  const loggedInUser = useMemo(() => {
    if (typeof window === "undefined") return null;
    return JSON.parse(localStorage.getItem("user") || "null");
  }, []);

  const loggedInUserId = Number(
    loggedInUser?.id || null
  );

  /* ------------------ REDUX ------------------ */

  const players =
    useSelector((state) => state.player?.players?.[ladderId]?.data) || [];

  const gradebarDetails =
    useSelector((state) => state.gradebar?.gradebarDetails) || [];

  const preset = useSelector((state) => state.gradebar?.preset || 7);

  const ladderDetails =
    useSelector((state) => state.player?.players?.[ladderId]?.ladderDetails) ||
    {};

  const ladderType =
    ladderTypeFromParams ||
    ladderDetails?.type?.toLowerCase() ||
    "bestof5";

  /* ------------------ STATES ------------------ */

  const [cacheBuster, setCacheBuster] = useState(Date.now());
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");

  /* ------------------ FETCH DATA ------------------ */

  const refreshData = useCallback(() => {
    if (ladderId && ladderType) {
      dispatch(
        fetchLeaderboard({
          ladder_id: ladderId,
          type:
            ladderType === "best3" || ladderType === "winlose"
              ? ladderType
              : "bestof5",
        })
      );
      dispatch(fetchGradebars(ladderId));
      setCacheBuster(Date.now());
    }
  }, [dispatch, ladderId, ladderType]);

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

    const isCurrentUser =
      String(loggedInUserId) === String(player.id);

    if (!isCurrentUser) {
      setDialogMessage("You can only edit your own profile");
      setIsDialogOpen(true);
      return;
    }

    setSelectedPlayerId(player.id);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedPlayerId(null);
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
        <PlayerSearch searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      </div>

      {/* NO PLAYERS */}
      {grades.length === 0 && (
        <p className="text-gray-500 text-center mt-6">No players found</p>
      )}

      {/* PLAYERS LIST */}
      {grades.map((grade, gradeIndex) => (
        <div key={gradeIndex} className="mt-8 px-4">
          <div className="mb-3 sticky top-0 bg-[#223848] px-4 py-2 rounded-lg shadow-lg text-xl text-white font-bold tracking-wide z-10">
            {grade.label}
          </div>

          <div className="space-y-3">
            {grade.players.map((player, pidx) => {
              const playerImageUrl = player.image
                ? `https://ne-games.com/leaderBoard/public/admin/clip-one/assets/user/original/${player.image}?t=${cacheBuster}`
                : "/logo.jpg";

              const isCurrentUser =
                String(loggedInUserId) === String(player.id);

              return (
                <motion.div
                  key={`${player.id}-${cacheBuster}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: pidx * 0.03 }}
                  onClick={() => handlePlayerClick(player)}
                  className={`flex items-center justify-between px-2 py-2 mb-3 rounded-lg shadow transition-all font-sans sm:px-4 sm:py-3 ${
                    isCurrentUser
                      ? "cursor-pointer hover:bg-[#143238]"
                      : "opacity-60 cursor-not-allowed"
                  }`}
                  style={{
                    background: "#223848",
                    border: "2px solid #4eb0a2",
                  }}
                >
                  {/* LEFT */}
                  <div className="flex-1">
                    <div className="flex w-full items-center mb-2">
                      <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#48aaa8] border-2 border-white text-lg sm:text-2xl font-bold text-white mr-2 shrink-0">
                        {player.rank || pidx + 1}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="text-white text-sm sm:text-base font-semibold truncate">
                          {player?.name || "N/A"}
                        </div>
                        <div className="text-[#d4e5e8] text-xs truncate">
                          {player?.phone || "N/A"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT AVATAR */}
                  <div className="w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center ml-3 shrink-0">
                    <Image
                      src={playerImageUrl}
                      alt={player.name}
                      width={96}
                      height={96}
                      className="object-cover w-full h-full rounded"
                      unoptimized
                    />
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
  />
)}


      {/* NOTICE */}
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
