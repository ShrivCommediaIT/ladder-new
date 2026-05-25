"use client";
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

const PlayerRankBadge = ({ rank, sizeClass = "h-12 w-12 sm:h-16 sm:w-16", imgSize = 64, textClass = "text-xs sm:text-sm" }) => {
  const rankNum = Number(rank);
  let src = "/ranksImg/rank.png";
  let scaleClass = "scale-[1.22] group-hover:scale-[1.34]";
  if (rankNum === 1) {
    src = "/ranksImg/rank-1.png";
    scaleClass = "scale-100 group-hover:scale-110";
  } else if (rankNum === 2) {
    src = "/ranksImg/rank-2.png";
    scaleClass = "scale-[1.15] group-hover:scale-[1.26]";
  } else if (rankNum === 3) {
    src = "/ranksImg/rank-3.png";
    scaleClass = "scale-[1.15] group-hover:scale-[1.26]";
  }

  return (
    <div className={`relative flex shrink-0 items-center justify-center select-none ${sizeClass}`}>
      <Image
        src={src}
        alt={`Rank ${rank}`}
        width={imgSize}
        height={imgSize}
        className={`object-contain transition-transform duration-200 ${scaleClass} ${sizeClass}`}
        unoptimized
      />
      <span className={`absolute inset-0 flex items-center justify-center font-black text-white drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.95)] ${textClass}`}>
        {rank}
      </span>
    </div>
  );
};

