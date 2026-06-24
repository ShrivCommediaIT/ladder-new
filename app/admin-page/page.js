
"use client";

import AdminPage from "@/components/pages/admin/AdminPage";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import useAuthGuard from "@/hooks/useAuthGuard";

const AdminPageRouter = () => {

  const ladderId = useSelector((state) => state.user?.user?.ladder_id);

  const allowed = useAuthGuard();
  if (!allowed) return null;

  return (
    <div>
      <AdminPage ladder_id={ladderId} />
    </div>
  );
};

export default AdminPageRouter;