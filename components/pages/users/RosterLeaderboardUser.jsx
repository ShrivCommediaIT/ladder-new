"use client";
import PlayerRankBadge from "@/components/shared/PlayerRankBadge";
import { IMAGE_BASE_URL } from "@/constants/api";
import Image from "next/image";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Skeleton } from "@/components/ui/skeleton";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSearchParams } from "next/navigation";
import { fetchRosterLeaderboard } from "@/redux/slices/rosterLeaderboardSlice";
import { setAgeFilter } from "@/redux/slices/leaderboardSlice";
import Logo from "@/public/logo1.png";
import RedeemModal from "../roster/RedeemModal";
import { getRequest } from "@/services/apiService";
import { EditPlayer } from "@/components/shared/EditPlayer";
import PlayerStatusToggle from "@/components/shared/PlayerStatusToggle";
import PlayerSearch from "./PlayerSearch";



/* ---------------- PLAYER CARD ---------------- */
const PlayerCard = ({ player, rank, onRedeemClick, onEditClick, loggedInUserId }) => {
  const isCurrentUser = String(loggedInUserId) === String(player.id);

  const playerImageUrl = player.image
    ? `${IMAGE_BASE_URL}/${player.image}`
    : Logo;

  return (
    <div
      onClick={() => isCurrentUser && onEditClick(player)}
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
          {player.gender && (
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
              {isCurrentUser && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRedeemClick(player);
                  }}
                  className="text-cyan-400 hover:text-cyan-300 font-bold text-xs sm:text-sm cursor-pointer underline decoration-cyan-400 decoration-[1.5px]"
                >
                  Redeem
                </button>
              )}
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

/* ---------------- MAIN COMPONENT ---------------- */
const RosterLeaderboardUser = ({ ladderId: propLadderId }) => {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const ladderId = propLadderId || searchParams.get("ladder_id");

  const { data, gradebarDetails, loading, error } = useSelector((state) => state.rosterLeaderboard);
  const { appliedAge, appliedAgeType, appliedGender } = useSelector((state) => state.player || {});
  const reduxUser = useSelector((state) => state.user?.user);

  const [currentUserId, setCurrentUserId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [redeemOpen, setRedeemOpen] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editPlayerId, setEditPlayerId] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("user") || sessionStorage.getItem("userData");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed?.id) setCurrentUserId(Number(parsed.id));
        } catch (e) {}
      }
    }
  }, []);

  const loggedInUserId = reduxUser?.id ? Number(reduxUser.id) : currentUserId;

  const loadData = useCallback(() => {
    if (!ladderId) return;
    const payload = { ladder_id: ladderId, type: "roster" };
    if (appliedAge > 0) {
      payload.dob = appliedAge;
      payload.age_type = appliedAgeType;
    }
    if (appliedGender) payload.gender = appliedGender;

    dispatch(fetchRosterLeaderboard(payload));
  }, [ladderId, dispatch, appliedAge, appliedAgeType, appliedGender]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filtering & Sorting
  const filteredPlayers = (data || []).filter(p => 
    !searchTerm || p.name?.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  const sortedPlayers = [...filteredPlayers].sort((a, b) => {
    if (!searchTerm) return 0;
    const q = searchTerm.toLowerCase().trim();
    const aStarts = a.name?.toLowerCase().startsWith(q);
    const bStarts = b.name?.toLowerCase().startsWith(q);
    if (aStarts && !bStarts) return -1;
    if (!aStarts && bStarts) return 1;
    return 0;
  });

  // Removed sections grouping to display a continuous flat list of players

  const handleRedeemClick = async (player) => {
    setSelectedPlayer(player);
    setRedeemOpen(true);
    setLoadingHistory(true);
    try {
      const user = JSON.parse(sessionStorage.getItem("user") || sessionStorage.getItem("userData") || "{}");
      const admin = JSON.parse(sessionStorage.getItem("adminDetails"));
      const res = await getRequest("/user/tokenHistory", {
        user_id: player.name,
        admin_id: admin.id
      });
      if (res.status) setHistoryData(res.data || []);
      else setHistoryData([]);
    } catch (err) {
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
    <div className="w-full">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
      
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mt-4 px-4 mb-6">
        <PlayerSearch 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onAgeSearch={(age, ageType, gender) => {
            const ageNum = age ? Number(age) : "";
            dispatch(setAgeFilter({ age: ageNum, ageType, gender }));
          }}
          onClearFilters={() => {
            dispatch(setAgeFilter({ age: 0, ageType: "under", gender: "" }));
          }}
          activeFilters={
            Boolean(searchTerm) ||
            appliedAge > 0 ||
            Boolean(appliedGender)
          }
          defaultAge={appliedAge}
        />
      </div>

      {loading && (
        <div className="px-4 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg bg-gray-700" />
          ))}
        </div>
      )}

      {error && <div className="text-red-400 text-center py-10">{error}</div>}

      {!loading && sortedPlayers.length === 0 ? (
        <div className="text-center py-10 text-gray-400 font-bold">No players found</div>
      ) : (
        !loading && (
          <div className="px-4 space-y-3">
            {sortedPlayers.map((player, i) => (
              <PlayerCard
                key={player.id}
                player={player}
                rank={player.rank || (i + 1)}
                onRedeemClick={handleRedeemClick}
                onEditClick={handleEditClick}
                loggedInUserId={loggedInUserId}
              />
            ))}
          </div>
        )
      )}

      <RedeemModal
        open={redeemOpen}
        onClose={() => setRedeemOpen(false)}
        player={selectedPlayer}
        data={historyData}
        loading={loadingHistory}
        onRedeemSuccess={() => {
          handleRedeemClick(selectedPlayer);
          loadData();
        }}
      />

      <EditPlayer
        open={editOpen}
        onClose={() => {
          setEditOpen(false);
          loadData();
        }}
        currentId={editPlayerId}
        ladderId={ladderId}
        ladder_type="roster"
        userLevel={true}
      />
    </div>
  );
};

export default RosterLeaderboardUser;
