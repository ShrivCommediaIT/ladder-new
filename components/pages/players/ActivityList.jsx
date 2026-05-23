"use client";

import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserActivity } from "@/redux/slices/activitySlice";
import { Skeleton } from "@/components/ui/skeleton";
import { useSearchParams } from "next/navigation";
import { getRequest } from "@/services/apiService";
import { API_ENDPOINTS } from "@/constants/api";
import { X } from "lucide-react";

const ActivityLog = ({ ladderId: propLadderId }) => {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const ladderId = propLadderId || searchParams.get("ladder_id");
  const { loading, data, error } = useSelector((state) => state.activity || {});

  const [firstLoad, setFirstLoad] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (!loading) {
      setFirstLoad(false);
    }
  }, [loading]);

  useEffect(() => {
    if (!ladderId) return;

    const fetchActivity = () => {
      dispatch(fetchUserActivity({ ladder_id: Number(ladderId) }));
    };

    fetchActivity(); // Initial fetch
    const interval = setInterval(fetchActivity, 1000); // Hits the API every second

    return () => clearInterval(interval);
  }, [ladderId, dispatch]);

  const activities = data?.data || [];

  const handleDelete = async (activityId) => {
    if (!activityId) return;
    setDeletingId(activityId);
    try {
      const res = await getRequest(API_ENDPOINTS.ACTIVITY_DELETE, { id: activityId });
      if (res?.status === 200 || res) {
        dispatch(fetchUserActivity({ ladder_id: Number(ladderId) }));
        toast.success("Activity deleted successfully!");
      }
    } catch (err) {
      toast.error(
        "Failed to delete activity: " +
          (err?.response?.data?.message || err.message),
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="best-board-card rounded-xl p-4">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--best-board-muted)]">Activity Feed</p>
        <span className="rounded-full border border-[var(--best-board-border-strong)] bg-[var(--best-board-accent-soft)] px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] best-board-highlight-soft">
          Live
        </span>
      </div>

      <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
        {firstLoad && loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="flex items-center gap-3 pb-3 border-b border-white/5">
                <Skeleton className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-3 w-3/4 bg-zinc-700" />
                </div>
                <Skeleton className="h-4 w-4 bg-zinc-700" />
              </div>
            ))}
          </div>
        ) : error ? (
          <p className="text-xs text-red-400">
            {typeof error === "string" ? error : error?.message || "Failed to load activity."}
          </p>
        ) : activities.length === 0 ? (
          <p className="text-sm text-[var(--best-board-muted)]">No activity available.</p>
        ) : (
          activities.map((activity, index) => {
            const isDeleting = deletingId === activity.id;
            return (
              <div
                key={activity.id || index}
                className={`flex items-start gap-3 border-b border-white/5 pb-3 last:border-b-0 last:pb-0 transition-all duration-200 ${
                  isDeleting ? "opacity-40" : ""
                }`}
              >
                <span
                  className={`mt-1.5 block h-2.5 w-2.5 rounded-full flex-shrink-0 ${
                    activity?.progress?.toLowerCase() === "down"
                      ? "bg-[var(--best-board-danger)]"
                      : "bg-emerald-400"
                  }`}
                />
                <p className="flex-1 text-sm text-[var(--best-board-text)] break-words leading-relaxed">
                  {activity.message}
                </p>
                <button
                  type="button"
                  onClick={() => handleDelete(activity.id)}
                  disabled={isDeleting}
                  className="text-[var(--best-board-danger)] hover:scale-110 active:scale-95 transition-transform p-0.5"
                  title="Delete Activity"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ActivityLog;
