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

      <div className={`${mobileSection === "toolbar" || mobileSection === "players" ? "block" : "hidden"} lg:sticky lg:top-[4.8rem] lg:z-30 lg:block`}>
        <div className="z-20 mb-4 flex flex-col gap-4 bg-[var(--best-board-bg)] pb-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {showReset ? (
              <ActionButton icon={RotateCcw} onClick={() => setResetOpen(true)}>
                {resetLabel}
              </ActionButton>
            ) : null}

            {showAddRemove ? (
              <Dialog open={addRemoveOpen} onOpenChange={setAddRemoveOpen}>
                <DialogTrigger asChild>
                  <ActionButton icon={Plus}>{addRemoveLabel}</ActionButton>
                </DialogTrigger>
                <DialogContent className="best-board-card border-[var(--best-board-border)] text-white sm:max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{addRemoveTitle}</DialogTitle>
                  </DialogHeader>
                  <AddRemoveBox
                    ladderId={ladderId}
                    onSuccessRefresh={() => {
                      setAddRemoveOpen(false);
                      refreshLeaderboard();
                    }}
                  />
                </DialogContent>
              </Dialog>
            ) : null}

            {showSort ? (
              <Dialog open={sortOpen} onOpenChange={setSortOpen}>
                <DialogTrigger asChild>
                  <ActionButton icon={ArrowDownUp} active={sortMode === "name"}>
                    {sortLabel}
                  </ActionButton>
                </DialogTrigger>
                <DialogContent className="best-board-card border-[var(--best-board-border)] text-white sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Sort Players</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3 mt-4">
                    {[
                      {
                        label: "Rank",
                        value: "rank",
                        description: "Keep the current leaderboard order.",
                      },
                      {
                        label: "Name",
                        value: "name",
                        description: "Sort players alphabetically.",
                      },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setSortMode(option.value);
                          setSortOpen(false);
                        }}
                        className={`w-full rounded-lg border px-4 py-3 text-left text-sm transition ${
                          sortMode === option.value
                            ? "border-[var(--best-board-border-strong)] bg-[var(--best-board-accent-soft)] text-[var(--best-board-text)]"
                            : "border-[var(--best-board-border)] bg-[var(--best-board-surface)] text-[var(--best-board-text)] hover:bg-[var(--best-board-surface-soft)]"
                        }`}
                      >
                        <div className="font-semibold">{option.label}</div>
                        <div className="text-[var(--best-board-muted)] text-xs mt-1">{option.description}</div>
                      </button>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            ) : null}

            {showFilter ? (
              <ActionButton
                icon={Filter}
                onClick={() => setFilterOpen(true)}
                active={Boolean(appliedAge || appliedGender) || filterOpen}
              >
                {filterLabel}
              </ActionButton>
            ) : null}
          </div>

          {showSectionSize ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-[var(--best-board-muted)]">{sectionLabel}</span>
              <select
                value={groupSize}
                onChange={(e) => onPresetChange?.(Number(e.target.value))}
                className="h-10 rounded-lg border border-[var(--best-board-border)] bg-[var(--best-board-surface)] px-3 text-sm text-white outline-none"
              >
                {sectionOptions.map((size) => (
                  <option key={size} value={size}>
                    {size} sections
                  </option>
                ))}
              </select>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
