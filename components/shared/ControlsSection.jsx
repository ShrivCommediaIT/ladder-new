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
  return (
    <>
      <div className="mb-4 flex gap-2 lg:hidden">
        {mobileSections.map((section) => (
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


    </>
  );
}
