"use client";
import { IMAGE_BASE_URL } from "@/constants/api";
import Image from "next/image";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchLeaderboard,
  setSelectedPlayer,
  setAgeFilter,
} from "@/redux/slices/leaderboardSlice";
import { EditPlayer } from "./EditPlayer";
import { Skeleton } from "@/components/ui/skeleton";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { fetchUserProfile } from "@/redux/slices/profileSlice";
import PlayerSearch from "../users/PlayerSearch";
import LadderLinkPanel from "./LadderLinkPanel";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchGradebars, resetGradebar } from "@/redux/slices/gradebarSlice";
import { paymentPage } from "@/helper/RouteName";
import { io } from "socket.io-client";
import Logo from "@/public/logo1.png";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { postRequest } from "@/services/apiService";
import PlayerStatusToggle from "@/components/shared/PlayerStatusToggle";
import PlayerSearchInput from "./PlayerSearchInput";
//  PlayerCard Component
const PlayerCard = ({
  player,
  rank,
  canEdit,
  onSelect,
  ladderType,
  refreshKey,
  currentUser,
}) => {
  const playerImageUrl = player.image
    ? `${IMAGE_BASE_URL}/${player.image
    }?t=${Date.now()}`
    : Logo;

  return (
    // new version
    <div
      onClick={() => {
        if (!canEdit) return onSelect("toastWarning");
        onSelect("select", player);
      }}
      className={`mb-3 rounded-lg shadow transition-all font-sans ${canEdit
        ? "cursor-pointer hover:bg-[#143238]"
        : "opacity-0 cursor-not-allowed"
        } sm:px-4 sm:py-3`}
      style={{
        background: "#223848",
        border: "2px solid #4eb0a2",
      }}
    >
      <div className="flex justify-between items-start mb-1 px-1 mt-1">
        <PlayerStatusToggle player={player} user={false} />
      </div>

      <div className="flex items-center justify-between px-2 py-2 ">

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

    </div>
  );
};

