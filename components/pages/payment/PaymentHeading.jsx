import React from 'react'
import Image from 'next/image'
import Logo from '@/public/topLogo.png'

const PaymentHeading = () => {
  return (
    <div className="w-full flex flex-col items-center pt-8 pb-4 gap-6">
      <div className="bg-white p-4 rounded-lg shadow-xl">
        <Image 
          src={Logo} 
          alt="Sports Solutions Pro" 
          width={180} 
          height={60} 
          className="object-contain"
        />
      </div>
      <h1 className="text-4xl md:text-5xl font-black text-white tracking-widest text-center uppercase">
        PAYMENT PLANS & LICENCES
      </h1>
    </div>
  )
}

export default PaymentHeading
