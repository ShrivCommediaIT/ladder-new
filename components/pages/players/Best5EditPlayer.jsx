

// final fix and optimized

"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
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

export const Best5EditPlayer = ({
  open = true,
  onClose = () => {},
  currentId = null,
  setLoading = () => {},
}) => {
  const dispatch = useDispatch();

  const playerId = currentId ? Number(currentId) : null;

  const ladderType = useSelector((state)=> state.ladder?.data?.type)


  const user = useSelector((state) => state?.user?.user || {});
  const playersStore = useSelector((state) => state.player?.players || {});
  const { loading, error: moveError, result } =
    useSelector((state) => state?.playerMoving) || {};

  // ✅ FIND SELECTED PLAYER SAFELY
  const selectedPlayer = Object.values(playersStore)
    .flatMap((g) => g?.data || [])
    .find((p) => Number(p.id) === playerId);

  // ✅ CORRECT LADDER ID (REAL FIX)
  const ladder_id = selectedPlayer?.ladder_id;

  // ✅ MODAL OPEN PAR LATEST DATA LOAD
  useEffect(() => {
    if (open && ladder_id) {
      dispatch(fetchLeaderboard({ ladder_id }));
    }
  }, [dispatch, ladder_id, open]);

  // ✅ 🔥 REAL-TIME UPDATE AFTER MOVE / RESULT
  useEffect(() => {
    if (result?.success_message) {
      toast.success(result.success_message);

      if (ladder_id) {
        dispatch(fetchLeaderboard({ ladder_id }));
      }

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
    // { value: "status", label: "Status" },
    { value: "stats", label: "Stats" },
    { value: "edit", label: "Edit" },
    { value: "load", label: "Upload" },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="min-w-full md:min-w-[700px] lg:min-w-[900px] border border-gray-700 bg-gray-900 text-gray-100 rounded-xl max-w-4xl">
        <DialogTitle className="text-2xl font-bold text-violet-400 border-b border-gray-800">
          {selectedPlayer
            ? `Edit Player: ${selectedPlayer.name} (Rank: ${selectedPlayer.rank})`
            : "Edit Player"}
        </DialogTitle>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="p-2">
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">

            {/* ✅ DESKTOP TABS */}
            <div className="hidden sm:block">
              <TabsList className="w-full bg-gray-800 rounded-lg">
                {tabs.map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="flex-1 px-4 py-2 text-sm text-gray-300 
                    data-[state=active]:bg-violet-600 data-[state=active]:text-white"
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {/* ✅ MOBILE DROPDOWN */}
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

            {/* ✅ TAB CONTENT */}
            <div className="mt-4 p-4 border border-gray-700 rounded-xl">
              <TabsContent value="result">
                <MoveNumberInput
                  onClose={onClose}
                  currentId={playerId}
                  currentRank={selectedPlayer?.rank}
                  setLoading={setLoading}
                  selectedPlayer={selectedPlayer}
                />
              </TabsContent>

              <TabsContent value="challenge">
                <ChallengeNumberInput
                  selectedPlayer={selectedPlayer}
                  userId={user?.id}
                />
              </TabsContent>

              <TabsContent value="edit">
                <EditPlayerDetails userId={playerId} onClose={onClose} />
              </TabsContent>

              <TabsContent value="load">
                <PlayerImage userId={playerId} onClose={onClose} />
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
