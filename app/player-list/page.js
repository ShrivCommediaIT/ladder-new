"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PlayerLists } from "@/components/pages/players/PlayerLists";
import useAuthGuard from "@/hooks/useAuthGuard";

export default function PlayerListsRouter() {

  const allowed = useAuthGuard();
  if (!allowed) return null;

  return <PlayerLists />;
}