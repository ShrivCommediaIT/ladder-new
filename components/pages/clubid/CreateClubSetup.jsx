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
    <div className="relative min-h-screen w-full overflow-x-hidden bg-background text-foreground">
      {/* ── Unified Navbar (Admin & Sub-Admin) ── */}
      <PlayerLevelNavbar activeTab="dashboard" />

      {/* Glow effects */}
      <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-secondary/20 blur-3xl" />

      <div className="w-full mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 pt-10 pb-8 relative z-10 flex flex-col items-center gap-6">
        {/* Tabs with Popover for Mobile & Desktop Click */}
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card/80 px-2 py-2 backdrop-blur">
          <button
            onClick={() => setActiveTab("master")}
            className={`px-6 py-2 rounded-xl text-sm font-semibold transition
              ${
                activeTab === "master"
                  ? "bg-primary text-white shadow"
                  : "text-foreground hover:bg-muted"
              }`}
          >
            Master Admin
          </button>

          <button
            onClick={() => setActiveTab("admin")}
            className={`px-6 py-2 rounded-xl text-sm font-semibold transition
              ${
                activeTab === "admin"
                  ? "bg-primary text-white shadow"
                  : "text-foreground hover:bg-muted"
              }`}
          >
            Section Admin
          </button>

          {/* --- INFO POPOVER START --- */}
          <Popover>
            <PopoverTrigger asChild>
              <button className="grid place-items-center h-8 w-8 rounded-full cursor-pointer bg-primary/10 text-primary hover:scale-110 transition outline-none">
                <Info className="w-4 h-4" />
              </button>
            </PopoverTrigger>
            <PopoverContent
              side="top"
              align="center"
              className="z-50 w-[90vw] rounded-2xl border border-border bg-card p-5 text-foreground shadow-2xl backdrop-blur-md sm:w-96"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-primary">
                    Very Important
                  </p>
                </div>
                
                <div className="space-y-3">
                  <p className="text-[13px] leading-relaxed text-muted-foreground">
                    Subadmin access allows administrators from different
                    sporting sections to independently create solutions that
                    relate to their sections effectively creating a separate
                    working subadmin area.
                  </p>
                  
                  <p className="text-[13px] italic leading-relaxed text-muted-foreground">
                    All solutions from all sections will be automatically
                    visible in the main admin dashboard and appear automatically
                    in the APP.
                  </p>

                  <div className="rounded-lg border border-primary/20 bg-primary/10 p-3">
                    <p className="text-[13px] font-medium leading-relaxed text-primary">
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
      <div className="fixed bottom-0 left-0 z-20 flex w-full items-center justify-center bg-gradient-to-t from-background via-background/70 to-transparent p-4 backdrop-blur">
        <button
          onClick={handleCreate}
          className="w-full cursor-pointer rounded-md bg-primary py-2 text-md font-bold text-white shadow-xl transition-all duration-300 hover:scale-[1.02] hover:bg-[var(--brand-hover)] active:scale-95 sm:w-xl"
          style={{ boxShadow: "var(--brand-button-shadow)" }}
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}
