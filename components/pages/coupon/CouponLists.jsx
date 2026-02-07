// "use client";

// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Separator } from "@/components/ui/separator";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { Loader2 } from "lucide-react";

// const CouponLists = () => {
//   const [coupons, setCoupons] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // ✅ Fetch fake coupon data
//   useEffect(() => {
//     const fetchCoupons = async () => {
//       try {
//         setLoading(true);
//         // 👇 You can replace this with your real endpoint later
//         const response = await axios.get("https://jsonplaceholder.typicode.com/users");

//         // 🧠 Map the fake API data to coupon-like structure
//         const fakeCoupons = response.data.slice(0, 8).map((user, index) => ({
//           discount_code: `CODE${index + 10}`,
//           discount_percentage: Math.floor(Math.random() * 30) + 5,
//           email: user.email,
//           business_name: user.company.name,
//           bank_name: "National Bank of Example",
//           bank_account_number: `AC${Math.floor(Math.random() * 10000000000)}`,
//           bic_code: `BIC${index + 101}`,
//           address: user.address.street,
//           city: user.address.city,
//           country: "USA",
//           post_code: user.address.zipcode,
//           bank_address: `${user.address.street}, ${user.address.city}`,
//         }));

//         setCoupons(fakeCoupons);
//       } catch (error) {
//         console.error("Error fetching coupons:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchCoupons();
//   }, []);

//   // ✅ Handle delete
//   const handleDelete = (code) => {
//     const filtered = coupons.filter((c) => c.discount_code !== code);
//     setCoupons(filtered);
//   };

//   // 🌀 Loading state
//   if (loading) {
//     return (
//       <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
//         <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
//         <p className="text-gray-600 text-lg">Loading coupons...</p>
//       </div>
//     );
//   }

//   // 😢 Empty state
//   if (coupons.length === 0) {
//     return (
//       <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
//         <p className="text-gray-600 text-lg">No coupons found.</p>
//       </div>
//     );
//   }

//   // 🎁 Coupons list UI
//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 sm:p-8">
//       <h1 className="text-3xl font-bold text-center text-blue-900 mb-8">
//         Created Coupons
//       </h1>

//       <ScrollArea className="h-[80vh] w-full max-w-6xl mx-auto space-y-6">
//         {coupons.map((coupon, index) => (
//           <Card
//             key={index}
//             className="shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 rounded-2xl overflow-hidden bg-white"
//           >
//             <div className="">
//                 <CardHeader className="bg-gradient-to-r from-pink-800 to-purple-500 text-white p-4">
//               <div className="flex items-center justify-between">
//                 <CardTitle className="text-xl font-bold">
//                   {coupon.discount_code || "N/A"}
//                 </CardTitle>
//                 <Badge
//                   variant="secondary"
//                   className="bg-white text-blue-700 font-semibold"
//                 >
//                   {coupon.discount_percentage}% OFF
//                 </Badge>
//               </div>
//               <p className="text-sm opacity-90 mt-1">
//                 {coupon.email || "No email provided"}
//               </p>
//             </CardHeader>

//             <CardContent className="p-5 sm:p-6 space-y-4">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <h3 className="font-semibold text-gray-700 mb-1">
//                     Business / Payee Name
//                   </h3>
//                   <p className="text-gray-800">{coupon.business_name}</p>
//                 </div>

//                 <div>
//                   <h3 className="font-semibold text-gray-700 mb-1">Bank Name</h3>
//                   <p className="text-gray-800">{coupon.bank_name}</p>
//                 </div>

//                 <div>
//                   <h3 className="font-semibold text-gray-700 mb-1">
//                     Account Number / IBAN
//                   </h3>
//                   <p className="text-gray-800">
//                     {coupon.bank_account_number || "N/A"}
//                   </p>
//                 </div>

//                 <div>
//                   <h3 className="font-semibold text-gray-700 mb-1">
//                     BIC / SWIFT Code
//                   </h3>
//                   <p className="text-gray-800">{coupon.bic_code || "N/A"}</p>
//                 </div>

