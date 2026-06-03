
"use client";

import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { LogOut, UserCircle2, Pencil, HelpCircle } from "lucide-react";
import { IoIosArrowDown } from "react-icons/io";
import { postFormData } from "@/services/apiService";
import { API_ENDPOINTS } from "@/constants/api";
// import Logo from "@/public/logo.jpg";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { clubIdPage, submitPerformancePage } from "@/helper/RouteName";

const SubAdminDetails = () => {


  const router = useRouter();

  const [user, setUser] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  //  Load user from storage
  useEffect(() => {
    const stored = sessionStorage.getItem("subAdmin");
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
      toast.error("User id missing");
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
      const res = await postFormData("/app/user/updateSubadminimage", formData);

      if (res.status == 200 || res.status === "success") {
        let imageUrl = res?.image || res?.data?.image || res?.path;

        if (imageUrl) {
          let filename = imageUrl;
          if (imageUrl.startsWith("http")) {
            filename = imageUrl.substring(imageUrl.lastIndexOf("/") + 1);
          }

          const existing = JSON.parse(
            sessionStorage.getItem("subAdmin") || "{}"
          );

          const updatedUser = {
            ...existing,
            image: filename,
            image_path: res?.image_path || res?.data?.image_path || "https://ne-games.com/leaderBoard/public/uploads"
          };

          sessionStorage.setItem(
            "subAdmin",
            JSON.stringify(updatedUser)
          );

          setUser(updatedUser);
        }

        toast.success("Profile image updated ");
      } else {
        toast.error(res?.message || "Upload failed");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Upload error");
    } finally {
      setUploading(false);
      setPreviewImage(null);
    }
  };

  //  Safe image resolver
  const IMAGE_BASE = "https://ne-games.com/leaderBoard/public/uploads/";

  const getImageSrc = () => {
    if (previewImage) return previewImage;

    const img = user?.image;
    console.log("image : ", img)

    if (!img) return "/logo.jpg";

    // if already full URL
    if (img.startsWith("http")) return img;

    // if image_path is present
    if (user?.image_path) return `${user.image_path}/${img}`;

    // if only filename came from API
    return IMAGE_BASE + img;
  };


  //  Logout
  const handleLogout = () => {
    sessionStorage.removeItem("admin");
    sessionStorage.removeItem("subAdmin");
    sessionStorage.removeItem("userData");
    sessionStorage.removeItem("persist:root");
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
            onClick={() => router.push(submitPerformancePage)}
            className="cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <HelpCircle className="mr-2 h-4 w-4 text-zinc-600 dark:text-zinc-400" />
            Submit to Talent Board
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => window.open("/q-a", "_blank")}
            className="cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <HelpCircle className="mr-2 h-4 w-4 text-zinc-600 dark:text-zinc-400" />
            Q & A
          </DropdownMenuItem>


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
