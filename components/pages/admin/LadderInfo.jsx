

"use client";

import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function LadderInfo() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth < 640);
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  const ladders = [
    {
      id: 1,
      title: "Minileagues",
      description:
        "3-0 win - 8 Pts, 3-1 win - 7 Pts, 3-2 win - 6 Pts, 3-2 Loss - 4 Pts, 3-1 Loss - 3 Pts, 3-0 Loss - 2 Pts",
    },
    {
      id: 2,
      title: "Win/Lose Ladders",
      description:
        "Players move up or down based on wins and losses only. This is the simplest ladder if match scores are not important.",
    },
    {
      id: 3,
      title: "Best of 3 Ladders",
      description:
        "Used in Tennis, Squash, Badminton, Table Tennis etc. Results are 2-0 or 2-1. Match score and player effort is recorded for fair ranking.",
    },
    {
      id: 4,
      title: "Best of 5 Ladders",
      description:
        "Used where matches are decided by a best-of-5 format like 3-0, 3-1 or 3-2 with detailed performance tracking.",
    },
    {
      id: 5,
      title: "Skills/Performance Leaderboards",
      description: "Set up to 12 fully customisable exercises or challenges with targets and timescales of your choosing for your students/trainees to complete.  Highly motivational and useful for setting grades. ",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-4 sm:p-5"
    >
      {/* Yaha scroll add kar rahe hain */}
      <div 
        className="
          max-h-[320px]     
          overflow-y-auto        
          scrollbar-thin       
          scrollbar-thumb-cyan-600/50
          scrollbar-track-transparent
          pr-1
        "
      >
        <ul className="space-y-3">
          {ladders.map((ladder, index) => (
            <motion.li
              key={ladder.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="
                group flex items-center justify-between 
                rounded-xl border border-white/10 bg-black/30 
                px-3 py-3 hover:bg-white/10 hover:shadow-lg 
                hover:shadow-cyan-500/10 transition
              "
            >
              <div className="flex items-center gap-2 text-white/90">
                <span className="text-cyan-300 font-bold">{ladder.id}.</span>
                <span className="text-sm sm:text-base font-medium">
                  {ladder.title}
                </span>
              </div>

              {isMobile ? (
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="grid place-items-center h-8 w-8 rounded-full bg-white/10 text-cyan-300 hover:scale-110 transition">
                      <Info className="w-4 h-4" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="max-w-xs sm:max-w-md border border-white/10 bg-[#0b1020]/95 text-white backdrop-blur-xl shadow-xl animate-in fade-in zoom-in">
                    {ladder.id === 1 ? (
                      <table className="text-xs sm:text-sm w-full text-left border-collapse">
                        <tbody>
                          <tr><td className="pr-4 py-1">3-0 Win</td><td className="py-1 font-semibold">8 Pts</td></tr>
                          <tr><td className="pr-4 py-1">3-1 Win</td><td className="py-1 font-semibold">7 Pts</td></tr>
                          <tr><td className="pr-4 py-1">3-2 Win</td><td className="py-1 font-semibold">6 Pts</td></tr>
                          <tr><td className="pr-4 py-1">3-2 Loss</td><td className="py-1 font-semibold">4 Pts</td></tr>
                          <tr><td className="pr-4 py-1">3-1 Loss</td><td className="py-1 font-semibold">3 Pts</td></tr>
                          <tr><td className="pr-4 py-1">3-0 Loss</td><td className="py-1 font-semibold">2 Pts</td></tr>
                        </tbody>
                      </table>
                    ) : (
                      <p className="text-xs sm:text-sm leading-relaxed">{ladder.description}</p>
                    )}
                  </PopoverContent>
                </Popover>
              ) : (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="grid place-items-center h-8 w-8 rounded-full bg-white/10 text-cyan-300 hover:scale-110 transition">
                        <Info className="w-4 h-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent
                      side="right"
                      sideOffset={10}
                      className="max-w-md border border-white/10 bg-[#0b1020]/95 text-white backdrop-blur-xl shadow-xl animate-in fade-in zoom-in"
                    >
                      {ladder.id === 1 ? (
                        <table className="text-sm w-full text-left border-collapse">
                          <tbody>
                            <tr><td className="pr-4 py-1">3-0 Win</td><td className="py-1 font-semibold">8 Pts</td></tr>
                            <tr><td className="pr-4 py-1">3-1 Win</td><td className="py-1 font-semibold">7 Pts</td></tr>
                            <tr><td className="pr-4 py-1">3-2 Win</td><td className="py-1 font-semibold">6 Pts</td></tr>
                            <tr><td className="pr-4 py-1">3-2 Loss</td><td className="py-1 font-semibold">4 Pts</td></tr>
                            <tr><td className="pr-4 py-1">3-1 Loss</td><td className="py-1 font-semibold">3 Pts</td></tr>
                            <tr><td className="pr-4 py-1">3-0 Loss</td><td className="py-1 font-semibold">2 Pts</td></tr>
                          </tbody>
                        </table>
                      ) : (
                        <p className="text-sm leading-relaxed">{ladder.description}</p>
                      )}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </motion.li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}