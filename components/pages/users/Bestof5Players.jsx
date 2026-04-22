"use client";
import { IMAGE_BASE_URL } from "@/constants/api";
import Image from "next/image";
import React, { useEffect, useState } from "react";
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

export default function Bestof5Players() {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();

  // ✅ ladder params
  const ladderId = searchParams.get("ladder_id");
  const ladderTypeFromParams = searchParams.get("type");

  // ✅ user from localStorage
  const userData =
    typeof window !== "undefined"
      ? JSON.parse(sessionStorage.getItem("userData") || "{}")
      : {};

  let effectiveUserId = null;
  let effectiveUserType = userData?.user_type || null;

  if (effectiveUserType === "admin") {
    effectiveUserId = userData?.id;
  } else if (effectiveUserType === "sub_admin") {
    effectiveUserId = userData?.user_id;
  }

  const user = {
    id: effectiveUserId,
    user_type: effectiveUserType,
  };

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

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [appliedAge, setAppliedAge] = useState(0);

  // ================== FETCH DATA ==================
  useEffect(() => {
    if (ladderId) {
      const payload = { ladder_id: Number(ladderId), type: ladderType };
      if (appliedAge > 0) {
        payload.dob = appliedAge;
      }
      dispatch(fetchLeaderboard(payload));
      dispatch(fetchGradebars(Number(ladderId)));
    }
  }, [dispatch, ladderId, ladderType, appliedAge]);

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

    const isAdmin = user?.user_type?.toLowerCase() === "admin";
    const isCurrentUser = String(user?.id) === String(player.id);

    if (isAdmin || isCurrentUser) {
      setSelectedPlayerId(player.id);
      setIsModalOpen(true);
    } else {
      toast.warning("You can only edit your own profile");
    }
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
        <PlayerSearch searchTerm={searchTerm} setSearchTerm={setSearchTerm} onAgeSearch={(age) => setAppliedAge(Number(age))} />
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
              const isAdmin = user?.user_type?.toLowerCase() === "admin";
              const isCurrentUser = String(user?.id) === String(player.id);
              const canEdit = isAdmin || isCurrentUser;

              const playerImageUrl = player.image
                ? `${IMAGE_BASE_URL}/${player.image}`
                : "/logo.jpg";

              return (
                <motion.div
                  key={player.id || pidx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => canEdit && handlePlayerClick(player)}
                  className={`flex items-center justify-between px-2 py-2 mb-3 rounded-lg shadow transition-all relative ${canEdit
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
                  <div className="flex-1 min-w-0 mt-6">
                    <div className="text-white flex items-center gap-2 text-sm sm:text-base font-semibold truncate">
                      {player?.name || "N/A"}
                      {player.age && (
                        <p className="text-white border border-white px-2 py-0.5 text-xs font-semibold rounded shrink-0 w-fit ml-8">
                          {player.age}
                        </p>
                      )}
                    </div>
                    <div className="text-[#d4e5e8] text-xs truncate">
                      {player?.phone || "N/A"}
                    </div>
                  </div>

                  <div className="w-20 h-20 flex items-center justify-center ml-3">
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

      {/* EDIT */}
      {isModalOpen && (
        <EditPlayer
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          currentId={selectedPlayerId}
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

