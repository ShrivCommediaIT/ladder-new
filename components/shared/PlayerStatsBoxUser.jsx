
"use client";

import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPlayerResult } from "@/redux/slices/PlayerResultSlice";
import { motion } from "framer-motion";
import gsap from "gsap";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useSearchParams } from "next/navigation";

export default function PlayerStatsBoxUser({ userId, ladderId }) {
  const dispatch = useDispatch();
  const { data, loading, error } = useSelector(
    (state) => state.playerResult
  );
  const searchParams = useSearchParams();
  const cardRef = useRef(null);


  // ✅ Safely extract values
  const totalGame = Number(data?.result?.total_game || 0);
  const totalWin = Number(data?.result?.total_win || 0);
  const totalPoint = Number(data?.result?.total_point || 0);

  // ✅ FRONTEND WIN% CALCULATION (instead of backend value)
  const winPercentage =
    totalGame > 0 ? ((totalWin / totalGame) * 100).toFixed(2) + "%" : "0%";

  // ✅ Avg points per match (already correct)
  const avgPoints =
    totalGame > 0 ? (totalPoint / totalGame).toFixed(2) : 0;

  // Fetch player stats
  useEffect(() => {
    if (userId && ladderId) {
      dispatch(fetchPlayerResult({ user_id: userId, ladder_id: ladderId }));
    }
  }, [userId, ladderId, dispatch]);

  // GSAP entry animation
  useEffect(() => {
    if (!loading && cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 60 },
        { opacity: 1, y: 0, duration: 0.9, ease: "power3.out" }
      );
    }
  }, [loading]);

  if (loading) {
    return (
      <Card className="w-full max-w-full sm:max-w-lg mx-auto shadow-lg bg-gray-900 border border-gray-700">
        <CardHeader>
          <CardTitle className="text-white text-lg">Loading Stats...</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-8 w-full bg-gray-700" />
          <Skeleton className="h-8 w-full bg-gray-700" />
          <Skeleton className="h-8 w-full bg-gray-700" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-full sm:max-w-lg mx-auto shadow-md bg-red-900 border border-red-700">
        <CardHeader>
          <CardTitle className="text-red-200">Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-100">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="flex justify-center w-full"
    >
      <div className="w-full sm:max-w-full bg-gradient-to-br from-gray-900 via-blue-950 to-gray-800 text-white rounded-2xl shadow-2xl p-5 overflow-hidden border border-gray-700 backdrop-blur-md">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mb-4">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-3"
          >
            <h1 className="text-lg sm:text-xl font-bold tracking-wide text-white">
              🏆 Player Statistics
            </h1>
          </motion.div>

          <Dialog>
            <DialogTrigger asChild>
              <Button className="cursor-pointer bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-indigo-700 hover:to-violet-700 text-xs sm:text-sm px-4 py-2 rounded-lg shadow-lg transition-all duration-300 flex items-center gap-2">
                <Info className="w-4 h-4" />
                Stats Explained
              </Button>
            </DialogTrigger>
                <DialogContent className="max-w-md sm:max-w-2xl mx-auto backdrop-blur-md bg-gradient-to-br from-gray-900 via-blue-950 to-gray-800 text-white border border-blue-100 shadow-2xl rounded-2xl p-4 sm:p-6 lg:p-8 overflow-hidden">
              <DialogHeader>
                <DialogTitle className="text-lg sm:text-xl lg:text-2xl font-bold text-center text-blue-200 pb-3 sm:pb-4 border-b border-blue-800/50">
                  Performance Rank Explained
                </DialogTitle>
                <DialogDescription className="text-gray-100 text-xs sm:text-sm lg:text-base leading-relaxed space-y-3 sm:space-y-4 mt-3 sm:mt-4">
                  {/* Points System */}
                  
                  {(() => {
                    const ladderType = searchParams.get("ladder_type") || searchParams.get("type");

                    if (ladderType === "winlose") {
                      return (
                        <div className="space-y-2 sm:space-y-1">
                          <p className="flex items-center text-sm sm:text-base font-semibold">
                            <span className="w-6 h-6 sm:w-7 sm:h-7 bg-green-500 rounded-full flex items-center justify-center text-xs font-bold mr-3 flex-shrink-0">
                              🏆
                            </span>
                            <span>4 Points for a win</span>
                          </p>
                          <p className="flex items-center text-sm sm:text-base font-semibold">
                            <span className="w-6 h-6 sm:w-7 sm:h-7 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold mr-3 flex-shrink-0">
                              ❌
                            </span>
                            <span>2 Points for a loss</span>
                          </p>
                        </div>
                      );
                    }

                    if (ladderType === "best3" || ladderType === "bestof3") {
                      return (
                        <div className="space-y-2 sm:space-y-1">
                          <p className="flex items-center text-sm sm:text-base font-semibold">
                            <span className="w-6 h-6 sm:w-7 sm:h-7 bg-green-500 rounded-full flex items-center justify-center text-xs font-bold mr-3 flex-shrink-0">
                              🏆
                            </span>
                            <span>5 Points for a 2-0 win</span>
                          </p>
                          <p className="flex items-center text-sm sm:text-base font-semibold">
                            <span className="w-6 h-6 sm:w-7 sm:h-7 bg-green-400 rounded-full flex items-center justify-center text-xs font-bold mr-3 flex-shrink-0">
                              🏆
                            </span>
                            <span>4 Points for a 2-1 win</span>
                          </p>
                          <p className="flex items-center text-sm sm:text-base font-semibold">
                            <span className="w-6 h-6 sm:w-7 sm:h-7 bg-orange-500 rounded-full flex items-center justify-center text-xs font-bold mr-3 flex-shrink-0">
                              ❌
                            </span>
                            <span>2 Points for a 2-1 loss</span>
                          </p>
                          <p className="flex items-center text-sm sm:text-base font-semibold">
                            <span className="w-6 h-6 sm:w-7 sm:h-7 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold mr-3 flex-shrink-0">
                              ❌
                            </span>
                            <span>1 Points for a 2-0 loss</span>
                          </p>
                        </div>
                      );
                    }

                    // Default: Best of 5 points
                    return (
                      <div className="space-y-2 sm:space-y-1">
                        <p className="flex items-center text-sm sm:text-base font-semibold">
                          <span className="w-6 h-6 sm:w-7 sm:h-7 bg-green-500 rounded-full flex items-center justify-center text-xs font-bold mr-3 flex-shrink-0">
                            🏆
                          </span>
                          <span>8 Points for a 3-0 win</span>
                        </p>
                        <p className="flex items-center text-sm sm:text-base font-semibold">
                          <span className="w-6 h-6 sm:w-7 sm:h-7 bg-green-400 rounded-full flex items-center justify-center text-xs font-bold mr-3 flex-shrink-0">
                            🏆
                          </span>
                          <span>7 Points for a 3-1 win</span>
                        </p>
                        <p className="flex items-center text-sm sm:text-base font-semibold">
                          <span className="w-6 h-6 sm:w-7 sm:h-7 bg-green-300 rounded-full flex items-center justify-center text-xs font-bold mr-3 flex-shrink-0">
                            🏆
                          </span>
                          <span>6 Points for a 3-2 win</span>
                        </p>  
                        <p className="flex items-center text-sm sm:text-base font-semibold">
                          <span className="w-6 h-6 sm:w-7 sm:h-7 bg-orange-500 rounded-full flex items-center justify-center text-xs font-bold mr-3 flex-shrink-0">
                            ❌
                          </span>
                          <span>4 Points for a 3-2 loss</span>
                        </p>
                        <p className="flex items-center text-sm sm:text-base font-semibold">
                          <span className="w-6 h-6 sm:w-7 sm:h-7 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold mr-3 flex-shrink-0">
                            ❌
                          </span>
                          <span>3 Points for a 3-1 loss</span>
                        </p>
                        <p className="flex items-center text-sm sm:text-base font-semibold">
                          <span className="w-6 h-6 sm:w-7 sm:h-7 bg-red-600 rounded-full flex items-center justify-center text-xs font-bold mr-3 flex-shrink-0">
                            ❌
                          </span>
                          <span>2 Points for a 3-0 loss</span>
                        </p>
                      </div>
                    );
                  })()}
            
                  {/* Calculation Box */}
                  <div className="bg-gradient-to-r from-blue-500/20 to-indigo-500/20 backdrop-blur-sm border border-blue-500/50 px-3 py-3 sm:px-4 sm:py-4 rounded-xl sm:rounded-md mt-4 sm:mt-6">
                    <p className="font-semibold text-center text-xs sm:text-sm lg:text-base leading-tight mb-2 sm:mb-3">
                      Total points are divided by the total number of games played
                    </p>
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent mx-auto my-2 sm:my-3 max-w-xs"></div>
                    <p className="font-bold text-center text-sm sm:text-md lg:text-lg text-white drop-shadow-sm">
                      This is your Performance Score
                    </p>
                  </div>
            
                  {/* Final Ranking */}
                  <div className="pt-4 sm:pt-6">
                    <p className="text-red-300 sm:text-red-200 italic text-center font-semibold text-xs sm:text-sm lg:text-md leading-tight bg-red-900/20 px-3 py-2 rounded-lg border border-red-500/30">
                      Your Performance Score Gives You <br className="sm:hidden" />
                      <span className="block sm:inline">Your Performance Ranking</span>
                    </p>
                  </div>
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Table */}
        {data ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="rounded-xl overflow-hidden border border-gray-700 shadow-inner bg-black/30"
          >
            <Table className="w-full text-xs sm:text-sm md:text-base">
              <TableHeader className="bg-gradient-to-r from-gray-800 to-gray-900">
                <TableRow>
                  <TableHead className="text-blue-400">Games</TableHead>
                  <TableHead className="text-green-400">Wins</TableHead>
                  <TableHead className="text-red-400">Win%</TableHead>
                  <TableHead className="text-sky-300">Points</TableHead>
                  <TableHead className="text-violet-300">Avg</TableHead>
                  <TableHead className="text-yellow-300">Rank</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <motion.tr
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
                  className="border-b border-gray-700 hover:bg-gray-800/70 transition-all duration-200"
                >
                  <TableCell>{totalGame}</TableCell>
                  <TableCell className="font-semibold text-gray-400">
                    {totalWin}
                  </TableCell>
                  {/* ✅ FRONTEND WIN% */}
                  <TableCell className="font-semibold text-gray-400">
                    {winPercentage}
                  </TableCell>
                  <TableCell className="font-semibold text-gray-400">
                    {totalPoint}
                  </TableCell>
                  <TableCell className="font-semibold text-gray-400">
                    {avgPoints}
                  </TableCell>
                  <TableCell className="font-semibold text-yellow-300">
                    {data.win_rank}
                  </TableCell>
                </motion.tr>
              </TableBody>
            </Table>
          </motion.div>
        ) : (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-gray-400 text-center py-4"
          >
            No stats found for this player.
          </motion.p>
        )}
      </div>
    </motion.div>
  );
}
