// "use client";

// import React, { useState } from "react";
// import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

// const APPKEY = "Py9YJXgBecbbqxjRVaHarcSnJyuzhxGqJTkY6xKZRfrdXFy72HPXvFRvfEjy";

// export default function PaypalCheckout({ amount }) {
//   const [paid, setPaid] = useState(false);

//   const handleApprove = (orderId) => {
//     console.log("Payment approved! Order ID:", orderId);
//     // ✅ Call your backend to capture order / verify payment
//   };

//   return (
//     <PayPalScriptProvider
//       options={{
//         "client-id": process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
//          currency: "GBP",
//       }}
//     >
//       {!paid ? (
//         <PayPalButtons
//           style={{ layout: "vertical" }}
//           createOrder={(data, actions) => {
//             return actions.order.create({
//               purchase_units: [
//                 {
//                   amount: {
//                     value: amount.toString(),
//                   },
//                 },
//               ],
//             });
//           }}
//           onApprove={async (data, actions) => {
//             const order = await actions.order.capture();
//             console.log("Order captured:", order);
//             setPaid(true);

//             // ✅ Call backend PHP API to save payment info
//             fetch("https://ne-games.com/leaderBoard/api/user/buySubscription", {
//               method: "POST",
//               headers: { "Content-Type": "application/json",APPKEY },
//               body: JSON.stringify({ order }),
//             });
//           }}
//         />
//       ) : (
//         <p>Payment successful! Thank you.</p>
//       )}
//     </PayPalScriptProvider>
//   );
// }


import React from 'react'

const PaypalCheckout = () => {
  return (
    <div>PaypalCheckout</div>
  )
}

export default PaypalCheckout