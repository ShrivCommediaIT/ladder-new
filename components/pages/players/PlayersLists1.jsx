"use client";
import React from "react";
import { useSearchParams } from "next/navigation";

import MinileaguePlayers from "./MinileaguePlayers";
import Best5Players from "./Best5Players";
import BasicLeaderboard from "./BasicLeaderboard";
import RosterLeaderboard from "../roster/RosterLeaderboard";
import PositiveLeaderboard from "./PositiveLeaderBoard";
import NegativeLeaderboard from "./negativeLeaderboard";

const PlayersLists1 = ({ searchValue = "", onSearchChange }) => {
  const searchParams = useSearchParams();
  const ladderId = searchParams.get("ladder_id");

  const ladderType = searchParams.get("type");

  if (ladderType === "minileague") {
    return <MinileaguePlayers ladderId={ladderId} type="minileague" />;
  }

  if (ladderType === "skill") {
    return <BasicLeaderboard ladderId={ladderId} type="skill" />;
  }

  // best5 best3 winlose
  if (ladderType && ["best5", "best3", "winlose"].includes(ladderType)) {
    return <Best5Players ladderId={ladderId} searchValue={searchValue} onSearchChange={onSearchChange} />;
  }

  if (ladderType === "roster") {
    return <RosterLeaderboard ladderId={ladderId} />;
  }

  
  if (ladderType === "positive") {
    return <PositiveLeaderboard ladderId={ladderId} />;
  }

  if (ladderType === "negative") {
    return <NegativeLeaderboard ladderId={ladderId} />;
  }


  return (
    <div className="text-center text-white py-20 text-xl">
      Invalid ladder type / No data found.
    </div>
  );
};

export default PlayersLists1;

