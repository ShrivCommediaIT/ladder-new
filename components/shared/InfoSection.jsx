"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { getRequest } from "@/services/apiService";
import { API_ENDPOINTS } from "@/constants/api";
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
import ActivityLog from "@/components/pages/players/ActivityList";
import { Copy, X } from "lucide-react";
import { formatLadderType } from "./ladderUtils";

// User-level specific sidebar imports
import ContactAdmin from "@/components/shared/ContactAdmin";
import LadderRuleCardUser from "@/components/pages/users/LadderRuleCardUser";
import ActivityLogUser from "@/components/shared/ActivityLogUser";
import EditPlayer from "@/components/shared/EditPlayer";

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
  userLevel = false,
}) {
  const [copied, setCopied] = useState(false);
  const [sessionUser, setSessionUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [adminDetails, setAdminDetails] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const searchParams = useSearchParams();
  const propLadderId = searchParams.get("ladder_id");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedSub = sessionStorage.getItem("subAdmin");
      const storedAdmin = sessionStorage.getItem("userData");
      const storedUser = sessionStorage.getItem("user");

      if (storedSub) {
        try {
          setSessionUser(JSON.parse(storedSub));
        } catch (e) {
          console.error(e);
        }
      } else if (storedAdmin) {
        try {
          setSessionUser(JSON.parse(storedAdmin));
        } catch (e) {
          console.error(e);
        }
      }

      if (storedUser) {
        try {
          setCurrentUser(JSON.parse(storedUser));
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, [contactOpen]);

  useEffect(() => {
    if (!userLevel || !propLadderId) return;
    const fetchAdmin = async () => {
      try {
        const res = await getRequest(API_ENDPOINTS.LEADERBOARD, { ladder_id: propLadderId });
        setAdminDetails(res?.ladderDetails || null);
      } catch (err) {
        console.error("Error fetching admin details in InfoSection:", err);
      }
    };
    fetchAdmin();
  }, [userLevel, propLadderId]);

  const isSubAdmin = sessionUser?.user_type === "sub_admin" || sessionUser?.role === "sub_admin" || (typeof window !== "undefined" && !!sessionStorage.getItem("subAdmin"));
  const contactTitle = userLevel ? "Admin Contact" : isSubAdmin ? "Sub-Admin Contact" : "Admin Contact";
  const displayName = userLevel 
    ? adminDetails?.admin_name || "Admin" 
    : sessionUser?.name || user?.name || (isSubAdmin ? "Sub-Admin" : "Admin");
  const displayPhone = userLevel 
    ? adminDetails?.admin_phone || "Not Provided" 
    : sessionUser?.phone || user?.phone || "N/A";

  const handleCopy = async () => {
    if (!inviteUrl) return;
    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
        await navigator.clipboard.writeText(inviteUrl);
        setCopied(true);
      } else {
        // Fallback for non-secure contexts (HTTP)
        const textarea = document.createElement("textarea");
        textarea.value = inviteUrl;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        try {
          const successful = document.execCommand("copy");
          if (successful) {
            setCopied(true);
          } else {
            console.error("Fallback copy command was unsuccessful");
          }
        } catch (err) {
          console.error("Fallback copy failed", err);
        }
        document.body.removeChild(textarea);
      }
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

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

          {userLevel ? (
            <ContactAdmin />
          ) : (
            <div className="best-board-card rounded-xl p-4">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--best-board-muted)]">{contactTitle}</p>
                {!userLevel && (
                  <button
                    type="button"
                    onClick={() => setContactOpen(true)}
                    className="rounded-md border border-[var(--best-board-border)] bg-white/5 px-3 py-1 text-xs text-[var(--best-board-muted)]"
                  >
                    Edit
                  </button>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--best-board-muted)]">Name</p>
                  <p className="mt-1 text-xl font-semibold text-[var(--best-board-text)]">{displayName}</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--best-board-muted)]">Phone</p>
                  <p className="mt-1 text-xl font-semibold text-[var(--best-board-text)]">{displayPhone}</p>
                </div>
              </div>
            </div>
          )}

          {inviteUrl && (
            <div className="best-board-card rounded-xl p-4 hidden lg:block">
              <p className="mb-4 text-[11px] uppercase tracking-[0.28em] text-[var(--best-board-muted)]">Invite URL</p>
              <div className="rounded-lg border border-[var(--best-board-border)] bg-[var(--best-board-bg)] p-3 text-xs text-[var(--best-board-muted)] break-all">
                {inviteUrl || "Invite link unavailable"}
              </div>
              <button
                type="button"
                onClick={handleCopy}
                disabled={!inviteUrl}
                className={`best-board-action-surface mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  copied 
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" 
                    : ""
                }`}
              >
                <Copy className={`h-4 w-4 transition-transform duration-200 ${copied ? "scale-110" : ""}`} />
                {copied ? "Copied!" : "Copy Link"}
              </button>
            </div>
          )}

          <div className="hidden lg:block">
            <QuickActionsCard actions={quickActions} />
          </div>

          {userLevel ? (
            <LadderRuleCardUser ladderIdProp={propLadderId} />
          ) : (
            <div className="rounded-2xl border border-primary/20 bg-card/95 p-4 shadow-lg">
              <div className="mb-4 rounded-xl border border-primary/15 bg-gradient-to-r from-primary/12 via-secondary/12 to-primary/8 px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.28em] text-primary/80">
                  INFORMATION / RULES
                </p>
              </div>
              <LadderRulesCard />
            </div>
          )}

          {userLevel ? (
            <ActivityLogUser ladderId={propLadderId} />
          ) : (
            <ActivityLog userLevel={userLevel} />
          )}

          {!userLevel && (
            <div className="best-board-card rounded-xl p-4">
              <p className="mb-4 text-[11px] uppercase tracking-[0.28em] text-[var(--best-board-muted)]">Members & Local Services</p>
              <p className="text-sm leading-6 text-[var(--best-board-muted)]">
                Manage member access, local service integrations, discount tokens, and club information from this shared side panel.
              </p>
            </div>
          )}
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

      {isEditOpen && (
        <EditPlayer
          open={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          currentId={currentUser?.id}
          ladder_id={propLadderId}
          ladder_type={currentUser?.ladder_type || ladderType}
        />
      )}
    </>
  );
}
