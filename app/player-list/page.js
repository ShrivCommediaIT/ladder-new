"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import useAuthGuard from "@/hooks/useAuthGuard";

const PlayerLists = dynamic(
  () => import("@/components/pages/players/PlayerLists").then((m) => ({ default: m.PlayerLists })),
  { ssr: false, loading: () => null }
);

export default function PlayerListsRouter() {
  const allowed = useAuthGuard();
  if (!allowed) return null;

  return <PlayerLists />;
}