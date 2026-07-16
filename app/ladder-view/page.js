"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux"; // ✅ Added for ladder type detection
import DummyPlayerList from "@/components/shared/DummyPlayerList";           // ✅ best5/winlose
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import InfoSection from "@/components/shared/InfoSection";
import { motion, AnimatePresence } from "framer-motion";
import MobileQuickActionsAndInvite from "@/components/shared/MobileQuickActionsAndInvite";
import { XCircle } from "lucide-react";

export default function LadderView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ladderId = searchParams.get("ladder_id");
  const ladderType = searchParams.get("ladder_type") || searchParams.get("type");

  const [mobileSection, setMobileSection] = useState("players");
  const [isDesktop, setIsDesktop] = useState(false);
  const [extraActions, setExtraActions] = useState([]);

  const baseActions = [
    {
      id: "leave-ladder",
      label: "Leave Ladder",
      icon: XCircle,
      tone: "danger",
      onClick: () => {},
      disabled: true,
    }
  ];

  const mergedQuickActions = [...baseActions, ...extraActions];

  // ---------------- SCREEN SIZE ----------------
  useEffect(() => {
    const checkScreen = () => setIsDesktop(window.innerWidth >= 1024);
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);
  
  // ✅ Detect ladder type from Redux store
  const ladderDetails = useSelector((state) => {
    // Check both player and minileague slices
    return state.player?.players?.[ladderId]?.ladderDetails || 
           state.minileague?.ladderDetails || {};
  });

  const inviteUrl = typeof window !== "undefined"
    ? `${window.location.origin}/login-user?ladder_id=${ladderId}&ladder_type=${ladderType}`
    : "";

  // ✅ Select correct component based on ladder type
  const getPlayersComponent = () => {
    return <DummyPlayerList ladderId={ladderId} ladderType={ladderType} onActionsChanged={setExtraActions} />;
  };

  return (
    <div className="flex flex-col w-full min-h-screen py-4 bg-background text-foreground relative">
      {/* Floating Theme Toggle */}

      {/* Back Button and Header Actions */}
      <div className="w-full flex items-center justify-between px-4 sm:px-8 lg:px-12 max-w-8xl mx-auto mb-6">
        <Button
          variant="outline"
          size="lg"
          className="w-full sm:w-auto bg-[var(--best-board-surface)] text-[var(--best-board-text)] hover:bg-[var(--best-board-surface-soft)] border border-[var(--best-board-border)] cursor-pointer px-6 sm:px-8 py-2 text-sm sm:text-md font-semibold"
          onClick={() => router.back()}
        >
          ← Back
        </Button>
      </div>

      {/* Mobile/Tablet tab switcher */}
      <div className="mb-4 flex gap-2 lg:hidden mt-5 px-4 sm:px-8">
        {[
          { id: "players", label: "Players" },
          { id: "info", label: "Info" },
        ].map((section) => (
          <button
            key={section.id}
            type="button"
            onClick={() => setMobileSection(section.id)}
            className={`flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition ${mobileSection === section.id
                ? "border-[var(--best-board-border-strong)] bg-[var(--best-board-accent-soft)] text-white font-semibold"
                : "border-[var(--best-board-border)] bg-[var(--best-board-surface)] text-[var(--best-board-text)] hover:bg-[var(--best-board-surface-soft)]"
              }`}
          >
            {section.label}
          </button>
        ))}
      </div>

      {/* Grid Layout (Side-by-side on desktop, stacked on mobile) */}
      <main className="w-full px-4 sm:px-8 lg:px-12 pb-6 max-w-8xl mx-auto">
        <div className="grid items-start gap-6 grid-cols-1 lg:grid-cols-[minmax(0,0.9fr)_360px] xl:grid-cols-[minmax(0,0.86fr)_400px]">
          <AnimatePresence>
            {(mobileSection === "players" || isDesktop) && (
              <motion.div
                key="ladder"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="min-w-0"
              >
                <MobileQuickActionsAndInvite
                  // inviteUrl={inviteUrl}
                  quickActions={mergedQuickActions}
                />
                {getPlayersComponent()}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {(mobileSection === "info" || isDesktop) && (
              <motion.div
                key="sidebar"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-4 lg:sticky lg:top-[5.2rem] lg:self-start"
              >
                <InfoSection
                  userLevel={true}
                  ladderType={ladderType}
                  user={null}
                  inviteUrl={inviteUrl}
                  quickActions={mergedQuickActions}
                  mobileSection={mobileSection}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
