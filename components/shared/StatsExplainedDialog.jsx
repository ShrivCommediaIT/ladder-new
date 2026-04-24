"use client";

import React from "react";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useSearchParams } from "next/navigation";

const StatsExplainedDialog = () => {
  const searchParams = useSearchParams();
  
  return (
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
                      <span>6 Points for a 2-0 win</span>
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
  );
};

export default StatsExplainedDialog;