//                 <div className="md:col-span-2">
//                   <Separator className="my-2" />
//                 </div>

//                 <div>
//                   <h3 className="font-semibold text-gray-700 mb-1">Address</h3>
//                   <p className="text-gray-800">
//                     {coupon.address}, {coupon.city}, {coupon.country} -{" "}
//                     {coupon.post_code}
//                   </p>
//                 </div>

//                 <div>
//                   <h3 className="font-semibold text-gray-700 mb-1">
//                     Bank Address
//                   </h3>
//                   <p className="text-gray-800">{coupon.bank_address}</p>
//                 </div>
//               </div>

//            <div className="flex justify-end gap-4 items-center">
//                <div className="flex justify-end mt-6">
//                 <Button
//                   variant="outline"
//                   className="border-blue-600 text-blue-700 hover:bg-blue-50 cursor-pointer"
//                   onClick={() => handleDelete(coupon.discount_code)}
//                 >
//                   Show Details
//                 </Button>
//               </div>

//                  <div className="flex justify-end mt-6">
//                 <Button
//                   variant="outline"
//                   className="border-red-600 text-red-700 hover:bg-red-50"
//                   onClick={() => handleDelete(coupon.discount_code)}
//                 >
//                   Delete
//                 </Button>
//               </div>
//            </div>
//             </CardContent>
//             </div>
//           </Card>
//         ))}
//       </ScrollArea>
//     </div>
//   );
// };

// export default CouponLists;













// ======================================== two

