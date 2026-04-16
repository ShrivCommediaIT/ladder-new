
"use client"

import React from 'react'
import PaymentHeading from '@/components/pages/payment/PaymentHeading'
import SubscriptionPlan from '@/components/pages/payment/SubscriptionPlan'

import { useSelector } from 'react-redux'


const PaymentPageRouter = () => {

  const ladderId = useSelector((state) => state.user?.user?.ladder_id);

  return (
    <div className='bg-gradient-to-b from-[#080a1f] via-[#071748] to-[#0000de] min-h-screen'>
        <main className=''>
         <PaymentHeading />
         <SubscriptionPlan ladderId={ladderId} />
        </main>
    </div>
  )
}

export default PaymentPageRouter