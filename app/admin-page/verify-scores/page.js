"use client";

import VerifyScoresPage from "@/components/pages/admin/VerifyScoresPage";
import useAuthGuard from "@/hooks/useAuthGuard";
import React from "react";

const VerifyScoresRouter = () => {
  const allowed = useAuthGuard();
  if (!allowed) return null;

  return (
    <div>
      <VerifyScoresPage />
    </div>
  );
};

export default VerifyScoresRouter;
