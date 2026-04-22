

"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import LoginUser from "@/components/pages/users/LoginUser";

const LoginUserRouter = () => {
  const searchParams = useSearchParams();

  // ✅ direct query params read
  const ladderId = searchParams.get("ladder_id");
  const ladderType = searchParams.get("ladder_type");

  return (
    <LoginUser
      ladderId={ladderId}
      ladderType={ladderType}
    />
  );
};

export default LoginUserRouter;
