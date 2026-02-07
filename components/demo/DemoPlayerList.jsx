"use client";

import React, { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useDispatch, useSelector } from "react-redux";
import { fetchLeaderboard } from "@/redux/slices/leaderboardSlice";
import { fetchGradebars } from "@/redux/slices/gradebarSlice";
import PlayerCard from "@/components/shared/PlayerCard";
import { EditPlayer } from "@/components/shared/EditPlayer";
import PlayerSearch from "./PlayerSearch";
import { motion } from "framer-motion";
import AvailableLabel from "@/components/shared/AvailableLabel";

export default function DemoPlayerList({ ladderId }) {
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [customRanks, setCustomRanks] = useState({}); // ✅ local state to override rank

  const user = useSelector((state) => state.user.user);
  const players = useSelector(
    (state) => state.player?.players?.[ladderId]?.data || []
  );

  console.log("user rank joe bloggs : ", user)

  const gradebarDetails = useSelector(
    (state) => state.gradebar?.gradebarDetails || []
  );
  const moveLoading = useSelector((state) => state.playerMoving?.loading);

  useEffect(() => {
    if (ladderId) {
      dispatch(fetchLeaderboard({ ladder_id: ladderId }));
      dispatch(fetchGradebars(ladderId));
    }
  }, [dispatch, ladderId]);

  const filteredPlayers = searchTerm
    ? players.filter((p) =>
        p.name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : players;

  const generateGrades = (players, gradebars = []) => {
    const chunkSize = 10;
    return players.reduce((acc, _, i) => {
      if (i % chunkSize === 0) {
        const gradeIndex = Math.floor(i / chunkSize);
        const label =
          gradebars[gradeIndex]?.gradebar_name ||
          `GRADE ${String.fromCharCode(65 + gradeIndex)}`;
        acc.push({
          label,
          players: players.slice(i, i + chunkSize),
        });
      }
      return acc;
    }, []);
  };

  const grades = generateGrades(filteredPlayers, gradebarDetails);

  const handlePlayerClick = (playerId) => {
    if (!user) {
      setDialogMessage("Please login first");
      setIsDialogOpen(true);
      return;
    }

    if (user?.user_type === "admin" || String(user?.id) === String(playerId)) {
      setSelectedPlayerId(playerId);
      setIsModalOpen(true);
    } else {
      setDialogMessage("You can only edit your own profile");
      setIsDialogOpen(true);
    }
  };

  // ✅ Reset player rank back to default
  const handleResetRank = (playerId, defaultRank) => {
    setCustomRanks((prev) => {
      const updated = { ...prev };
      delete updated[playerId]; // remove custom override
      return updated;
    });
  };

  return (
    <div className="w-full space-y-6 relative">
      {/* Loading Overlay */}
      {moveLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 z-50 flex items-center justify-center bg-white/10 backdrop-blur-sm"
        >
          <div className="loader w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </motion.div>
      )}

      {/* Search Input */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 mb-4">
        <PlayerSearch searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      </div>

      {grades.map((grade, gradeIndex) => (
  <div key={gradeIndex} className="mb-8">
    {/* Badge + AvailableLabel inline */}
    <div className="flex items-center gap-8">
      <Badge className="bg-orange-500 rounded-md py-2 px-6 text-md font-semibold uppercase">
        {grade.label}
      </Badge>
      {gradeIndex === 0 && <AvailableLabel />}
      {
        user?.user_id === "joebloggs@gmail.com" && (
          <div>
        <Button onClick={handleResetRank} className="bg-red-500 hover:bg-red-600 cursor-pointer">Reset Rank </Button>
      </div>
        )
      }
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 mt-4">
      {grade.players.length > 0 ? (
        grade.players.map((player) => {
          const isCurrentUser = String(user?.id) === String(player.id);
          const canEdit = isCurrentUser || user?.user_type === "admin";

          // ✅ Final Color Logic
          let bgColor = "bg-blue-100 dark:bg-blue-100"; // default
          if (isCurrentUser) {
            if (String(player.player_status) === "1") {
              bgColor = "bg-yellow-300";
            } else {
              bgColor = "bg-blue-100";
            }
          } else {
            if (String(player.player_status) === "1") {
              bgColor = "bg-green-400";
            } else {
              bgColor = "bg-blue-100";
            }
          }

          const displayedRank = customRanks[player.id] ?? player.rank; // ✅ use overridden rank if exists

          return (
            <div
              key={player.id}
              className={`relative flex flex-col gap-2 rounded-md shadow-lg py-3 px-4 transition-all
                ${bgColor}
                ${
                  canEdit
                    ? "cursor-pointer hover:scale-[1.01]"
                    : "cursor-not-allowed opacity-100"
                }
              `}
              onClick={() => handlePlayerClick(player.id)}
            >
              <PlayerCard
                name={player.name}
                phone={player.phone}
                rank={displayedRank}
                image={player.image}
              />

         
            </div>
          );
        })
      ) : (
        <p className="text-gray-500 col-span-full text-center">
          No players found
        </p>
      )}
    </div>
  </div>
))}


      {/* Edit Player Modal */}
      {isModalOpen && (
        <EditPlayer
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          currentId={selectedPlayerId}
        />
      )}

      {/* Confirmation Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md w-full">
          <DialogHeader>
            <DialogTitle>Notice</DialogTitle>
          </DialogHeader>
          <p className="py-2">{dialogMessage}</p>
          <DialogFooter>
            <Button onClick={() => setIsDialogOpen(false)}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}