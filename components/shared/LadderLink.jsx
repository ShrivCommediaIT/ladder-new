

  "use client";

import React, { useEffect, useState } from "react";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSelector } from "react-redux";
import  fetchLeaderboard  from "@/redux/slices/leaderboardSlice";

const LadderLink = () => {
  const [copied, setCopied] = useState(false);
  const [registerUrl, setRegisterUrl] = useState("");
  const user = useSelector((state) => state.user.user);

  const ladder = useSelector((state)=>state.ladder?.data?.ladder_id)

  useEffect(() => {
    if (user?.id && typeof window !== "undefined") {
      const encodedId = btoa(String(ladder)); // Encode user.id
      const url = `${window.location.origin}/register-user/${encodedId}`;
      setRegisterUrl(url);
    }
  }, [user]);

  const handleCopy = async () => {
    if (!registerUrl) return;
    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
        await navigator.clipboard.writeText(registerUrl);
        setCopied(true);
      } else {
        // Fallback for non-secure contexts
        const textarea = document.createElement("textarea");
        textarea.value = registerUrl;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        try {
          const successful = document.execCommand("copy");
          if (successful) {
            setCopied(true);
          } else {
            console.error("Fallback copy failed");
          }
        } catch (err) {
          console.error("Fallback copy failed", err);
        }
        document.body.removeChild(textarea);
      }
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  if (!registerUrl) return null;

  return (
    <div className="w-full px-4 flex items-center md:flex-row justify-between">
      <div className="flex items-center justify-center gap-2">
        <span className="text-sm text-blue-950 font-semibold">
          This is your registration link
        </span>
        <div className="flex items-center justify-center rounded gap-2 bg-white border">
          <input
            type="text"
            value={registerUrl}
            readOnly
            className="text-sm px-2 py-1 w-full text-blue-800 font-bold outline-none"
          />
          <Button
            onClick={handleCopy}
            className="bg-white text-red-500 hover:bg-white cursor-pointer px-3 py-1"
          >
            {copied ? "Copied!" : "Copy"} <Copy size={14} className="ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LadderLink;






