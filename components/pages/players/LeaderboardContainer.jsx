"use client";

import { useState } from "react";
import BasicLeaderboard from "./BasicLeaderboard";
import BasicLeaderboardSetUpSkill from "./BasicLeaderboardSetUpSkill";

const initialSkills = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  description: "",
  mode: "plus",
}));

export default function LeaderboardContainer() {
  const [skills, setSkills] = useState(initialSkills);
  const [openSetup, setOpenSetup] = useState(false);

  return (
    <>
      <BasicLeaderboard
        skills={skills}
        onOpenSetup={() => setOpenSetup(true)}
      />

      {openSetup && (
        <BasicLeaderboardSetUpSkill
          skills={skills}
          setSkills={setSkills}
          onClose={() => setOpenSetup(false)}
        />
      )}
    </>
  );
}
