
"use client";

import { useState } from "react";
import { useSelector } from "react-redux"; // ✅ Added for ladder type detection
import DummyPlayerList from "@/components/shared/DummyPlayerList";           // ✅ best5/winlose
import DummyMinileaguePlayerList from "@/components/shared/DummyMinileaguePlayerList"; // ✅ minileague
import DummyActivity from "@/components/shared/DummyActivity";
import DummyUserRules from "@/components/shared/DummyUserRules";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";
import LocalDiscount from "@/components/shared/LocalDiscount";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import DummyBasicLeaderBoard from "@/components/shared/DummyBasicLeaderBoard";

export default function LadderView() {
  const router = useRouter();
  const [showLadder, setShowLadder] = useState(true);
  const searchParams = useSearchParams();
  const ladderId = searchParams.get("ladder_id");
const ladderType = searchParams.get("ladder_type") || searchParams.get("type");
  // ✅ Detect ladder type from Redux store
  const ladderDetails = useSelector((state) => {
    // Check both player and minileague slices
    return state.player?.players?.[ladderId]?.ladderDetails || 
           state.minileague?.ladderDetails || {};
  });
  
  // const ladderType = ladderDetails?.type || ladderId || "winlose";
  
  // ✅ Select correct component based on ladder type
  const getPlayersComponent = () => {
    // if (ladderType === "minileague") {
    //   return <DummyMinileaguePlayerList ladderId={ladderId} />;
    // }

    // if (ladderType === "skill") {
    //   return <DummyBasicLeaderBoard ladderId={ladderId} />
    // }

    return <DummyPlayerList ladderId={ladderId} />;
  };

  return (
    <div className="flex flex-col w-full min-h-screen py-4 bg-gray-800">
      {/* Back Button */}
      <div className="sm:px-12 md:px-12 lg:px-12 w-full mb-2"></div>

      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 px-4 sm:px-8 lg:px-12 max-w-8xl mx-auto">
        <Button
          variant="outline"
          size="lg"
          className="w-full sm:w-auto bg-gray-500 text-white cursor-pointer px-6 sm:px-8 py-2 text-sm sm:text-md font-semibold"
          onClick={() => router.back()}
        >
          ← Back
        </Button>

        <Button
          onClick={() => setShowLadder(!showLadder)}
          variant="outline"
          size="lg"
          className="w-full sm:w-auto cursor-pointer px-6 sm:px-8 py-2 text-sm sm:text-md font-semibold bg-white-500 text-white hover:bg-gray-600 hover:text-white"
        >
          {showLadder ? "Ladder ON" : "Ladder OFF"}
        </Button>
      </div>

      {/* Layout */}
      <div className="flex flex-col md:flex-row w-full px-4 sm:px-0 md:px-0 lg:px-0 mx-auto">
        {/* Mobile/desktop Ladder */}
        <AnimatePresence>
          {showLadder && (
            <motion.div
              key="ladder"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="flex-1 md:flex-2"
            >
              {getPlayersComponent()} {/* ✅ Renders correct component */}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Other Components */}
        <AnimatePresence>
          {(!showLadder || window.innerWidth >= 768) && (
            <motion.div
              key="others"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="flex-1 flex flex-col gap-4 sm:mt-16"
            >
              <div className="flex items-center justify-center w-full">
                <DummyUserRules ladderId={ladderId} />
              </div>

              <div className="flex items-center justify-center w-full">
                <DummyActivity ladderId={ladderId} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
