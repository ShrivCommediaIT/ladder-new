"use client"

import React from 'react'
import RegisterUser from '@/components/pages/users/RegisterUser'
import { useSearchParams } from "next/navigation"

const RegisterUserRouter = () => {

  const searchParams = useSearchParams()

  // ✅ direct URL se params lo
  const ladderId = searchParams.get("ladder_id")
  const ladderType = searchParams.get("ladder_type")

  return (
    <div className='bg-gray-900'>
        <RegisterUser 
          ladderId={ladderId}
          ladderType={ladderType}
        />
    </div>
  )
}

export default RegisterUserRouter
