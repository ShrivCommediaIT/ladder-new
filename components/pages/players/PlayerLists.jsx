

"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import PlayersLists1 from "./PlayersLists1";
import ActivityLog from "./ActivityList";
import LeaderBoard from "./LeaderBoard";
import { fetchUserActivity } from "@/redux/slices/activitySlice";
import { fetchLeaderboard } from "@/redux/slices/leaderboardSlice";
import LadderRulesCard from "./LadderRulesCard";
import AdminButton from "@/components/shared/AdminButton";
import Info from "@/components/shared/Info";
import AdminEditPhone from "@/components/shared/AdminEditPhone";
import { useSearchParams, useRouter } from "next/navigation";
import { fetchMiniLeague } from "@/redux/slices/minileagueSlice";
import MusicDownloadList from "./MusicDownloadList";
import PlayerLevelNavbar from "@/components/shared/PlayerLevelNavbar";
import { Card, CardContent } from "@/components/ui/card";
import { formatLadderType } from "@/components/shared/ladderUtils";

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
  const [bestSearchValue, setBestSearchValue] = useState("");

  const searchParams = useSearchParams();
  const ladderId = searchParams.get("ladder_id");
  const ladderType = searchParams.get("ladder_type");
  const type = searchParams.get("type");
  const shouldPrint = searchParams.get("print");
  const isBestLayout = ["best5", "best3", "winlose", "skill", "positive", "negative", "minileague", "roster"].includes(type || ladderType || "");

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
      await dispatch(fetchLeaderboard({ ladder_id: ladderId, type: type || ladderType }));
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
    const hasSeenInfo = sessionStorage.getItem("adminInfoShown");

    if (!hasSeenInfo) {
      setShowInfo(true);
      sessionStorage.setItem("adminInfoShown", "true");
    }
  }, []);

  const handlePrintClick = () => {
    window.print();
  };

  // ✅ Fixed: Use miniLeague ladder_id as primary source
  const currentLadderId = ladder?.ladder_id || ladderId;
  const playerEntry = useSelector((state) =>
    ladderId ? state.player?.players?.[Number(ladderId)] : null,
  );
  const currentLadderName =
    playerEntry?.ladderDetails?.name ||
    miniLeagueData?.name ||
    "Football Ladder";
  const currentPlayerCount = playerEntry?.data?.length || 0;
  const resolvedLadderType = type || ladderType || "ladder";

  return (
    <div className={isBestLayout ? "ladder-shell min-h-screen" : "bg-gray-800 min-h-screen"}>
      {/* 🔹 Unified Sticky Navbar (Admin & Sub-Admin) */}
      <PlayerLevelNavbar
        activeTab="players"
        ladderName={currentLadderName}
        liveCount={currentPlayerCount}
        ladderType={type || ladderType}
        searchValue={bestSearchValue}
        onSearchChange={setBestSearchValue}
      />

      {isBestLayout ? (
        <div className="w-full px-4 pb-6 sm:px-6 lg:px-10">
          <PlayersLists1 searchValue={bestSearchValue} onSearchChange={setBestSearchValue} />
        </div>
      ) : (
        <>
      {/* 🔹 Main Section */}
      <div className="w-full mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 flex flex-col lg:flex-row gap-6">
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
        <div className="hidden lg:flex lg:w-[560px] flex-col gap-4 flex-shrink-0">
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
        </>
      )}

      <footer className="relative z-10 mt-10 px-4 pb-8 sm:px-6 lg:px-8">
        <Card className="mx-auto w-full border border-border bg-card text-foreground shadow-lg">
          <CardContent className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Sports Solutions Pro {formatLadderType(resolvedLadderType)} Ladder
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Rankings, activity, and player management in one shared ladder view.
              </p>
            </div>
            <p className="text-sm text-primary">
              {currentPlayerCount > 0
                ? `${currentPlayerCount} player${currentPlayerCount === 1 ? "" : "s"} on this ladder`
                : "Player list updates live as members join"}
            </p>
          </CardContent>
        </Card>
      </footer>
    </div>
  );
};

