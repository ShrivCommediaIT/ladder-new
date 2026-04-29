

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

  const [selectedTab, setSelectedTab] = useState("result");

  const tabs = [
    { value: "result", label: "Result" },
    { value: "challenge", label: "Challenge" },
    { value: "stats", label: "Stats" },
    { value: "edit", label: "Edit" },
    { value: "load", label: "Upload" },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[calc(100%-2rem)] sm:max-w-[700px] lg:max-w-[900px] mx-auto bg-gray-900 text-white max-h-[90vh] overflow-y-auto">
        <DialogTitle className="p-2 border-b border-gray-700 text-violet-400">
          {selectedPlayer?.name || "Player"}
        </DialogTitle>

        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          {/* DESKTOP */}
          <div className="hidden sm:block">
            <TabsList className="w-full bg-gray-800">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="text-white data-[state=active]:bg-white data-[state=active]:text-black transition-all duration-200"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* MOBILE */}
          <div className="sm:hidden mb-4">
            <Select value={selectedTab} onValueChange={setSelectedTab}>
              <SelectTrigger className="w-full bg-gray-800 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 text-white">
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
      </DialogContent>
    </Dialog>
  );
};
