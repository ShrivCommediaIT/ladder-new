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
import axios from "axios";

const APPKEY =
  "Py9YJXgBecbbqxjRVaHarcSnJyuzhxGqJTkY6xKZRfrdXFy72HPXvFRvfEjy";

const ActivityLogUser = ({ ladderId }) => {
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

      const response = await axios.get(
        `https://ne-games.com/leaderBoard/api/user/activity?ladder_id=${ladderId}&page=${page}&limit=${ACTIVITIES_PER_PAGE}`,
        { headers: { APPKEY } }
      );

      const data =
        response?.data?.data ||
        response?.data?.activities ||
        response?.data?.result ||
        [];

      const newActivities = Array.isArray(data) ? data : [];

      /* Prevent flashing */
      setActivities((prev) => {
        if (JSON.stringify(prev) === JSON.stringify(newActivities)) {
          return prev;
        }
        return newActivities;
      });

      const totalCount =
        response?.data?.total_count ||
        response?.data?.meta?.total ||
        newActivities.length;

      setTotalPages(
        Math.max(1, Math.ceil(totalCount / ACTIVITIES_PER_PAGE))
      );

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
          <FaLongArrowAltUp
            className="text-green-400"
            size={18}
          />
        ) : progress.includes("down") ||
          progress.includes("loss") ||
          progress.includes("lose") ? (
          <FaLongArrowAltDown
            className="text-pink-400"
            size={18}
          />
        ) : null;

      return (

        <motion.div
          key={activity.id || index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-3 p-4 bg-gradient-to-tr from-gray-800 via-gray-900 to-gray-800 rounded-xl shadow-md flex gap-3"
        >

          {icon}

          <div>

            <p className="text-white text-base">
              {activity.message}
            </p>

          </div>

        </motion.div>

      );
    });
  };


  /* Pagination UI */

  const renderPagination = () => {

    return (

      <div className="flex justify-center gap-2 mt-4">

        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 bg-gray-800 rounded"
        >
          <FaChevronLeft />
        </button>

        <span className="px-4 py-1 text-white">

          {currentPage} / {totalPages}

        </span>

        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 bg-gray-800 rounded"
        >
          <FaChevronRight />
        </button>

      </div>

    );

  };


  return (

    <Card className="mx-6 bg-gradient-to-r from-[#141C2B] to-gray-900 text-white">

      <CardContent className="p-6">

        {/* Header */}

        <h2 className="text-2xl font-bold mb-6 text-center flex items-center justify-center gap-3">

          <Image
            src={digitalTwin}
            width={40}
            height={40}
            alt="activity"
          />

          ACTIVITY

        </h2>


        {/* List */}

        <div className="max-h-[400px] overflow-y-auto space-y-3">

          {firstLoad && loading ? (

            <div className="space-y-4">

              {Array.from({ length: 5 }).map((_, i) => (

                <div key={i} className="flex gap-3">

                  <Skeleton className="h-6 w-6 rounded-full"/>

                  <div className="flex-1 space-y-2">

                    <Skeleton className="h-4 w-2/3"/>

                    <Skeleton className="h-3 w-1/3"/>

                  </div>

                </div>

              ))}

            </div>

          ) : activities.length === 0 ? (

            <p className="text-center text-gray-400">

              No activity available

            </p>

          ) : (

            renderActivities()

          )}

        </div>


        {totalPages > 1 && renderPagination()}

      </CardContent>

    </Card>

  );

};

export default ActivityLogUser;