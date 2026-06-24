"use client";

import SubAdminDashboard from '@/components/pages/admin/sub-admin/SubAdminDashboard'
import useAuthGuard from '@/hooks/useAuthGuard';
import React from 'react'

const SubAdminDashboardRouter = () => {

  const allowed = useAuthGuard();
  if (!allowed) return null;

  return (
    <div>
        <SubAdminDashboard />
    </div>
  )
}

export default SubAdminDashboardRouter