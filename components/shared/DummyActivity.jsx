"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import {
  FaLongArrowAltDown,
  FaLongArrowAltUp,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import digitalTwin from "@/public/digital-twin.gif";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { getRequest } from "@/services/apiService";
import { API_ENDPOINTS } from "@/constants/api";

const DummyActivity = ({ ladderId }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [firstLoad, setFirstLoad] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const ACTIVITIES_PER_PAGE = 10;

  /* ================= FETCH ================= */

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

      setTotalPages(Math.max(1, Math.ceil(totalCount / ACTIVITIES_PER_PAGE)));

      setError("");
    } catch (err) {
      setError("");
    } finally {
      setLoading(false);
      setFirstLoad(false);
    }
  }, [ladderId]);


  /* First Load */

  useEffect(() => {
    if (!ladderId) return;
    setCurrentPage(1);
    fetchActivities(1);
  }, [ladderId, fetchActivities]);


  /* Pagination Change */

  useEffect(() => {
    if (!ladderId) return;
    fetchActivities(currentPage, true);
  }, [currentPage]);


  /* Auto Refresh Smooth */

  useEffect(() => {
    if (!ladderId) return;
    const interval = setInterval(() => {
      fetchActivities(currentPage, true);
    }, 3000);
    return () => clearInterval(interval);
  }, [ladderId, currentPage, fetchActivities]);


  /* Pagination */

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };


  /* Render Activities */

  const renderActivities = () => {
    return activities.map((activity, index) => {
      const progress =
        activity.progress?.toLowerCase() ||
        activity.direction?.toLowerCase() ||
        activity.type?.toLowerCase() ||
        "";

      const icon =
        progress.includes("up") || progress.includes("win") ? (
          <FaLongArrowAltUp className="text-green-400 drop-shadow shrink-0" size={18} />
        ) : progress.includes("down") ||
          progress.includes("loss") ||
          progress.includes("lose") ? (
          <FaLongArrowAltDown className="text-pink-400 drop-shadow shrink-0" size={18} />
        ) : null;

      return (
        <motion.div
          key={activity.id || index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-3 p-4 bg-gradient-to-tr from-gray-800 via-gray-900 to-gray-800 rounded-xl shadow-md flex gap-3 border border-gray-700 hover:border-purple-500 hover:shadow-lg transition-all"
        >
          {icon}
          <div>
            <p className="text-white text-base">{activity.message}</p>
          </div>
        </motion.div>
      );
    });
  };


  /* Pagination UI */

  const renderPagination = () => (
    <div className="flex justify-center gap-2 mt-4">
      <button
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1 bg-gray-800 rounded disabled:opacity-40"
      >
        <FaChevronLeft />
      </button>
      <span className="px-4 py-1 text-white">
        {currentPage} / {totalPages}
      </span>
      <button
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1 bg-gray-800 rounded disabled:opacity-40"
      >
        <FaChevronRight />
      </button>
    </div>
  );


  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card className="mx-6 bg-gradient-to-r from-[#141C2B] to-gray-900 text-white">
        <CardContent className="p-6">

          {/* Header */}
          <motion.h2
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-2xl font-extrabold mb-6 text-center flex items-center justify-center gap-3"
          >
            <Image
              src={digitalTwin}
              width={40}
              height={40}
              alt="activity"
              className="rounded-full border-2 border-blue-400 shadow"
            />
            <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-500 bg-clip-text text-transparent drop-shadow">
              ACTIVITY
            </span>
          </motion.h2>

          {/* List */}
          <div className="max-h-[400px] overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-gray-800">
            {firstLoad && loading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-3 w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : activities.length === 0 ? (
              <p className="text-center text-gray-400">No activity available</p>
            ) : (
              renderActivities()
            )}
          </div>

          {totalPages > 1 && renderPagination()}

        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DummyActivity;
