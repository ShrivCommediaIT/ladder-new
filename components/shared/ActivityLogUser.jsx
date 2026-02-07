

"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { FaLongArrowAltDown, FaLongArrowAltUp, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import digitalTwin from "@/public/digital-twin.gif";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

const APPKEY = "Py9YJXgBecbbqxjRVaHarcSnJyuzhxGqJTkY6xKZRfrdXFy72HPXvFRvfEjy";

const ActivityLogUser = ({ ladderId }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ACTIVITIES_PER_PAGE = 10;

  // Fetch activities with pagination
  const fetchActivities = useCallback(async (page = 1) => {
    if (!ladderId) return setLoading(false);
    
    try {
      setLoading(true);
      const res = await axios.get(
        `https://ne-games.com/leaderBoard/api/user/activity?ladder_id=${ladderId}&page=${page}&limit=${ACTIVITIES_PER_PAGE}`,
        { headers: { "Content-Type": "application/json", APPKEY } }
      );
      
      const data = res.data?.data || [];
      setActivities(data);
      
      // Calculate total pages (assuming API returns total_count)
      const totalCount = res.data?.total_count || res.data?.meta?.total || data.length;
      setTotalPages(Math.ceil(totalCount / ACTIVITIES_PER_PAGE));
      
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch activities");
      setActivities([]);
    } finally {
      setLoading(false);
    }
  }, [ladderId]);

  useEffect(() => {
    fetchActivities(1);
  }, [fetchActivities]);

  // Pagination handlers
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      fetchActivities(page);
    }
  };

  const renderActivities = () => {
    return activities.map((activity, index) => {
      const progress = activity.progress?.toLowerCase();
      const icon =
        progress === "up" ? (
          <FaLongArrowAltUp className="text-green-400 drop-shadow-lg" size={20} />
        ) : progress === "down" ? (
          <FaLongArrowAltDown className="text-pink-400 drop-shadow-lg" size={20} />
        ) : (
          <div className="w-5 h-5 bg-gray-600 rounded-full" />
        );

      return (
        <motion.div
          key={activity.id || index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.4 }}
          className="group mb-3 p-4 rounded-2xl shadow-lg bg-gradient-to-r from-slate-900/80 via-slate-800/90 to-slate-900/80 
                     border border-slate-700/50 hover:border-emerald-400/50 hover:shadow-emerald-500/25 
                     hover:-translate-y-1 transition-all duration-300 backdrop-blur-sm"
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 mt-1">
              {icon}
            </div>
            <div className="flex-1 min-w-0">
                          <p className="text-base md:text-lg font-medium text-white break-words break-all whitespace-normal overflow-hidden">
  {activity.message}
</p>

              <p className="text-xs text-slate-400 mt-1 font-medium">
                {new Date(activity.created_at).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        </motion.div>
      );
    });
  };

  // Pagination component
  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Previous button
    pages.push(
      <button
        key="prev"
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-2 rounded-lg font-semibold text-sm transition-all duration-200 
                   disabled:opacity-50 disabled:cursor-not-allowed 
                   bg-slate-800/50 hover:bg-slate-700 border border-slate-600/50
                   disabled:border-slate-700/30
                   hover:text-emerald-400 disabled:text-slate-400"
      >
        <FaChevronLeft size={14} />
      </button>
    );

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => goToPage(i)}
          className={`px-3 py-2 rounded-lg font-semibold text-sm transition-all duration-200 
                     border border-slate-600/50 min-w-[44px] ${
            i === currentPage
              ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/25"
              : "bg-slate-800/50 hover:bg-slate-700 hover:text-emerald-400 text-slate-200"
          }`}
        >
          {i}
        </button>
      );
    }

    // Next button
    pages.push(
      <button
        key="next"
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-2 rounded-lg font-semibold text-sm transition-all duration-200 
                   disabled:opacity-50 disabled:cursor-not-allowed 
                   bg-slate-800/50 hover:bg-slate-700 border border-slate-600/50
                   disabled:border-slate-700/30
                   hover:text-emerald-400 disabled:text-slate-400"
      >
        <FaChevronRight size={14} />
      </button>
    );

    return pages;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-none shadow-2xl overflow-hidden">
        <CardContent className="p-0">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="p-8 pb-6 border-b border-slate-700/50 bg-gradient-to-r from-slate-900/90 to-slate-800/90 backdrop-blur-sm"
          >
            <div className="flex items-center justify-center gap-4">
              <div className="p-2 bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-2xl border border-blue-500/30 shadow-xl">
                <Image
                  src={digitalTwin}
                  width={44}
                  height={44}
                  alt="activity"
                  className="rounded-xl shadow-2xl"
                />
              </div>
              <div>
                <h2 className="text-3xl md:text-4xl font-black text-transparent bg-gradient-to-r from-cyan-400 via-purple-400 to-emerald-400 bg-clip-text drop-shadow-2xl">
                  ACTIVITY LOG
                </h2>
              </div>
            </div>
          </motion.div>

          {/* Activities List */}
          <div className="p-6 md:p-8 max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-emerald-500/60 scrollbar-track-slate-900/50">
            <AnimatePresence mode="wait">
              {loading ? (
                <div className="space-y-4">
                  {Array.from({ length: ACTIVITIES_PER_PAGE }).map((_, i) => (
                    <motion.div
                      key={`skeleton-${i}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="p-5 rounded-2xl bg-slate-800/50 border border-slate-700/30 animate-pulse"
                    >
                      <div className="flex items-center gap-4">
                        <Skeleton className="h-6 w-6 rounded-full bg-slate-700/50" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-5 w-4/5 bg-slate-700/50 rounded-lg" />
                          <Skeleton className="h-3 w-2/5 bg-slate-700/30 rounded-md" />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : error ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-16"
                >
                  <div className="w-20 h-20 mx-auto mb-4 bg-red-500/10 rounded-2xl border-2 border-red-500/30 flex items-center justify-center">
                    <span className="text-3xl">⚠️</span>
                  </div>
                  <p className="text-xl font-semibold text-red-400 mb-2">{error}</p>
                  <button
                    onClick={() => fetchActivities(currentPage)}
                    className="px-6 py-2 bg-emerald-500/80 hover:bg-emerald-500 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-emerald-500/25"
                  >
                    Retry
                  </button>
                </motion.div>
              ) : activities.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-16"
                >
                  <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-slate-800 to-slate-700 rounded-3xl flex items-center justify-center shadow-xl">
                    <span className="text-4xl">📭</span>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-300 mb-2">No Activities Yet</h3>
                  <p className="text-slate-500 text-lg">Your activity log is empty. Play some matches!</p>
                </motion.div>
              ) : (
                renderActivities()
              )}
            </AnimatePresence>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="px-6 pb-8 pt-4 border-t border-slate-700/50 bg-slate-900/50 backdrop-blur-sm"
            >
              <div className="flex items-center justify-center gap-2">
                {renderPagination()}
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ActivityLogUser;
