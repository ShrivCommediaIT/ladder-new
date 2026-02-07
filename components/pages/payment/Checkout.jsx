// "use client";
// import { loadStripe } from "@stripe/stripe-js";

// const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

// export default function Checkout({ amount, planType }) {
//   const handleCheckout = async () => {
//     const res = await fetch("/api/checkout", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ amount, planType }),
//     });
//     const data = await res.json();
//     const stripe = await stripePromise;
//     await stripe.redirectToCheckout({ sessionId: data.id });
//   };

//   return <button onClick={handleCheckout}>Pay Now</button>;
// }


import React from 'react'

const Checkout = () => {
  return (
    <div>Checkout</div>
  )
}

export default Checkout