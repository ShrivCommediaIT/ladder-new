"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

function Switch({
  className,
  checked,
  onCheckedChange,
  disabled,
  id,
  ...props
}) {
  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    onCheckedChange?.(!checked);
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      id={id}
      onClick={handleClick}
      className={cn(
        "peer inline-flex h-[1.15rem] w-8 shrink-0 cursor-pointer items-center rounded-full border border-transparent shadow-xs transition-all outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "bg-primary" : "bg-zinc-600 dark:bg-zinc-600",
        className
      )}
      {...props}
    >
      <span
        className={cn(
          "bg-white pointer-events-none block size-4 rounded-full ring-0 transition-transform shadow-sm",
          checked ? "translate-x-[14px]" : "translate-x-0"
        )}
      />
    </button>
  );
}

export { Switch }
