

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
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function LadderInfo({ ladders }) {
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  const handleEditClick = (ladderId, ladderType, inverted) => {
    router.push(`/player-list?ladder_id=${ladderId}&type=${ladderType}&inverted=${inverted}&demo=true`);
  };

  useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth < 640);
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  const uniqueLadders = useMemo(() => {
    if (!ladders || ladders.length === 0) return [];

    const byType = new Map();
    for (const ladder of ladders) {
      const typeKey = ladder?.type || "unknown";
      if (!byType.has(typeKey)) {
        byType.set(typeKey, ladder);
      }
    }

    return Array.from(byType.values());
  }, [ladders]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full rounded-2xl border border-border bg-card shadow-sm p-4 sm:p-5"
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
          {uniqueLadders && uniqueLadders.map((ladder, index) => (
            <motion.li
              key={ladder.type || index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="
                group flex items-center justify-between 
                rounded-xl border border-border bg-muted/30 
                px-3 py-3 hover:bg-muted/50 transition
                cursor-pointer
              "
              onClick={() => handleEditClick(ladder.id, ladder.type, ladder.inverted)}
            >
              <div className="flex items-center gap-2 text-foreground">
                <span className="text-sm sm:text-base font-medium">
                  {ladder.name}
                </span>
              </div>

              {isMobile ? (
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="grid place-items-center h-8 w-8 rounded-full bg-primary/10 text-primary hover:scale-110 hover:bg-primary/20 transition">
                      <Info className="w-4 h-4" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[90vw] max-w-sm border border-border bg-card text-foreground backdrop-blur-xl shadow-xl animate-in fade-in zoom-in">
                    <p className="text-xs sm:text-sm leading-relaxed">{ladder.info}</p>
                  </PopoverContent>
                </Popover>
              ) : (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="grid place-items-center h-8 w-8 rounded-full bg-primary/10 text-primary hover:scale-110 hover:bg-primary/20 transition">
                        <Info className="w-4 h-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent
                      side="right"
                      sideOffset={10}
                      className="max-w-md border border-border bg-card/95 text-foreground backdrop-blur-xl shadow-xl animate-in fade-in zoom-in"
                    >
                      <p className="text-sm leading-relaxed">{ladder.info}</p>
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