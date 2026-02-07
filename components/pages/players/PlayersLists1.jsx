"use client";
import React from "react";
import { useSelector } from "react-redux";
import { useSearchParams } from "next/navigation";

import MinileaguePlayers from "./MinileaguePlayers";
import Best5Players from "./Best5Players";
import BasicLeaderboard from "./BasicLeaderboard";
import RosterLeaderboard from "../roster/RosterLeaderboard";

const PlayersLists1 = () => {
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
    return <Best5Players ladderId={ladderId} />;
  }

  if (ladderType === "roster") {
    return <RosterLeaderboard ladderId={ladderId} />;
  }

  return (
    <div className="text-center text-white py-20 text-xl">
      Invalid ladder type / No data found.
    </div>
  );
};

export default PlayersLists1;

// ===============================

// "use client";
// import React from "react";
// import { useSelector } from "react-redux";
// import { useSearchParams } from "next/navigation";

// import MinileaguePlayers from "./MinileaguePlayers";
// import Best5Players from "./Best5Players";
// import BasicLeaderboard from "./BasicLeaderboard";

// const PlayersLists1 = () => {
//   const searchParams = useSearchParams();
//   const ladderId = searchParams.get("ladder_id");

//   // ✅ Correct selectors
//   const playerLadderType = useSelector(
//     (state) => state.player?.players?.[ladderId]?.ladderDetails?.type
//   );

//   const miniLeagueLadderType = useSelector(
//     (state) => state.minileague?.players?.[ladderId]?.ladderDetails?.type
//   );

//   const skillLadderType = useSelector(
//     (state) => state.skillLeaderboard?.players?.[ladderId]?.ladderDetails?.type
//   );

//   console.log("skill:", skillLadderType);
//   console.log("player:", playerLadderType);
//   console.log("mini:", miniLeagueLadderType);

//   // ✅ Ladder type priority: skill > best5/best3/winlose > minileague
//   let ladderType = skillLadderType;

//   if (!ladderType) {
//     // check for normal leaderboard types
//     if (playerLadderType && ["best5", "best3", "winlose"].includes(playerLadderType)) {
//       ladderType = playerLadderType;
//     } else if (miniLeagueLadderType === "minileague") {
//       ladderType = "minileague";
//     }
//   }

//   console.log("FINAL ladderType:", ladderType);

//   // ✅ Render according to ladderType
//   if (ladderType === "minileague") {
//     return <MinileaguePlayers ladderId={ladderId} type="minileague" />;
//   }

//   if (ladderType === "skill") {
//     return <BasicLeaderboard ladderId={ladderId} type="skill" />;
//   }

//   if (ladderType && ["best5", "best3", "winlose"].includes(ladderType)) {
//     return <Best5Players ladderId={ladderId} />;
//   }

//   return (
//     <div className="text-center text-white py-20 text-xl">
//       Invalid ladder type / No data found.
//     </div>
//   );
// };

// export default PlayersLists1;
