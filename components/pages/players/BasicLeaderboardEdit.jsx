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
import BasicLeaderboardActivityEntryCard from "./BasicLeaderboardActivityEntryCard";

export const BasicLeaderboardEdit = ({
  open = true,
  onClose = () => {},
  currentId = null,
  ladderId: propLadderId,
  skillNumber,
  skillActivityId,
}) => {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();

  const playerId = currentId ? Number(currentId) : null;

  const { error: moveError, result } =
    useSelector((state) => state?.playerMoving) || {};

  // Skill ladder id (priority: props > params)
  const ladder_id =
    Number(propLadderId) || Number(searchParams.get("ladder_id"));

  // Player data (skill leaderboard)
  const players = useSelector((state) => state.skillLeaderboard?.data || []);

  const selectedPlayer = players.find((p) => Number(p.id) === Number(playerId));

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

  const [selectedTab, setSelectedTab] = useState("activity");

  const tabs = [
    { value: "activity", label: "Activity No." },
    { value: "load", label: "Upload Avatar" },
  ];

  // 🔥 FORWARD onClose TO CHILD COMPONENTS
  const handleChildClose = useCallback(() => {
    onClose(); // Trigger parent refresh
  }, [onClose]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="min-w-full md:min-w-[700px] lg:min-w-[900px] bg-gray-900 text-white">
        <DialogTitle className="text-xl font-bold border-b border-gray-700 p-1">
          {selectedPlayer?.name || "Player"}
        </DialogTitle>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Tabs
            value={selectedTab}
            onValueChange={setSelectedTab}
            className="text-white"
          >
       
            {/* DESKTOP TABS */}
            <div className="hidden sm:block">
              <TabsList className="w-full bg-gray-800 border border-gray-700">
                {tabs.map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="
          text-gray-300
          data-[state=active]:text-white
          data-[state=active]:bg-gray-700
          data-[state=active]:shadow-md
          transition-all duration-200
        "
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {/* MOBILE DROPDOWN */}
            <div className="sm:hidden mb-4">
              <Select value={selectedTab} onValueChange={setSelectedTab}>
                <SelectTrigger className="w-full bg-gray-800 text-white">
                  <SelectValue>
                    {tabs.find((t) => t.value === selectedTab)?.label}
                  </SelectValue>
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

            {/* ACTIVITY TAB - PASS onClose */}
            <TabsContent value="activity">
              <div className="max-h-[60vh] overflow-auto text-white">
                <BasicLeaderboardActivityEntryCard
                  ladderId={ladder_id}
                  skillNumber={skillNumber}
                  playerId={playerId}
                  skillActivityId={skillActivityId}
                  onClose={handleChildClose}
                  initialActivity={skillNumber}
                />
              </div>
            </TabsContent>

            {/* IMAGE UPLOAD TAB */}
            <TabsContent value="load">
              <PlayerImage
                userId={playerId}
                ladderId={ladder_id}
                onClose={handleChildClose} // ✅ PASS HERE TOO
              />
            </TabsContent>
          </Tabs>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};
