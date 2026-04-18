"use client";
import { IMAGE_BASE_URL } from "@/constants/api";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchLeaderboard } from "@/redux/slices/leaderboardSlice";
import { fetchGradebars } from "@/redux/slices/gradebarSlice";
import Logo from "@/public/logo.jpg";
import PlayerPerformationRanking from "./PlayerPerformationRanking";

const PlayerCard = ({ player, rank, ladderType, preset }) => {
  const playerImageUrl = player.image
    ? `${IMAGE_BASE_URL}/${
        player.image
      }?t=${Date.now()}`
    : Logo;

  return (
    <div
      className={`flex items-center justify-between px-2 py-2 mb-3 rounded-lg shadow transition-all font-sans cursor-default sm:px-4 sm:py-3`}
      style={{
        background: "#223848",
        border: "2px solid #4eb0a2",
      }}
    >
      {/* LEFT CONTENT */}
      <div className="flex-1">
        <div className="flex w-full items-center mb-2">
          <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#48aaa8] border-2 border-white text-lg sm:text-2xl font-bold text-white mr-2 shrink-0">
            {rank}
          </div>

          <div className="flex-1 min-w-0">
            <div className="text-white flex items-center gap-2 text-sm sm:text-base font-semibold truncate">
              {player?.name || "N/A"}   
              {player.age && (
              <p className="text-white border border-white px-2 py-0.5 text-xs font-semibold rounded shrink-0 w-fit">
                {player.age}
              </p>
            )}
            </div>
            <div className="text-[#d4e5e8] text-xs truncate">
              {player?.phone || "N/A"}
            </div>
          </div>
        </div>
      </div>

      {/* ✅ RIGHT ALIGNED AVATAR */}
      <div className="w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center ml-3 shrink-0">
        <Image
          src={playerImageUrl}
          alt={player.name}
          width={96}
          height={96}
          className="object-cover w-full h-full rounded"
          unoptimized
        />
      </div>
    </div>
  );
};

export default function DummyPlayerList({ ladderId }) {
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState("");
  const ladderType = useSelector(
    (state) => state.player?.players[ladderId]?.ladderDetails?.type,
  );
  const players = useSelector(
    (state) => state.player?.players?.[ladderId]?.data || [],
  );
  const preset = useSelector((state) => state.gradebar?.preset || 10);
  const gradebarDetails = useSelector(
    (state) => state.gradebar?.gradebarDetails || [],
  );
  const ladderDetails = useSelector(
    (state) => state.player?.players?.[ladderId]?.ladderDetails || null,
  );

  useEffect(() => {
    if (ladderId) {
      dispatch(fetchLeaderboard({ ladder_id: ladderId, type: ladderType }));
      dispatch(fetchGradebars(ladderId));
    }
  }, [ladderId, dispatch]);

  const filteredPlayers = players
    .filter((p) => p.name?.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => a.rank - b.rank);

  const generateGrades = (playersArr, gradebarDetails, preset) => {
    if (!playersArr || playersArr.length === 0) return [];
    const out = [];
    let startIndex = 0;
    const groupSize = Number(preset) || 10;
    while (startIndex < playersArr.length) {
      const groupPlayers = playersArr.slice(startIndex, startIndex + groupSize);
      const gradeIdx = Math.floor(startIndex / groupSize);
      const gradeLabel =
        gradebarDetails?.[gradeIdx]?.gradebar_name ||
        `Minileague ${gradeIdx + 1}`;
      out.push({
        label: gradeLabel,
        players: groupPlayers,
      });
      startIndex += groupSize;
    }
    return out;
  };

  const grades = generateGrades(filteredPlayers, gradebarDetails, preset);

  return (
    <div>
      {/* Ladder Title */}
      {ladderDetails && (
        <div className="py-4 text-center sm:text-start px-4">
          <h2 className="text-2xl font-bold text-white">
            {ladderDetails.name}
          </h2>
          <p className="text-gray-200 text-md border-b-2 border-amber-500 py-1 font-semibold">
            Admin Details: {ladderDetails.admin_name} (
            {ladderDetails.admin_phone})
          </p>
        </div>
      )}

      {/* Search input */}
      <div className="mb-6 px-4">
        <input
          type="text"
          placeholder="Search players..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-md border border-gray-600 bg-[#223848] text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#4eb0a2]"
        />
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mt-4 px-4">
        <PlayerPerformationRanking ladderId={ladderId} />
      </div>

      {grades.length === 0 ? (
        <div className="text-center py-10 text-gray-400 font-bold">No players found</div>
      ) : (
        <div className="space-y-8 sm:px-4 md:px-4 ">
          {grades.map((grade, index) => (
            <div key={index}>
              {/* Section header */}
              <div className="mb-3 sticky top-0 bg-[#223848] px-4 py-2 rounded-lg shadow-lg text-xl text-white font-bold tracking-wide z-10">
                {grade.label}
              </div>

              {/* Players List */}
              <div className="space-y-3">
                {grade.players.map((player, pidx) => (
                  <PlayerCard
                    key={player.id || pidx}
                    player={player}
                    rank={player.rank || pidx + 1}
                    ladderType={ladderType}
                    preset={preset}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
