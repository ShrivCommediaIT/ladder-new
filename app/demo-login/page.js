"use client";
import DemoLogin from '@/components/demo/DemoLogin';
import { useSearchParams } from 'next/navigation';
import React from 'react';

const DemoLoginRouter = () => {
  const searchParams = useSearchParams();
  const demoType = searchParams.get("demoType");

  // Mapping demoType → ladderId & ladderType
  const demoMap = {
    winlose: { id: 1, type: "winlose" },
    best3: { id: 154, type: "best3" },
    best5: { id: 155, type: "best5" },
  };

  const demoConfig = demoMap[demoType] || demoMap.winlose;
  const ladderId = demoConfig.id;

  return (
    <div>
      <DemoLogin ladderId={ladderId} />
    </div>
  );
};

export default DemoLoginRouter;
