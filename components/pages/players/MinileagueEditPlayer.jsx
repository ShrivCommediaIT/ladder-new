"use client";

import { useState, useEffect, useCallback } from "react";
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
import PlayerStatsBox from "./PlayerStatsBox";
import MoveNumberMinileague from "./MovePlayerMinileague";

export const MinileagueEditPlayer = ({
  open = true,
  onClose = () => {},
  currentId = null,
  ladderId: propLadderId,
  setLoading = () => {},
  sectionIndex = null,
}) => {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();

  const playerId = currentId ? Number(currentId) : null;

  const ladderType =
    searchParams.get("ladder_type")?.toLowerCase() || "minileague";

const userData =
  typeof window !== "undefined"
    ? JSON.parse(sessionStorage.getItem("userData") || sessionStorage.getItem("subAdmin") || "{}")
    : {};

let userId = null;

if (userData.user_type === "admin") {
  userId = userData.id || userData.user_id;
} else if (userData.user_type === "sub_admin") {
  userId = userData.user_id;
} else {
  userId = userData.id || null;
}

  const playersStore = useSelector((state) => state.player?.players || {});
  const { error: moveError, result } =
    useSelector((state) => state?.playerMoving) || {};
  const minileagueData = useSelector((state) => state.minileague?.data || []);

  const findPlayerWithSection = useCallback(() => {
    if (!playerId) return null;

    if (
      ladderType === "minileague" &&
      Array.isArray(minileagueData) &&
      typeof sectionIndex === "number" &&
      minileagueData[sectionIndex]
    ) {
      const users =
        minileagueData[sectionIndex]?.users_record ||
        minileagueData[sectionIndex]?.users ||
        [];
      const player = users.find((p) => Number(p.id) === Number(playerId));
      if (player) {
        return {
          ...player,
          id: Number(player.id),
          rank: Number(player.rank),
          ladder_id: Number(
            player.ladder_id || searchParams.get("ladder_id") || propLadderId,
          ),
          sectionIndex,
        };
      }
    }

    if (ladderType === "minileague") {
      for (let i = 0; i < minileagueData.length; i++) {
        const users =
          minileagueData[i]?.users_record || minileagueData[i]?.users || [];
        const player = users.find((p) => Number(p.id) === Number(playerId));
        if (player) {
          return {
            ...player,
            id: Number(player.id),
            rank: Number(player.rank),
            ladder_id: Number(
              player.ladder_id || searchParams.get("ladder_id") || propLadderId,
            ),
            sectionIndex: i,
          };
        }
      }
    }

    return null;
  }, [
    playerId,
    ladderType,
    minileagueData,
    sectionIndex,
    searchParams,
    propLadderId,
  ]);

  const selectedPlayer = findPlayerWithSection();
  const ladder_id =
    selectedPlayer?.ladder_id ||
    Number(searchParams.get("ladder_id")) ||
    Number(propLadderId);
  const playerSectionIndex = selectedPlayer?.sectionIndex ?? sectionIndex ?? 0;

  useEffect(() => {
    if (result?.success_message) {
      toast.success(result.success_message);
      if (ladder_id) dispatch(fetchMiniLeague({ ladder_id }));
      dispatch(clearMoveResult());
    }

    if (moveError) {
      toast.error(moveError);
      dispatch(clearMoveResult());
    }
  }, [result, moveError, dispatch, ladder_id]);

  const [selectedTab, setSelectedTab] = useState("result");

  const tabs = [
    { value: "result", label: "Result" },
    { value: "challenge", label: "Challenge" },
    { value: "stats", label: "Stats" },
    { value: "edit", label: "Edit" },
    { value: "load", label: "Upload Avatar" },
  ];

  // Reset selectedTab on modal open
  useEffect(() => {
    if (open) {
      setSelectedTab("result");
    }
  }, [open]);

  const sectionName =
    ladderType === "minileague"
      ? minileagueData[playerSectionIndex]?.section ||
        `Section ${playerSectionIndex + 1}`
      : null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-[95vw] sm:max-w-[700px] lg:max-w-[900px] mx-auto bg-white text-slate-900 border border-slate-200 dark:bg-slate-950 dark:text-white dark:border-slate-800 shadow-2xl rounded-2xl max-h-[90vh] overflow-y-auto p-0">
        <DialogTitle className="text-xl font-bold border-b border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-200 p-4 text-center">
          {selectedPlayer?.name}
          {sectionName && (
            <span className="ml-2 text-sm text-blue-500 dark:text-blue-400">({sectionName})</span>
          )}
        </DialogTitle>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4">
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            {/* DESKTOP TABS */}
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

            {/* MOBILE DROPDOWN */}
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

            {/* TAB CONTENT */}
            <div className="mt-2 p-4 border border-slate-200 dark:border-slate-800 rounded-xl">
              <TabsContent value="result">
                <MoveNumberMinileague
                  onClose={onClose}
                  currentId={playerId}
                  currentRank={selectedPlayer?.rank}
                  setLoading={setLoading}
                  selectedPlayer={selectedPlayer}
                  userId={userId}
                  ladderId={ladder_id}
                  currentSectionIndex={playerSectionIndex}
                />
              </TabsContent>

              <TabsContent value="challenge">
                <ChallengeNumberInput
                  selectedPlayer={selectedPlayer}
                  userId={userId}
                  ladderId={ladder_id}
                  ladderType={ladderType}
                />
              </TabsContent>

              <TabsContent value="stats">
                <PlayerStatsBox userId={playerId} ladderId={ladder_id} />
              </TabsContent>

              <TabsContent value="edit">
                <EditPlayerDetails
                  userId={playerId}
                  ladderId={ladder_id}
                  onClose={onClose}
                  minileagueSelectedPlayer={selectedPlayer}
                />
              </TabsContent>

              <TabsContent value="load">
                <PlayerImage
                  userId={playerId}
                  ladderId={ladder_id}
                  onClose={onClose}
                />
              </TabsContent>
            </div>
          </Tabs>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};
