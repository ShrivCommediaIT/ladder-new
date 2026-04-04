
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogOut, UserCircle2, Pencil } from "lucide-react";
import { IoIosArrowDown } from "react-icons/io";
import axios from "axios";
// import Logo from "@/public/logo.jpg";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { clubIdPage } from "@/helper/RouteName";

const SubAdminDetails = () => {
  const APPKEY =
    "Py9YJXgBecbbqxjRVaHarcSnJyuzhxGqJTkY6xKZRfrdXFy72HPXvFRvfEjy";

  const router = useRouter();

  const [user, setUser] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  //  Load user from storage
  useEffect(() => {
    const stored = localStorage.getItem("subAdmin");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        setUser(null);
      }
    }
  }, []);



  // Upload handler with instant preview + safe storage merge
  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!user?.id) {
      alert("User id missing");
      return;
    }

    //  instant preview
    const localPreview = URL.createObjectURL(file);
    setPreviewImage(localPreview);

    const formData = new FormData();
    formData.append("id", String(user.id));
    formData.append("image", file);

    setUploading(true);

    try {
      const res = await axios.post(
        "https://ne-games.com/leaderBoard/api/app/user/updateSubadminimage",
        formData,
        {
          headers: {
            APPKEY: APPKEY,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (res.data.status == 200 || res.data.status === "success") {
        let imageUrl =
          res.data?.image ||
          res.data?.data?.image ||
          res.data?.path;

        if (imageUrl) {
          // ensure full url
          if (!imageUrl.startsWith("http")) {
            imageUrl =
              "https://ne-games.com/leaderBoard/uploads/" + imageUrl;
          }

          const existing = JSON.parse(
            localStorage.getItem("subAdmin") || "{}"
          );

          const updatedUser = {
            ...existing,
            image: imageUrl,
          };

          localStorage.setItem(
            "subAdmin",
            JSON.stringify(updatedUser)
          );

          setUser(updatedUser);
        }

        alert("Profile image updated ");
      } else {
        alert(res.data.message || "Upload failed");
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Upload error");
    } finally {
      setUploading(false);
      setPreviewImage(null);
    }
  };

    //  Safe image resolver
const IMAGE_BASE = "https://ne-games.com/leaderBoard/uploads/";

const getImageSrc = () => {
  if (previewImage) return previewImage;

  const img = user?.image;
  console.log("image : ", img)

  if (!img) return "/logo.jpg";

  // if already full URL
  if (img.startsWith("http")) return img;

  // if only filename came from API
  return IMAGE_BASE + img;
};


  //  Logout
  const handleLogout = () => {
    localStorage.removeItem("admin");
    localStorage.removeItem("subAdmin");
    localStorage.removeItem("userData");
    localStorage.removeItem("persist:root");
    sessionStorage.clear();
    router.push(clubIdPage);
  };

  if (!user) return null;

  return (
    <div className="flex justify-end items-center gap-3">

      {/* IMAGE UPLOAD */}
      <label
        className="relative cursor-pointer group"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative w-9 h-9 rounded-full overflow-hidden border bg-zinc-700">

          <img
            src={getImageSrc()}
            alt="User"
            className="w-full h-full object-cover"
          />

          {uploading && (
            <div className="absolute inset-0 bg-black/60 grid place-items-center text-[10px] text-white">
              Upload…
            </div>
          )}

          <div className="absolute inset-0 bg-black/40 opacity-0 
                          group-hover:opacity-100 transition 
                          grid place-items-center">
            <Pencil className="w-3 h-3 text-white" />
          </div>
        </div>

        <input
          type="file"
          accept="image/*"
          className="hidden"
          disabled={uploading}
          onChange={handleImageChange}
        />
      </label>

      {/*  DROPDOWN */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="flex items-center gap-2 cursor-pointer px-2 py-1 rounded-md hover:bg-zinc-800">

            <div className="hidden sm:flex flex-col leading-tight">
              <span className="text-sm font-semibold text-zinc-100 capitalize">
                {user.name}
              </span>
              <span className="text-xs text-zinc-400">
                {user.sport_name}
              </span>
            </div>

            <IoIosArrowDown size={18} className="text-zinc-500" />
          </div>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-52 mt-2">
          <DropdownMenuLabel className="flex items-center gap-2">
            <UserCircle2 className="w-4 h-4" />
            {user.name}
          </DropdownMenuLabel>

          <DropdownMenuItem
            onClick={handleLogout}
            className="text-red-600 cursor-pointer hover:bg-red-50"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

    </div>
  );
};

export default SubAdminDetails;
