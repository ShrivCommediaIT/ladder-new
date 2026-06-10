"use client";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useSearchParams } from "next/navigation";

import MinileagueMovePlayerBox from "./MinileagueMovePlayerBox";
import Best5MovePlayerBox from "./Best5MovePlayerBox";

const MovePlayerBox = ({ onCancel, onSuccessRefresh }) => {

  const [open, setOpen] = useState(true);

  const searchParams = useSearchParams();

  const ladderId = searchParams.get("ladder_id");

  // URL se direct type lo (highest priority)
  const paramLadderType = searchParams.get("ladder_type");

  // Redux se fallback
  const playerLadderType = useSelector(
    (state) => state.player?.players?.[ladderId]?.ladderDetails?.type
  );

  const miniLeagueLadderType = useSelector(
    (state) => state.minileague?.ladderDetails?.type
  );

  // Final type decide
  const ladderType =
    paramLadderType || playerLadderType || miniLeagueLadderType;

  /* ========== RENDER ACCORDING TO TYPE ========== */

  if (ladderType === "minileague") {
    return <MinileagueMovePlayerBox onCancel={onCancel} onSuccessRefresh={onSuccessRefresh} />;
  }

  // best5 + winlose + best3 => Best5MovePlayerBox
  // if (["best5", "winlose", "best3"].includes(ladderType)) {
  //   return <Best5MovePlayerBox  open={open} onClose={() => setOpen(false)} />;
  // }

if (["best5", "winlose", "best3"].includes(ladderType)) {
  return (
    <Best5MovePlayerBox
      open={open}
      onClose={() => setOpen(false)}
      onSuccessRefresh={onSuccessRefresh}
    />
  );
}

  return (
    <div className="text-center text-white py-20 text-xl">
      Invalid ladder type / No data found.
    </div>
  );
};

export default MovePlayerBox;
