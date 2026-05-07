"use client";

import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import AdminEditPhone from "@/components/shared/AdminEditPhone";
import LadderRulesCard from "@/components/pages/players/LadderRulesCard";
import QuickActionsCard from "@/components/shared/QuickActionsCard";
import { Copy, X } from "lucide-react";
import { formatLadderType } from "./ladderUtils";

export default function InfoSection({
  mobileSection,
  ladderType,
  user,
  inviteUrl,
  setContactOpen,
  setResetOpen,
  setAddRemoveOpen,
  setSortOpen,
  setFilterOpen,
  activityItems,
  handleDeleteActivity,
  contactOpen,
  resetOpen,
  handleResetBoard,
  quickActions = [],
  resetDescription = "This will reset the current ladder data.",
}) {
  return (
    <>
      <aside className={`${mobileSection === "info" ? "block" : "hidden"} lg:sticky lg:top-[5.2rem] lg:block lg:self-start`}>
        <div className="space-y-4">
          <div className="best-board-card rounded-xl p-4">
            <div className="mb-2 flex items-start justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--best-board-muted)]">Ladder Type</p>
                <p className="mt-1 text-2xl font-semibold text-[var(--best-board-text)]">{formatLadderType(ladderType)}</p>
              </div>
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
                Active
              </span>
            </div>
          </div>

          <div className="best-board-card rounded-xl p-4">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--best-board-muted)]">Admin Contact</p>
              <button
                type="button"
                onClick={() => setContactOpen(true)}
                className="rounded-md border border-[var(--best-board-border)] bg-white/5 px-3 py-1 text-xs text-[var(--best-board-muted)]"
              >
                Edit
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--best-board-muted)]">Name</p>
                <p className="mt-1 text-xl font-semibold text-[var(--best-board-text)]">{user?.name || "Admin"}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--best-board-muted)]">Phone</p>
                <p className="mt-1 text-xl font-semibold text-[var(--best-board-text)]">{user?.phone || "N/A"}</p>
              </div>
            </div>
          </div>

          <div className="best-board-card rounded-xl p-4">
            <p className="mb-4 text-[11px] uppercase tracking-[0.28em] text-[var(--best-board-muted)]">Invite URL</p>
            <div className="rounded-lg border border-[var(--best-board-border)] bg-[var(--best-board-bg)] p-3 text-xs text-[var(--best-board-muted)] break-all">
              {inviteUrl || "Invite link unavailable"}
            </div>
            <button
              type="button"
              onClick={() => {
                if (!inviteUrl) return;
                navigator.clipboard.writeText(inviteUrl);
              }}
              className="best-board-action-surface mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-lg text-sm font-medium"
            >
              <Copy className="h-4 w-4" />
              Copy Link
            </button>
          </div>

          <QuickActionsCard actions={quickActions} />

          <div className="rounded-2xl border border-primary/20 bg-card/95 p-4 shadow-lg">
            <div className="mb-4 rounded-xl border border-primary/15 bg-gradient-to-r from-primary/12 via-secondary/12 to-primary/8 px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.28em] text-primary/80">
                INFORMATION / RULES
              </p>
            </div>
            <LadderRulesCard />
          </div>

          <div className="best-board-card rounded-xl p-4">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--best-board-muted)]">Activity Feed</p>
              <span className="rounded-full border border-[var(--best-board-border-strong)] bg-[var(--best-board-accent-soft)] px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] best-board-highlight-soft">
                Live
              </span>
            </div>

            <div className="space-y-3">
              {activityItems.length === 0 ? (
                <p className="text-sm text-[var(--best-board-muted)]">No activity available.</p>
              ) : (
                activityItems.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 border-b border-white/5 pb-3 last:border-b-0 last:pb-0">
                    <span
                      className={`mt-1 block h-2.5 w-2.5 rounded-full ${activity?.progress?.toLowerCase() === "down"
                        ? "bg-[var(--best-board-danger)]"
                        : "bg-emerald-400"
                        }`}
                    />
                    <p className="flex-1 text-sm text-[var(--best-board-text)]">{activity.message}</p>
                    <button type="button" onClick={() => handleDeleteActivity(activity.id)} className="text-[var(--best-board-danger)]">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="best-board-card rounded-xl p-4">
            <p className="mb-4 text-[11px] uppercase tracking-[0.28em] text-[var(--best-board-muted)]">Members & Local Services</p>
            <p className="text-sm leading-6 text-[var(--best-board-muted)]">
              Manage member access, local service integrations, discount tokens, and club information from this shared side panel.
            </p>
          </div>
        </div>

      </aside>

      <Dialog open={contactOpen} onOpenChange={setContactOpen}>
        <DialogContent className="best-board-card border-[var(--best-board-border)] text-white sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Admin Contact</DialogTitle>
          </DialogHeader>
          <AdminEditPhone />
        </DialogContent>
      </Dialog>

      <AlertDialog open={resetOpen} onOpenChange={setResetOpen}>
        <AlertDialogContent className="best-board-card border-[var(--best-board-border)] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Reset leaderboard?</AlertDialogTitle>
            <AlertDialogDescription className="text-[var(--best-board-muted)]">
              {resetDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-[var(--best-board-border)] bg-[var(--best-board-surface-soft)] text-white hover:bg-[var(--best-board-surface)]">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleResetBoard}
              className="border border-[var(--best-board-border-strong)] bg-[var(--best-board-accent-soft)] text-white hover:bg-[var(--best-board-accent-soft)]"
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
