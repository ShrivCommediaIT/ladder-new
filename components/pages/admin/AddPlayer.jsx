"use client";
import React from "react";
import { useSelector } from "react-redux";
import { useSearchParams } from "next/navigation";

import MinileagueAddPlayer from "./MinileagueAddPlayer";
import BestAddPlayer from "./BestAddPlayer";
import AddPlayerSkill from "./AddPlayerSkill";

const AddPlayer = ({ ladderId, onClose, onSuccessRefresh }) => { // ✅ Both props
  const searchParams = useSearchParams();
  const typeFromParams = searchParams.get("type");

  const playerLadderType = useSelector(
    (state) => state.player?.players?.[ladderId]?.ladderDetails?.type
  );
  const miniLeagueLadderType = useSelector(
    (state) => state.minileague?.ladderDetails?.type
  );

  const ladderType = typeFromParams || playerLadderType || miniLeagueLadderType;

  /* ========== RENDER WITH CALLBACKS ========== */
  if (ladderType === "minileague") {
    return <MinileagueAddPlayer ladderId={ladderId} onClose={onClose} />;
  }

  if (ladderType === "skill") {
    return (
      <AddPlayerSkill 
        ladderId={ladderId}
        onClose={onClose} // ✅ Parent onClose forward
        onSuccessRefresh={onSuccessRefresh} // ✅ Refresh callback
      />
    );
  }

  if (ladderType === "best5") {
    return <BestAddPlayer ladderId={ladderId} onClose={onClose} />;
  }

  return <BestAddPlayer ladderId={ladderId} onClose={onClose} />;
};

export default AddPlayer;
