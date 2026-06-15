"use client";

import { Input } from "@/components/ui/input";
import { Calendar } from "lucide-react";
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
  style,
  ...props
}) {
  const inputRef = useRef(null);

  const handleClick = (e) => {
    if (inputRef.current) {
      try {
        if (typeof inputRef.current.showPicker === "function") {
          inputRef.current.showPicker();
        } else {
          inputRef.current.focus();
        }
      } catch (err) {
        inputRef.current.focus();
      }
    }
  };

  return (
    <div onClick={handleClick} className="relative cursor-pointer w-full">
      <Calendar className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
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
          "bg-[var(--input-bg)] border-[var(--input-border)] text-foreground accent-primary pr-4",
          "focus:border-primary focus:ring-2 focus:ring-primary/20",
          "hover:border-primary/50",
          "[&::-webkit-calendar-picker-indicator]:cursor-pointer",
          "[&::-webkit-calendar-picker-indicator]:opacity-70 hover:[&::-webkit-calendar-picker-indicator]:opacity-100",
          "dark:[&::-webkit-calendar-picker-indicator]:brightness-0 dark:[&::-webkit-calendar-picker-indicator]:invert",
          className,
        )}
        style={{
          ...style,
          paddingLeft: "44px",
        }}
        {...props}
      />
    </div>
  );
}