// Main Players List Component
const Best5Players = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const ladderId = searchParams.get("ladder_id");

  const user = useSelector((state) => state.user?.user);

  const {
    players,
    selectedPlayer,
    loading: reduxLoading,
    appliedAge,
    appliedAgeType,
    appliedGender,
  } = useSelector((state) => state.player);
  const { gradebarDetails, gradebar } = useSelector((state) => state.gradebar);

  const ladderDetails =
    useSelector((state) => state.player?.players?.[ladderId]?.ladderDetails) ||
    {};
  const ladderType = ladderDetails?.type;
  const typeMinileague = useSelector((state) => state.ladder?.data?.type);
  const [isOpen, setIsOpen] = useState(false);
  const [loadingPlayers, setLoadingPlayers] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [localGradebars, setLocalGradebars] = useState([]);
  const [groupSize, setGroupSize] = useState(6);
  const [refreshKey, setRefreshKey] = useState(0);
  const isRefreshingRef = useRef(false);

  // Edit section state
  const [editIndex, setEditIndex] = useState(null);
  const [newName, setNewName] = useState("");
  const [editGradebarId, setEditGradebarId] = useState(null);

  // Ensure ladderId is a Number to match Redux state keys
  const numericLadderId = Number(ladderId);
  const playerList = players?.[numericLadderId]?.data || [];


  useEffect(() => {
    if (user?.id) dispatch(fetchUserProfile(user.id));
  }, [user?.id, dispatch]);

  // Local gradebars
  useEffect(() => {
    if (Array.isArray(gradebarDetails)) setLocalGradebars(gradebarDetails);
    if (gradebar?.preset) setGroupSize(Number(gradebar.preset));
  }, [gradebarDetails, gradebar]);

  useEffect(() => {
    dispatch(setSelectedPlayer(null));
  }, [ladderId, dispatch]);

  const cleanedSearch = searchQuery.toLowerCase().replace(/\s+/g, "");

  // 🔍 filter
  let filteredPlayers = playerList;

  if (cleanedSearch) {
    filteredPlayers = playerList.filter((p) =>
      p.name?.toLowerCase().replace(/\s+/g, "").includes(cleanedSearch),
    );
  }

  // 🧹 unique
  const uniquePlayers = Array.from(
    new Map(filteredPlayers.map((p) => [p.id, p])).values(),
  );

  // 🎯 CONDITIONAL SORT
  let sortedPlayers = uniquePlayers;

  if (cleanedSearch) {
    // ⭐ SEARCH MODE = startsWith first → then alphabetical
    sortedPlayers = [...uniquePlayers].sort((a, b) => {
      const aNameClean = (a.name || "").toLowerCase().replace(/\s+/g, "");
      const bNameClean = (b.name || "").toLowerCase().replace(/\s+/g, "");

      const aStarts = aNameClean.startsWith(cleanedSearch);
      const bStarts = bNameClean.startsWith(cleanedSearch);

      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;

      return aNameClean.localeCompare(bNameClean);
    });
  }

  const generateGrades = (playersArr, gradebars = []) => {
    const size = Number(groupSize) || 6;
    const out = [];
    for (let i = 0; i < playersArr.length; i += size) {
      const group = playersArr.slice(i, i + size);
      const idx = Math.floor(i / size);
      const gb = gradebars[idx];
      out.push({
        label: gb?.gradebar_name || `Minileague ${idx + 1}`,
        players: group,
        gradebarId: gb?.id ?? `temp-${idx}`,
        isFallback: !gb?.id,
      });
    }
    return out;
  };

  // const grades = generateGrades(uniquePlayers, localGradebars);
  const grades = generateGrades(sortedPlayers, localGradebars);

  const urlType = searchParams.get("type") || searchParams.get("ladder_type");

  const refreshLeaderboard = useCallback(async (forceRefresh = false, age = appliedAge, ageType = appliedAgeType, gender = appliedGender) => {
    if (!ladderId || isRefreshingRef.current) return;
    isRefreshingRef.current = true;
    setLoadingPlayers(true);
    setRefreshKey((prev) => prev + 1);

    try {
      const payload = {
        ladder_id: ladderId,
        type: urlType || "bestof5"
      };

      if (age > 0) {
        payload.dob = age;
        payload.age_type = ageType;
      }
      if (gender) {
        payload.gender = gender;
      }

      await Promise.all([
        dispatch(fetchGradebars(ladderId)),
        dispatch(fetchLeaderboard(payload)),
      ]);
    } catch (error) {
      console.error("Refresh failed:", error);
    } finally {
      setLoadingPlayers(false);
      setTimeout(() => (isRefreshingRef.current = false), 1500);
    }
  }, [ladderId, dispatch, urlType, appliedAge, appliedAgeType, appliedGender]);

  useEffect(() => {
    if (!ladderId) return;
    // ✅ Only fetch on mount if data is NOT already in Redux (avoids double-fetch when parent already loaded it)
    const hasData = players?.[Number(ladderId)]?.data?.length > 0;
    if (!hasData) {
      refreshLeaderboard();
    } else {
      setLoadingPlayers(false);
    }
  }, [ladderId]); // intentionally only run on ladderId change, not on refreshLeaderboard identity change

  const handlePurchase = () => router.push(paymentPage);

  const handleUpdateSection = async () => {
    if (!newName.trim()) return toast.error("Name required");
    if (!editGradebarId) return toast.error("Invalid Gradebar ID");

    try {
      if (String(editGradebarId).startsWith("temp-")) {
        const data = await postRequest("/user/creategradeBar", {
          user_id: user?.id,
          ladder_id: ladderId,
          preset: groupSize,
          gradebar_name: newName.trim(),
        });
        if (data?.status === 200)
          toast.success("Gradebar created successfully!");
        else toast.error(data?.message || "Failed to create gradebar");
      } else {
        const data = await postRequest("/user/updateGradebarName", {
          gradebar_details_id: editGradebarId,
          name: newName.trim(),
        });
        if (data?.success) toast.success("Updated Successfully");
        else toast.error(data?.message || "Update failed");
      }
    } catch (err) {
      toast.error("Server error");
    } finally {
      setEditIndex(null);
      setEditGradebarId(null);
      refreshLeaderboard();
    }
  };

  const handlePresetChange = async (value) => {
    setGroupSize(value);
    if (!ladderId || !user?.id) return;
    try {
      await dispatch(
        resetGradebar({
          user_id: user.id,
          ladder_id: ladderId,
          gradebar_id: gradebar?.id,
          preset: value,
          gradebar_name: "Minileague",
        }),
      ).unwrap();
    } catch (err) {
      console.error(err);
      toast.error("Failed to reset gradebar!");
    }
  };

  return (
    <div id="print-section" className="space-y-4 relative" key={refreshKey}>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />


        <div className="flex flex-col gap-2">
            <PlayerSearchInput value={searchQuery} onChange={setSearchQuery} />
          </div>


      {/* Ladder link + search */}
      <div className="flex flex-col gap-3 sm:flex-col md:items-center md:gap-2 md:justify-between">
        <div className="w-full">
          <LadderLinkPanel ladderId={ladderId} ladderType={ladderType} />
        </div>
      </div>

      {/* Edit Sections UI */}
      <div className=" flex justify-between items-center sm:flex-row sm:items-center gap-3 bg-gradient-to-r from-gray-900 to-cyan-900 p-4 rounded-xl shadow-lg border border-teal-600">
        <label
          htmlFor="groupSize"
          className="text-white font-bold text-lg sm:text-xl"
        >
          Edit Sections:
        </label>
        <select
          id="groupSize"
          value={groupSize}
          onChange={(e) => handlePresetChange(Number(e.target.value))}
          className="px-8 py-2 rounded-lg border border-white/40 bg-white/10 text-white font-semibold backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-teal-300 transition-all"
        >
          {[1, 2, 3, 4, 5, 6, 7].map((size) => (
            <option key={size} value={size} className="text-black">
              {size}
            </option>
          ))}
        </select>
      </div>

      {/* Loading */}
      {loadingPlayers || reduxLoading ? (
        <div>
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-md mb-1" />
          ))}
        </div>
      ) : grades.length === 0 ? (
        <div className="text-center py-10 text-gray-400 font-bold">No players found</div>
      ) : (
        <div>
          {grades.map((section, idx) => (
            <React.Fragment key={`${section.gradebarId}-${refreshKey}`}>
              {/* Section header */}
              <div className="my-3 flex items-center justify-between bg-gradient-to-r from-[#0f3a4a] to-[#1e60aa] px-4 py-3 rounded-xl shadow-xl border border-[#4eb0a2]">
                <div className="text-white text-lg sm:text-xl font-bold tracking-wide flex items-center gap-2">
                  {/* <span className="bg-[#4eb0a2] text-black px-3 py-1 rounded-full text-xs font-extrabold shadow">{idx + 1}</span> */}
                  {editIndex === idx ? (
                    <input
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="bg-gray-800 text-white px-2 py-1 rounded"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleUpdateSection();
                        if (e.key === "Escape") setEditIndex(null);
                      }}
                    />
                  ) : (
                    <span>{section.label}</span>
                  )}
                </div>
                <button
                  onClick={() => {
                    if (editIndex === idx) handleUpdateSection();
                    else {
                      setEditIndex(idx);
                      setNewName(section.label);
                      setEditGradebarId(section.gradebarId);
                    }
                  }}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg transition-all border border-white/30"
                >
                  ✏️ {editIndex === idx ? "Save" : "Edit"}
                </button>
              </div>

              {/* Player cards */}
              {section.players.map((player, pidx) => {
                const canEdit =
                  user?.user_type?.toLowerCase() === "admin" ||
                  user?.id === player.user_id;
                const globalIndex = idx * groupSize + pidx;

                return (
                  <PlayerCard
                    key={`${player.id}-${player.total_point}-${player.rank}-${refreshKey}`}
                    player={player}
                    rank={player.rank || globalIndex + 1}
                    canEdit={canEdit}
                    ladderType={ladderType}
                    refreshKey={refreshKey}
                    onSelect={(action, playerData) => {
                      if (action === "toastWarning")
                        toast.warning("You may only tap on your name");
                      else if (action === "select") {
                        dispatch(
                          setSelectedPlayer({
                            ...playerData,
                            ladder_id: ladderId,
                          }),
                        );
                        setIsOpen(true);
                      }
                    }}
                    currentUser={user}
                  />
                );
              })}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* EditPlayer modal */}
      {selectedPlayer && (
        <EditPlayer
          open={isOpen}
          onClose={() => setIsOpen(false)}
          currentId={selectedPlayer?.id}
        />
      )}
    </div>
  );
};

export default Best5Players;
