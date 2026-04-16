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
    return (
      <MinileagueAddPlayer
        ladderId={ladderId}
        onClose={onClose}
        onSuccessRefresh={onSuccessRefresh} // ✅ Added
      />
    );
  }

  if (["skill", "positive", "negative", "roster"].includes(ladderType)) {
    return (
      <AddPlayerSkill
        ladderId={ladderId}
        onClose={onClose}
        onSuccessRefresh={onSuccessRefresh}
      />
    );
  }

  return (
    <BestAddPlayer
      ladderId={ladderId}
      onClose={onClose}
      onSuccessRefresh={onSuccessRefresh} // ✅ Added
    />
  );
};

export default AddPlayer;
