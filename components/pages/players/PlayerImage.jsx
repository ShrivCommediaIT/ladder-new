


"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";


import { uploadProfileImage } from "@/redux/slices/profileImageSlice";
import { resetProfileImageState } from "@/redux/slices/profileImageSlice";
import { fetchUserProfile } from "@/redux/slices/profileSlice";
import { fetchMiniLeague } from "@/redux/slices/minileagueSlice";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import Cropper from "react-easy-crop";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, UploadCloud, Loader2 } from "lucide-react";
const defaultAvatar = "/logo.jpg";
import { fetchLeaderboard } from "@/redux/slices/leaderboardSlice";
import { fetchUserActivity } from "@/redux/slices/activitySlice";
import { fetchRosterLeaderboard } from "@/redux/slices/rosterLeaderboardSlice";
import { toast } from "react-toastify";


const PlayerImage = ({ userId, ladderId, ladderType, onClose = () => { } }) => {
  const dispatch = useDispatch();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [cropping, setCropping] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const { loading, success, error } = useSelector(
    (state) => state.profileImage
  );

  const playerState = useSelector((state) => state.player?.players?.[ladderId]) || {};
  const rosterState = useSelector((state) => state.rosterLeaderboard) || {};

  const isRoster = ladderType === "roster";
  const imagePath = isRoster
    ? (rosterState.image_path || "https://ne-games.com/leaderBoard/public/admin/clip-one/assets/user/original")
    : (playerState.image_path || "https://ne-games.com/leaderBoard/public/admin/clip-one/assets/user/original");

  const players = isRoster ? (rosterState.data || []) : (playerState.data || []);
  const selectedPlayer = players.find((p) => Number(p.id) === Number(userId)) || null;

  useEffect(() => {
    if (selectedPlayer?.image) {
      setPreview(`${imagePath}/${selectedPlayer.image}`);
    } else {
      setPreview(defaultAvatar);
    }
  }, [selectedPlayer, imagePath]);

  useEffect(() => {
    return () => {
      dispatch(resetProfileImageState());
    };
  }, [dispatch]);


  const handleImageChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setCropping(true);
    }
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const getCroppedImg = async () => {
    if (!preview || !croppedAreaPixels) return null;

    const image = new window.Image();
    image.src = preview;
    await new Promise((resolve) => (image.onload = resolve));

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = croppedAreaPixels.width;
    canvas.height = croppedAreaPixels.height;

    ctx.drawImage(
      image,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      croppedAreaPixels.width,
      croppedAreaPixels.height
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), "image/jpeg");
    });
  };

  const handleCropSave = async () => {
    const croppedBlob = await getCroppedImg();
    if (croppedBlob) {
      const croppedFile = new File([croppedBlob], "cropped.jpg", {
        type: "image/jpeg",
      });
      setFile(croppedFile);
      setPreview(URL.createObjectURL(croppedBlob));
      setCropping(false);
    }
  };


  const handleUpload = async () => {
    if (!userId || !file) return;

    console.log("PlayerImage: Starting upload...", { userId, file: file.name });

    const result = await dispatch(
      uploadProfileImage({
        id: userId,
        image: file
      })
    );

    if (result.meta.requestStatus === "fulfilled") {
      console.log("PlayerImage: Upload successful, refreshing data...");

      try {
        // 1. Profile refresh
        if (userId) {
          console.log("PlayerImage: Refreshing user profile for", userId);
          await dispatch(fetchUserProfile(userId));
        }

        if (ladderId) {
          // 2. MiniLeague refresh
          console.log("PlayerImage: Refreshing minileague for", ladderId);
          await dispatch(fetchMiniLeague({
            ladder_id: ladderId,
            ladderType: "minileague",
          }));

          // 3. Refresh specific leaderboard
          if (ladderType === "roster") {
            console.log("PlayerImage: Refreshing roster leaderboard", ladderId);
            await dispatch(fetchRosterLeaderboard({ ladder_id: ladderId }));
          } else if (ladderType) {
            console.log("PlayerImage: Refreshing specific leaderboard", { ladderId, ladderType });
            await dispatch(fetchLeaderboard({
              ladder_id: ladderId,
              type: ladderType
            }));
          } else {
            // Fallback refresh for all common types
            const types = ["bestof3", "bestof5", "best3", "best5", "winlose"];
            console.log("PlayerImage: No ladderType provided, refreshing common types", types);
            await Promise.all(types.map(type =>
              dispatch(fetchLeaderboard({ ladder_id: ladderId, type }))
            ));
          }

          // 4. Refresh activity
          console.log("PlayerImage: Refreshing user activity for", ladderId);
          await dispatch(fetchUserActivity({ ladder_id: ladderId }));
        }

        console.log("PlayerImage: Refresh complete, closing modal in 500ms");
        toast.success("Profile image updated successfully!");

        setTimeout(() => {
          onClose();
        }, 500);

      } catch (err) {
        console.error("PlayerImage: Refresh failed", err);
        toast.error("Image uploaded, but data refresh failed. Please refresh manually.");
      }
    } else {
      console.error("PlayerImage: Upload failed", result.error);
    }
  };


  return (
    <motion.div
      className="w-full max-w-2xl mx-auto p-4"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <Card className="shadow-xl border border-border bg-card rounded-2xl overflow-hidden">
        <CardContent className="space-y-4 flex flex-col items-center py-6 ">
          <motion.label
            htmlFor="fileInput"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="cursor-pointer relative group"
          >
            <Image
              src={preview || defaultAvatar}
              alt="Selected Profile"
              width={120}
              height={120}
              className="rounded-full w-28 h-28 object-cover border-4 border-border shadow-lg transition-all duration-300 group-hover:border-primary"
            />
            <motion.div
              className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              initial={false}
            >
              <UploadCloud className="w-6 h-6 text-white" />
            </motion.div>
          </motion.label>

          <input
            id="fileInput"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />

          {/* Cropping Overlay */}
          <AnimatePresence>
            {cropping && (
              <motion.div
                className="fixed inset-0 bg-black/70 flex flex-col items-center justify-center z-50 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="relative w-[90vw] h-[60vh] bg-card rounded-2xl shadow-2xl overflow-hidden"
                >
                  <Cropper
                    image={preview}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    cropShape="round"
                    showGrid={false}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={onCropComplete}
                  />
                </motion.div>

                <motion.div
                  className="flex gap-4 mt-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Button
                    onClick={() => setCropping(false)}
                    variant="secondary"
                    className="bg-muted hover:bg-muted-foreground/20 text-foreground px-5"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCropSave}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5"
                  >
                    Save Crop
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 🩵 Upload Button */}
          <motion.div whileHover={{ scale: 1.03 }}>
            <Button
              onClick={handleUpload}
              disabled={loading || !file || !userId}
              className="w-full bg-gradient-to-r px-12 from-blue-600 to-indigo-300 hover:from-blue-700 hover:to-indigo-200 shadow-lg"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="animate-spin w-4 h-4" />
                  Uploading...
                </div>
              ) : (
                "Upload"
              )}
            </Button>
          </motion.div>

          {/* Success Message */}
          <AnimatePresence>
            {success && (
              <motion.p
                key="success"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-green-600 text-sm font-semibold flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" /> Upload successful!
              </motion.p>
            )}
          </AnimatePresence>

          {/* Error Message */}
          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-600 text-sm font-semibold"
            >
              {typeof error === "string"
                ? error
                : error.message || error.error_message || "Upload failed"}
            </motion.p>
          )}

          {!userId && (
            <p className="text-red-500 text-sm font-semibold">
              User ID is missing.
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PlayerImage;
