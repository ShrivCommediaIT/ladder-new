

"use client";

import RegisterUser from "@/components/pages/users/RegisterUser";
import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";

const RegisterUserPage = () => {
  const params = useParams(); // Gets [encodedId] from the URL
  const searchParams = useSearchParams(); // For ladder_type query
  const [ladderId, setLadderId] = useState(null);
  const [ladderType, setLadderType] = useState(null);

  useEffect(() => {
    const encodedId = params?.encodedId;
    const ladderTypeParam = searchParams?.get("ladder_type");

    // Decode ladderId
    if (encodedId) {
      try {
        const decodedId = atob(decodeURIComponent(encodedId)); // Safe decode
        setLadderId(decodedId);
      } catch (error) {
        console.error("Invalid encoded ladder ID:", error);
        setLadderId(null);
      }
    }

    // Set ladderType from query
    if (ladderTypeParam) {
      setLadderType(ladderTypeParam);
    }
  }, [params, searchParams]);

  return (
    <div className="bg-slate-800/5">
      {/* Pass decoded ladderId and ladderType safely to child */}
      <RegisterUser ladderId={ladderId} ladderType={ladderType} />
    </div>
  );
};

export default RegisterUserPage;
