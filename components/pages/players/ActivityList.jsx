"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { FaLongArrowAltDown, FaLongArrowAltUp, FaTrash } from "react-icons/fa";
import digitalTwin from "@/public/digital-twin.gif";
import { fetchUserActivity } from "@/redux/slices/activitySlice";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import axios from "axios";

const APPKEY = "Py9YJXgBecbbqxjRVaHarcSnJyuzhxGqJTkY6xKZRfrdXFy72HPXvFRvfEjy";

const ActivityLog = () => {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const ladder_id = searchParams.get("ladder_id");
  // const { loading, data, error } = useSelector((state) => state.activity);
  const { loading, data, error } = useSelector((state) => state.activity);

const [firstLoad, setFirstLoad] = useState(true);

  // Local deleting state for smoother UX
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
  if (!loading) {
    setFirstLoad(false);
  }
}, [loading]);

  useEffect(() => {
  if (ladder_id) {
    dispatch(fetchUserActivity({ ladder_id: Number(ladder_id) }));
  }
}, [ladder_id, dispatch]);

useEffect(() => {
  if (!ladder_id) return;

  const interval = setInterval(() => {
    dispatch(fetchUserActivity({ ladder_id: Number(ladder_id) }));
  }, 3000);

  return () => clearInterval(interval);
}, [ladder_id, dispatch]);

  const activities = data?.data || [];

  const handleDelete = async (activityId) => {
    if (!activityId) return;
    setDeletingId(activityId);
    try {
      await axios.get(
        `https://ne-games.com/leaderBoard/api/user/activityDelete?id=${activityId}`,
        { headers: { APPKEY } },
      );
      // Refresh log after successful delete
      dispatch(fetchUserActivity({ ladder_id: Number(ladder_id) }));
    } catch (err) {
      alert(
        "Failed to delete activity: " +
          (err?.response?.data?.message || err.message),
      );
    } finally {
      setDeletingId(null);
    }
  };

  const renderActivities = () => {
    return activities.map((activity, index) => {
      const progress = activity.progress?.toLowerCase();
      let icon = null;

      if (progress === "up") {
        icon = (
          <FaLongArrowAltUp className="text-green-400 drop-shadow" size={20} />
        );
      } else if (progress === "down") {
        icon = (
          <FaLongArrowAltDown className="text-pink-400 drop-shadow" size={20} />
        );
      }

      const isDeleting = deletingId === activity.id;

      return (
        <motion.div
          key={activity.id || index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.05 }}
          className={`mb-3 p-4 bg-gradient-to-tr from-gray-800 via-gray-900 to-gray-800 rounded-xl shadow-md flex items-center justify-between transition duration-200 ${
            isDeleting ? "opacity-60 pointer-events-none" : ""
          }`}
        >
          <div className="flex items-start gap-3 w-full overflow-hidden">
            {icon && <div className="flex-shrink-0">{icon}</div>}

            <p className="text-base md:text-lg font-medium text-white break-words break-all whitespace-normal overflow-hidden">
              {activity.message}
            </p>
          </div>
          {/* Delete icon button (right) */}
          <button
            className="ml-2 flex items-center justify-center rounded-full text-red-400 text-xl shadow hover:scale-105 hover:bg-gradient-to-br cursor-pointer focus:outline-none transition-all duration-200 w-8 h-8 bg-gray-900"
            title="Delete Activity"
            onClick={() => handleDelete(activity.id)}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Skeleton className="h-6 w-6 rounded-full bg-red-500" />
            ) : (
              <FaTrash />
            )}
          </button>
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
      <Card className="flex items-center justify-center mx-6 text-white bg-gradient-to-r from-[#141C2B] to-gray-900 rounded-lg font-semibold text-xl shadow-xl ">
        <CardContent className="w-full max-w-2xl p-6">
          {/* Header */}
          <motion.h2
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-2xl font-extrabold mb-6 text-center flex items-center justify-center gap-3"
          >
            <Image
              src={digitalTwin}
              width={50}
              height={50}
              alt="activity"
              className="rounded-full"
            />
            <span className="text-zinc-300 bg-clip-text">ACTIVITY</span>
          </motion.h2>
          {/* Scrollable Body */}
          <div className="w-full max-h-[400px] overflow-y-auto px-2 pr-3 space-y-3 scrollbar-thin scrollbar-thumb-purple-400 scrollbar-track-transparent hover:scrollbar-thumb-purple-500">
            {firstLoad && loading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-4 flex items-center gap-3 animate-pulse"
                  >
                    <Skeleton className="h-10 w-10 rounded-full bg-gray-700" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-2/3 bg-gray-700" />
                      <Skeleton className="h-3 w-1/2 bg-gray-700" />
                    </div>
                    <Skeleton className="h-8 w-8 rounded-full bg-purple-700" />
                  </motion.div>
                ))}
              </div>
            ) : error ? (
              <p className="text-center text-red-400 font-semibold">
                {typeof error === "string"
                  ? error
                  : error?.message || "Something went wrong"}
              </p>
            ) : activities.length === 0 ? (
              <p className="text-center text-zinc-300">
                No activity available.
              </p>
            ) : (
              renderActivities()
            )}
          </div>
        </CardContent>
      </Card>
      {/* Scrollbar styles */}
      <style jsx global>{`
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-thumb {
          background-color: #a78bfa;
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background-color: #8b5cf6;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
      `}</style>
    </motion.div>
  );
};

export default ActivityLog;
