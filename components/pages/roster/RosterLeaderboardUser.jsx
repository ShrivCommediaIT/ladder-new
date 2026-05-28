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
      className={`mb-3 rounded-xl transition-all duration-200 group overflow-hidden ${
        isCurrentUser ? "cursor-pointer" : "opacity-70 grayscale-[0.3]"
      }`}
      style={{
        background: "var(--best-board-surface)",
        border: isCurrentUser
          ? "2px solid var(--best-board-highlight)"
          : "1px solid var(--best-board-border-strong)",
        boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
      }}
    >
      {/* ── TOP STRIP: toggle + status + age/gender chips ── */}
      <div
        className="flex items-center justify-between px-2 sm:px-3 py-1.5 gap-2"
        style={{
          borderBottom: "1px solid var(--best-board-border)",
          background: "var(--secondary)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <PlayerStatusToggle player={player} user={true} forceDisabled={!isCurrentUser} />

        <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap justify-end">
          {player?.token_status && (
            <span
              className="text-[9px] sm:text-[10px] font-semibold px-2 py-0.5 rounded-full best-board-tag-soft"
            >
              Status: {player.token_status}
            </span>
          )}
          {player.age !== null && player.age !== undefined && player.age !== "" && (
            <span
              className="text-[9px] sm:text-[10px] font-semibold px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap best-board-tag-accent"
            >
              Age : {player.age}
            </span>
          )}
          {!!player.gender && (
            <span
              className="text-[9px] sm:text-[10px] font-semibold px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap best-board-tag-accent"
            >
              Gender: {player.gender === "male" ? "M" : "F"}
            </span>
          )}
        </div>
      </div>

      {/* ── MAIN BODY ── */}
      <div className="flex items-stretch px-2 sm:px-3 py-2 sm:py-2.5 gap-2 sm:gap-3">

        {/* LEFT SECTION: rank badge + name/phone/tokens */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 flex-1 min-w-0">
          <div className="flex flex-col items-center gap-1 flex-shrink-0">
            <PlayerRankBadge
              rank={rank}
              sizeClass="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14"
              imgSize={56}
              textClass="text-[10px] sm:text-xs md:text-sm"
            />
          </div>

          {/* Info block */}
          <div className="flex-1 min-w-0">
            {/* Player name */}
            <div
              className="text-xs sm:text-sm font-bold truncate mb-0.5 leading-tight best-board-text"
            >
              {player?.name || "N/A"}
            </div>

            {/* Phone */}
            <div
              className="text-[10px] sm:text-xs truncate mb-1.5 sm:mb-2 leading-tight best-board-muted"
            >
              {player?.phone || "N/A"}
            </div>

            {/* Tokens Section */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] sm:text-xs best-board-muted">Today:</span>
                <span
                  className="text-xs sm:text-sm font-bold px-2 py-0.5 rounded best-board-tag-soft"
                >
                  {player?.today_token ?? "0"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT SECTION: total tokens badge + avatar ── */}
        <div
          className="flex flex-col items-center justify-between gap-1.5 sm:gap-2 pl-2 sm:pl-3 flex-shrink-0"
          style={{ borderLeft: "1px solid var(--best-board-border)" }}
        >
          {/* Total Tokens badge */}
          <div
            className="flex flex-col items-center justify-center rounded-lg sm:rounded-xl px-1 sm:px-2 py-1 sm:py-1.5 w-[48px] sm:w-[56px] md:w-[60px]"
            style={{
              background: "var(--best-board-accent-soft)",
              border: "1px solid var(--best-board-border-strong)",
            }}
          >
            <span
              className="text-sm sm:text-base md:text-lg font-black leading-none w-full text-center truncate"
              style={{ color: "var(--best-board-highlight)" }}
            >
              {player?.total_token ?? 0}
            </span>
            <span
              className="text-[8px] sm:text-[9px] font-semibold uppercase tracking-wider mt-0.5"
              style={{ color: "var(--best-board-muted)" }}
            >
              Tokens
            </span>
          </div>

          {/* Player avatar */}
          <div
            className="rounded-md sm:rounded-lg overflow-hidden flex-shrink-0 w-[52px] h-[52px] sm:w-16 sm:h-16 md:w-[72px] md:h-[72px]"
            style={{ border: "1px solid var(--best-board-border-strong)" }}
          >
            <Image
              src={playerImageUrl}
              alt={player?.name || "Player"}
              width={72}
              height={72}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-200"
              unoptimized
            />
          </div>
        </div>

      </div>
    </div>
  );
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

  // Removed sections grouping to display a continuous flat list of players

  return (
    <div className="space-y-5">
      <ToastContainer />

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

      {!loading && sortedPlayers.length === 0 ? (
        <div className="text-center py-10 text-gray-400 font-bold">No players found</div>
      ) : (
        !loading && (
          <div className="space-y-3 mt-3">
            {sortedPlayers.map((player, i) => (
              <PlayerCard
                key={player.id}
                player={player}
                rank={player.rank || i + 1}
                currentUser={currentUser}
                onClick={() => handlePlayerClick(player)}
              />
            ))}
          </div>
        )
      )}

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
