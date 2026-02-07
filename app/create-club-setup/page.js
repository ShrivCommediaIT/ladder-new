
"use client"

import CreateClubSetup from '@/components/pages/clubid/CreateClubSetup'
import React from 'react'
import useAuthGuard from '@/hooks/useAuthGuard'

const CreateClubSetupRouter = () => {

   const allowed = useAuthGuard();
    if (!allowed) return null;

  return (
    <div>
        <CreateClubSetup />
    </div>
  )
}

export default CreateClubSetupRouter