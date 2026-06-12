
// ============================ win % fixing in minileague 

"use client";

import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPlayerResult } from "@/redux/slices/PlayerResultSlice";
import { motion } from "framer-motion";
import gsap from "gsap";
import { Button } from "@/components/ui/button";
import { LineChart, SeparatorVertical } from "lucide-react";
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
import StatsExplainedDialog from "@/components/shared/StatsExplainedDialog";

export default function PlayerStatsUser({ userId }) {
  const dispatch = useDispatch();
  const { data, loading, error } = useSelector(
    (state) => state.playerResult
  );
  const cardRef = useRef<HTMLDivElement | null>(null);

  const searchParams = useSearchParams();
  const ladderId = searchParams.get("ladder_id");

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
      <div className="w-full sm:max-w-full bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-gray-900 dark:via-blue-950 dark:to-gray-800 text-slate-800 dark:text-white rounded-2xl shadow-2xl p-3 sm:p-5 overflow-hidden border border-slate-200 dark:border-gray-700 backdrop-blur-md">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mb-4">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-3"
          >
            <h1 className="text-lg sm:text-xl font-bold tracking-wide text-slate-800 dark:text-white">
              🏆 Player Statistics
            </h1>
          </motion.div>

          <StatsExplainedDialog />
        </div>

        {/* Stats Table */}
        {data ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="rounded-xl overflow-x-auto border border-slate-200 dark:border-gray-700 shadow-inner bg-slate-100/50 dark:bg-black/30 w-full"
          >
            <Table className="w-full text-[11px] sm:text-sm md:text-base">
              <TableHeader className="bg-gradient-to-r from-slate-100 to-slate-200 dark:from-gray-800 dark:to-gray-900">
                <TableRow>
                  <TableHead className="text-blue-600 dark:text-blue-400 px-1 py-2 sm:px-4 text-center">Games</TableHead>
                  <TableHead className="text-green-600 dark:text-green-400 px-1 py-2 sm:px-4 text-center">Wins</TableHead>
                  <TableHead className="text-red-600 dark:text-red-400 px-1 py-2 sm:px-4 text-center">Win%</TableHead>
                  <TableHead className="text-sky-600 dark:text-sky-300 px-1 py-2 sm:px-4 text-center">Points</TableHead>
                  <TableHead className="text-violet-600 dark:text-violet-300 px-1 py-2 sm:px-4 text-center">Avg</TableHead>
                  <TableHead className="text-yellow-600 dark:text-yellow-300 px-1 py-2 sm:px-4 text-center">Rank</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <motion.tr
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
                  className="border-b border-slate-200 dark:border-gray-700 hover:bg-slate-100 dark:hover:bg-gray-800/70 transition-all duration-200"
                >
                  <TableCell className="px-1 py-2.5 sm:px-4 text-center text-slate-800 dark:text-gray-300">{totalGame}</TableCell>
                  <TableCell className="font-semibold text-slate-700 dark:text-gray-400 px-1 py-2.5 sm:px-4 text-center">
                    {totalWin}
                  </TableCell>
                  {/* ✅ FRONTEND WIN% */}
                  <TableCell className="font-semibold text-slate-700 dark:text-gray-400 px-1 py-2.5 sm:px-4 text-center">
                    {winPercentage}
                  </TableCell>
                  <TableCell className="font-semibold text-slate-700 dark:text-gray-400 px-1 py-2.5 sm:px-4 text-center">
                    {totalPoint}
                  </TableCell>
                  <TableCell className="font-semibold text-slate-700 dark:text-gray-400 px-1 py-2.5 sm:px-4 text-center">
                    {avgPoints}
                  </TableCell>
                  <TableCell className="font-semibold text-yellow-600 dark:text-yellow-300 px-1 py-2.5 sm:px-4 text-center">
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
