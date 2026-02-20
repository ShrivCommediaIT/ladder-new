

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
import { Skeleton } from "@/components/ui/skeleton";

import PlayerStatsBoxUser from "./PlayerStatsBoxUser";
import ChallengeNumberInput from "./ChallengeNumberInput";
import MoveNumberInput from "./MoveNumberInput";
import EditPlayerDetails from "./EditPlayerDetails";
import PlayerImage from "./PlayerImage";
import StatusPlayer from "./StatusPlayer";

import { clearStatusMessage } from "@/redux/slices/playerStatusSlice";
import { resetProfileImageState } from "@/redux/slices/profileImageSlice";

export const EditPlayer = ({
  open = true,
  onClose = () => {},
  currentId = null,
  setLoading = () => {},
  ladderId = null,
}) => {
  const dispatch = useDispatch();

  /* -------------------- USER FROM LOCALSTORAGE -------------------- */

  const [localUser, setLocalUser] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = JSON.parse(localStorage.getItem("user") || "null");
      setLocalUser(storedUser);
    }
  }, []);

  const userId = Number(localUser?.id || localUser?.user_id || null);
  const ladder_id = Number(localUser?.ladder_id || null);

  /* -------------------- REDUX -------------------- */

  const players =
    useSelector((state) => state.player?.players?.[ladder_id]?.data) || [];

  const selectedPlayer = useMemo(
    () => players.find((p) => Number(p.id) === Number(currentId)),
    [players, currentId]
  );

  const moving = useSelector((s) => s?.playerMoving) || {};
  const status = useSelector((s) => s?.playerStatus) || {};
  const image = useSelector((s) => s?.profileImage) || {};

  const [activeTab, setActiveTab] = useState("");
  const [challengedPlayer, setChallengedPlayer] = useState("");
  const [showEditSkeleton, setShowEditSkeleton] = useState(false);

  /* -------------------- FETCH PLAYERS -------------------- */

  useEffect(() => {
    if (open && ladder_id) {
      dispatch(fetchLeaderboard({ ladder_id }));
    }
  }, [dispatch, ladder_id, open]);

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
      dispatch(fetchLeaderboard({ ladder_id }));
    }
  }, [moving, status, image, dispatch, ladder_id]);

  /* -------------------- EDIT SKELETON -------------------- */

  useEffect(() => {
    if (activeTab === "edit") {
      setShowEditSkeleton(true);
      const t = setTimeout(() => setShowEditSkeleton(false), 700);
      return () => clearTimeout(t);
    }
  }, [activeTab]);

  const tabs = [
    { value: "move", label: "Result" },
    // { value: "status", label: "Status" },
    { value: "edit", label: "Edit" },
    { value: "load", label: "Upload" },
    { value: "stats", label: "Stats" },
    { value: "challenge", label: "Challenge" },
  ];

  /* -------------------- UI -------------------- */

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="min-w-full md:min-w-[700px] lg:min-w-[900px] bg-gray-900 text-white">
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

            {/* MOBILE */}
            {/* <div className="sm:hidden mb-4">
              <Select value={activeTab} onValueChange={setActiveTab}>
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
            </div> */}

<div className="sm:hidden mb-4">
  <Select
    value={activeTab}
    onValueChange={(val) => setActiveTab(val)}
  >
    <SelectTrigger className="w-full bg-gray-800 text-white">
      <SelectValue placeholder="Select" />
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

            {/* CONTENT */}
            <motion.div
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
                <PlayerImage userId={selectedPlayer?.id} onClose={onClose} />
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
