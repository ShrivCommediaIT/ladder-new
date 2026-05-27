
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
import LadderInfo from "./LadderInfo";


const DemoLadder = ({ userId }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const printRef = useRef(null);

  const [showDemo, setShowDemo] = useState(false);

  const { allLadders, loading, error } = useSelector(
    (state) => state.fetchLadder
  );

  const subAdmin =
    typeof window !== "undefined"
      ? JSON.parse(sessionStorage.getItem("subAdmin") || "null")
      : null;

  const admin =
    typeof window !== "undefined"
      ? JSON.parse(sessionStorage.getItem("userData") || "null")
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
              <LadderInfo ladders={demoLadders} />
            )}
          </div>
        </div>

      </motion.div>

    </div>

  );

};

export default DemoLadder;