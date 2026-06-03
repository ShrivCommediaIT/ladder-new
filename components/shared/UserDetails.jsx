"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { LogOut, UserCircle2, Shield, UserPlus, Key, HelpCircle } from "lucide-react";
import { IoIosArrowDown } from "react-icons/io";
import Logo from "@/public/logo.jpg";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { clubIdPage, subAdminPage, submitPerformancePage } from "@/helper/RouteName";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { createClubId } from "@/helper/RouteName";
import { resetUserState } from "@/redux/slices/userSlice";

const getUserImage = (user) => {
  if (!user || !user.image) return null;
  if (user.image.startsWith("http") || user.image.startsWith("blob:")) {
    return user.image;
  }
  if (user.image_path) {
    return `${user.image_path}/${user.image}`;
  }
  return `https://ne-games.com/leaderBoard/public/uploads/${user.image}`;
};

const UserDetails = ({ user: demoUser, ladderType }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [user, setUser] = useState(null);



  // ✅ Get user from sessionStorage


  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const storedAdminDetails = sessionStorage.getItem("adminDetails");
        const storedSubAdmin = sessionStorage.getItem("subAdmin");
        const storedAdmin = sessionStorage.getItem("userData");

        const adminDetails = storedAdminDetails ? JSON.parse(storedAdminDetails) : null;
        const subAdmin = storedSubAdmin ? JSON.parse(storedSubAdmin) : null;
        const admin = storedAdmin ? JSON.parse(storedAdmin) : null;

        let mergedUser = null;
        if (subAdmin?.user_type === "sub_admin") {
          mergedUser = { ...subAdmin };
        } else if (admin?.user_type === "admin") {
          mergedUser = { ...admin, ...adminDetails };
        } else if (adminDetails?.user_type === "admin") {
          mergedUser = { ...adminDetails };
        }

        setUser(mergedUser);
      } catch (err) {
        console.error("Invalid user data in sessionStorage", err);
        setUser(null);
      }
    }
  }, []);


  const finalUser = demoUser || user;

  const getEncodedLadderId = () => {
    if (!finalUser || !finalUser.ladder_id) return null;
    return btoa(String(finalUser.ladder_id));
  };

  const handleLogout = () => {
    // Clear storage
    sessionStorage.removeItem("userData");
    sessionStorage.removeItem("subAdmin");
    localStorage.removeItem("persist:root");
    sessionStorage.clear();
    dispatch(resetUserState());

    // Admin logout → login-page
    if (finalUser?.user_type === "admin") {
      router.push("/login-page");
      return;
    }

    // Sub-admin logout → subAdminPage
    if (finalUser?.user_type === "sub_admin") {
      router.push(clubIdPage);
      return;
    }

    // Fallback → guest/login
    const encodedId = finalUser?.ladder_id
      ? btoa(String(finalUser.ladder_id))
      : null;
    const redirectUrl = encodedId
      ? `/login-user?id=${encodedId}${ladderType ? `&ladder_type=${encodeURIComponent(ladderType)}` : ""}`
      : "/login-user";

    router.push(redirectUrl);
  };

  const handleAdminClick = () => {
    router.push("/admin-page");
  };

  const handleClubIdClick = () => {
    router.push(createClubId);
  };



  const handleSubAdminClick = () => {
    router.push(subAdminPage); // sub-admin dashboard route
  };

  return (
    <div className="w-full">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="flex justify-end items-center space-x-3 cursor-pointer rounded-md px-3 py-2 transition dark:hover:bg-zinc-800">
            {getUserImage(finalUser) ? (
              <img
                src={getUserImage(finalUser)}
                alt="User"
                className="rounded-full border w-8 h-8 object-cover"
              />
            ) : (
              <Image
                src={Logo}
                alt="User"
                width={32}
                height={32}
                className="rounded-full border w-8 h-8 object-cover"
              />
            )}
            <div className="hidden sm:flex flex-col">
              <span className="text-sm font-semibold text-zinc-100 capitalize dark:text-zinc-200">
                {finalUser?.name || "Guest"}
              </span>
              <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                {finalUser?.user_type === "sub_admin" ? "Section Admin" : "Admin"}
              </span>
            </div>
            <IoIosArrowDown size={18} className="text-zinc-600" />
          </div>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-52 mt-2" align="end">
          <DropdownMenuLabel className="flex flex-col gap-0.5 text-zinc-700 dark:text-zinc-200">
            <div className="flex items-center gap-2">
              <UserCircle2 className="w-4.5 h-4.5 text-zinc-500" />
              <span>{finalUser?.name || "Guest"}</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 ml-6.5">
              {finalUser?.user_type === "sub_admin" ? "Section Admin" : "Admin"}
            </span>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          {(finalUser?.user_type === "admin" || finalUser?.user_type === "sub_admin") && (
            <DropdownMenuItem
              onClick={() => router.push("/profile")}
              className="cursor-pointer hover:bg-green-50 dark:hover:bg-green-900/30"
            >
              <UserCircle2 className="mr-2 h-4 w-4 text-green-600" />
              Update Profile
            </DropdownMenuItem>
          )}

          {finalUser?.user_type === "sub_admin" && (
            <>
              <DropdownMenuItem
                onClick={handleSubAdminClick}
                className="cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/30"
              >
                <Shield className="mr-2 h-4 w-4 text-blue-600" />
                Sub-Admin Dashboard
              </DropdownMenuItem>
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
            </>
          )}

          {finalUser?.user_type === "admin" && (
            <>
              <DropdownMenuItem
                onClick={handleAdminClick}
                className="cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/30"
              >
                <Shield className="mr-2 h-4 w-4 text-blue-600" />
                Admin Dashboard
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={handleClubIdClick}
                className="cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/30"
              >
                <Shield className="mr-2 h-4 w-4 text-blue-600" />
                Create Club or Coach ID
              </DropdownMenuItem>

              {/* {getEncodedLadderId() && (
                <Link
                  href={`/register-user/${getEncodedLadderId()}`}
                  className="flex items-center gap-2 cursor-pointer hover:bg-green-50 dark:hover:bg-green-900/30 px-2 py-1"
                >
                  <UserPlus className="mr-2 h-4 w-4 text-green-600" />
                  Register Player
                </Link>
              )} */}
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
                className="text-red-600 cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/30"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </>
          )}

          {finalUser &&
            finalUser?.user_type !== "admin" &&
            finalUser?.user_id !== "joebloggs@gmail.com" && (
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-red-600 cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/30"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            )}

          {!finalUser && (
            <DropdownMenuItem
              onClick={() => router.push("/login-user")}
              className="text-blue-600 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/30"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Login
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>


    </div>
  );
};

export default UserDetails;
