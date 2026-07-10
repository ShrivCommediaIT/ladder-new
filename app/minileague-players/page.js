"use client";
import dynamic from "next/dynamic";

const PlayerLists = dynamic(
  () => import("@/components/pages/players/PlayerLists").then((m) => ({ default: m.PlayerLists })),
  { ssr: false, loading: () => null }
);

const PlayerListsRouter = () => {
  return (
    <div>
      <PlayerLists />
    </div>
  );
};

export default PlayerListsRouter;