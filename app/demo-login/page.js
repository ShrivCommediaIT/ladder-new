

// "use client";
// import DemoLogin from '@/components/demo/DemoLogin';
// import { useSearchParams } from 'next/navigation';
// import React from 'react';

// const DemoLoginRouter = () => {
//   const searchParams = useSearchParams();
//   const demoType = searchParams.get("demoType");

//   // Mapping demoType → ladderId
//   const demoMap = {
//     winlose: 1,
//     best3: 154,
//     best5: 155,
//   };

//   const ladderId = demoMap[demoType] || 1; // default win/lose

//   return (
//     <div>
//       <DemoLogin ladderId={ladderId} />
//     </div>
//   );
// };

// export default DemoLoginRouter;








// ========================== 18-12-2025 ====================

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
