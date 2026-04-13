"use client";
import { IMAGE_BASE_URL } from "@/constants/api";

import Image from "next/image";
import React, { useRef, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { getRequest, postFormData } from "@/services/apiService";
import { API_ENDPOINTS } from "@/constants/api";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

// import game from "@/public/game.png";



const UserHeading = () => {
  const fileInputRef = useRef(null);
  const [alertOpen, setAlertOpen] = useState(false);
  const [apiLadderName, setApiLadderName] = useState("");
  const [logo, setLogo] = useState(null);

  const searchParams = useSearchParams();
  const ladderId = searchParams.get("ladder_id"); // ✅ dynamic ladderId from URL
  const ladderType = searchParams.get("ladder_type"); // ✅ dynamic ladderType from URL

  // 🔥 Fetch ladder details dynamically based on URL params
  useEffect(() => {
    if (!ladderId) return;

    const fetchLadderDetails = async () => {
      try {
        const res = await getRequest(API_ENDPOINTS.LEADERBOARD, {
          ladder_id: ladderId,
          ...(ladderType ? { type: ladderType } : {}),
        });

        setApiLadderName(res?.ladderDetails?.name || "Test Skill");
        setLogo(res?.ladderDetails?.logo || null);
      } catch (err) {
        console.error("Ladder API error:", err);
      }
    };

    fetchLadderDetails();
  }, [ladderId, ladderType]);

  const handleLogoClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !ladderId) return;

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("ladder_id", ladderId);

      const res = await postFormData(API_ENDPOINTS.UPDATE_LADDER_LOGO, formData);

      if (res.status === 200) {
        setLogo(res.logo);
        setAlertOpen(true);
      } else {
        console.error("Logo upload failed:", res.data.message);
      }
    } catch (err) {
      console.error("Logo upload error:", err);
      setAlertOpen(true);
    }
  };

  const imagePath =
    logo && logo !== "null"
      ? logo.startsWith("http")
        ? logo
        : `${IMAGE_BASE_URL}/${logo}`
      : "/game.png";

  return (
    <div className="w-full">
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleLogoUpload}
        style={{ display: "none" }}
      />

      <div className="flex justify-between items-center gap-2">
        <div onClick={handleLogoClick} className="cursor-pointer">
          <Image
            src={imagePath}
            alt="Ladder Logo"
            width={100}
            height={100}
            className="rounded-full border shadow-md object-cover w-20 h-16"
          />
        </div>

        <div className="w-full flex flex-col items-center md:items-start">
          <h1 className="uppercase text-white font-bold text-lg md:text-4xl text-center md:text-left">
            {apiLadderName}
          </h1>
        </div>
      </div>

      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Logo Uploaded Successfully!</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogAction onClick={() => setAlertOpen(false)}>
            OK
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UserHeading;




