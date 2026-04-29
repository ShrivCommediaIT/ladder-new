"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import MasterAdminClubId from "./MasterAdminClubId";
import AdminClubId from "./AdminClubId";
import { adminPage } from "@/helper/RouteName";
import { Info, X } from "lucide-react"; // X icon for close button
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import PlayerLevelNavbar from "@/components/shared/PlayerLevelNavbar";

export default function CreateClubSetup() {
  const [activeTab, setActiveTab] = useState("master");
  const router = useRouter();
   const searchParams = useSearchParams();
  const type = searchParams.get("type");

  useEffect(() => {
    if (type == "Admins"){
      setActiveTab("admin")
    }else{
      setActiveTab("master")
    }
  }, [])

  const handleCreate = () => {
    router.push(adminPage);
  };

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-[#07111f] text-white">
      {/* ── Unified Navbar (Admin & Sub-Admin) ── */}
      <PlayerLevelNavbar activeTab="dashboard" />

      {/* Glow effects */}
      <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-blue-600/30 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-purple-600/30 blur-3xl" />

      <div className="w-full mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 pt-10 pb-8 relative z-10 flex flex-col items-center gap-6">
        {/* Tabs with Popover for Mobile & Desktop Click */}
        <div className="flex items-center gap-3 bg-white/10 backdrop-blur px-2 py-2 rounded-2xl border border-white/10">
          <button
            onClick={() => setActiveTab("master")}
            className={`px-6 py-2 rounded-xl text-sm font-semibold transition
              ${
                activeTab === "master"
                  ? "bg-white text-black shadow"
                  : "text-white hover:bg-white/10"
              }`}
          >
            Master Admin
          </button>

          <button
            onClick={() => setActiveTab("admin")}
            className={`px-6 py-2 rounded-xl text-sm font-semibold transition
              ${
                activeTab === "admin"
                  ? "bg-white text-black shadow"
                  : "text-white hover:bg-white/10"
              }`}
          >
            Section Admin
          </button>

          {/* --- INFO POPOVER START --- */}
          <Popover>
            <PopoverTrigger asChild>
              <button className="grid place-items-center h-8 w-8 rounded-full cursor-pointer bg-white/10 text-cyan-300 hover:scale-110 transition outline-none">
                <Info className="w-4 h-4" />
              </button>
            </PopoverTrigger>
            <PopoverContent
              side="top"
              align="center"
              className="w-[90vw] sm:w-96 bg-[#1A1A42] border-slate-700 text-slate-100 p-5 rounded-2xl shadow-2xl z-50 backdrop-blur-md"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                  <p className="font-bold text-cyan-400 text-xs tracking-wider uppercase">
                    Very Important
                  </p>
                </div>
                
                <div className="space-y-3">
                  <p className="text-[13px] leading-relaxed text-slate-200">
                    Subadmin access allows administrators from different
                    sporting sections to independently create solutions that
                    relate to their sections effectively creating a separate
                    working subadmin area.
                  </p>
                  
                  <p className="text-[13px] leading-relaxed text-slate-300 italic">
                    All solutions from all sections will be automatically
                    visible in the main admin dashboard and appear automatically
                    in the APP.
                  </p>

                  <div className="bg-cyan-500/10 p-3 rounded-lg border border-cyan-500/20">
                    <p className="text-[13px] leading-relaxed text-cyan-200 font-medium">
                      Create Subadmin Pins and inform administrators from different sections of their access pins.
                    </p>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          {/* --- INFO POPOVER END --- */}
        </div>
      </div>

      {/* FULL PAGE CONTENT */}
      <div className="relative z-10">
        {activeTab === "master" ? <MasterAdminClubId /> : <AdminClubId />}
      </div>

      {/* BOTTOM FIXED CREATE BUTTON */}
      <div className="fixed bottom-0 left-0 w-full flex items-center justify-center z-20 p-4 bg-gradient-to-t from-black/60 to-transparent backdrop-blur">
        <button
          onClick={handleCreate}
          className="w-full sm:w-xl py-2 rounded-md text-md font-bold cursor-pointer text-white
          bg-teal-800
          shadow-xl shadow-teal-500/30
          transform transition-all duration-300
          hover:scale-[1.02] hover:shadow-teal-500/50
          active:scale-95 animate-pulse"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}