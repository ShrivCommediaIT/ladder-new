"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { LucideSearch, X, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AgeFilter from "@/components/shared/AgeFilter";
import { useSearchParams } from "next/navigation";

const PlayerSearch = ({ searchTerm, setSearchTerm, onAgeSearch, onClearFilters }) => {
  const [open, setOpen] = useState(true); // ✅ always open by default
  const [selectedAge, setSelectedAge] = useState(null);
  const searchParams = useSearchParams();
  const ladderType = searchParams.get("type");
  // 📱 ensure open on all screen sizes
  useEffect(() => {
    setOpen(true);
  }, []);

  const handleSearchChange = (e) => {
    let val = e.target.value;
    val = val.replace(/^\s+/, "");
    val = val.replace(/\s{2,}/g, " ");
    setSearchTerm(val);
  };

  const handleAgeSearch = (age, ageType, gender) => {
    setSelectedAge(age);
    if (onAgeSearch) {
      onAgeSearch(age, ageType, gender);
    }
  };

  const handleClearAll = () => {
    setSearchTerm("");
    setSelectedAge(null);
    if (onAgeSearch) onAgeSearch(null, "under", "");
    if (onClearFilters) onClearFilters();
  };

  const hasActiveFilters = searchTerm || selectedAge;

  return (
    <div className="flex items-center gap-2 w-full max-w-md flex-wrap">

      {/* 🔍 Search Icon (desktop toggle) */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="p-2 rounded-full bg-pink-200 hover:bg-pink-300 transition flex-shrink-0"
      >
        <LucideSearch className="w-5 h-5 text-gray-700" />
      </button>

      {/* 📝 Search Input — always visible */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "100%", opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden flex-1 relative min-w-[160px]"
          >
            <Input
              autoFocus
              placeholder="Search player by name"
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-3 pr-9 h-10 rounded bg-pink-100 placeholder-gray-600 
                         focus:ring-2 focus:ring-pink-400 focus:border-pink-400 
                         transition-all w-full"
            />

            {/* ❌ Clear search text */}
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-200 transition"
                type="button"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🎂 Age Filter */}
      {!ladderType && <div className="h-10 flex-shrink-0">
        <AgeFilter onSearch={handleAgeSearch} user={true} />
      </div>}

      {/* 🔄 Clear All Filters button — only shows when filters are active */}
      <AnimatePresence>
        {hasActiveFilters && (
          <motion.button
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ duration: 0.2 }}
            onClick={handleClearAll}
            type="button"
            className="flex items-center gap-1.5 px-3 h-10 rounded-full bg-gray-100 hover:bg-red-100 hover:text-red-600 text-gray-600 text-sm font-medium transition flex-shrink-0 border border-gray-200 hover:border-red-300"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Clear
          </motion.button>
        )}
      </AnimatePresence>

    </div>
  );
};

export default PlayerSearch;