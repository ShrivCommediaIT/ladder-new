

"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { useDispatch, useSelector } from "react-redux";
import { clearMoveResult } from "@/redux/slices/playerMovingSlice";
import { toast } from "react-toastify";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { fetchMiniLeague } from "@/redux/slices/minileagueSlice";
import { useSearchParams } from "next/navigation";
import ChallengeNumberInput from "./ChallengeNumberInput";
import EditPlayerDetails from "./EditPlayerDetails";
import PlayerImage from "./PlayerImage";
import MovePlayerMinileague from "./MovePlayerMinileague";
import { Skeleton } from "@/components/ui/skeleton";
import PlayerStatsBoxUser from "./PlayerStatsBoxUser";

export const MinileagueEditPlayer = ({
  open = true,
  onClose = () => {},
  currentId = null,
  ladderId: propLadderId,
  setLoading = () => {},
  sectionIndex = null,
  userLevel = false,
}) => {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();

  /* ---------------- LOGGED IN USER (LOCALSTORAGE) ---------------- */

  const loggedInUser = useMemo(() => {
    if (typeof window === "undefined") return null;
    return JSON.parse(sessionStorage.getItem("user") || "null");
  }, []);

  const loggedInUserId = Number(loggedInUser?.id || null);

  /* ---------------- REDUX ---------------- */

  const ladderType = searchParams.get("ladder_type") || "minileague";
  

  const { error: moveError, result } =
    useSelector((state) => state?.playerMoving) || {};

  const minileagueData = useSelector((state) => state.minileague?.data || []);

  const userLadderId = useSelector((state) => state.user?.user?.ladder_id);

  const playerId = currentId ? Number(currentId) : null;

  /* ---------------- FIND PLAYER + SECTION ---------------- */

  const findPlayerWithSection = useCallback(() => {

    if (!playerId || ladderType !== "minileague") return null;

    // 1) Try given sectionIndex first
    if (typeof sectionIndex === "number" && minileagueData[sectionIndex]) {
      
      const users =
        minileagueData[sectionIndex]?.users_record ||
        minileagueData[sectionIndex]?.users ||
        [];

      const directPlayer = users.find(
        (p) => Number(p.id || p.user_id) === Number(playerId),
      );

      if (directPlayer) {
        return {
          ...directPlayer,
          id: Number(directPlayer.id || directPlayer.user_id),
          rank: Number(directPlayer.rank),
          ladder_id: Number(
            directPlayer.ladder_id ||
              userLadderId ||
              searchParams.get("ladder_id") ||
              propLadderId,
          ),
          sectionIndex,
        };
      }
    }

    // 2) Fallback: scan all sections
    for (let i = 0; i < minileagueData.length; i++) {
      const users =
        minileagueData[i]?.users_record || minileagueData[i]?.users || [];

      const player = users.find(
        (p) => Number(p.id || p.user_id) === Number(playerId),
      );

      if (player) {
        return {
          ...player,
          id: Number(player.id || player.user_id),
          rank: Number(player.rank),
          ladder_id: Number(
            player.ladder_id ||
              userLadderId ||
              searchParams.get("ladder_id") ||
              propLadderId,
          ),
          sectionIndex: i,
        };
      }
    }

    return null;
  }, [
    playerId,
    ladderType,
    minileagueData,
    sectionIndex,
    userLadderId,
    searchParams,
    propLadderId,
  ]);

  const selectedPlayer = findPlayerWithSection();

  const ladder_id =
    selectedPlayer?.ladder_id ||
    userLadderId ||
    Number(searchParams.get("ladder_id")) ||
    Number(propLadderId);

  const playerSectionIndex = selectedPlayer?.sectionIndex ?? sectionIndex ?? 0;

  /* ---------------- MOVE RESULT EFFECT ---------------- */

  useEffect(() => {
    if (result?.success_message) {
      toast.success(result.success_message);
      ladder_id && dispatch(fetchMiniLeague({ ladder_id }));
      dispatch(clearMoveResult());
    }

    if (moveError) {
      toast.error(moveError);
      dispatch(clearMoveResult());
    }
  }, [result, moveError, dispatch, ladder_id]);

  /* ---------------- UI ---------------- */

  const allTabs = [
    { value: "result", label: "Result" },
    { value: "challenge", label: "Challenge" },
    { value: "stats", label: "Stats" },
    { value: "edit", label: "Edit" },
    { value: "load", label: "Upload" },
  ];

  const tabs = userLevel 
    ? allTabs.filter((t) => t.value === "edit") 
    : allTabs;

  const [selectedTab, setSelectedTab] = useState("result");

  // Reset tab on mount
  useEffect(() => {
    if (open && tabs.length > 0) {
      setSelectedTab(tabs[0].value);
    }
  }, [open, tabs]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[calc(100%-2rem)] sm:max-w-[480px] mx-auto bg-white text-slate-900 border border-slate-200 dark:bg-slate-950 dark:text-white dark:border-slate-800 shadow-2xl rounded-2xl max-h-[90vh] overflow-y-auto p-0">
        <DialogTitle className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 text-center font-bold text-base text-slate-800 dark:text-slate-200">
          Player Control Panel
        </DialogTitle>

        <div className="p-4 overflow-y-auto max-h-[80vh]">
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            {/* DESKTOP */}
            <div className="hidden sm:block mb-4">
              <TabsList className="w-full flex bg-slate-100 dark:bg-slate-900 rounded-xl p-1 gap-1 border border-slate-200/50 dark:border-slate-800">
                {tabs.map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="flex-1 text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white text-xs py-1.5 rounded-lg transition-all data-[state=active]:bg-cyan-500 data-[state=active]:text-slate-950 data-[state=active]:font-black"
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {/* MOBILE */}
            <div className="sm:hidden mb-4">
              <Select value={selectedTab} onValueChange={setSelectedTab}>
                <SelectTrigger className="w-full bg-slate-50 border-slate-200 text-slate-900 dark:bg-slate-900 dark:border-slate-800 dark:text-white h-10 rounded-xl focus:border-cyan-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200 text-slate-900 dark:bg-slate-900 dark:border-slate-800 dark:text-white rounded-xl">
                  {tabs.map((tab) => (
                    <SelectItem key={tab.value} value={tab.value}>
                      {tab.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

          <TabsContent value="result">
            <MovePlayerMinileague
              onClose={onClose}
              currentId={playerId}
              currentRank={selectedPlayer?.rank}
              setLoading={setLoading}
              selectedPlayer={selectedPlayer}
              ladderId={ladder_id}
              userId={loggedInUserId}
              currentSectionIndex={playerSectionIndex}
            />
          </TabsContent>

          <TabsContent value="challenge">
            <ChallengeNumberInput
              selectedPlayer={selectedPlayer}
              userId={loggedInUserId}
              ladderId={ladder_id}
              ladderType={ladderType}
            />
          </TabsContent>

          <TabsContent value="stats">
            {playerId && ladder_id ? (
              <PlayerStatsBoxUser userId={playerId} ladderId={ladder_id} />
            ) : (
              <Skeleton className="h-40 w-full bg-white/10" />
            )}
          </TabsContent>

          <TabsContent value="edit">
            <EditPlayerDetails
              userId={playerId}
              ladderId={ladder_id}
              selectedPlayer={selectedPlayer}
              onClose={onClose}
            />
          </TabsContent>

          <TabsContent value="load">
            <PlayerImage
              userId={playerId}
              ladderId={ladder_id}
              onClose={onClose}
            />
          </TabsContent>
        </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};
