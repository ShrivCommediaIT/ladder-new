"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { LogOut, UserCircle2 } from "lucide-react";
import { IoIosArrowDown } from "react-icons/io";
import Logo from "@/public/logo.jpg";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const UserDetailsTypeUser = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [user, setUser] = useState(null);

  /* ---------------- GET USER ---------------- */

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = sessionStorage.getItem("user");
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          setUser(null);
        }
      }
    }
  }, []);

  /* ---------------- PARAMS ---------------- */

  const ladder_id = searchParams.get("ladder_id");
  const ladder_type = searchParams.get("ladder_type");

  /* ---------------- LOGOUT ---------------- */

  const handleLogout = () => {
    sessionStorage.removeItem("user");
    localStorage.removeItem("persist:root");
    sessionStorage.clear();

    let url = "/login-user";

    if (ladder_id && ladder_type) {
      url = `/login-user?ladder_id=${ladder_id}&ladder_type=${ladder_type}`;
    }

    router.push(url);
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="w-full">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="flex justify-end items-center space-x-3 cursor-pointer rounded-md px-3 py-2 transition hover:bg-zinc-800">
            <Image
              src={Logo}
              alt="User"
              width={32}
              height={32}
              className="rounded-full border w-8 h-8 object-cover"
            />

            <div className="hidden sm:flex flex-col">
              <span className="text-sm font-semibold text-zinc-100 capitalize">
                {user?.name || "Guest"}
              </span>
              <span className="text-xs text-zinc-300">Profile</span>
            </div>

            <IoIosArrowDown size={18} className="text-zinc-600" />
          </div>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-52 mt-2" align="end">
          <DropdownMenuLabel className="flex items-center gap-2 text-zinc-700">
            <UserCircle2 className="w-4 h-4" />
            {user?.name || "Guest"}
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

export default UserDetailsTypeUser;
