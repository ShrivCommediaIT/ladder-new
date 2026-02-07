

// "use client";
// import React, { useEffect, useState } from "react";
// import LoginUser from "@/components/pages/users/LoginUser";

// const LoginUserRouter = ({ params, searchParams }) => {
//   const { encodedId } = params;

//   // query param se ladderType
//   const ladderTypeParam = searchParams?.ladder_type;

//   const [ladderId, setLadderId] = useState(null);
//   const [ladderType, setLadderType] = useState(null);

//   useEffect(() => {
//     if (!encodedId) return;

//     try {
//       // Safe Base64 validation
//       const isBase64 = /^[A-Za-z0-9+/=]+$/.test(encodedId);
//       if (!isBase64) {
//         console.warn("⚠️ Invalid Base64 string received:", encodedId);
//         setLadderId(null);
//         return;
//       }

//       const decodedId = atob(encodedId);
//       setLadderId(decodedId);
//     } catch (err) {
//       console.error(" Invalid encoded ID:", err);
//       setLadderId(null);
//     }
//   }, [encodedId]);

//   useEffect(() => {
//     if (ladderTypeParam) {
//       setLadderType(ladderTypeParam);
//     }
//   }, [ladderTypeParam]);

//   return <LoginUser ladderId={ladderId} ladderType={ladderType} />;
// };

// export default LoginUserRouter;











// ===================== redirect to login =========================

"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import LoginUser from "@/components/pages/users/LoginUser";

const LoginUserRouter = ({ params }) => {
  const { encodedId } = params;

  const searchParams = useSearchParams();
  const ladderTypeParam = searchParams.get("ladder_type");

  const [ladderId, setLadderId] = useState(null);
  const [ladderType, setLadderType] = useState(null);

  useEffect(() => {
    if (!encodedId) return;

    try {
      const isBase64 = /^[A-Za-z0-9+/=]+$/.test(encodedId);
      if (!isBase64) {
        console.warn("Invalid Base64 string received:", encodedId);
        setLadderId(null);
        return;
      }

      const decodedId = atob(encodedId);
      setLadderId(decodedId);
    } catch (err) {
      console.error("Invalid encoded ID:", err);
      setLadderId(null);
    }
  }, [encodedId]);

  useEffect(() => {
    if (ladderTypeParam) {
      setLadderType(ladderTypeParam);
    }
  }, [ladderTypeParam]);

  return <LoginUser ladderId={ladderId} ladderType={ladderType} />;
};

export default LoginUserRouter;
