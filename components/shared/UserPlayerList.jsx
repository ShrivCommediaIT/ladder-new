"use client";
import { IMAGE_BASE_URL } from "@/constants/api";

import { CardContent } from "@/components/ui/card";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import Logo from "@/public/logo.jpg";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchLeaderboard,
  setSelectedPlayer,
} from "@/redux/slices/leaderboardSlice";
import { EditPlayer } from "./EditPlayer";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { fetchUserProfile } from "@/redux/slices/profileSlice";
import PlayerSearchInput from "./PlayerSearchInput";
import LadderLink from "./LadderLink";
import { useSearchParams } from "next/navigation";

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

const UserPlayerList = () => {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();

  const urlLadderId = searchParams.get("ladder_id");
  const user = useSelector((state) => state.user?.user);
  const ladderId = urlLadderId || user?.ladder_id;

  const { players, selectedPlayer } = useSelector((state) => state.player);
  const ladderTypeFromUrl = searchParams.get("type") || searchParams.get("ladder_type");
  const gradebarDetails = useSelector(
    (state) => state.player?.gradebarDetails?.[ladderId] || []
  );
  const profile = useSelector((state) => state.profile?.data);

  const playerList = players?.[ladderId]?.data || [];
  const imagePath = players?.[ladderId]?.image_path || "";

  const [isOpen, setIsOpen] = useState(false);
  const [moveLoading, setMoveLoading] = useState(false);
  const [loadingPlayers, setLoadingPlayers] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const subscription = user?.subscription;
  const isSubscribed = subscription !== null;

  useEffect(() => {
    if (ladderId && !players?.[ladderId]) {
      setLoadingPlayers(true);
      dispatch(fetchLeaderboard({ ladder_id: ladderId, type: ladderTypeFromUrl })).finally(() =>
        setLoadingPlayers(false)
      );
    }
  }, [dispatch, ladderId, players, ladderTypeFromUrl]);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchUserProfile(user.id));
    }
  }, [dispatch, user?.id]);

  const filteredPlayers = searchQuery
    ? playerList.filter((player) =>
      player.name?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : playerList;

  const uniqueFilteredPlayers = Array.from(
    new Map(filteredPlayers.map((p) => [p.id, p])).values()
  );

  const generateGrades = (players, gradebarDetails = []) => {
    const chunkSize = 10;
    return players.reduce((acc, _, i) => {
      if (i % chunkSize === 0) {
        const gradeIndex = Math.floor(i / chunkSize);
        const label =
          gradebarDetails[gradeIndex]?.gradebar_name ||
          `GRADE ${String.fromCharCode(65 + gradeIndex)}`;
        acc.push({
          label,
          players: players.slice(i, i + chunkSize),
        });
      }
      return acc;
    }, []);
  };

  return (
    <div className="p-4 space-y-6 relative">
      {playerList.length > 0 && (
        <div className="w-full">
          <div className="flex">
            {user?.user_type === "admin" && <LadderLink />}
            <PlayerSearchInput value={searchQuery} onChange={setSearchQuery} />
          </div>
        </div>
      )}

      {moveLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 z-50 bg-white/70 backdrop-blur-sm flex items-center justify-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="flex items-center gap-3 p-6 rounded-lg bg-white/80 shadow-md"
          >
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </motion.div>
        </motion.div>
      )}

      {loadingPlayers ? (
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-md" />
          ))}
        </CardContent>
      ) : uniqueFilteredPlayers.length === 0 ? (
        <div className="text-center py-10 text-gray-400 font-bold">No players found</div>
      ) : (
        <div className="space-y-8">
          {generateGrades(uniqueFilteredPlayers, gradebarDetails).map(
            (grade, gradeIndex) => (
              <div key={gradeIndex} className="space-y-2">
                <h2 className="text-md font-bold bg-orange-500 text-white px-4 py-1 rounded w-fit shadow-sm uppercase">
                  {grade.label}
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-3">
                  {grade.players.map((player, index) => {
                    const isActive = selectedPlayer?.id === player.id;
                    const canEdit =
                      user?.user_type === "admin" || user?.id === player.id;
                    const isAllowed = isSubscribed || index < 10;

                    const playerImageUrl = player.image
                      ? `${IMAGE_BASE_URL}/${player.image}?t=${Date.now()}`
                      : Logo;

                    return (
                      <motion.div
                        key={player.id || index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.03 }}
                      >
                        <div
                          onClick={() => {
                            if (!isAllowed) {
                              toast.warning(
                                "Upgrade your subscription to access more players."
                              );
                              return;
                            }
                            if (!canEdit) {
                              toast.warning("You may only tap on your name");
                              return;
                            }
                            dispatch(
                              setSelectedPlayer({
                                ...player,
                                ladder_id: ladderId,
                                type: ladderTypeFromUrl,
                              })
                            );
                            setIsOpen(true);
                          }}
                          className={`flex flex-col gap-2 items-center rounded-md shadow-md py-3 px-4 transition-all
                            ${player.player_status === 1
                              ? "bg-green-300"
                              : isActive
                                ? "bg-yellow-300"
                                : "bg-blue-100 dark:bg-gray-800"
                            }
                            ${isAllowed && canEdit
                              ? "cursor-pointer hover:scale-[1.01]"
                              : "cursor-not-allowed opacity-40 grayscale"
                            }`}
                        >
                          <div className="flex items-center w-full gap-3">
                            <PlayerRankBadge rank={player.rank} sizeClass="h-12 w-12 sm:h-16 sm:w-16 mr-2" imgSize={64} textClass="text-xs sm:text-sm" />
                            <Image
                              src={playerImageUrl}
                              className="rounded-full w-12 h-12 object-cover border border-gray-300"
                              width={48}
                              height={48}
                              alt={`Player ${player.name}`}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="text-gray-900 flex items-center gap-2 text-sm sm:text-base font-semibold truncate">
                                {player?.name || "N/A"}
                                {player.age !== null && player.age !== undefined && player.age !== "" && (
                                  <p
                                    className="text-xs font-semibold px-2 py-0.5 rounded shrink-0 w-fit ml-8"
                                    style={{
                                      background: "var(--best-board-accent-soft)",
                                      color: "white",
                                      border: "1px solid var(--best-board-border-strong)",
                                    }}
                                  >
                                    Age : {player.age}
                                  </p>
                                )}
                                {player.gender && (
                                  <p
                                    className="text-xs font-semibold px-2 py-0.5 rounded shrink-0 w-fit ml-1"
                                    style={{
                                      background: "var(--best-board-accent-soft)",
                                      color: "white",
                                      border: "1px solid var(--best-board-border-strong)",
                                    }}
                                  >
                                    Gender: {player.gender === "male" ? "M" : "F"}
                                  </p>
                                )}
                              </div>
                              <div className="text-gray-600 text-xs truncate">
                                {player?.phone || "N/A"}
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )
          )}
        </div>
      )}

      {selectedPlayer && (
        <EditPlayer
          open={isOpen}
          onClose={() => {
            setIsOpen(false);
            dispatch(setSelectedPlayer(null));
            if (user?.id) {
              dispatch(fetchUserProfile(user?.id));
            }
            if (ladderId) {
              dispatch(fetchLeaderboard({ ladder_id: ladderId, type: ladderTypeFromUrl }));
            }
          }}
          currentId={selectedPlayer?.id}
          setLoading={setMoveLoading}
        />
      )}
    </div>
  );
};

export default UserPlayerList;