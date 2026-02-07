
"use client"

import React from 'react'
import PaymentHeading from '@/components/pages/payment/PaymentHeading'
import SubscriptionPlan from '@/components/pages/payment/SubscriptionPlan'

import { useSelector } from 'react-redux'


const PaymentPageRouter = () => {

  const ladderId = useSelector((state) => state.user?.user?.ladder_id);

  return (
    <div>
        <main className='bg-gradient-to-br from-purple-300 via-pink-200 to-indigo-400 '>
         <PaymentHeading />
         <SubscriptionPlan ladderId={ladderId} />
        </main>
    </div>
  )
}

export default PaymentPageRouter