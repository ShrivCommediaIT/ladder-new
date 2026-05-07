"use client";

import React from "react";

const TONE_CLASSNAMES = {
  default: "best-board-card-soft text-white",
  accent:
    "border-[var(--best-board-border-strong)] bg-[var(--best-board-accent-soft)] text-white",
  danger:
    "border-[color:color-mix(in_srgb,var(--best-board-danger)_35%,transparent)] bg-[color:color-mix(in_srgb,var(--best-board-danger)_16%,transparent)] text-white",
};

function QuickActionButton({
  icon: Icon,
  label,
  onClick,
  disabled = false,
  tone = "default",
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-lg p-4 text-center transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 ${TONE_CLASSNAMES[tone] || TONE_CLASSNAMES.default}`}
    >
      <Icon className="mx-auto mb-2 h-4 w-4" />
      <p className="text-xs uppercase tracking-[0.22em] text-[var(--best-board-muted)]">
        {label}
      </p>
    </button>
  );
}

export default function QuickActionsCard({
  title = "Quick Actions",
  actions = [],
  columns = 2,
  children,
}) {
  const visibleActions = actions.filter((action) => !action.hidden);

  if (visibleActions.length === 0 && !children) {
    return null;
  }

  return (
    <div className="best-board-card rounded-xl p-4">
      <p className="mb-4 text-[11px] uppercase tracking-[0.28em] text-[var(--best-board-muted)]">
        {title}
      </p>
      {children ? (
        children
      ) : (
        <div
          className="grid gap-2"
          style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
        >
          {visibleActions.map((action) => (
            <QuickActionButton key={action.id || action.label} {...action} />
          ))}
        </div>
      )}
    </div>
  );
}
