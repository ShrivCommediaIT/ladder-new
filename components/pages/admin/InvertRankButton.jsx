"use client";

import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toggleInvertRanking } from "@/redux/slices/leaderboardSlice";

export default function InvertRankButton() {
  const dispatch = useDispatch();
  const isDescending = useSelector(
    (state) => state.player.invertRanking
  );

  return (
    <Button
      variant="secondary"
      onClick={() => dispatch(toggleInvertRanking())}
      className="bg-[#163344] bg-[length:200%_100%] animate-gradient-x border border-gray-400 text-white font-bold uppercase rounded-xl py-3 px-4 h-16 w-full shadow-lg flex flex-col items-center justify-center gap-1 text-[10px] leading-tight cursor-pointer hover:bg-slate-900 transition-transform"
    >
      <ArrowUpDown size={16} />
      {isDescending ? "Descending" : "Ascending"}
    </Button>
  );
}
