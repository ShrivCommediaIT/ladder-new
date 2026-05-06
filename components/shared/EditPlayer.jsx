

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
  ladder_type: propLadderType = null,
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
      const storedUser = JSON.parse(sessionStorage.getItem("user") || "null");
      setLocalUser(storedUser);
    }
  }, []);

  const userId = Number(localUser?.id || localUser?.user_id || null);
  const ladder_id = Number(ladderId || localUser?.ladder_id || null);


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

  const [activeTab, setActiveTab] = useState("");
  const [mobileTab, setMobileTab] = useState(""); // empty = shows "Select Type" placeholder

  const handleMobileTabChange = (val) => {
    setMobileTab(val);
    setActiveTab(val);
  };
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


  const allTabs = [
    { value: "move", label: "Result" },
    { value: "challenge", label: "Challenge" },
    { value: "stats", label: "Stats" },
    { value: "edit", label: "Edit" },
    { value: "load", label: "Upload Avatar" },
  ];
  

  /* If roster → only Edit + Upload */

  const tabs =
    ladderType === "roster"
      ? allTabs.filter((t) => t.value === "edit" || t.value === "load")
      : allTabs;

  // Reset on modal open
  useEffect(() => {
    if (open) {
      setMobileTab("");
      setActiveTab(tabs[0]?.value || "");
    }
  }, [open]);

  // Also reset mobile when ladderType changes (tabs list changes)
  useEffect(() => {
    setMobileTab("");
    if (tabs.length > 0) {
      setActiveTab(tabs[0].value);
    }
  }, [ladderType]);

  /* -------------------- UI -------------------- */

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[calc(100%-2rem)] sm:max-w-[700px] lg:max-w-[900px] mx-auto bg-gray-900 text-white max-h-[90vh] overflow-y-auto">
        <DialogTitle>
          <VisuallyHidden>Edit Player</VisuallyHidden>
        </DialogTitle>

        {/* HEADER */}
        <div className="px-4 py-3 border-b border-white/10 text-center font-semibold">
          Player Control Panel
        </div>

        <div className="p-4 overflow-y-auto max-h-[80vh]">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            {/* DESKTOP */}
            <div className="hidden sm:block mb-4">
              <TabsList className="w-full flex bg-black/40 rounded-xl p-1">
                {tabs.map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="flex-1 text-white text-sm data-[state=active]:bg-cyan-500 data-[state=active]:text-black"
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {/* MOBILE DROPDOWN */}
            <div className="sm:hidden mb-4">
              <Select value={mobileTab} onValueChange={handleMobileTabChange}>
                <SelectTrigger className="w-full bg-gray-800 text-white">
                  <SelectValue placeholder="Select Type" />
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

            {/* CONTENT — hidden on mobile until a type is selected */}
            <motion.div
              className={!mobileTab ? "hidden sm:block" : ""}
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
                    userId={selectedPlayer?.id}       // ✅ pass explicitly
                    ladderId={ladder_id}
                    onClose={onClose}
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
