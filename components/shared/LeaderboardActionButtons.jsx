"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Funnel, X } from "lucide-react";
import BasicLeaderboardPrintSkillsSheet from "@/components/pages/admin/BasicLeaderboardPrintSkillsSheet";
import AgeFilter from "@/components/shared/AgeFilter";

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
  className = "flex flex-wrap justify-between w-full sm:flex-nowrap gap-2 mt-3 sm:mt-0",
  onAgeSearch = null,
  resetSignal = 0,
}) {
  if (onlyLeave) {
    return (
      <div className={`${className} flex items-center justify-between gap-2 w-full`}>
        {currentUserId && (
          <Button
            onClick={handleSelfRemove}
            disabled={isRefreshing}
            className="bg-gradient-to-r from-red-500/10 to-orange-500/10 hover:from-red-500/20 hover:to-orange-500/20 
                 text-red-400 border border-red-500/20 font-bold rounded-lg px-4 py-2 flex items-center gap-2 shadow-lg transition-all duration-250 w-full justify-center sm:w-auto"
          >
            <X size={16} className="w-4 h-4 text-red-400" />
            Click here to leave this solution
          </Button>
        )}
        {onAgeSearch && (
          <div className="h-10 flex-shrink-0">
            <AgeFilter onSearch={onAgeSearch} user={false} resetSignal={resetSignal} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`${className} flex items-center gap-2`}>
      <div className="flex flex-wrap items-center gap-2">
      {(!isSorted && appliedAge === 0) ? (
        <Button
          onClick={handleSortBySkill}
          disabled={isRefreshing}
          className="bg-gradient-to-r from-teal-500/10 to-emerald-500/10 hover:from-teal-500/20 hover:to-emerald-500/20 
               text-teal-400 border border-teal-500/20 font-bold rounded-lg px-4 py-2 flex items-center gap-2 transition-all duration-250"
        >
          <Funnel size={16} className="text-teal-400" />
          Sort by {sortByText}
        </Button>
      ) : (
        <Button
          onClick={handleClearAll}
          disabled={isRefreshing}
          className="bg-gradient-to-r from-rose-500/10 to-red-500/10 hover:from-rose-500/20 hover:to-red-500/20 
               text-rose-400 border border-rose-500/20 font-bold rounded-lg px-4 py-2 flex items-center gap-2 transition-all duration-250"
        >
          <Funnel size={16} className="text-rose-400" />
          Clear All
        </Button>
      )}

      {currentUserId && (
        <Button
          onClick={handleSelfRemove}
          disabled={isRefreshing}
          className="bg-gradient-to-r from-red-500/10 to-orange-500/10 hover:from-red-500/20 hover:to-orange-500/20 
               text-red-400 border border-red-500/20 font-bold rounded-lg px-4 py-2 flex items-center gap-2 shadow-lg transition-all duration-250"
        >
          <X size={16} className="w-4 h-4 text-red-400" />
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

      {onAgeSearch && (
        <div >
          <AgeFilter onSearch={onAgeSearch} user={true} resetSignal={resetSignal} />
        </div>
      )}
    </div>
  );
}
