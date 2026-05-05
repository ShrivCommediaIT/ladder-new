"use client";

import { Input } from "@/components/ui/input";
import {
  cn,
  formatDateInputValue,
  parseDateInputValue,
} from "@/lib/utils";
import { useRef } from "react";

const DEFAULT_MIN_DATE = "1920-01-01";

export default function DateOfBirthInput({
  id = "dob",
  value,
  onChange,
  className,
  min = DEFAULT_MIN_DATE,
  max,
  disabled = false,
  ...props
}) {
  const inputRef = useRef(null);

  const handleClick = () => {
    if (inputRef.current) {
      inputRef.current.showPicker?.() || inputRef.current.focus();
    }
  };

  return (
    <div onClick={handleClick} className="cursor-pointer">
      <Input
        ref={inputRef}
        id={id}
        type="date"
        value={formatDateInputValue(value)}
        min={min}
        max={max || formatDateInputValue(new Date())}
        onChange={(event) => onChange?.(parseDateInputValue(event.target.value))}
        disabled={disabled}
        className={cn(
          "[color-scheme:dark] bg-slate-900/70 border-cyan-500/30 text-white accent-cyan-400",
          "focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/40",
          "hover:border-cyan-400/50",
          "[&::-webkit-calendar-picker-indicator]:cursor-pointer",
          "[&::-webkit-calendar-picker-indicator]:opacity-90",
          "[&::-webkit-calendar-picker-indicator]:filter",
          "[&::-webkit-calendar-picker-indicator]:brightness-0",
          "[&::-webkit-calendar-picker-indicator]:invert",
          className,
        )}
        {...props}
      />
    </div>
  );
}
