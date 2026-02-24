"use client";

import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { fetchLadders } from "@/redux/slices/fetchLadderSlice";
import { useRouter } from "next/navigation";

import { motion } from "framer-motion";

import { fetchLadderByUserId } from "@/redux/slices/ladderSlice";
import { ListChecks } from "lucide-react";

const DemoLadder = ({ userId }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const printRef = useRef(null);

  const [seeAll, setSeeAll] = useState(false);

  const { allLadders, loading, error } = useSelector(
    (state) => state.fetchLadder,
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
        }),
      );
    }
  }, [userId, dispatch]);

  const handleEditClick = (ladderId, ladderType) => {
    router.push(`/player-list?ladder_id=${ladderId}&type=${ladderType}`);
  };

  const filteredLadders = allLadders?.filter(
    (ladder) => ladder.created_by === "demo",
  );

  const initialLadders = filteredLadders?.slice(0, 5);
  const visibleLadders = seeAll ? filteredLadders : initialLadders;

  return (
    <div className="w-full px-2 sm:px-0">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div
          ref={printRef}
          className="rounded-2xl backdrop-blur-xl shadow-2xl w-full"
        >
          <div className="space-y-4 text-white">
            {/* Header */}
            <div className="flex items-center justify-between px-1 sm:px-2 pt-2">
              <h3 className="text-base sm:text-lg font-semibold text-cyan-300 flex items-center gap-2">
                <ListChecks className="h-4 w-4 sm:h-5 sm:w-5" />
                Demo Solutions
              </h3>
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

            {!loading && allLadders?.length === 0 && (
              <p className="text-xs sm:text-sm text-white/50 px-2">
                No ladders created yet.
              </p>
            )}

            {/* Ladder List */}
            <div
              className={`space-y-3 transition-all duration-300 ${
                seeAll ? "max-h-[60vh] overflow-y-auto pr-1 sm:pr-2" : "h-auto"
              }`}
            >
              {visibleLadders?.map((ladder, index) => {
                const isDemo = ladder.created_by === "demo";

                return (
                  <motion.div
                    key={ladder.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between rounded-xl p-3 sm:px-4 sm:py-3 gap-3
                      ${
                        isDemo
                          ? "bg-yellow-500/10 border border-cyan-400"
                          : "bg-black/40 border border-white/10"
                      }`}
                  >
                    {/* Left */}
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-cyan-500/70 font-mono text-xs sm:text-sm w-5">
                        {index + 1}.
                      </span>

                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-medium text-white text-sm sm:text-base truncate">
                          {ladder.name}
                        </span>
                      </div>
                    </div>

                    {/* Right */}
                    <div className="flex items-center gap-2 justify-end sm:justify-start">
                      <Button
                        size="sm"
                        variant="ghost"
                        className={`flex-1 sm:flex-none px-4 sm:px-6 h-8 sm:h-9 text-xs sm:text-sm
      ${
        isDemo
          ? "text-cyan-300 border border-cyan-400/50 hover:bg-cyan-400/10 hover:text-white"
          : "text-cyan-300 border border-cyan-300/30 hover:bg-cyan-300/10 hover:text-white"
      }`}
                        onClick={() => handleEditClick(ladder.id, ladder.type)}
                      >
                        Edit
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DemoLadder;
