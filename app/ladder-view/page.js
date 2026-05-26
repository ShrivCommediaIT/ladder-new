"use client";

import { useSelector } from "react-redux"; // ✅ Added for ladder type detection
import DummyPlayerList from "@/components/shared/DummyPlayerList";           // ✅ best5/winlose
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import InfoSection from "@/components/shared/InfoSection";

export default function LadderView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ladderId = searchParams.get("ladder_id");
  const ladderType = searchParams.get("ladder_type") || searchParams.get("type");
  
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
    return <DummyPlayerList ladderId={ladderId} ladderType={ladderType} />;
  };

  return (
    <div className="flex flex-col w-full min-h-screen py-4 bg-background text-foreground relative">
      {/* Floating Theme Toggle */}
      <div className="fixed top-4 right-4 z-[60]">
        <ThemeToggle />
      </div>

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

      {/* Grid Layout (Side-by-side on desktop, stacked on mobile) */}
      <main className="w-full px-4 sm:px-8 lg:px-12 pb-6 max-w-8xl mx-auto">
        <div className="grid items-start gap-6 grid-cols-1 lg:grid-cols-[minmax(0,0.9fr)_360px] xl:grid-cols-[minmax(0,0.86fr)_400px]">
          {/* Left Panel: Leaderboard */}
          <div className="min-w-0">
            {getPlayersComponent()}
          </div>
          
          {/* Right Panel: Premium User Info Section */}
          <div className="lg:sticky lg:top-[5.2rem] lg:self-start">
            <InfoSection
              userLevel={true}
              ladderType={ladderType}
              user={null}
              inviteUrl={inviteUrl}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
