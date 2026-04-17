

"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import Minileague from "./Minileague";
import { InvertRanckings } from "@/components/shared/InvertRanckings";
import { useSearchParams } from "next/navigation";

const MinileagueSearch = ({
  value,
  onChange,
  placeholder = "Search player by name...",
}) => {
  const inputRef = useRef(null);
  const [displayValue, setDisplayValue] = useState("");
  const [isSubAdminDetails, setIsSubAdminDetails] = useState(null);

  // Clean search value (IGNORE ALL SPACES for backend)
  const cleanSearchValue = useCallback((inputValue) => {
    if (!inputValue) return "";
    return inputValue.replace(/\s+/g, "").toLowerCase();
  }, []);

  const searchParams = useSearchParams();
  const ladderType = searchParams.get("ladder_type");

  useEffect(() => {
    const subAdminDetails = JSON.parse(sessionStorage.getItem("subAdmin"))
    if (subAdminDetails?.role === "admin") {
      setIsSubAdminDetails(true)
    }
  }, [])

  const handleChange = useCallback(
    (e) => {
      const rawValue = e.target.value;
      setDisplayValue(rawValue);
      onChange(cleanSearchValue(rawValue));
    },
    [cleanSearchValue, onChange]
  );

  const handleClear = useCallback(() => {
    setDisplayValue("");
    onChange("");
    inputRef.current?.focus();
  }, [onChange]);

  useEffect(() => {
    if (!value) setDisplayValue("");
  }, [value]);

  return (
    <div className="flex gap-3">
      <div className="relative w-full border border-white/10 bg-zinc-900/70 backdrop-blur-xl shadow-lg focus-within:border-indigo-500/60 focus-within:shadow-indigo-500/20 transition-all duration-300 p-2 bg-gradient-to-r from-gray-900 to-cyan-900 rounded-md">
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={displayValue}
          onChange={handleChange}
          className="
          pl-11 pr-12 py-3
          text-[15px] text-zinc-100 placeholder:text-zinc-400
          bg-transparent border-none
          focus-visible:ring-0 focus-visible:ring-offset-0
        "
        />

        {/* Search Icon */}
        <svg
          className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1110.5 3a7.5 7.5 0 016.15 13.65z"
          />
        </svg>

        {/* Clear Button */}
        {displayValue && (
          <button
            onClick={handleClear}
            type="button"
            aria-label="Clear search"
            className="
            absolute right-2.5 top-1/2 -translate-y-1/2
            p-1.5 rounded-full
            bg-zinc-800/60 hover:bg-zinc-700
            text-zinc-400 hover:text-white
            transition-all duration-200
          "
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      {/* {(ladderType == null && isSubAdminDetails == null) ? <InvertRanckings /> : null} */}
    </div>
  );
};

export default MinileagueSearch;
