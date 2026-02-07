"use client";
import React from "react";
import { useSelector } from "react-redux";
import { useSearchParams } from "next/navigation";

import RemoveBestPlayer from "./RemoveBestPlayer";
import RemoveMinileaguePlayer from "./RemoveMinileaguePlayer";

const RemovePlayerBox = ({ onClose, onSuccessRefresh }) => {
  const searchParams = useSearchParams();
  const ladderId = searchParams.get("ladder_id");
  const typeFromParams = searchParams.get("type");

  // Multiple sources se ladderType
  const playerLadderType = useSelector(
    (state) => state.player?.players?.[ladderId]?.ladderDetails?.type
  );
  const miniLeagueLadderType = useSelector(
    (state) => state.minileague?.ladderDetails?.type
  );

  // ✅ Final ladderType
  const ladderType =
    typeFromParams || playerLadderType || miniLeagueLadderType;

  /* ========== RENDER ACCORDING TO TYPE ========== */

  // Minileague
  if (ladderType === "minileague") {
    return <RemoveMinileaguePlayer ladderId={ladderId} />;
  }

  // Best5 / Winlose / Best3 / Skill
  if (["best5", "winlose", "best3", "skill"].includes(ladderType)) {
    return (
      <RemoveBestPlayer
        ladderId={ladderId}
        onClose={onClose}
        onSuccessRefresh={onSuccessRefresh}
      />
    );
  }

  // Default fallback
  return (
    <div className="text-center text-white py-20 text-xl">
      Invalid ladder type: "{ladderType}" / No data found for ladderId: {ladderId}
    </div>
  );
};

export default RemovePlayerBox;
