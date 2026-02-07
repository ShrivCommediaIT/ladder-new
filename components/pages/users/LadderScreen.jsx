
"use client";

import React, { useState } from "react";
import UserRules from "./LadderRuleCardUser";
import PlayersList from "./PlayersList";

export default function LadderScreen({ ladderId }) {
  const [isLadderView, setIsLadderView] = useState(false); // default OFF

  return (
    <div className="w-full">
      {isLadderView ? (
        // 👉 ON: Only PlayersList full width
        <div className="w-full">
          <PlayersList ladderId={ladderId} />
        </div>
      ) : (
        // 👉 OFF: Rules + PlayersList side by side
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <UserRules isLadderView={isLadderView} setIsLadderView={setIsLadderView} />
          </div>
          <div className="md:col-span-2">
            <PlayersList ladderId={ladderId} />
          </div>
        </div>
      )}
    </div>
  );
}