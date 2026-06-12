

"use client";

import { useState, useEffect } from "react";
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
import { fetchLeaderboard } from "@/redux/slices/leaderboardSlice";
import ChallengeNumberInput from "./ChallengeNumberInput";
import MoveNumberInput from "./MoveNumberInput";
import EditPlayerDetails from "./EditPlayerDetails";
import PlayerImage from "./PlayerImage";
import StatusPlayer from "./StatusPlayer";
import PlayerStatsBox from "./PlayerStatsBox";
import { ChevronDown } from "lucide-react";
import { useSearchParams } from "next/navigation";

export const EditPlayer = ({
  open = true,
  onClose = () => {},
  currentId = null,
  setLoading = () => {},
  initialTab = "result",
}) => {
  const dispatch = useDispatch();

  const searchParams = useSearchParams()
  const urlType = searchParams.get("type") || searchParams.get("ladder_type");
  const urlLadderId = searchParams.get("ladder_id");

  const ladder_id = urlLadderId || 
  searchParams.get("ladder_type")?.toLowerCase() || "minileague";

  const userData =
    typeof window !== "undefined"
      ? JSON.parse(
          sessionStorage.getItem("userData") ||
            sessionStorage.getItem("subAdmin") ||
            "{}",
        )
      : {};

  let userId = null;

  if (userData.user_type === "admin") {
     userId = userData.id || userData.user_id;
  } else if (userData.user_type === "sub_admin") {
    userId = userData.user_id;
  } else {
    userId = userData.id || null;
  }

  const playerId = currentId ? Number(currentId) : null;

  const playersStore = useSelector((state) => state.player?.players || {});
  const {
    loading,
    error: moveError,
    result,
  } = useSelector((state) => state?.playerMoving) || {};

  // FIND SELECTED PLAYER SAFELY
  const selectedPlayer = Object.values(playersStore)
    .flatMap((g) => g?.data || [])
    .find((p) => Number(p.id) === playerId);
  
  useEffect(() => {
    if (result?.success_message) {
      toast.success(result.success_message);

      if (ladder_id) {
        dispatch(fetchLeaderboard({ ladder_id, type: urlType })); // INSTANT REFRESH
      }

      dispatch(clearMoveResult());
    }

    if (moveError) {
      toast.error(moveError);
      dispatch(clearMoveResult());
    }
  }, [result, moveError, dispatch, ladder_id]);

  const [selectedTab, setSelectedTab] = useState(initialTab || "result");

  // Reset tabs to initial state every time the modal opens
  useEffect(() => {
    if (open) {
      setSelectedTab(initialTab || "result");
    }
  }, [open, initialTab]);

  const tabs = [
    { value: "result", label: "Result" },
    { value: "challenge", label: "Challenge" },
    // { value: "status", label: "Status" },
    { value: "stats", label: "Stats" },
    { value: "edit", label: "Edit" },
    { value: "load", label: "Upload Avatar" },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-[95vw] sm:max-w-[700px] lg:max-w-[900px] mx-auto bg-white text-slate-900 border border-slate-200 dark:bg-slate-950 dark:text-white dark:border-slate-800 shadow-2xl rounded-2xl max-h-[90vh] overflow-y-auto p-0">
        <DialogTitle className="text-xl font-bold border-b border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-200 p-4 text-center">
          {selectedPlayer
            ? `Edit Player: ${selectedPlayer.name} (Rank: ${selectedPlayer.rank})`
            : "Edit Player"}
        </DialogTitle>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 overflow-y-auto max-h-[80vh]"
        >
          <Tabs
            value={selectedTab}
            onValueChange={setSelectedTab}
            className="w-full"
          >
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

            {/* TAB CONTENT */}
            <div className="mt-2 p-4 border border-slate-200 dark:border-slate-800 rounded-xl">
              <TabsContent value="result">
                <MoveNumberInput
                  onClose={onClose}
                  currentId={playerId}
                  currentRank={selectedPlayer?.rank}
                  setLoading={setLoading}
                  selectedPlayer={selectedPlayer}
                  userId={userId}
                />
              </TabsContent>

              <TabsContent value="challenge">
                <ChallengeNumberInput
                  selectedPlayer={selectedPlayer}
                  userId={userId}
                />
              </TabsContent>

              <TabsContent value="edit">
                <EditPlayerDetails userId={playerId} ladderId={ladder_id} onClose={onClose} />
              </TabsContent>

              <TabsContent value="load">
                <PlayerImage userId={playerId} ladderId={ladder_id} ladderType={urlType} onClose={onClose} />
              </TabsContent>

              {/* <TabsContent value="status">
                <StatusPlayer playerId={playerId} onClose={onClose} />
              </TabsContent> */}

              <TabsContent value="stats">
                <PlayerStatsBox userId={playerId} ladderId={ladder_id} />
              </TabsContent>
            </div>
          </Tabs>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};
