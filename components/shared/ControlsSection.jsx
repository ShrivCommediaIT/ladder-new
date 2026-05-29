"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import AddRemoveBox from "@/components/pages/admin/AddRemoveBox";
import { ArrowDownUp, Filter, Plus, RotateCcw } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSearchParams } from "next/navigation";

const ActionButton = ({ icon: Icon, children, active = false, ...props }) => (
  <button
    type="button"
    {...props}
    className={`inline-flex h-10 items-center gap-2 rounded-lg border px-4 text-sm font-medium transition ${
      active
        ? "border-[var(--best-board-border-strong)] bg-[var(--best-board-accent-soft)] text-[var(--best-board-text)]"
        : "border-[var(--best-board-border)] bg-[var(--best-board-surface)] text-[var(--best-board-text)] hover:bg-[var(--best-board-surface-soft)]"
    } ${props.className || ""}`}
  >
    <Icon className="h-4 w-4" />
    <span>{children}</span>
  </button>
);

export default function ControlsSection({
  mobileSection,
  setMobileSection,
  mobileSections,
  resetOpen,
  setResetOpen,
  addRemoveOpen,
  setAddRemoveOpen,
  refreshLeaderboard,
  ladderId,
  sortMode,
  setSortMode,
  sortOpen,
  setSortOpen,
  filterOpen,
  setFilterOpen,
  appliedAge,
  appliedGender,
  groupSize,
  onPresetChange,
  showReset = true,
  showAddRemove = true,
  showSort = true,
  showFilter = true,
  showSectionSize = true,
  resetLabel = "Reset",
  addRemoveLabel = "Add / Remove",
  addRemoveTitle = "Manage Players",
  sortLabel = "Sort",
  filterLabel = "Age / Gender",
  sectionLabel = "Sections",
  sectionOptions = [1, 2, 3, 4, 5, 6, 7],
}) {
  const searchParams = useSearchParams();
  const urlType = searchParams.get("type") || searchParams.get("ladder_type");
  const isBestOrWinlose = ["best5", "best3", "winlose", "bestof5", "bestof3"].includes(urlType);
  const shouldShowSection = showSectionSize && isBestOrWinlose;
  return (
    <>
      <div className="mb-4 flex gap-2 lg:hidden mt-5">
        {mobileSections
          .filter((section) => section.id !== "toolbar" && section.label !== "Tools")
          .map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => setMobileSection(section.id)}
              className={`flex-1 rounded-lg border px-4 py-2 text-sm font-medium ${
                mobileSection === section.id
                  ? "border-[var(--best-board-border-strong)] bg-[var(--best-board-accent-soft)]"
                  : "border-[var(--best-board-border)] bg-[var(--best-board-surface)]"
              }`}
            >
              {section.label}
            </button>
          ))}
      </div>

      <div className={`${mobileSection === "toolbar" || mobileSection === "players" ? "block" : "hidden"} lg:sticky lg:top-[4.8rem] lg:z-30 lg:block`}>
        <div className="z-20 mb-4 flex flex-col gap-4 bg-[var(--best-board-bg)] pb-2 sm:flex-row sm:items-center sm:justify-between">

          {shouldShowSection ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-[var(--best-board-muted)]">{sectionLabel}</span>
              <Select
                value={groupSize ? String(groupSize) : undefined}
                onValueChange={(value) => onPresetChange?.(Number(value))}
              >
                <SelectTrigger className="h-10 w-36 rounded-lg border border-[var(--best-board-border)] bg-[var(--best-board-surface)] px-3 text-sm text-[var(--best-board-text)] font-medium outline-none shadow-none flex items-center justify-between">
                  <SelectValue placeholder={groupSize ? `${groupSize} sections` : "Select size"} />
                </SelectTrigger>
                <SelectContent className="w-36 min-w-[9rem] max-w-[9rem] bg-[var(--best-board-surface)] border border-[var(--best-board-border)] text-[var(--best-board-text)] shadow-lg z-50">
                  {Array.from(new Set([...sectionOptions, groupSize]))
                    .filter((size) => typeof size === "number" && !isNaN(size) && size > 0)
                    .sort((a, b) => a - b)
                    .map((size) => (
                      <SelectItem
                        key={size}
                        value={String(size)}
                        className="text-[var(--best-board-text)] text-xs hover:bg-[var(--best-board-surface-soft)] focus:bg-[var(--best-board-surface-soft)] focus:text-[var(--best-board-text)] cursor-pointer"
                      >
                        {size} sections
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
