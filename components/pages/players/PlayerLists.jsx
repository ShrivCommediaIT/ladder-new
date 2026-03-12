

"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import PlayersLists1 from "./PlayersLists1";
import ActivityLog from "./ActivityList";
import PlayerHeading from "./PlayerHeading";
import LeaderBoard from "./LeaderBoard";
import UserDetails from "@/components/shared/UserDetails";
import { fetchUserActivity } from "@/redux/slices/activitySlice";
import { fetchLeaderboard } from "@/redux/slices/leaderboardSlice";
import LadderRulesCard from "./LadderRulesCard";
import AdminButton from "../admin/AdminButton";
import Info from "@/components/shared/Info";
import AdminEditPhone from "@/components/shared/AdminEditPhone";
import { useSearchParams, useRouter } from "next/navigation";
import { fetchMiniLeague } from "@/redux/slices/minileagueSlice";
import MusicDownloadList from "./MusicDownloadList";

export const PlayerLists = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  
  // ✅ Fixed: Use miniLeague data instead of activity data for ladder info
  const miniLeagueData = useSelector((state) => state.miniLeague?.data);
  const ladder = miniLeagueData || useSelector((state) => state.activity?.data?.data);

  const [loadingPlayers, setLoadingPlayers] = useState(true);
  const [loadingActivity, setLoadingActivity] = useState(true);
  const [loadingMiniLeague, setLoadingMiniLeague] = useState(true);

  const globalLoading = loadingPlayers || loadingActivity || loadingMiniLeague;

  const searchParams = useSearchParams();
  const ladderId = searchParams.get("ladder_id");
  const ladderType = searchParams.get("ladder_type");
  const type = searchParams.get("type");
  const shouldPrint = searchParams.get("print");

  // 🔹 Trigger print if query param is present
  useEffect(() => {
    if (shouldPrint === "true") {
      const timer = setTimeout(() => {
        window.print();
        const params = new URLSearchParams(window.location.search);
        params.delete("print");
        const newUrl =
          window.location.pathname +
          (params.toString() ? `?${params.toString()}` : "");
        router.replace(newUrl);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [shouldPrint, router]);

  // ✅ Fixed: Fetch ALL data including miniLeague FIRST
  useEffect(() => {
    const fetchData = async () => {
      if (!ladderId) return;

      // 1. Fetch MiniLeague FIRST (priority)
      setLoadingMiniLeague(true);
      await dispatch(fetchMiniLeague({ ladder_id: ladderId }));
      setLoadingMiniLeague(false);

      // 2. Then fetch leaderboard
      setLoadingPlayers(true);
      await dispatch(fetchLeaderboard({ ladder_id: ladderId }));
      setLoadingPlayers(false);

      // 3. Finally fetch activity
      setLoadingActivity(true);
      await dispatch(fetchUserActivity({ ladder_id: ladderId }));
      setLoadingActivity(false);
    };

    fetchData();
  }, [dispatch, ladderId]); // ✅ Removed unnecessary dependencies

  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    const hasSeenInfo = localStorage.getItem("adminInfoShown");

    if (!hasSeenInfo) {
      setShowInfo(true);
      localStorage.setItem("adminInfoShown", "true");
    }
  }, []);

  const handlePrintClick = () => {
    window.print();
  };

  // ✅ Fixed: Use miniLeague ladder_id as primary source
  const currentLadderId = ladder?.ladder_id || ladderId;

  return (
    <div className="bg-gray-800 min-h-screen">
      {/* 🔹 Sticky Header */}
      <div className="sm:flex justify-between top-0 z-50 backdrop-blur-md px-4 py-4">
        <div className="">
          <div className="flex-1 min-w-0 ">
            <PlayerHeading />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* <button
            onClick={handlePrintClick}
            className="px-8 py-1 text-white bg-gradient-to-r from-[#8dd5f1] to-blue-800 rounded-lg font-semibold text-xl border hover cursor-pointer transition"
          >
            Print
          </button> */}

          <UserDetails />
        </div>
      </div>

      {/* 🔹 Main Section */}
      <div className="flex flex-col lg:flex-row gap-6 ">
        {/* 🔹 Left/Main Column */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          <div className="flex flex-col gap-4 lg:hidden">
            <AdminEditPhone />
            <AdminButton />
            <LadderRulesCard />
          </div>

          <div className="px-2">
            <PlayersLists1 />
          </div>
          
          <div className="lg:hidden ">
            <ActivityLog ladderId={currentLadderId} />
          </div>
        </div>

        {/* 🔹 Sidebar → visible only on lg+ screens */}
        <div className="hidden lg:flex lg:w-[600px] flex-col gap-4 flex-shrink-0">
          <AdminEditPhone />
          <AdminButton />
          <LadderRulesCard />
         {(type === "skill" || ladderType === "skill") && <MusicDownloadList/>}
          <ActivityLog ladderId={currentLadderId} />
        </div>
      </div>

      {/* 🔹 LeaderBoard */}
      <div className="px-4 mt-6 w-full overflow-x-auto">
        <LeaderBoard />
      </div>

      {/* 🔹 Loader */}
      {globalLoading && (
        <div className="px-4 py-6 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-purple-600 border-solid" />
        </div>
      )}
    </div>
  );
};