/* ---------------- PLAYER CARD ---------------- */
const PlayerCard = ({ player, rank, onRedeemClick, onEditClick, loggedInUserId }) => {
  const isCurrentUser = String(loggedInUserId) === String(player.id);
  
  const playerImageUrl = player.image
    ? `${IMAGE_BASE_URL}/${player.image}`
    : Logo;

  return (
    <div
      onClick={() => isCurrentUser && onEditClick(player)}
      className={`flex flex-col mb-3 rounded-lg bg-[#1a2f3d] border border-[#4eb0a2] overflow-hidden transition-all ${
        isCurrentUser ? "cursor-pointer hover:bg-[#244252]" : "opacity-70 grayscale-[0.5]"
      }`}
    >
      <div
        className="flex justify-between items-center px-4 py-2"
        onClick={(e) => e.stopPropagation()}
      >
        <PlayerStatusToggle player={player} user={true} forceDisabled={!isCurrentUser} />
      </div>

      <div className="flex items-center justify-between px-3 py-4">
        {/* ===== DESKTOP VIEW (1024px+) ===== */}
        <div className="hidden md:flex items-center w-full">
          <div className="flex gap-3 items-center flex-shrink-0 w-[35%]">
            <div className="flex-shrink-0 flex justify-end">
              <div className="w-10 h-10 rounded border border-[#4eb0a2] flex items-center justify-center overflow-hidden flex-shrink-0">
                <Image 
                  src={playerImageUrl} 
                  alt={player.name} 
                  width={40} 
                  height={40} 
                  className="object-cover" 
                  unoptimized 
                  onError={(e) => (e.currentTarget.src = Logo.src)}
                />
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
                 {player.gender && (
                  <p className="text-white border border-white px-1.5 py-0.5 text-[10px] leading-none font-semibold rounded shrink-0 w-fit ml-1">
                    {player.gender == "male" ?"M":"F"}
                  </p>
                )}
              </div>
              <div className="text-gray-300 text-xs truncate flex items-center gap-2">
                <span>{player?.phone ?? "N/A"}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1 flex-shrink-0 w-[35%]">
            <div className="border border-white text-white text-xs px-2 py-0.5 w-fit">
              {"status : " + (player?.token_status || "Newcomer")}
            </div>
            <div className="text-white text-sm">
              Tokens - {player?.today_token ?? 0}{" "}
              {isCurrentUser && (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    onRedeemClick(player);
                  }}
                  className="text-[#48aaa8] font-semibold cursor-pointer hover:underline ml-1"
                >
                  Redeem
                </span>
              )}
            </div>
          </div>

          <div className="flex-shrink-0 w-[15%] text-white text-xs">
            Total = {player?.total_token ?? 0}
          </div>

          <PlayerRankBadge rank={rank} sizeClass="h-12 w-12 sm:h-16 sm:w-16" imgSize={64} textClass="text-xs sm:text-sm" />
        </div>

        {/* ===== MOBILE VIEW ===== */}
        <div className="flex md:hidden items-center justify-between w-full gap-2">
          <div className="flex items-start gap-2 flex-1 min-w-0">
            <PlayerRankBadge rank={rank} sizeClass="h-12 w-12 sm:h-16 sm:w-16 mt-1" imgSize={64} textClass="text-xs sm:text-sm" />
            <div className="flex flex-col min-w-0">
              <div className="border border-white text-white text-[10px] px-1.5 py-0.5 w-fit mb-1 leading-tight">
                {"status : " + (player?.token_status || "Newcomer")}
              </div>
              <div className="flex items-center min-w-0">
                <div className="text-white font-bold text-xs truncate">{player?.name ?? "N/A"}</div>
                {player?.age && (
                  <div className="text-white border border-white px-1.5 py-0.5 text-[10px] leading-none font-semibold rounded shrink-0 w-fit ml-2">
                    {player.age}
                  </div>
                )}
                 {player.gender && (
                  <p className="text-white border border-white px-1.5 py-0.5 text-[10px] leading-none font-semibold rounded shrink-0 w-fit ml-1">
                    {player.gender == "male" ?"M":"F"}
                  </p>
                )}
              </div>
              <div className="text-gray-300 text-[10px] truncate">
                {player?.phone ?? "N/A"}
              </div>
              <div className="text-white text-[11px] mt-0.5">
                {player?.today_token ?? 0} Tokens{" "}
                {isCurrentUser && (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      onRedeemClick(player);
                    }}
                    className="text-[#48aaa8] font-semibold cursor-pointer hover:underline ml-1"
                  >
                    Redeem
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center flex-shrink-0">
            <div className="text-white text-[10px] font-medium text-center leading-tight">Total<br />Tokens</div>
            <div className="bg-white text-black font-bold text-base px-3 py-0.5 mt-1 min-w-[44px] text-center rounded-sm">
              {player?.total_token ?? 0}
            </div>
          </div>

          <div className="w-11 h-11 rounded flex items-center justify-center flex-shrink-0 overflow-hidden bg-[#223848] border border-[#4eb0a2]">
            <Image 
              src={playerImageUrl} 
              alt={player.name} 
              width={44} 
              height={44} 
              className="object-cover" 
              unoptimized 
              onError={(e) => (e.currentTarget.src = Logo.src)}
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

  // Grouping
  const groupSize = 7;
  const sections = [];
  for (let i = 0; i < sortedPlayers.length; i += groupSize) {
    sections.push({
      label: gradebarDetails?.[i / groupSize]?.gradebar_name || `Minileague ${i / groupSize + 1}`,
      players: sortedPlayers.slice(i, i + groupSize),
    });
  }

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

      {!loading && sections.length === 0 ? (
        <div className="text-center py-10 text-gray-400 font-bold">No players found</div>
      ) : (
        !loading && sections.map((section, idx) => (
          <div key={idx} className="mb-8 px-4">
            <div className="space-y-3">
              {section.players.map((player, i) => (
                <PlayerCard
                  key={player.id}
                  player={player}
                  rank={player.rank || (idx * groupSize + i + 1)}
                  onRedeemClick={handleRedeemClick}
                  onEditClick={handleEditClick}
                  loggedInUserId={loggedInUserId}
                />
              ))}
            </div>
          </div>
        ))
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
      />
    </div>
  );
};

export default RosterLeaderboardUser;
