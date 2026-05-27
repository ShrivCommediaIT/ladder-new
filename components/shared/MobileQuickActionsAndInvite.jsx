"use client";

import React, { useState } from "react";
import { Copy, Check } from "lucide-react";
import QuickActionsCard from "./QuickActionsCard";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { useSearchParams } from "next/navigation";

export default function MobileQuickActionsAndInvite({ inviteUrl, quickActions }) {
  const [copied, setCopied] = useState(false);
  const searchParams = useSearchParams();
  const propLadderId = searchParams.get("ladder_id");

  const isDemo = useSelector((state) => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("demo") === "true") return true;
    }
    const createdBy = 
      state.player?.players?.[propLadderId]?.ladderDetails?.created_by ||
      state.player?.players?.[Number(propLadderId)]?.ladderDetails?.created_by ||
      state.skillLeaderboard?.ladderDetails?.created_by ||
      state.positiveLeaderBoard?.ladderDetails?.created_by ||
      state.negativeLeaderBoard?.ladderDetails?.created_by ||
      state.rosterLeaderboard?.ladderDetails?.created_by ||
      state.minileague?.data?.created_by;

    return createdBy?.toLowerCase() === "demo";
  });

  const handleCopy = async () => {
    if (!inviteUrl) return;
    if (isDemo) {
      toast.warning("Disabled for Demo Purposes");
      return;
    }
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(inviteUrl);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = inviteUrl;
        textarea.style.position = "fixed";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      toast.success("Invite link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const hasActions = Array.isArray(quickActions) && quickActions.length > 0;

  if (!inviteUrl && !hasActions) return null;

  return (
    <div className="lg:hidden mb-6 flex flex-col gap-4">
      {inviteUrl && (
        <div className="best-board-card rounded-xl p-4">
          <p className="mb-3 text-[11px] uppercase tracking-[0.28em] text-[var(--best-board-muted)]">
            Invite URL
          </p>
          <div className="rounded-lg border border-[var(--best-board-border)] bg-[var(--best-board-bg)] p-3 text-xs text-[var(--best-board-muted)] break-all select-all font-mono">
            {inviteUrl}
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className={`best-board-action-surface mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
              copied
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.15)]"
                : "border border-[var(--best-board-border)] text-[var(--best-board-text)] hover:bg-[var(--best-board-surface)]"
            }`}
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-emerald-400" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                <span>Copy Invite Link</span>
              </>
            )}
          </button>
        </div>
      )}

      {hasActions && (
        <QuickActionsCard title="Quick Actions" actions={quickActions} />
      )}
    </div>
  );
}
