
"use client"

import CreateLadder from '@/components/pages/ladder/CreateLadder'
import useAuthGuard from '@/hooks/useAuthGuard';
import React from 'react'

const LadderPageRouter = () => {

  const allowed = useAuthGuard();
  if (!allowed) return null;

  return (
    <div>
        <CreateLadder />
    </div>
  )
}

export default LadderPageRouter