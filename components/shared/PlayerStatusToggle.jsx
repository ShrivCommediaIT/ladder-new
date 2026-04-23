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

  // Logic based on the user prop (boolean)
  let isEditable = user === false; // Admin level if user={false}

  if (user === true) {
    // User level if user={true}
    if (typeof window !== "undefined") {
      const storedUser = sessionStorage.getItem("user") || sessionStorage.getItem("userData");
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          if (
            (parsed.id && player.id && Number(parsed.id) === Number(player.id)) ||
            (parsed.id && player.user_id && Number(parsed.id) === Number(player.user_id))
          ) {
            isEditable = true;
          }
        } catch (e) {
          console.error("Error parsing user from session storage", e);
        }
      }
    }
  }

  const handleToggle = (checked) => {
    if (!isEditable) return;
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

  // If user level (user={true}) and not the owner, show only the radio button (colored dot)
  if (user === true && !isEditable) {
    return (
      <div className="flex items-center justify-center py-1">
        <div 
          className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 ${
            isActive 
              ? "bg-emerald-500 border-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]" 
              : "bg-red-500 border-red-400 shadow-[0_0_8px_rgba(239,68,68,0.5)]"
          }`}
        />
      </div>
    );
  }

  // Otherwise (admin or owner), show the toggle switch
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
