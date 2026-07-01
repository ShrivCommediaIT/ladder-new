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
import { useSearchParams } from "next/navigation";

import PlayerImage from "./PlayerImage";
import BasicLeaderboardUserActivityEntryCard from "./BasicLeaderboardUserActivityEntryCard";
import BasicLeaderboardAgeUserEdit from "./BasicLeaderboardAgeUserEdit";

import { Skeleton } from "@/components/ui/skeleton";

export const BasicLeaderboardUserEdit = ({
  open = true,
  onClose = () => {},
  currentId = null,
  ladderId: propLadderId,
  skillNumber,
  skillActivityId,
  onPaymentRequired,
}) => {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const playerId = currentId ? Number(currentId) : null;

  const { error: moveError, result } =
    useSelector((state) => state?.playerMoving) || {};
  // ✅ Skill ladder id (priority: props > params)
  const ladder_id =
    Number(propLadderId) || Number(searchParams.get("ladder_id"));
  const type = searchParams.get("type")
  const ladderType = searchParams.get("ladder_type")
  // ✅ Player data (skill leaderboard)
  const playersSkills = useSelector((state) => state.skillLeaderboard?.data || []);
  const playersPositive = useSelector((state) => state.positiveLeaderBoard?.data || []);
  const playersNegative = useSelector((state) => state.negativeLeaderBoard?.data || []);

  
    const [showEditSkeleton, setShowEditSkeleton] = useState(false);
    const [selectedPlayer, setPlayers] = useState([]);

  useEffect(() => {
    if (result?.success_message) {
      toast.success(result.success_message);
      dispatch(clearMoveResult());
    }

    if (moveError) {
      toast.error(moveError);
      dispatch(clearMoveResult());
    }
  }, [result, moveError, dispatch]);

  useEffect(() => {
    if ((type === "skill" || ladderType == "skill") && playersSkills) {
      const selectedPlayer = playersSkills.find((p) => Number(p.id) === Number(playerId));
      setPlayers(selectedPlayer)
    } else if ((type === "positive" || ladderType == "positive") && playersPositive) {
      const selectedPlayer = playersPositive.find((p) => Number(p.id) === Number(playerId));
      setPlayers(selectedPlayer)
    } else if ((type === "negative" || ladderType == "negative") && playersNegative) {
      const selectedPlayer = playersNegative.find((p) => Number(p.id) === Number(playerId));
      setPlayers(selectedPlayer)
    }
  }, [type, ladderType, playersSkills, playersPositive, playersNegative, playerId]);

  const [selectedTab, setSelectedTab] = useState("activity");

  // Reset to initial state every time the modal opens
  useEffect(() => {
    if (open) {
      setSelectedTab("activity");
    }
  }, [open]);

  const tabs = [
    { value: "activity", label: "Activity No." },
    { value: "load", label: "Upload Avatar" },
    { value: "edit", label: "Edit Player" },
  ];

  // 🔥 FORWARD onClose TO CHILD COMPONENTS
  const handleChildClose = useCallback(() => {
    onClose(); // Trigger parent refresh
  }, [onClose]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[calc(100%-2rem)] sm:max-w-2xl mx-auto bg-background text-foreground border border-border shadow-2xl rounded-2xl max-h-[90vh] overflow-y-auto p-0">
        <DialogTitle className="px-4 py-3 border-b border-border text-center font-bold text-base text-foreground">
          Player Control Panel
        </DialogTitle>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4">
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            {/* DESKTOP TABS */}
            <div className="hidden sm:block mb-4">
              <TabsList className="w-full flex bg-muted rounded-xl p-1 gap-1 border border-border">
                {tabs.map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="flex-1 text-muted-foreground hover:text-foreground text-xs py-1.5 rounded-lg transition-all data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:font-black"
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {/* MOBILE DROPDOWN */}
            <div className="sm:hidden mb-4">
              <Select value={selectedTab} onValueChange={setSelectedTab}>
                <SelectTrigger className="w-full bg-muted border-border text-foreground h-10 rounded-xl focus:border-primary">
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border text-popover-foreground rounded-xl">
                  {tabs.map((tab) => (
                    <SelectItem key={tab.value} value={tab.value}>
                      {tab.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* TAB CONTENT */}
            <div className="mt-2 p-4 border border-border rounded-xl">
              {/* ACTIVITY TAB */}
              <TabsContent value="activity">
                <div className="max-h-[70vh] overflow-auto">
                  <BasicLeaderboardUserActivityEntryCard
                    ladderId={ladder_id}
                    skillNumber={skillNumber}
                    playerId={playerId}
                    skillActivityId={skillActivityId}
                    onClose={handleChildClose}
                    initialActivity={skillNumber}
                    playerName={selectedPlayer?.name || "Player"}
                    selectedPlayer={selectedPlayer}
                    onPaymentRequired={onPaymentRequired}
                  />
                </div>
              </TabsContent>

              {/* IMAGE UPLOAD TAB */}
              <TabsContent value="load">
                <PlayerImage
                  userId={playerId}
                  ladderId={ladder_id}
                  onClose={handleChildClose}
                />
              </TabsContent>

              <TabsContent value="edit">
                {showEditSkeleton ? (
                  <div className="space-y-3">
                    <Skeleton className="h-10 w-full bg-muted" />
                    <Skeleton className="h-10 w-full bg-muted" />
                  </div>
                ) : (
                  <BasicLeaderboardAgeUserEdit
                    selectedPlayer={selectedPlayer}
                    userId={selectedPlayer?.id}
                    ladderId={ladder_id}
                    onClose={onClose}
                  />
                )}
              </TabsContent>
            </div>
          </Tabs>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};
