"use client";
import { IMAGE_BASE_URL } from "@/constants/api";
import Image from "next/image";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchLeaderboard,
  setSelectedPlayer,
} from "@/redux/slices/leaderboardSlice";
import { EditPlayer } from "./EditPlayer";
import { Skeleton } from "@/components/ui/skeleton";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { fetchUserProfile } from "@/redux/slices/profileSlice";
import PlayerSearchInput from "./PlayerSearchInput";
import LadderLinkPanel from "./LadderLinkPanel";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchGradebars } from "@/redux/slices/gradebarSlice";
import { paymentPage } from "@/helper/RouteName";
import Logo from "@/public/logo.jpg";

// ✅ FIXED GROUP SIZE
const FIXED_GROUP_SIZE = 7;

/* -------------------- PLAYER CARD -------------------- */
const PlayerCard = ({
  player,
  rank,
  canEdit,
  isAllowed,
  onSelect,
  ladderType,
}) => {
  const playerImageUrl = player.image
    ? `${IMAGE_BASE_URL}/${player.image}?t=${Date.now()}`
    : Logo;

  return (
    <div
      onClick={() => {
        if (!isAllowed) return onSelect("proDialog");
        if (!canEdit) return onSelect("toastWarning");
        onSelect("select", player);
      }}
      className={`flex items-center justify-between px-2 py-2 mb-3 rounded-lg shadow transition-all font-sans ${
        isAllowed && canEdit
          ? "cursor-pointer hover:bg-[#143238]"
          : "opacity-70 cursor-not-allowed"
      }`}
      style={{
        background: "#223848",
        border: "2px solid #4eb0a2",
      }}
    >
      <div className="flex-1">
        <div className="flex items-center mb-2">
          <div className="w-8 h-8 flex items-center justify-center rounded-full bg-[#48aaa8] border-2 border-white text-white font-bold mr-2">
            {rank}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white font-semibold truncate">
              {player?.name || "N/A"}
            </div>
            <div className="text-[#d4e5e8] text-xs truncate">
              {player?.phone || "N/A"}
            </div>
          </div>
          <div className="ml-2">
            <span className="bg-[#1b4542] text-[#fdf7c3] px-3 py-1 rounded-full font-bold">
              {player.total_point || 0}
            </span>
          </div>
        </div>
      </div>

      <div className="w-20 h-20 ml-3">
        <Image
          src={playerImageUrl}
          alt={player.name}
          width={80}
          height={80}
          className="rounded object-cover"
          unoptimized
        />
      </div>
    </div>
  );
};