"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const CouponLists = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCoupon, setSelectedCoupon] = useState(null);

  // ✅ Fetch fake coupon data
  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          "https://jsonplaceholder.typicode.com/users"
        );

        const fakeCoupons = response.data.slice(0, 8).map((user, index) => ({
          discount_code: `CODE${index + 10}`,
          discount_percentage: Math.floor(Math.random() * 30) + 5,
          email: user.email,
          business_name: user.company.name,
          bank_name: "National Bank of Example",
          bank_account_number: `AC${Math.floor(Math.random() * 10000000000)}`,
          bic_code: `BIC${index + 101}`,
          address: user.address.street,
          city: user.address.city,
          country: "USA",
          post_code: user.address.zipcode,
          bank_address: `${user.address.street}, ${user.address.city}`,
        }));

        setCoupons(fakeCoupons);
      } catch (error) {
        console.error("Error fetching coupons:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCoupons();
  }, []);

  // ✅ Handle delete
  const handleDelete = (code) => {
    const filtered = coupons.filter((c) => c.discount_code !== code);
    setCoupons(filtered);
  };

  // 🌀 Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-gray-600 text-lg">Loading coupons...</p>
      </div>
    );
  }

  // 😢 Empty state
  if (coupons.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <p className="text-gray-600 text-lg">No coupons found.</p>
      </div>
    );
  }

  // 🎁 Coupons list UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 sm:p-8">
      <h1 className="text-3xl font-bold text-center text-blue-900 mb-8">
        Created Coupons
      </h1>

      <ScrollArea className="h-[80vh] w-full max-w-6xl mx-auto space-y-6">
        {coupons.map((coupon, index) => (
          <Card
            key={index}
            className="shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 rounded-2xl overflow-hidden bg-white"
          >
            <CardHeader className="bg-gradient-to-r from-pink-800 to-purple-500 text-white p-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold">
                  {coupon.discount_code || "N/A"}
                </CardTitle>
                <Badge
                  variant="secondary"
                  className="bg-white text-blue-700 font-semibold"
                >
                  {coupon.discount_percentage}% OFF
                </Badge>
              </div>
              <p className="text-sm opacity-90 mt-1">
                {coupon.email || "No email provided"}
              </p>
            </CardHeader>

            <CardContent className="p-5 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-gray-700 mb-1">
                    Business / Payee Name
                  </h3>
                  <p className="text-gray-800">{coupon.business_name}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-700 mb-1">Bank Name</h3>
                  <p className="text-gray-800">{coupon.bank_name}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-700 mb-1">
                    Account Number / IBAN
                  </h3>
                  <p className="text-gray-800">
                    {coupon.bank_account_number || "N/A"}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-700 mb-1">
                    BIC / SWIFT Code
                  </h3>
                  <p className="text-gray-800">{coupon.bic_code || "N/A"}</p>
                </div>

                <div className="md:col-span-2">
                  <Separator className="my-2" />
                </div>

                <div>
                  <h3 className="font-semibold text-gray-700 mb-1">Address</h3>
                  <p className="text-gray-800">
                    {coupon.address}, {coupon.city}, {coupon.country} -{" "}
                    {coupon.post_code}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-700 mb-1">
                    Bank Address
                  </h3>
                  <p className="text-gray-800">{coupon.bank_address}</p>
                </div>
              </div>

              {/* ✅ Action Buttons */}
              <div className="flex justify-end gap-4 items-center mt-6">
                {/* Show Details Button with Dialog */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="border-blue-600 text-blue-700 hover:bg-blue-50 cursor-pointer"
                      onClick={() => setSelectedCoupon(coupon)}
                    >
                      Show Details
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-lg max-w-sm w-full rounded-2xl">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-bold text-blue-800">
                        Coupon Details
                      </DialogTitle>
                    </DialogHeader>

                    {/* {selectedCoupon && (
                      <div className="overflow-x-auto mt-4">
                        <table className="min-w-full border border-gray-200 text-sm">
                          <tbody>
                            {Object.entries(selectedCoupon).map(
                              ([key, value]) => (
                                <tr
                                  key={key}
                                  className="border-b last:border-none"
                                >
                                  <td className="px-4 py-2 font-semibold capitalize bg-gray-50 w-1/3 text-gray-700">
                                    {key.replace(/_/g, " ")}
                                  </td>
                                  <td className="px-4 py-2 text-gray-800 break-words">
                                    {value}
                                  </td>
                                </tr>
                              )
                            )}
                          </tbody>
                        </table>
                      </div>
                    )} */}



                        
                    {selectedCoupon && (
                      <div className="mt-4">
                        <table className="min-w-full border border-gray-200 text-sm">
                          <tbody>
                            <tr className="border-b">
                              <td className="px-4 py-2 font-semibold bg-gray-50 text-gray-700">
                                Discount Code
                              </td>
                              <td className="px-4 py-2 text-gray-800">
                                {selectedCoupon.discount_code}
                              </td>
                            </tr>

                            <tr className="border-b">
                              <td className="px-4 py-2 font-semibold bg-gray-50 text-gray-700">
                                Email
                              </td>
                              <td className="px-4 py-2 text-gray-800">
                                {selectedCoupon.email}
                              </td>
                            </tr>

                            <tr className="border-b">
                              <td className="px-4 py-2 font-semibold bg-gray-50 text-gray-700">
                                Discount Percentage
                              </td>
                              <td className="px-4 py-2 text-gray-800">
                                {selectedCoupon.discount_percentage}% OFF
                              </td>
                            </tr>

                                 <tr className="border-b">
                              <td className="px-4 py-2 font-semibold bg-gray-50 text-gray-700">
                                Total Apply Code
                              </td>
                              <td className="px-4 py-2 text-gray-800">
                                {selectedCoupon.discount_percentage}
                              </td>
                            </tr>

                            

                            
                          </tbody>
                        </table>
                      </div>
                    )}


                  </DialogContent>
                </Dialog>

                {/* Delete Button */}
                <Button
                  variant="outline"
                  className="border-red-600 text-red-700 hover:bg-red-50"
                  onClick={() => handleDelete(coupon.discount_code)}
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </ScrollArea>
    </div>
  );
};

export default CouponLists;
