"use client";
import { IMAGE_BASE_URL } from "@/constants/api";

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
import PlayerStatusToggle from "../../shared/PlayerStatusToggle";
import { EditPlayer } from "../../shared/EditPlayer";

// Player Card
const PlayerCard = ({ player, rank, currentUser, onClick }) => {
  const playerImageUrl = player.image
    ? `${IMAGE_BASE_URL}/${player.image}`
    : Logo;

  const isCurrentUser = Number(currentUser?.id) === Number(player.id);

  return (
    <div
      onClick={onClick}
      className="flex flex-col mb-3 rounded-lg shadow bg-[#223848] border-2 border-[#4eb0a2] overflow-hidden cursor-pointer"
    >
      <div
        className="flex justify-between items-center px-4 py-2"
        onClick={(e) => e.stopPropagation()}
      >
        <PlayerStatusToggle player={player} user={true} />
      </div>

      <div className="flex items-center justify-between px-3 py-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#48aaa8] text-white font-bold flex items-center justify-center">
            {rank}
          </div>

          <div className="flex-1 min-w-0">
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
        </div>

        <div className="flex flex-col items-center">
          <div className="text-white text-[10px] font-medium text-center leading-tight">Total<br />Tokens</div>
          <div className="bg-white text-black font-bold text-base px-3 py-0.5 mt-1 min-w-[44px] text-center rounded-sm">
            {player?.total_token ?? "N/A"}
          </div>
        </div>

        <div className="w-11 h-11 rounded flex items-center justify-center flex-shrink-0 overflow-hidden bg-gray-200">
          <Image
            src={playerImageUrl}
            alt={player?.name || "Player"}
            width={44}
            height={44}
            className="object-cover w-full h-full"
            unoptimized
            onError={(e) => (e.currentTarget.src = Logo.src)}
          />
        </div>
      </div>
    </div>);
};

// MAIN COMPONENT — ROSTER ONLY
const RosterLeaderboard = () => {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const ladderId = searchParams.get("ladder_id");
  const ladderType = searchParams.get("type") || "roster";

  const { data, ladderDetails, gradebarDetails, loading, error } = useSelector(
    (state) => state.rosterLeaderboard,
  );
  const reduxUser = useSelector((state) => state.user?.user);
  const [sessionUser, setSessionUser] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("user") || sessionStorage.getItem("userData");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.id) {
            setSessionUser(parsed);
          }
        } catch (e) {
          console.error("Failed to parse user session", e);
        }
      }
    }
  }, []);

  const currentUser = reduxUser?.id ? reduxUser : sessionUser;
  const currentUserId = Number(currentUser?.id || null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  const handlePlayerClick = (player) => {
    const isCurrentUser = Number(currentUserId) === Number(player.id);
    const isAdmin = currentUser?.user_type?.toLowerCase() === "admin";

    if (isCurrentUser || isAdmin) {
      setSelectedPlayerId(player.id);
      setIsModalOpen(true);
    } else {
      toast.info("You can only edit your own details.");
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedPlayerId(null);
  };

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
      {!loading && sections.length === 0 ? (
        <div className="text-center py-10 text-gray-400 font-bold">No players found</div>
      ) : (
        !loading &&
        sections.map((section, idx) => (
          <div key={idx}>
            {section.players.map((player, i) => (
              <PlayerCard
                key={player.id}
                player={player}
                rank={player.rank || i + 1}
                currentUser={currentUser}
                onClick={() => handlePlayerClick(player)}
              />
            ))}
          </div>
        )))}

      {isModalOpen && (
        <EditPlayer
          open={isModalOpen}
          onClose={handleModalClose}
          currentId={selectedPlayerId}
          ladderId={ladderId}
          ladder_type="roster"
        />
      )}
    </div>
  );
};

export default RosterLeaderboard;