/* -------------------- MAIN COMPONENT -------------------- */
const Minileague = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const ladderId = searchParams.get("ladder_id");

  const user = useSelector((state) => state.user?.user);
  const subscription = useSelector((state) => state.user?.subscription);
  const { players, selectedPlayer, loading } = useSelector(
    (state) => state.player
  );
  const { gradebarDetails } = useSelector((state) => state.gradebar);

  const [allowedUsers, setAllowedUsers] = useState(10);
  const [isOpen, setIsOpen] = useState(false);
  const [loadingPlayers, setLoadingPlayers] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isProDialogOpen, setIsProDialogOpen] = useState(false);
  const [localGradebars, setLocalGradebars] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const isRefreshingRef = useRef(false);

  const playerList = players?.[ladderId]?.data || [];

  /* ✅ Subscription Limit */
  useEffect(() => {
    const baseUsers = 10;
    if (subscription) {
      const expiry = new Date(subscription.subscription_expired_date);
      setAllowedUsers(
        expiry > new Date()
          ? baseUsers + Number(subscription.no_of_users || 0)
          : baseUsers
      );
    } else setAllowedUsers(baseUsers);
  }, [subscription]);

  useEffect(() => {
    if (user?.id) dispatch(fetchUserProfile(user.id));
  }, [user?.id, dispatch]);

  useEffect(() => {
    if (Array.isArray(gradebarDetails))
      setLocalGradebars(gradebarDetails);
  }, [gradebarDetails]);

  useEffect(() => {
    dispatch(setSelectedPlayer(null));
  }, [ladderId, dispatch]);

  const filteredPlayers = searchQuery
    ? playerList.filter((p) =>
        p.name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : playerList;

  const uniquePlayers = Array.from(
    new Map(filteredPlayers.map((p) => [p.id, p])).values()
  );

  /* ✅ FIXED 7 PLAYERS PER SECTION */
  const generateGrades = (playersArr) => {
    const out = [];
    for (let i = 0; i < playersArr.length; i += FIXED_GROUP_SIZE) {
      out.push({
        label: `Minileague ${Math.floor(i / FIXED_GROUP_SIZE) + 1}`,
        players: playersArr.slice(i, i + FIXED_GROUP_SIZE),
      });
    }
    return out;
  };

  const grades = generateGrades(uniquePlayers);

  const refreshLeaderboard = useCallback(async () => {
    if (!ladderId || isRefreshingRef.current) return;
    isRefreshingRef.current = true;
    setLoadingPlayers(true);
    setRefreshKey((prev) => prev + 1);

    try {
      await Promise.all([
        dispatch(fetchGradebars(ladderId)),
        dispatch(fetchLeaderboard({ ladder_id: ladderId })),
      ]);
    } finally {
      setLoadingPlayers(false);
      setTimeout(() => (isRefreshingRef.current = false), 1500);
    }
  }, [ladderId, dispatch]);

  useEffect(() => {
    if (ladderId) refreshLeaderboard();
  }, [ladderId, refreshLeaderboard]);

  const handlePurchase = () => router.push(paymentPage);

  return (
    <div className="space-y-6 relative" key={refreshKey}>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />

      {/* ✅ FIXED INFO */}
      <div className="bg-cyan-900 p-4 rounded-xl text-white font-bold text-center">
        Players Per Section Fixed: 7
      </div>

      {/* Search */}
      <div className="flex flex-col gap-3 md:flex-row md:justify-between">
        {user?.user_type?.toLowerCase() === "admin" && ladderId && (
          <LadderLinkPanel ladderId={ladderId} />
        )}
        <div className="w-full md:w-[40%]">
          <PlayerSearchInput value={searchQuery} onChange={setSearchQuery} />
        </div>
      </div>

      {/* Loading */}
      {loadingPlayers || loading ? (
        <>
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full mb-1" />
          ))}
        </>
      ) : (
        <div>
          {grades.map((section, idx) => (
            <React.Fragment key={idx}>
              <div className="my-3 bg-[#0f3a4a] px-4 py-2 rounded text-white font-bold">
                {section.label}
              </div>

              {section.players.map((player, pidx) => {
                const globalIndex = idx * FIXED_GROUP_SIZE + pidx;
                const canEdit =
                  user?.user_type?.toLowerCase() === "admin" ||
                  user?.id === player.user_id;
                const isAllowed = globalIndex < allowedUsers;

                return (
                  <PlayerCard
                    key={player.id}
                    player={player}
                    rank={player.rank || globalIndex + 1}
                    canEdit={canEdit}
                    isAllowed={isAllowed}
                    onSelect={(action, playerData) => {
                      if (action === "proDialog")
                        setIsProDialogOpen(true);
                      else if (action === "toastWarning")
                        toast.warning("You may only tap on your name");
                      else if (action === "select") {
                        dispatch(
                          setSelectedPlayer({
                            ...playerData,
                            ladder_id: ladderId,
                          })
                        );
                        setIsOpen(true);
                      }
                    }}
                  />
                );
              })}
            </React.Fragment>
          ))}
        </div>
      )}

      {selectedPlayer && (
        <EditPlayer
          open={isOpen}
          onClose={() => setIsOpen(false)}
          currentId={selectedPlayer?.id}
        />
      )}

      {isProDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 text-center space-y-4">
            <p className="text-lg font-bold">Premium Feature</p>
            <p>Please purchase first to unlock the ladder</p>
            <button
              onClick={handlePurchase}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              Purchase Ladder
            </button>
            <button
              onClick={() => setIsProDialogOpen(false)}
              className="ml-2 bg-gray-300 px-4 py-2 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Minileague;