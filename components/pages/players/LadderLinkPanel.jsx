
"use client";

import React, { useEffect, useState } from "react";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { getRequest } from "@/services/apiService";
import { API_ENDPOINTS } from "@/constants/api";
import { InvertRanckings } from "@/components/shared/InvertRanckings";
import { useSearchParams } from "next/navigation";

const LadderLinkPanel = ({ ladderId, ladderType }) => {
  const [copied, setCopied] = useState(false);
  const [loginUrl, setLoginUrl] = useState("");
  const [isDemo, setIsDemo] = useState(false);
  const searchParams = useSearchParams();
  const type = searchParams.get("type");
  // 🔹 API Function
  const fetchLadderDetails = async () => {
    try {
      const res = await getRequest(API_ENDPOINTS.LEADERBOARD, {
        ladder_id: ladderId,
        type: ladderType,
      });

      const createdBy = res?.ladderDetails?.created_by;

      if (createdBy === "demo") {
        setIsDemo(true);
      } else {
        setIsDemo(false);
      }
    } catch (err) {
      console.log("API Error", err);
    }
  };

  useEffect(() => {
    if (!ladderId || !ladderType) return;
    fetchLadderDetails();

    if (typeof window === "undefined") return;

    const url = `${window.location.origin}/login-user?ladder_id=${ladderId}&ladder_type=${ladderType}`;

    setLoginUrl(url);
  }, [ladderId, ladderType]);

  const copyToClipboard = async (text) => {
    if (typeof window === "undefined") {
      return false;
    }

    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }

    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.setAttribute("readonly", "");
    textArea.style.position = "absolute";
    textArea.style.left = "-9999px";
    document.body.appendChild(textArea);
    textArea.select();

    const copiedSuccessfully = document.execCommand("copy");
    document.body.removeChild(textArea);

    return copiedSuccessfully;
  };

  const handleCopy = async () => {
    if (!loginUrl) return;

    if (isDemo) {
      toast.warning("Disabled for Demo Purposes");
      return;
    }

    try {
      const copiedSuccessfully = await copyToClipboard(loginUrl);

      if (!copiedSuccessfully) {
        toast.error("Unable to copy link");
        return;
      }

      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Copy failed", error);
      toast.error("Unable to copy link");
    }
  };

  if (!loginUrl) return null;

  return (
      <div className="w-full backdrop-blur-sm ">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 w-full">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full text-white bg-gradient-to-r from-gray-900 to-cyan-900 p-1 shadow-lg border border-teal-600 rounded-md">
            <div className="flex flex-col sm:flex-row px-2 items-center rounded w-full py-3">
              <span className="sm:text-sm text-center sm:text-left font-semibold px-2">
                URL :
              </span>

              <input
                type="text"
                value={loginUrl}
                readOnly
                className="text-sm py-2 rounded-md flex-1 font-semibold outline-none"
              />

              <Button
                onClick={handleCopy}
                className="sm:ml-2 text-gray-200 px-4 py-2 border border-gray-100 shadow-md flex items-center gap-1 text-sm font-medium cursor-pointer"
              >
                {copied ? "Copied!" : "Copy"}
                <Copy size={14} />
              </Button>
            </div>
          </div>
        </div>
      </div>
  );
};

export default LadderLinkPanel;
