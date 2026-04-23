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
import RedeemModal from "./RedeemModal";
import { getRequest } from "@/services/apiService";
import EditPlayer from "../../shared/EditPlayer";
import PlayerStatusToggle from "../../shared/PlayerStatusToggle";

// ✅ Player Card
const PlayerCard = ({ player, rank, onRedeemClick, onEditClick, currentUser }) => {

  const playerImageUrl = player.image
    ? `${IMAGE_BASE_URL}/${player.image}`
    : Logo;

  return (
    <div
      onClick={() => onEditClick(player)}
      className="flex flex-col mb-3 rounded-lg bg-[#1a2f3d] border border-[#4eb0a2] cursor-pointer hover:bg-[#244252] transition-colors overflow-hidden"
    >
      <div
        className="flex justify-between items-center px-4 py-2"
        onClick={(e) => e.stopPropagation()}
      >
        <PlayerStatusToggle player={player} user={false} />
      </div>

      <div className="flex items-center justify-between px-3 py-4">
        {/* ===== DESKTOP VIEW (1024px+) ===== */}
        <div className="hidden md:flex items-center w-full">
          {/* Rank + Name */}
          <div className="flex gap-3 items-center flex-shrink-0 w-[35%]">
            {/* Avatar */}
            <div className="flex-shrink-0 flex justify-end">
              <div className="w-10 h-10 rounded border border-[#4eb0a2] flex items-center justify-center overflow-hidden flex-shrink-0">
                {playerImageUrl ? (
                  <Image src={playerImageUrl} alt={player.name} width={40} height={40} className="object-cover" unoptimized />
                ) : (
                  <div className="text-[#48aaa8] text-[9px] text-center leading-tight font-medium">your<br />avatar</div>
                )}
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex items-center min-w-0">
                <div className="text-white font-semibold text-sm truncate">{player?.name ?? "N/A"}</div>
                {player?.age && (
                  <div className="text-white border border-white px-1.5 py-0.5 text-[10px] leading-none font-semibold rounded shrink-0 w-fit ml-5">
                    {player.age}
                  </div>
                )}
              </div>
              <div className="text-gray-300 text-xs truncate flex items-center gap-2">
                <span>{player?.phone ?? "N/A"}</span>
              </div>
            </div>
          </div>

          {/* Status + Tokens */}
          <div className="flex flex-col gap-1 flex-shrink-0 w-[35%]">
            <div className="border border-white text-white text-xs px-2 py-0.5 w-fit">
              {"status : " + player?.token_status ?? "Status: Club Icon"}
            </div>
            <div className="text-white text-sm">
              Tokens - {player?.today_token ?? "N/A"}{" "}
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  onRedeemClick(player);
                }}
                className="text-[#48aaa8] font-semibold cursor-pointer hover:underline"
              >
                Redeem
              </span>
            </div>
          </div>

          {/* Total */}
          <div className="flex-shrink-0 w-[15%] text-white text-xs">
            Total = {player?.total_token ?? "N/A"}
          </div>

          <div className="w-8 h-8 rounded-full bg-[#48aaa8] text-white font-bold flex items-center justify-center text-sm flex-shrink-0">
            {rank}
          </div>

        </div>

        {/* ===== MOBILE / TABLET VIEW (below 1024px) ===== */}
        <div className="flex md:hidden items-center justify-between w-full gap-2">

          {/* Left: Rank + Name + Phone + Redeem */}
          <div className="flex items-start gap-2 flex-1 min-w-0">
            <div className="w-7 h-7 rounded-full bg-[#48aaa8] text-white font-bold flex items-center justify-center text-xs flex-shrink-0 mt-1">
              {rank}
            </div>
            <div className="flex flex-col min-w-0">
              <div className="border border-white text-white text-[10px] px-1.5 py-0.5 w-fit mb-1 leading-tight">
                {"status : " + player?.token_status ?? "Status: Club Legend"}
              </div>
              <div className="flex items-center min-w-0">
                <div className="text-white font-bold text-xs truncate">{player?.name ?? "N/A"}</div>
                {player?.age && (
                  <div className="text-white border border-white px-1.5 py-0.5 text-[10px] leading-none font-semibold rounded shrink-0 w-fit ml-2">
                    {player.age}
                  </div>
                )}
              </div>
              <div className="text-gray-300 text-[10px] truncate flex items-center gap-1.5">
                <span>{player?.phone ?? "N/A"}</span>
              </div>
              <div className="text-white text-[11px] mt-0.5">
                {player?.today_token ?? "N/A"} to{" "}
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    onRedeemClick(player);
                  }}
                  className="text-[#48aaa8] font-semibold cursor-pointer hover:underline"
                >
                  Redeem
                </span>
              </div>
            </div>
          </div>

          {/* Center: Total Tokens */}
          <div className="flex flex-col items-center flex-shrink-0">
            <div className="text-white text-[10px] font-medium text-center leading-tight">Total<br />Tokens</div>
            <div className="bg-white text-black font-bold text-base px-3 py-0.5 mt-1 min-w-[44px] text-center rounded-sm">
              {player?.total_token ?? "N/A"}
            </div>
          </div>

          {/* Right: Avatar */}
          <div className="w-11 h-11 rounded flex items-center justify-center flex-shrink-0 overflow-hidden bg-gray-200">
            {playerImageUrl ? (
              <Image src={playerImageUrl} alt={player.name} width={44} height={44} className="object-cover" unoptimized />
            ) : (
              <div className="text-[#48aaa8] text-[9px] text-center leading-tight font-medium">your<br />avatar</div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

// ✅ MAIN COMPONENT — ROSTER ONLY
const RosterLeaderboard = () => {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const ladderId = searchParams.get("ladder_id");

  const ladderType = searchParams.get("type");

  const { data, ladderDetails, gradebarDetails, loading, error } = useSelector(
    (state) => state.rosterLeaderboard,
  );
  const currentUser = useSelector((state) => state.user?.user);

  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [redeemOpen, setRedeemOpen] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [editPlayerId, setEditPlayerId] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const refreshRef = useRef(false);

  // ✅ Fetch roster leaderboard only
  const loadRoster = useCallback(() => {
    if (!ladderId ?? refreshRef.current) return;
    refreshRef.current = true;

    dispatch(fetchRosterLeaderboard({ ladder_id: ladderId })).finally(() => {
      setTimeout(() => (refreshRef.current = false), 1000);
    });
  }, [ladderId, dispatch]);

  useEffect(() => {
    loadRoster();
  }, [loadRoster]);


  // ✅ search + alphabet priority sort
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

  // step 3 — alphabet priority + token sort + rank sort
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

    // ⭐ second priority: more total tokens on top
    const aTokens = Number(a.total_token || 0);
    const bTokens = Number(b.total_token || 0);
    if (aTokens !== bTokens) {
      return bTokens - aTokens;
    }

    // fallback → rank sort
    return Number(a.rank || 0) - Number(b.rank || 0);
  });

  // ✅ group by gradebar preset (roster section)
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

  const handleRedeemClick = async (player) => {
    setSelectedPlayer(player);
    setRedeemOpen(true);
    setLoadingHistory(true);

    try {
      const admin = JSON.parse(sessionStorage.getItem("adminDetails"));

      const data = await getRequest("/user/tokenHistory", {
        user_id: player.name,
        admin_id: admin.id
      });

      if (data.status === true) {
        setHistoryData(data.data || []);
      } else {
        setHistoryData([]);
      }
    } catch (err) {
      console.error(err);
      setHistoryData([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleEditClick = (player) => {
    setEditPlayerId(player.id);
    setEditOpen(true);
  };


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
                rank={i + 1}
                onRedeemClick={handleRedeemClick}
                onEditClick={handleEditClick}
                currentUser={currentUser}
              />
            ))}
          </div>
        )))}
      <RedeemModal
        open={redeemOpen}
        onClose={() => setRedeemOpen(false)}
        player={selectedPlayer}
        history={historyData}
        loading={loadingHistory}
      />

      {/* Edit Player Modal */}
      <EditPlayer
        open={editOpen}
        onClose={() => setEditOpen(false)}
        currentId={editPlayerId}
        ladderId={ladderId}
      />
    </div>

  );
};

export default RosterLeaderboard;
