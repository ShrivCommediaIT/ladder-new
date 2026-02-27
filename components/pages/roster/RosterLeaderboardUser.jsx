"use client";

import Image from "next/image";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Skeleton } from "@/components/ui/skeleton";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchRosterLeaderboard } from "@/redux/slices/rosterLeaderboardSlice";
import Logo from "@/public/logo1.png";
import LadderLinkPanel from "../players/LadderLinkPanel";

// Player Card
const PlayerCard = ({ player, rank }) => {
  const playerImageUrl = player.image
    ? `https://ne-games.com/leaderBoard/public/admin/clip-one/assets/user/original/${player.image}`
    : Logo;

  return (
    <div className="flex items-center justify-between px-3 py-3 mb-3 rounded-lg shadow bg-[#223848] border-2 border-[#4eb0a2]">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-[#48aaa8] text-white font-bold flex items-center justify-center">
          {rank}
        </div>

        <div>
          <div className="text-white font-semibold">
            {player?.name || "N/A"}
          </div>
          <div className="text-gray-300 text-sm">{player?.phone || "N/A"}</div>
        </div>
      </div>

      <Image
        src={playerImageUrl}
        alt={player.name}
        width={70}
        height={70}
        className="rounded object-cover"
        unoptimized
      />
    </div>
  );
};

// MAIN COMPONENT — ROSTER ONLY
const RosterLeaderboard = () => {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const ladderId = searchParams.get("ladder_id");

  const ladderType = searchParams.get("type");

  const { data, ladderDetails, gradebarDetails, loading, error } = useSelector(
    (state) => state.rosterLeaderboard,
  );

  const [searchQuery, setSearchQuery] = useState("");
  const refreshRef = useRef(false);

  // ✅ Fetch roster leaderboard only
  const loadRoster = useCallback(() => {
    if (!ladderId || refreshRef.current) return;
    refreshRef.current = true;

    dispatch(fetchRosterLeaderboard({ ladder_id: ladderId })).finally(() => {
      setTimeout(() => (refreshRef.current = false), 1000);
    });
  }, [ladderId, dispatch]);

  useEffect(() => {
    loadRoster();
  }, [loadRoster]);


  // search + alphabet priority sort
const cleaned = searchQuery.toLowerCase().trim();

let working = data || [];

// step 1 — filter if search present
if (cleaned) {
  working = working.filter((p) =>
    p.name?.toLowerCase().includes(cleaned),
  );
}

// step 2 — unique
const uniquePlayers = Array.from(
  new Map(working.map((p) => [p.id, p])).values(),
);

// step 3 — alphabet priority + rank sort
const sortedPlayers = [...uniquePlayers].sort((a, b) => {
  const aName = a.name?.toLowerCase() || "";
  const bName = b.name?.toLowerCase() || "";

  // ⭐ priority: startsWith searched letter
  if (cleaned) {
    const aStarts = aName.startsWith(cleaned);
    const bStarts = bName.startsWith(cleaned);

    if (aStarts && !bStarts) return -1;
    if (!aStarts && bStarts) return 1;
  }

  // fallback → rank sort
  return Number(a.rank || 0) - Number(b.rank || 0);
});



  const filtered = cleaned
    ? data.filter((p) =>
        p.name?.toLowerCase().replace(/\s+/g, "").includes(cleaned),
      )
    : data;


  // group by gradebar preset (roster section)
  const groupSize = 6;

  const sections = [];
  for (let i = 0; i < sortedPlayers.length; i += groupSize) {
    sections.push({
      label:
        gradebarDetails?.[i / groupSize]?.gradebar_name ||
        `Section ${i / groupSize + 1}`,
      players: sortedPlayers.slice(i, i + groupSize),
    });
  }

  return (
    <div className="space-y-5">
      <ToastContainer />

      {/* Ladder Name */}
      {/* <h1 className="text-3xl font-bold text-white">
        {ladderDetails?.name || "Roster"}
      </h1> */}

      <div>
        <LadderLinkPanel ladderId={ladderId} ladderType={ladderType} />
      </div>

      {/* Search */}
      <input
        placeholder="Search player..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full px-3 py-2 rounded bg-gray-800 text-white border"
      />

      {/* Loading */}
      {loading &&
        Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-md" />
        ))}

      {/* Error */}
      {error && <div className="text-red-400">{error}</div>}

      {/* Sections */}
      {!loading &&
        sections.map((section, idx) => (
          <div key={idx}>
            {/* <div className="bg-gradient-to-r from-[#0f3a4a] to-[#1e60aa] text-white font-bold px-4 py-2 rounded mb-3">
            {section.label}
          </div> */}

            {section.players.map((player, i) => (
              <PlayerCard
                key={player.id}
                player={player}
                rank={player.rank || i + 1}
              />
            ))}
          </div>
        ))}
    </div>
  );
};

export default RosterLeaderboard;
