"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { LucideSearch, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const PlayerSearch = ({
  searchTerm,
  setSearchTerm,
  onClearFilters,
  activeFilters = false,
}) => {
  const [open, setOpen] = useState(true); // ✅ always open by default

  useEffect(() => {
    setOpen(true);
  }, []);

  const handleSearchChange = (e) => {
    let val = e.target.value;
    val = val.replace(/^\s+/, "");
    val = val.replace(/\s{2,}/g, " ");
    setSearchTerm(val);
  };

  return (
    <div className="flex items-center gap-2 w-full flex-wrap">

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
                onClick={() => {
                  setSearchTerm("");
                  if (onClearFilters) onClearFilters();
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-200 transition"
                type="button"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default PlayerSearch;