

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
import { fetchLeaderboard, uploadCSV } from "@/redux/slices/leaderboardSlice";

const LeaderBoard = () => {
  const dispatch = useDispatch();
  const { playersData, loading, error } = useSelector((state) => state);
  const user = useSelector((state) => state.user?.user);
  const ladderId = user?.ladder_id;

  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [file, setFile] = useState(null);

  useEffect(() => {
    dispatch(fetchLeaderboard());
  }, [dispatch]);


  return (
    <div className="p-4 space-y-2">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    

      {/* 🧭 Feedback */}
      {loading && <p className="text-sm text-blue-500">Loading players...</p>}
      {error && <p className="text-sm text-red-500">Error: {error}</p>}

      {/* 📋 Player Cards */}
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {(playersData || []).map((player, index) => {
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
                  className={`flex gap-4 rounded-md shadow-md py-3 px-4 items-center justify-start transition
                    ${isActive ? "bg-yellow-300" : "bg-blue-100 hover:bg-blue-200"}
                    ${!canEdit ? "opacity-70 cursor-not-allowed" : "cursor-pointer"}
                  `}
                >
                  <span className="font-semibold text-lg">{index + 1}</span>
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
              </DialogTrigger>

              {/* ✏️ Only Show Modal if Editable */}
              {canEdit && selectedPlayer?.id === player.id && (
                <DialogContent onInteractOutside={(e) => e.preventDefault()}>
                  <EditPlayer key={selectedPlayer.id} player={selectedPlayer} />
                </DialogContent>
              )}
            </Dialog>
          );
        })}
      </CardContent>
    </div>
  );
};

export default LeaderBoard;
