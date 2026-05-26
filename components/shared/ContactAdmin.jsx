"use client";

import React, { useEffect, useState } from "react";
import { getRequest } from "@/services/apiService";
import { API_ENDPOINTS } from "@/constants/api";
import { useSearchParams } from "next/navigation";

const ContactAdmin = () => {
  const searchParams = useSearchParams();
  const ladderId = searchParams.get("ladder_id");
  const [adminDetails, setAdminDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!ladderId) return;

    const fetchAdmin = async () => {
      try {
        const res = await getRequest(API_ENDPOINTS.LEADERBOARD, { ladder_id: ladderId });
        setAdminDetails(res?.ladderDetails);
        console.log("admin details :", res?.ladderDetails);
        
      } catch (err) {
        console.error("Error fetching admin details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdmin();
  }, [ladderId]);

  const handleCopy = () => {
    if (adminDetails?.admin_phone) {
      navigator.clipboard.writeText(adminDetails.admin_phone);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="best-board-card rounded-xl p-4 space-y-3">
        <div className="h-4 w-1/3 bg-white/5 animate-pulse rounded" />
        <div className="h-6 w-2/3 bg-white/5 animate-pulse rounded" />
      </div>
    );
  }

  if (!adminDetails) {
    return (
      <div className="best-board-card rounded-xl p-4 text-center text-red-500 text-sm">
        Failed to load admin details
      </div>
    );
  }

  return (
    <div className="best-board-card rounded-xl p-4">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--best-board-muted)]">Admin Contact</p>
        {adminDetails?.admin_phone && (
          <button
            type="button"
            onClick={handleCopy}
            className={`rounded-md border px-3 py-1 text-xs transition-all duration-200 cursor-pointer ${
              copied
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                : "border-[var(--best-board-border)] bg-white/5 text-[var(--best-board-muted)] hover:bg-white/10"
            }`}
          >
            {copied ? "Copied!" : "Copy Phone"}
          </button>
        )}
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--best-board-muted)]">Name</p>
          <p className="mt-1 text-xl font-semibold text-[var(--best-board-text)] capitalize">
            {adminDetails?.admin_name || "Admin"}
          </p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--best-board-muted)]">Phone</p>
          <p className="mt-1 text-xl font-semibold text-[var(--best-board-text)]">
            {adminDetails?.admin_phone || "Not Provided11"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ContactAdmin;
