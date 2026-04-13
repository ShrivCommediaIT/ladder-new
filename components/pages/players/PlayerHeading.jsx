"use client";
import { IMAGE_BASE_URL } from "@/constants/api";

import Image from "next/image";
import React, { useRef, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "next/navigation";
import { Pencil } from "lucide-react";
import { fetchRosterLeaderboard } from "@/redux/slices/rosterLeaderboardSlice";
import { postFormData, postWithParams } from "@/services/apiService";

const PlayerHeading = ({ demoLadderName }) => {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  const searchParams = useSearchParams();

  // ✅ URL params
  const ladderIdFromUrl = searchParams.get("ladder_id");
  const ladderType = searchParams.get("type");

  // ❌ redux user dependency removed (as you asked earlier)
  const ladderId = ladderIdFromUrl;

  // ✅ roster slice data
  const rosterLadderDetails = useSelector(
    (state) => state.rosterLeaderboard?.ladderDetails
  );

  // ✅ normal slice fallback (if needed)
  const normalLadderDetails = useSelector(
    (state) => state.player?.players?.[ladderId]?.ladderDetails
  );

  // ✅ choose source
  const ladderDetails =
    ladderType === "roster" ? rosterLadderDetails : normalLadderDetails;

  // ✅ auto fetch roster if needed
  useEffect(() => {
    if (ladderType === "roster" && ladderId && !rosterLadderDetails) {
      dispatch(fetchRosterLeaderboard({ ladder_id: ladderId }));
    }
  }, [ladderType, ladderId, rosterLadderDetails, dispatch]);

  // --------------------------

  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState("");

  useEffect(() => {
    setEditedName(demoLadderName || ladderDetails?.name || "");
  }, [ladderDetails, demoLadderName]);

  // --------------------------

  const logo = ladderDetails?.logo;
  const name = demoLadderName || ladderDetails?.name;

  const imagePath =
    logo && logo !== "null"
      ? logo.startsWith("http")
        ? logo
        : `${IMAGE_BASE_URL}/${logo}`
      : "/game.png";

  // --------------------------

  const handleLogoClick = () => {
    if (!demoLadderName && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleLogoUpload = async (e) => {
    if (demoLadderName) return;
    const file = e.target.files?.[0];
    if (!file || !ladderId) return;

    const formData = new FormData();
    formData.append("logo", file);
    formData.append("ladder_id", ladderId);

    try {
      const response = await postFormData("/user/updateladderlogo", formData);

      if (response?.status === 200 || response?.status === true) window.location.reload();
    } catch (err) {
      console.error("Logo upload error:", err);
    }
  };

  // --------------------------

  const handleNameEdit = () => {
    if (!demoLadderName) setIsEditingName(true);
  };

  const saveName = async () => {
    if (demoLadderName) return;
    if (!ladderId || !editedName.trim()) return;

    try {
      const response = await postWithParams("/user/updateladdername", {
        ladder_id: ladderId,
        name: editedName.trim()
      });

      if (response?.status === 200 || response?.status === true) {
        setIsEditingName(false);
        window.location.reload();
      }
    } catch (error) {
      console.error("Name update error:", error);
    }
  };

  const handleNameKeyPress = (e) => {
    if (e.key === "Enter") saveName();
  };

  // --------------------------

  return (
    <div className="px-4 w-full">
      <div className="flex flex-col text-zinc-200 sm:flex-row items-center justify-center sm:justify-start gap-4 sm:gap-8 max-w-3xl mx-auto">

        {/* hidden file input */}
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleLogoUpload}
          className="hidden"
        />

        {/* Logo */}
        <div
          className={`relative ${demoLadderName ? "" : "cursor-pointer"}`}
          onClick={handleLogoClick}
        >
          <Image
            src={imagePath}
            alt="Ladder Logo"
            width={90}
            height={90}
            className="rounded-full border shadow-md object-cover"
          />

          {!demoLadderName && (
            <div className="absolute bottom-1 right-1 bg-white p-1 rounded-full shadow">
              <Pencil className="w-4 h-4 text-gray-600" />
            </div>
          )}
        </div>

        {/* Name */}
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">

            {isEditingName ? (
              <input
                className="text-3xl font-bold border-b-2 border-purple-600 bg-transparent focus:outline-none px-1"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                onBlur={saveName}
                onKeyDown={handleNameKeyPress}
                autoFocus
              />
            ) : (
              <>
                <h1 className="uppercase text-3xl sm:text-4xl font-bold break-words">
                  {name || "Loading..."}
                </h1>

                {!demoLadderName && (
                  <button onClick={handleNameEdit}>
                    <Pencil className="w-4 h-4 text-zinc-300" />
                  </button>
                )}
              </>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};

export default PlayerHeading;
