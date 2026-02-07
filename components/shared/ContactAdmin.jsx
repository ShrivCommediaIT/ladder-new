"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaPhoneVolume } from "react-icons/fa";
import { MdContentCopy } from "react-icons/md"; // ✅ copy icon import
import { useSearchParams } from "next/navigation";

const APPKEY =
  "Py9YJXgBecbbqxjRVaHarcSnJyuzhxGqJTkY6xKZRfrdXFy72HPXvFRvfEjy";

const ContactAdmin = () => {
    const searchParams = useSearchParams();
    const ladderId = searchParams.get("ladder_id");
    console.log("ladderId : ", ladderId);
  const [adminDetails, setAdminDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);


  useEffect(() => {
    if (!ladderId) return; // ✅ ladderId required

    const fetchAdmin = async () => {
      try {
        const res = await axios.get(
          `https://ne-games.com/leaderBoard/api/user/leaderboard?ladder_id=${ladderId}`,
          {
            headers: {
              APPKEY,
            },
          }
        );
        setAdminDetails(res.data.ladderDetails);
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
      setTimeout(() => setCopied(false), 2000); // 2 sec
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Loading...</div>;
  }

  if (!adminDetails) {
    return (
      <div className="p-4 text-center text-red-500">
        Failed to load admin details
      </div>
    );
  }

  return (
    <div className="px-8">
      <h2 className="text-lg font-bold border-b-2 text-white mb-2 text-center md:text-left">
        Contact Admin
      </h2>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-gray-300">
        {/* ✅ Admin Name */}
        <p className="capitalize text-center sm:text-left">
          <span className="font-semibold">Name:</span>{" "}
          {adminDetails.admin_name || "Not Available"}
        </p>

        {/* ✅ Admin Phone with Copy Button */}
        <div className="flex items-center justify-center sm:justify-start gap-2">
          <FaPhoneVolume className="text-lg" />
          <span className="font-semibold">
            {adminDetails.admin_phone || "Not Provided"}
          </span>

          {/* ✅ Copy button with dynamic text */}
          {adminDetails?.admin_phone && (
            <button
              onClick={handleCopy}
              className={`flex items-center cursor-pointer gap-1 px-2 py-1 text-xs rounded transition 
                ${copied ? "bg-green-500 hover:bg-green-500" : "bg-gray-200 hover:bg-gray-300"}`}
            >
              <MdContentCopy className="text-gray-800" />
              {copied ? "Copied!" : "Copy"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactAdmin;
