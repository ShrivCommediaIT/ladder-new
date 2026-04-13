"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { LogOut, UserCircle2, Shield, UserPlus, Key } from "lucide-react";
import { IoIosArrowDown } from "react-icons/io";
import Logo from "@/public/logo.jpg";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { clubIdPage } from "@/helper/RouteName";
import { subAdminPage } from "@/helper/RouteName";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import ChangePassword from "@/components/pages/admin/ChangePassword";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

import { createClubId } from "@/helper/RouteName";
import { resetUserState } from "@/redux/slices/userSlice";

const UserDetails = ({ user: demoUser, ladderType }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [user, setUser] = useState(null);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);



  // ✅ Get user from localStorage
 

  useEffect(() => {
  if (typeof window !== "undefined") {
    try {
      const storedAdmin = localStorage.getItem("userData");
      const storedSubAdmin = localStorage.getItem("subAdmin");

      const admin = storedAdmin ? JSON.parse(storedAdmin) : null;
      const subAdmin = storedSubAdmin ? JSON.parse(storedSubAdmin) : null;

      // ✅ Pehle role check karo
      if (admin?.user_type === "admin") {
        setUser(admin);
        return;
      }

      if (subAdmin?.user_type === "sub_admin") {
        setUser(subAdmin);
        return;
      }

      setUser(null);
    } catch (err) {
      console.error("Invalid user data in localStorage", err);
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
    localStorage.removeItem("userData");
    localStorage.removeItem("subAdmin");
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

  const handleOpenChangePassword = () => {
    setIsChangePasswordOpen(true);
  };

  const handleSubAdminClick = () => {
    router.push(subAdminPage); // sub-admin dashboard route
  };

  return (
    <div className="w-full">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="flex justify-end items-center space-x-3 cursor-pointer rounded-md px-3 py-2 transition dark:hover:bg-zinc-800">
            <Image
              src={Logo}
              alt="User"
              width={32}
              height={32}
              className="rounded-full border w-8 h-8 object-cover"
            />
            <div className="hidden sm:flex flex-col">
              <span className="text-sm font-semibold text-zinc-100 capitalize dark:text-zinc-200">
                {finalUser?.name || "Guest"}
              </span>
              <span className="text-xs text-zinc-300">Profile</span>
            </div>
            <IoIosArrowDown size={18} className="text-zinc-600" />
          </div>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-52 mt-2" align="end">
          <DropdownMenuLabel className="flex items-center gap-2 text-zinc-700 dark:text-zinc-200">
            <UserCircle2 className="w-4 h-4" />
            {finalUser?.name || "Guest"}
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          {finalUser?.user_type === "sub_admin" && (
            <>
              <DropdownMenuItem
                onClick={handleSubAdminClick}
                className="cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/30"
              >
                <Shield className="mr-2 h-4 w-4 text-blue-600" />
                Sub-Admin Dashboard
              </DropdownMenuItem>

              {/* <DropdownMenuItem
                onClick={handleLogout}
                className="text-red-600 cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/30"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem> */}
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
                Generate Club ID and Section Administrators
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={handleOpenChangePassword}
                className="cursor-pointer hover:bg-green-50 dark:hover:bg-green-900/30"
              >
                <Key className="mr-2 h-4 w-4 text-green-600" />
                Change Password
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

      {/* Change Password Modal */}
      {isChangePasswordOpen && finalUser && (
        <Dialog
          open={isChangePasswordOpen}
          onOpenChange={setIsChangePasswordOpen}
        >
          <DialogContent className="w-[400px] rounded-xl p-6">
            <DialogTitle className="text-lg font-semibold text-center mb-4">
              Change Password
            </DialogTitle>

            <ChangePassword userId={finalUser.id} />

            <div className="mt-4 flex justify-center">
              <DialogClose className="px-4 py-2 bg-red-500 text-white rounded-lg hover:opacity-90">
                Close
              </DialogClose>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default UserDetails;
