

"use client";

import { useState, useEffect, useMemo } from "react";
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
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { fetchLeaderboard } from "@/redux/slices/leaderboardSlice";
import { fetchRosterLeaderboard } from "@/redux/slices/rosterLeaderboardSlice";
import { Skeleton } from "@/components/ui/skeleton";

import PlayerStatsBoxUser from "./PlayerStatsBoxUser";
import ChallengeNumberInput from "./ChallengeNumberInput";
import MoveNumberInput from "./MoveNumberInput";
import EditPlayerDetails from "./EditPlayerDetails";
import PlayerImage from "./PlayerImage";
import StatusPlayer from "./StatusPlayer";

import { clearStatusMessage } from "@/redux/slices/playerStatusSlice";
import { resetProfileImageState } from "@/redux/slices/profileImageSlice";

import { useSearchParams } from "next/navigation";

export const EditPlayer = ({
  open = true,
  onClose = () => { },
  currentId = null,
  setLoading = () => { },
  ladderId = null,
  ladder_id: propLadderId = null,
  ladder_type: propLadderType = null,
  userLevel = false,
  initialTab = null,
}) => {
  const dispatch = useDispatch();

  /* -------------------- USER FROM LOCALSTORAGE -------------------- */

  const [localUser, setLocalUser] = useState(null);

  const searchParams = useSearchParams();
  const ladderTypeFromUrl = searchParams.get("ladder_type") || searchParams.get("type");
  const ladderType = propLadderType || ladderTypeFromUrl;
  const urlType = ladderType;

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = JSON.parse(
        sessionStorage.getItem("user") ||
        sessionStorage.getItem("userData") ||
        sessionStorage.getItem("subAdmin") ||
        "null"
      );
      setLocalUser(storedUser);
    }
  }, []);

  const userId = Number(localUser?.id || localUser?.user_id || null);
  const ladder_id = Number(ladderId || propLadderId || localUser?.ladder_id || null);


  const storePlayers =
    useSelector((state) => state.player?.players?.[ladder_id]?.data) || [];
  const rosterPlayers =
    useSelector((state) => state.rosterLeaderboard?.data) || [];

  const players = ladderType === "roster" ? rosterPlayers : storePlayers;

  const selectedPlayer = useMemo(
    () => players.find((p) => Number(p.id) === Number(currentId)),
    [players, currentId]
  );

  const moving = useSelector((s) => s?.playerMoving) || {};
  const status = useSelector((s) => s?.playerStatus) || {};
  const image = useSelector((s) => s?.profileImage) || {};

  const [activeTab, setActiveTab] = useState("move");
  const [challengedPlayer, setChallengedPlayer] = useState("");
  const [showEditSkeleton, setShowEditSkeleton] = useState(false);

  /* -------------------- FETCH PLAYERS -------------------- */
  // ✅ No fetch on open — data is already in Redux state from parent page load.
  // Post-action refreshes (move, status change, image) are handled below.

  /* -------------------- HANDLE RESPONSES -------------------- */

  useEffect(() => {
    let didSomething = false;

    if (moving?.result?.success_message) {
      didSomething = true;
      dispatch(clearMoveResult());
    }
    if (moving?.error) {
      toast.error(moving.error);
      dispatch(clearMoveResult());
    }

    if (status?.successMessage) {
      didSomething = true;
      dispatch(clearStatusMessage());
    }
    if (status?.error) {
      toast.error(status.error);
      dispatch(clearStatusMessage());
    }

    if (image?.success) {
      didSomething = true;
      dispatch(resetProfileImageState());
    }
    if (image?.error) {
      toast.error(image.error);
      dispatch(resetProfileImageState());
    }

    if (didSomething && ladder_id) {
      if (ladderType === "roster") {
        dispatch(fetchRosterLeaderboard({ ladder_id }));
      } else {
        dispatch(fetchLeaderboard({ ladder_id, type: urlType }));
      }
      onClose();
    }
  }, [moving, status, image, dispatch, ladder_id, ladderType, urlType, onClose]);

  /* -------------------- EDIT SKELETON -------------------- */

  useEffect(() => {
    if (activeTab === "edit") {
      setShowEditSkeleton(true);
      const t = setTimeout(() => setShowEditSkeleton(false), 700);
      return () => clearTimeout(t);
    }
  }, [activeTab]);


  const allTabs = useMemo(() => [
    { value: "move", label: "Result" },
    { value: "challenge", label: "Challenge" },
    { value: "stats", label: "Stats" },
    { value: "edit", label: "Edit" },
    { value: "load", label: "Upload Avatar" },
  ], []);

  // Check if they are looking at their own profile or if they are admin
  const isAdmin = localUser?.user_type === "admin" || localUser?.user_type === "sub_admin";
  const isSelf = Number(localUser?.id || localUser?.user_id) === Number(currentId);

  const tabs = useMemo(() => {
    if (ladderType === "roster") {
      return allTabs.filter((t) => t.value === "edit" || t.value === "load");
    }
    if (isAdmin) {
      return allTabs;
    }
    // For userLevel (normal player views)
    if (isSelf) {
      // Self: Can view Result, Challenge, Stats, Edit, and Upload Avatar
      return allTabs;
    } else {
      // Other player: Can view Stats and Challenge them
      return allTabs.filter((t) => t.value === "stats" || t.value === "challenge");
    }
  }, [isAdmin, isSelf, ladderType, allTabs]);

  // Reset on modal open
  useEffect(() => {
    if (open && tabs.length > 0) {
      const defaultVal = initialTab && tabs.some(t => t.value === initialTab)
        ? initialTab
        : tabs[0]?.value || "";
      setActiveTab(defaultVal);
    }
  }, [open, tabs, initialTab]);

  // Also reset mobile when ladderType changes (tabs list changes)
  useEffect(() => {
    if (tabs.length > 0) {
      setActiveTab(tabs[0].value);
    }
  }, [ladderType, tabs]);

  /* -------------------- UI -------------------- */

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-[95vw] sm:max-w-[540px] md:max-w-[720px] lg:max-w-[900px] mx-auto bg-white text-slate-900 border border-slate-200 dark:bg-slate-950 dark:text-white dark:border-slate-800 shadow-2xl rounded-2xl max-h-[90vh] overflow-y-auto p-0">
        <DialogTitle>
          <VisuallyHidden>Edit Player</VisuallyHidden>
        </DialogTitle>

        {/* HEADER */}
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 text-center font-bold text-base text-slate-800 dark:text-slate-200">
          Player Control Panel
        </div>

        <div className="p-4 overflow-y-auto max-h-[80vh]">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
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

            {/* MOBILE DROPDOWN */}
            <div className="sm:hidden mb-4">
              <Select value={activeTab} onValueChange={setActiveTab}>
                <SelectTrigger className="w-full bg-slate-50 border-slate-200 text-slate-900 dark:bg-slate-900 dark:border-slate-800 dark:text-white h-10 rounded-xl focus:border-cyan-500">
                  <SelectValue placeholder="Select Type" />
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

            {/* CONTENT */}
            <motion.div
              className="mt-2 p-4 border border-slate-200 dark:border-slate-800 rounded-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <TabsContent value="move">
                <MoveNumberInput
                  onClose={onClose}
                  currentId={currentId}
                  currentRank={selectedPlayer?.rank}
                  setLoading={setLoading}
                  selectedPlayer={selectedPlayer}
                  userId={userId}
                  ladderId={ladder_id}
                />
              </TabsContent>

              <TabsContent value="challenge">
                <ChallengeNumberInput
                  selectedPlayer={selectedPlayer}
                  challengedPlayer={challengedPlayer}
                  setChallengedPlayer={setChallengedPlayer}
                  userId={userId}
                />
              </TabsContent>


              <TabsContent value="edit">
                {showEditSkeleton ? (
                  <div className="space-y-3">
                    <Skeleton className="h-10 w-full bg-white/10" />
                    <Skeleton className="h-10 w-full bg-white/10" />
                  </div>
                ) : (
                  <EditPlayerDetails
                    selectedPlayer={selectedPlayer}   // ✅ correct prop name
                    userId={selectedPlayer?.id || currentId}       // ✅ pass explicitly with robust fallback
                    ladderId={ladder_id}
                    onClose={onClose}
                    userLevel={userLevel}
                  />
                )}
              </TabsContent>


              <TabsContent value="load">
                <PlayerImage userId={selectedPlayer?.id} ladderId={ladder_id} ladderType={urlType || ladderType} onClose={onClose} />
              </TabsContent>

              {/* <TabsContent value="status">
                <StatusPlayer
                  playerId={selectedPlayer?.id}
                  onClose={onClose}
                />
              </TabsContent> */}

              <TabsContent value="stats">
                <PlayerStatsBoxUser
                  userId={selectedPlayer?.id}
                  ladderId={ladder_id}
                />
              </TabsContent>
            </motion.div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditPlayer;
