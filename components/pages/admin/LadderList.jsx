

"use client";

import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { fetchLadders } from "@/redux/slices/fetchLadderSlice";
import { useRouter } from "next/navigation";
import { getRequest } from "@/services/apiService";
import { API_ENDPOINTS } from "@/constants/api";

import { motion } from "framer-motion";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import { ListChecks } from "lucide-react";

const LadderList = ({ userId }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const printRef = useRef(null);

  const [deleteLadderId, setDeleteLadderId] = useState(null);
  const [deleteLadderName, setDeleteLadderName] = useState("");
  const [seeAll, setSeeAll] = useState(false);

  const { allLadders, loading, error } = useSelector(
    (state) => state.fetchLadder,
  );

  const subAdmin =
    typeof window !== "undefined"
      ? JSON.parse(sessionStorage.getItem("subAdmin") || "null")
      : null;

  const admin =
    typeof window !== "undefined"
      ? JSON.parse(sessionStorage.getItem("userData") || "null")
      : null;

  const refreshLadders = () => {
    if (admin?.user_type === "admin") {
      dispatch(fetchLadders({ userId: admin.id }));
      return;
    }

    if (subAdmin?.user_type === "sub_admin") {
      dispatch(
        fetchLadders({
          userId: subAdmin.user_id,
          created_by: subAdmin.id,
        }),
      );
    }
  };

  useEffect(() => {
    if (!userId) return;
    refreshLadders();
  }, [userId, admin?.id, admin?.user_type, subAdmin?.id, subAdmin?.user_id, subAdmin?.user_type]);

  const handleEditClick = (ladderId, ladderType, inverted) => {
    router.push(`/player-list?ladder_id=${ladderId}&type=${ladderType}&inverted=${inverted}`);
  };

  const handleDelete = async (ladderId) => {
    try {
      await getRequest(API_ENDPOINTS.DELETE_LEADERBOARD, { ladder_id: ladderId });
      refreshLadders();
    } catch (error) {
      console.error("Delete failed:", error?.response?.data || error.message);
    } finally {
      setDeleteLadderId(null);
    }
  };


let filteredLadders = [];

if (subAdmin?.user_type === "sub_admin") {
  filteredLadders = allLadders?.filter(
    (ladder) => ladder.created_by !== "demo"  && ladder.type !== "roster"
  );
} else if (admin?.user_type === "admin") {    
  filteredLadders = allLadders?.filter(
    (ladder) => ladder.created_by !== "demo"
  );
} 

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
          <div className="space-y-4 text-foreground">
            {/* Header */}
            <div className="flex items-center justify-between px-1 sm:px-2 pt-2">
              <h3 className="text-base sm:text-lg font-semibold text-primary flex items-center gap-2">
                <ListChecks className="h-4 w-4 sm:h-5 sm:w-5" />
                Your Competitions
              </h3>

              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer text-primary bg-card border-border hover:bg-muted h-8 sm:h-10 px-4 sm:px-8 text-xs sm:text-sm"
                onClick={() => setSeeAll((prev) => !prev)}
              >
                {seeAll ? "Show Less" : "See All"}
              </Button>
            </div>

            <Separator className="bg-border" />

            {loading && (
              <p className="text-xs sm:text-sm text-muted-foreground animate-pulse px-2">
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
                seeAll
                  ? "max-h-[60vh] overflow-y-auto pr-1 sm:pr-2"
                  : "h-auto"
              }`}
            >
              {visibleLadders?.length === 0 && !loading && (
                <p className="text-xs sm:text-sm text-white/50 px-2 text-center">
                  No competitions to display.
                </p>
              )}
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
                          ? "bg-yellow-500/10 border border-yellow-500/30"
                          : "bg-muted/30 border border-border"
                      }`}
                  >
                    {/* Left */}
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-cyan-500/70 font-mono text-xs sm:text-sm w-5">
                        {index + 1}.
                      </span>

                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-medium text-foreground text-sm sm:text-base truncate">
                          {ladder.name}
                        </span>

                        {isDemo && (
                          <span className="text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-500 text-black">
                            DEMO
                          </span>
                        )}
                      </div>
                    </div>

                   {/* Right */}
                  <div className="flex items-center gap-2 justify-end sm:justify-start">
                    <Button
                      size="sm"
                      variant="ghost"
                      className={`flex-1 sm:flex-none px-4 sm:px-6 h-8 sm:h-9 text-xs sm:text-sm cursor-pointer
                        ${
                          isDemo
                            ? "text-cyan-300 border border-cyan-400/50 hover:bg-cyan-400/10 hover:text-white"
                            : "text-cyan-300 border border-cyan-300/30 hover:bg-cyan-300/10 hover:text-white"
                        }`}
                      onClick={() =>
                        handleEditClick(ladder.id, ladder.type, ladder.inverted)
                      }
                    >
                      Edit 
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          className={`flex-1 sm:flex-none px-4 sm:px-6 h-8 sm:h-9 text-xs sm:text-sm cursor-pointer
                            ${
                              isDemo
                                ? "text-red-400 border border-red-500 hover:bg-red-300"
                                : "text-red-400 border border-red-400/30 hover:bg-red-400/50"
                            }`}
                          onClick={() => {
                            setDeleteLadderId(ladder.id);
                            setDeleteLadderName(ladder.name);
                          }}
                        >
                          Delete
                        </Button>
                      </AlertDialogTrigger>

                      <AlertDialogContent className="w-[90%] max-w-md bg-card border border-border text-foreground rounded-lg">
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Delete{" "}
                            <span className="text-red-400 font-bold">
                              {deleteLadderName}
                            </span>
                            ?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel
                            className="text-black"
                            onClick={() => setDeleteLadderId(null)}
                          >
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() =>
                              handleDelete(deleteLadderId)
                            }
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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

export default LadderList;
