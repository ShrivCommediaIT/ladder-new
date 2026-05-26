"use client";

import React, { useEffect, useState, useCallback } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { getRequest } from "@/services/apiService";
import { API_ENDPOINTS } from "@/constants/api";

const ActivityLogUser = ({ ladderId }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [firstLoad, setFirstLoad] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const ACTIVITIES_PER_PAGE = 10;

  const fetchActivities = useCallback(async (page = 1, silent = false) => {
    if (!ladderId) return;

    try {
      if (!silent) setLoading(true);

      const response = await getRequest(API_ENDPOINTS.ACTIVITY, {
        ladder_id: ladderId,
        page,
        limit: ACTIVITIES_PER_PAGE,
      });

      const data =
        response?.data ||
        response?.activities ||
        response?.result ||
        [];

      const newActivities = Array.isArray(data) ? data : [];

      setActivities((prev) => {
        if (JSON.stringify(prev) === JSON.stringify(newActivities)) return prev;
        return newActivities;
      });

      const totalCount =
        response?.total_count ||
        response?.meta?.total ||
        newActivities.length;

      setTotalPages(
        Math.max(1, Math.ceil(totalCount / ACTIVITIES_PER_PAGE))
      );

      setError("");
    } catch (err) {
      setError(err?.message || "Failed to load activity.");
    } finally {
      setLoading(false);
      setFirstLoad(false);
    }
  }, [ladderId]);

  useEffect(() => {
    if (!ladderId) return;
    setCurrentPage(1);
    fetchActivities(1);
  }, [ladderId, fetchActivities]);

  useEffect(() => {
    if (!ladderId) return;
    fetchActivities(currentPage, true);
  }, [currentPage, ladderId, fetchActivities]);

  useEffect(() => {
    if (!ladderId) return;
    const interval = setInterval(() => {
      fetchActivities(currentPage, true);
    }, 3000);
    return () => clearInterval(interval);
  }, [ladderId, currentPage, fetchActivities]);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const renderActivities = () => {
    return activities.map((activity, index) => {
      const progress =
        activity.progress?.toLowerCase() ||
        activity.direction?.toLowerCase() ||
        activity.type?.toLowerCase() ||
        "";

      const isDown = progress.includes("down") || progress.includes("loss") || progress.includes("lose");

      return (
        <motion.div
          key={activity.id || index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="flex items-start gap-3 border-b border-white/5 pb-3 last:border-b-0 last:pb-0"
        >
          <span
            className={`mt-1.5 block h-2.5 w-2.5 rounded-full flex-shrink-0 ${
              isDown
                ? "bg-[var(--best-board-danger)]"
                : "bg-emerald-400"
            }`}
          />
          <p className="flex-1 text-sm text-[var(--best-board-text)] break-words leading-relaxed">
            {activity.message}
          </p>
        </motion.div>
      );
    });
  };

  const renderPagination = () => {
    return (
      <div className="flex justify-center items-center gap-2 mt-4 pt-3 border-t border-white/5">
        <button
          type="button"
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1.5 bg-white/5 border border-[var(--best-board-border)] text-xs text-[var(--best-board-muted)] rounded transition hover:bg-white/10 disabled:opacity-40 disabled:hover:bg-white/5 cursor-pointer flex items-center justify-center"
        >
          <FaChevronLeft size={10} />
        </button>

        <span className="px-3 text-xs text-[var(--best-board-muted)]">
          {currentPage} / {totalPages}
        </span>

        <button
          type="button"
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1.5 bg-white/5 border border-[var(--best-board-border)] text-xs text-[var(--best-board-muted)] rounded transition hover:bg-white/10 disabled:opacity-40 disabled:hover:bg-white/5 cursor-pointer flex items-center justify-center"
        >
          <FaChevronRight size={10} />
        </button>
      </div>
    );
  };

  return (
    <div className="best-board-card rounded-xl p-4">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--best-board-muted)]">Activity Feed</p>
        <span className="rounded-full border border-[var(--best-board-border-strong)] bg-[var(--best-board-accent-soft)] px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] best-board-highlight-soft">
          Live
        </span>
      </div>

      <div className="max-h-[350px] overflow-y-auto pr-1 space-y-3">
        {firstLoad && loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="flex items-center gap-3 pb-3 border-b border-white/5">
                <Skeleton className="h-2.5 w-2.5 rounded-full bg-zinc-700 animate-pulse" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-3 w-3/4 bg-zinc-700 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <p className="text-xs text-red-400 text-center py-4">{error}</p>
        ) : activities.length === 0 ? (
          <p className="text-sm text-[var(--best-board-muted)] text-center py-4">
            No activity available.
          </p>
        ) : (
          renderActivities()
        )}
      </div>

      {totalPages > 1 && renderPagination()}
    </div>
  );
};

export default ActivityLogUser;