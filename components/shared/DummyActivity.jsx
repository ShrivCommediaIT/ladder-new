
"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { FaLongArrowAltDown, FaLongArrowAltUp } from "react-icons/fa";
import digitalTwin from "@/public/digital-twin.gif";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { getRequest } from "@/services/apiService";
import { API_ENDPOINTS } from "@/constants/api";

const ActivityLogUser = ({ ladderId }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchActivities = async () => {
      if (!ladderId) return setLoading(false);
      try {
        const res = await getRequest(API_ENDPOINTS.ACTIVITY, { ladder_id: ladderId });
        setActivities(res?.data || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch activities");
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [ladderId]);

  const renderActivities = () => {
    return activities.map((activity, index) => {
      const progress = activity.progress?.toLowerCase();
      const icon =
        progress === "up" ? (
          <FaLongArrowAltUp className="text-green-400 drop-shadow" size={18} />
        ) : progress === "down" ? (
          <FaLongArrowAltDown className="text-pink-400 drop-shadow" size={18} />
        ) : null;

      return (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-4 p-4 rounded-xl shadow-md bg-gradient-to-tr from-gray-800 via-gray-900 to-gray-800 border border-gray-700 hover:shadow-lg hover:border-purple-500"
        >
          <p className="text-base md:text-lg font-semibold flex items-center gap-2 text-white">
            {icon}
            <span className="">{activity.message}</span>
          </p>
        </motion.div>
      );
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card className="bg-gradient-to-tr from-gray-900 via-gray-800 to-gray-900 border-none shadow-2xl">
        <CardContent>
          <motion.h2
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-2xl font-extrabold mb-6 text-center flex items-center justify-center gap-3"
          >
            <Image
              src={digitalTwin}
              width={38}
              height={38}
              alt="activity"
              className="rounded-full border-2 border-blue-400 shadow"
            />
            <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-500 bg-clip-text text-transparent drop-shadow">
              ACTIVITY
            </span>
          </motion.h2>

          <div className="w-full max-w-xl px-1 pr-3 space-y-3 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-gray-800">
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-4 flex items-center gap-3 animate-pulse"
                  >
                    <Skeleton className="h-10 w-10 rounded-full bg-gray-700" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-2/3 bg-gray-700" />
                      <Skeleton className="h-3 w-1/2 bg-gray-700" />
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : error ? (
              <p className="text-center text-red-400 font-semibold">⚠️ {error}</p>
            ) : activities.length === 0 ? (
              <p className="text-center text-gray-300">No activity available.</p>
            ) : (
              renderActivities()
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ActivityLogUser;

