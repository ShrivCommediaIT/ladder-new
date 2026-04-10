
"use client";

import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { fetchLadders } from "@/redux/slices/fetchLadderSlice";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { fetchLadderByUserId } from "@/redux/slices/ladderSlice";
import { ListChecks, Info } from "lucide-react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const ladderDescriptions = {
  win:
    "Players move up or down based on wins and losses only. This is the simplest ladder if match scores are not important.",

  best3:
    "Used in Tennis, Squash, Badminton, Table Tennis etc. Results are 2-0 or 2-1. Match score and player effort is recorded for fair ranking.",

  best5:
    "Used where matches are decided by a best-of-5 format like 3-0, 3-1 or 3-2 with detailed performance tracking.",

  skill:
    "Set up to 12 fully customisable exercises or challenges with targets and timescales of your choosing for your students/trainees to complete. Highly motivational and useful for setting grades.",
};

const DemoLadder = ({ userId }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const printRef = useRef(null);

  const [showDemo, setShowDemo] = useState(true);

  const { allLadders, loading, error } = useSelector(
    (state) => state.fetchLadder
  );

  const subAdmin =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("subAdmin") || "null")
      : null;

  const admin =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("userData") || "null")
      : null;

  useEffect(() => {
    if (!userId) return;

    if (admin?.user_type === "admin") {
      dispatch(fetchLadderByUserId({ userId: admin.id }));
    } else if (subAdmin?.user_type === "sub_admin") {
      dispatch(
        fetchLadders({
          userId: subAdmin.user_id,
          created_by: subAdmin.id,
        })
      );
    }
  }, [userId, dispatch]);

  const handleEditClick = (ladderId, ladderType) => {
    router.push(`/player-list?ladder_id=${ladderId}&type=${ladderType}`);
  };

  const demoLadders = allLadders?.filter(
    (ladder) => ladder.created_by === "demo"
  );

  return (
    <div className="w-full px-2 sm:px-0">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div
          ref={printRef}
          className="rounded-2xl w-full"
        >
          <div className="space-y-4 text-white">

            {/* Header */}
            <div className="flex items-center justify-between px-1 sm:px-2 pt-2">
              <h3 className="text-base sm:text-lg font-semibold text-cyan-300 flex items-center gap-2">
                <ListChecks className="h-4 w-4 sm:h-5 sm:w-5" />
                Demo Competitions
              </h3>

              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowDemo(!showDemo)}
                className="text-xs border border-cyan-400/50 text-cyan-300 hover:bg-cyan-100 cursor-pointer"
              >
                {showDemo ? "Hide" : "Show"}
              </Button>
            </div>

            <Separator className="bg-white/10" />

            {loading && (
              <p className="text-xs sm:text-sm text-white/50 animate-pulse px-2">
                Loading ladders...
              </p>
            )}

            {error && (
              <p className="text-xs sm:text-sm text-red-400 px-2">
                Error: {error}
              </p>
            )}

            {!loading && demoLadders?.length === 0 && (
              <p className="text-xs sm:text-sm text-white/50 px-2">
                No demo ladders found.
              </p>
            )}

            {/* Demo Ladders */}
            {showDemo && (
              <div className="space-y-3">

                {demoLadders?.map((ladder, index) => {
                  return (
                    <motion.div
                      key={ladder.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex flex-col sm:flex-row sm:items-center justify-between rounded-xl p-3 sm:px-4 sm:py-3 gap-3 bg-[#050810] border border-gray-700"
                    >

                      {/* Left */}

                      <div className="flex items-center gap-3 min-w-0">

                        <span className="text-cyan-500/70 font-mono text-xs sm:text-sm w-5">
                          {index + 1}.
                        </span>

                        <span className="font-medium text-white text-sm sm:text-base truncate">
                          {ladder.name}
                        </span>

                      </div>


                      {/* Right */}

                      <div className="flex items-center gap-2 w-full sm:w-auto">

                        <Button
                          size="sm"
                          variant="ghost"
                          className="flex-1 sm:flex-none px-4 sm:px-6 h-8 sm:h-9 text-xs sm:text-sm text-cyan-300 border border-cyan-400/50 hover:bg-cyan-400/10 hover:text-white"
                          onClick={() => handleEditClick(ladder.id, ladder.type)}
                        >
                          Test
                        </Button>

                        <Popover>
                          <PopoverTrigger asChild>
                            <button className="grid place-items-center h-8 w-8 rounded-full bg-white/10 text-cyan-300 hover:scale-110 transition cursor-pointer">
                              <Info className="w-4 h-4" />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent
                            side="right"
                            align="center"
                            className="max-w-xs sm:max-w-md border border-white/10 bg-[#0b1020]/95 text-white backdrop-blur-xl shadow-xl animate-in fade-in zoom-in"
                          >
                         
                              <p className="text-xs sm:text-sm leading-relaxed">
                                {ladder.info}
                              </p>
                        
                          </PopoverContent>
                        </Popover>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </motion.div>

    </div>

  );

};

export default DemoLadder;