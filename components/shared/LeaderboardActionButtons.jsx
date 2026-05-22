"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Funnel, X } from "lucide-react";
import BasicLeaderboardPrintSkillsSheet from "@/components/pages/admin/BasicLeaderboardPrintSkillsSheet";

export default function LeaderboardActionButtons({
  isSorted = false,
  appliedAge = 0,
  isRefreshing = false,
  handleSortBySkill,
  handleClearAll,
  currentUserId,
  handleSelfRemove,
  showPrint = false,
  skills = [],
  ladderId,
  sortByText = "Skill",
  onlyLeave = false,
  className = "flex flex-wrap justify-between w-full sm:flex-nowrap gap-2 mt-3 sm:mt-0"
}) {
  if (onlyLeave) {
    return (
      <div className={className}>
        {currentUserId && (
          <Button
            onClick={handleSelfRemove}
            disabled={isRefreshing}
            className="bg-gradient-to-r from-red-500 to-red-500 hover:from-orange-600 hover:to-red-600 
                 text-white font-bold rounded-md px-4 py-2 flex items-center gap-2 shadow-lg"
          >
            <X size={16} className="w-4 h-4" />
            Click here to leave this solution
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={className}>
      {(!isSorted && appliedAge === 0) ? (
        <Button
          onClick={handleSortBySkill}
          disabled={isRefreshing}
          className="bg-[#005F5A] text-white font-bold rounded-md px-4 py-2 flex items-center gap-2"
        >
          <Funnel size={16} />
          Sort by {sortByText}
        </Button>
      ) : (
        <Button
          onClick={handleClearAll}
          disabled={isRefreshing}
          className="bg-red-600 text-white font-bold rounded-md px-4 py-2 flex items-center gap-2"
        >
          <Funnel size={16} />
          Clear All
        </Button>
      )}

      {currentUserId && (
        <Button
          onClick={handleSelfRemove}
          disabled={isRefreshing}
          className="bg-gradient-to-r from-red-500 to-red-500 hover:from-orange-600 hover:to-red-600 
               text-white font-bold rounded-md px-4 py-2 flex items-center gap-2 shadow-lg"
        >
          <X size={16} className="w-4 h-4" />
          Click here to leave this solution
        </Button>
      )}

      {showPrint && (
        <BasicLeaderboardPrintSkillsSheet
          skills={skills}
          ladderId={ladderId}
          className="hidden"
        />
      )}
    </div>
  );
}
