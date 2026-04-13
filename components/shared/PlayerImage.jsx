

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { uploadProfileImage } from "@/redux/slices/profileImageSlice";
import { resetProfileImageState } from "@/redux/slices/profileImageSlice";
import { fetchUserProfile } from "@/redux/slices/profileSlice";
import { fetchMiniLeague } from "@/redux/slices/minileagueSlice";
import { toast } from "react-toastify"; 
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import Cropper from "react-easy-crop";
import defaultAvatar from "@/public/logo.jpg";
import { useSearchParams } from "next/navigation";

const PlayerImage = ({ userId, ladderId, onClose = () => {} }) => {

  const searchParams = useSearchParams();
const ladderType = searchParams.get("type");

  const dispatch = useDispatch();
  const { loading, success, error } = useSelector(
    (state) => state.profileImage
  );

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [cropping, setCropping] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  // Reset state on unmount
  useEffect(() => {
    return () => {
      dispatch(resetProfileImageState());
    };
  }, [dispatch]);

  // Instant preview after crop save
  useEffect(() => {
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  }, [file]);

  // FIXED: Real-time refresh + auto-close after upload success
  useEffect(() => {
    if (success) {
      
      // REAL-TIME REFRESH - 800ms delay for smooth UX
      const timer = setTimeout(() => {
        // Refresh leaderboard data
        if (ladderId) {
          dispatch(fetchMiniLeague({ ladder_id: ladderId, ladderType: "minileague" }));
        }
        
        dispatch(resetProfileImageState());
        onClose();
      }, 800);

      return () => clearTimeout(timer);
    }
  }, [success, ladderId, dispatch, onClose]);

  const handleImageChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setCropping(true);
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
    if (!croppedBlob) return;

    const croppedFile = new File([croppedBlob], "cropped.jpg", {
      type: "image/jpeg",
    });

    setFile(croppedFile);
    setPreview(URL.createObjectURL(croppedBlob)); // instant update
    setCropping(false);
  };

  // FIXED: Simple upload handler
  const handleUpload = () => {
    if (!userId || !file) {
      toast.error("Please select an image first!");
      return;
    }
    dispatch(uploadProfileImage({ id: userId, image: file }));
  };

  return (
    <Card className="w-full bg-gray-800 max-w-sm mx-auto p-4 space-y-4 shadow-lg rounded-2xl">
      <CardContent className="space-y-4 flex flex-col items-center">
        <label htmlFor="fileInput" className="cursor-pointer relative group">
          <Image
            src={preview || defaultAvatar}
            alt="Selected Profile"
            width={120}
            height={120}
            className="rounded-full w-24 h-24 object-cover border-4 border-gray-400 shadow-lg transition-all group-hover:border-blue-400 group-hover:shadow-xl"
          />
          <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
            <span className="text-white text-sm font-medium">Change Photo</span>
          </div>
        </label>
        
        <input
          id="fileInput"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
        />

        {/* CROPPING OVERLAY */}
        {cropping && (
          <div className="fixed inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-50 p-4">
            <div className="relative w-full max-w-sm h-[50vh] bg-white rounded-2xl overflow-hidden shadow-2xl">
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
            </div>
            <div className="flex gap-3 mt-6 w-full max-w-sm">
              <Button
                type="button"
                onClick={() => setCropping(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleCropSave}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Crop & Save
              </Button>
            </div>
          </div>
        )}

        {/* UPLOAD BUTTON */}
        <Button
          onClick={handleUpload}
          disabled={loading || !file || !userId}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Uploading...
            </span>
          ) : (
            "Upload Profile Image"
          )}
        </Button>

        {/* ERROR */}
        {error && (
          <p className="text-red-400 text-sm font-medium text-center px-4">
            {typeof error === "string"
              ? error
              : error.message || error.error_message || "Upload failed"}
          </p>
        )}
        
        {!userId && (
          <p className="text-red-500 text-sm font-semibold text-center">
            User ID is missing.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default PlayerImage;
