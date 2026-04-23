

"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Logo from "@/public/logo.jpg";
import { EditPlayer } from "./EditPlayer";
import PlayerStatusToggle from "@/components/shared/PlayerStatusToggle";
import { fetchLeaderboard, uploadCSV } from "@/redux/slices/leaderboardSlice";
import { useSearchParams } from "next/navigation";

const LeaderBoard = () => {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const urlType = searchParams.get("type") || searchParams.get("ladder_type");
  const urlLadderId = searchParams.get("ladder_id");
  const { playersData, loading, error } = useSelector((state) => state);
  const user = useSelector((state) => state.user?.user);
  const ladderId = urlLadderId || user?.ladder_id;

  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [file, setFile] = useState(null);

  // ✅ No independent fetch here — parent (PlayerLists.jsx) already handles initial load.
  // Data is read directly from Redux state via the 'players' selector in parent components.


  return (
    <div className="p-4 space-y-2">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    

      {/* 🧭 Feedback */}
      {loading && <p className="text-sm text-blue-500">Loading players...</p>}
      {error && <p className="text-sm text-red-500">Error: {error}</p>}

      {/* 📋 Player Cards */}
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {!loading && (playersData || []).length === 0 ? (
          <div className="text-center py-10 text-gray-400 font-bold col-span-full">No players found</div>
        ) : (
          (playersData || []).map((player, index) => {
            const isActive = selectedPlayer?.id === player.id;
            const isSelf = user?.id === player.id;
            const isAdmin = user?.user_type === "admin";
            const canEdit = isAdmin || isSelf;

            return (
              <Dialog
                key={player.id || index}
                onOpenChange={(isOpen) => {
                  if (!isOpen) setSelectedPlayer(null);
                }}
              >
                <DialogTrigger asChild>
                  <div
                    onClick={() => {
                      if (canEdit) {
                        setSelectedPlayer(player);
                      } else {
                        toast.warning("You can only edit your own profile.");
                      }
                    }}
                  >
                    <div className="flex flex-col w-full gap-2">
                      <div className="flex justify-between items-start mb-1 px-1">
                        <PlayerStatusToggle player={player} user={false} />
                      </div>
                       <div className="flex gap-4 items-center">
                         <Image
                          src={Logo}
                          className="rounded-full w-10 h-10"
                          width={40}
                          height={40}
                          alt={`Player ${index + 1}`}
                         />
                         <p className="truncate">
                           {player.name || player.username || "Unknown"}
                         </p>
                       </div>
                    </div>
                  </div>
                </DialogTrigger>

                {/* ✏️ Only Show Modal if Editable */}
                {canEdit && selectedPlayer?.id === player.id && (
                  <DialogContent onInteractOutside={(e) => e.preventDefault()}>
                    <EditPlayer key={selectedPlayer.id} player={selectedPlayer} />
                  </DialogContent>
                )}
              </Dialog>
            );
          })
        )}
      </CardContent>
    </div>
  );
};

export default LeaderBoard;
