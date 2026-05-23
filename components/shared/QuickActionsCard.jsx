"use client";

import React from "react";

const TONE_CLASSES = {
  default: "best-board-card-soft border-[var(--best-board-border)] hover:bg-[var(--best-board-surface)]",
  accent: "border-[var(--best-board-border-strong)] bg-[var(--best-board-accent-soft)] hover:bg-[var(--best-board-accent-soft)]",
  danger: "border-[color:color-mix(in_srgb,var(--best-board-danger)_35%,transparent)] bg-[color:color-mix(in_srgb,var(--best-board-danger)_16%,transparent)] hover:bg-[color:color-mix(in_srgb,var(--best-board-danger)_24%,transparent)]",
  success: "border-emerald-300/50 bg-emerald-500/25 hover:bg-emerald-500/35",
};

export function QuickActionButton({ icon: Icon, label, onClick, disabled = false, tone = "default" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-lg h-16 w-full border px-4 text-white shadow-none transition hover:-translate-y-0.5 flex flex-col items-center justify-center gap-1 text-[10px] font-bold uppercase leading-tight disabled:cursor-not-allowed disabled:opacity-60 ${TONE_CLASSES[tone] || TONE_CLASSES.default}`}
    >
      {Icon && <Icon className="h-5 w-5" />}
      <span>{label}</span>
    </button>
  );
}

export default function QuickActionsCard({
  title = "Quick Actions",
  actions = [],
  children,
}) {
  const visibleActions = actions.filter((a) => !a.hidden);

  if (visibleActions.length === 0 && !children) return null;

  return (
    <div className="best-board-card rounded-xl p-4">
      <p className="mb-4 text-[11px] uppercase tracking-[0.28em] text-[var(--best-board-muted)]">
        {title}
      </p>
      {visibleActions.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {visibleActions.map((action) =>
            action.node ? (
              <div key={action.id} className="h-16 w-full">{action.node}</div>
            ) : (
              <QuickActionButton
                key={action.id}
                icon={action.icon}
                label={action.label}
                onClick={action.onClick}
                disabled={action.disabled}
                tone={action.tone || "default"}
              />
            )
          )}
        </div>
      )}
      {children}
    </div>
  );
}
