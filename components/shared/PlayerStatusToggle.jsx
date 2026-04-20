"use client";

import React from "react";
import { useDispatch } from "react-redux";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { changePlayerStatus } from "@/redux/slices/leaderboardSlice";
import { toast } from "react-toastify";

const PlayerStatusToggle = ({ player, user }) => {
  const dispatch = useDispatch();



  const isActive = Number(player?.player_status) === 1;

  const handleToggle = (checked) => {
    const newStatus = checked ? 1 : 0;
    
    dispatch(changePlayerStatus({ user_id: player.id, player_status: newStatus }))
      .unwrap()
      .then(() => {
        toast.success(`${player.name} is now ${checked ? "Active" : "Inactive"}`);
      })
      .catch((err) => {
        toast.error(err || "Failed to update status");
      });
  };

  return (
    <div 
      className="flex items-center gap-2 bg-black/20 px-2 py-1 rounded-full border border-white/5"
      onClick={(e) => e.stopPropagation()} // 🛑 Prevent opening edit modal
    >
      <Switch
        id={`status-${player.id}`}
        checked={isActive}
        onCheckedChange={handleToggle}
        className="data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-zinc-600 scale-75 sm:scale-100"
      />
      <Label 
        htmlFor={`status-${player.id}`}
        className={`text-[10px] sm:text-xs font-bold uppercase transition-colors ${
          isActive ? "text-emerald-400" : "text-white"
        }`}
      >
        {isActive ? "Active" : "Inactive"}
      </Label>
    </div>
  );
};

export default PlayerStatusToggle;
