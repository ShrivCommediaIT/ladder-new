
"use client";
import DemoRegister from '@/components/demo/DemoRegister';
import { useSearchParams } from "next/navigation";
import React from 'react';

const DemoPageRouter = () => {
  const searchParams = useSearchParams();
  const demoType = searchParams.get("demoType");
  const demoTypeName = searchParams.get("demoTypeName");

  // Mapping demoType → ladderId
  const demoMap = {
    winlose: 1,
    best3: 154,
    best5: 155,
  };

  const demoNameMap = {
    winlose: "winlose",
    best3: "best3",
    best5: "best5"
  }

  const ladderId = demoMap[demoType] || 1; // default 1 (winlose)
  const ladderType = demoNameMap[demoTypeName] || "winlose";

  return (
    <div>
      <DemoRegister ladderId={ladderId} ladderType={ladderType} />
    </div>
  );
};

export default DemoPageRouter;
