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

  // IMPORTANT: default state = "select"
  const [selectedTab, setSelectedTab] = useState("select");

  const tabs = [
    { value: "select", label: "Select :" },
    { value: "result", label: "Result" },
    { value: "challenge", label: "Challenge" },
    { value: "stats", label: "Stats" },
    { value: "edit", label: "Edit" },
    { value: "load", label: "Upload" },
  ];

  const sectionName =
    ladderType === "minileague"
      ? minileagueData[playerSectionIndex]?.section ||
        `Section ${playerSectionIndex + 1}`
      : null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="min-w-full md:min-w-[700px] lg:min-w-[900px] bg-gray-900 text-white">
        <DialogTitle className="text-xl font-bold border-b border-gray-700 ">
          {selectedPlayer?.name}
          {sectionName && (
            <span className="ml-2 text-sm text-blue-400">{sectionName}</span>
          )}
        </DialogTitle>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            {/* DESKTOP TABS */}
            <div className="hidden text-white sm:block">
              <TabsList className="w-full bg-gray-800">
                {tabs
                  .filter((t) => t.value !== "select")
                  .map((tab) => (
                    <TabsTrigger key={tab.value} value={tab.value} className="text-white data-[state=active]:bg-white data-[state=active]:text-black transition-all duration-200">
                      {tab.label}
                    </TabsTrigger>
                  ))}
              </TabsList>
            </div>

            {/* MOBILE DROPDOWN – FIXED */}
            <div className="sm:hidden mb-4">
              <Select value={selectedTab} onValueChange={setSelectedTab}>
                <SelectTrigger className="w-full bg-gray-800 text-white">
                  <SelectValue>
                    {tabs.find((t) => t.value === selectedTab)?.label ||
                      "Select :"}
                  </SelectValue>
                </SelectTrigger>

                <SelectContent className="bg-gray-800 text-white">
                  {tabs
                    .filter((tab) => tab.value !== "select")
                    .map((tab) => (
                      <SelectItem key={tab.value} value={tab.value}>
                        {tab.label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* TAB CONTENT */}
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

            {/* <TabsContent value="edit">
              <EditPlayerDetails
                userId={playerId}
                ladderId={ladder_id}
                onClose={onClose}
              />
            </TabsContent> */}

            <TabsContent value="edit">
              <EditPlayerDetails
                userId={playerId}
                ladderId={ladder_id} // YE ADD KARO (same as PlayerImage)
                onClose={onClose}
              />
            </TabsContent>

            <TabsContent value="load">
              <PlayerImage
                userId={playerId}
                ladderId={ladder_id} // PASSED LADDER ID
                onClose={onClose}
              />
            </TabsContent>
          </Tabs>
        </motion.div>
      </DialogContent>


      
    </Dialog>
  );
};
