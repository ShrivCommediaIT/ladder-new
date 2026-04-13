"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import BgHome from "@/public/topLogo.png";
import Facebook from "@/public/facebook.png";
import Youtube from "@/public/youtube.png";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { loginPage } from "@/helper/RouteName";

import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import { useSelector } from "react-redux";

// live key
// const stripePromise = loadStripe(
//   "pk_live_51LFh2OJsNwj9rybc0tvpLTAqLfEweHmbDAkv3YukrUIXrIxtXPd7tqBvGxSSZEA55r3KlH2V7AZETbQhuqwn4OqT00NdPDedFd"
// );

// ------------------------------------
// testing

const stripePromise = loadStripe(
  "pk_test_51LFh2OJsNwj9rybczkrJhz3tV7ve8NEGquIRdIt0TqqMlBEZaZmeoIHkITvpPdPBFW36Cwgbztkj44iiN4igjc4300OB2xb1bU"
);

// -------------------------------------

import { postRequest, getRequest } from "@/services/apiService";
import { API_ENDPOINTS } from "@/constants/api";
// ADD THIS IMPORT

function CheckoutForm({
  amount,
  noOfUsers,
  subscriptionType,
  onClose,
  response,
  ladderId,
}) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter(); // ✅ INIT ROUTER
  const [loading, setLoading] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogMessage, setDialogMessage] = useState("");
  const [activeLadderId, setActiveLadderId] = useState(null);

  const userId = useSelector((state) => state.user?.user?.id);

  const handleSubmit = async () => {
    if (!stripe || !elements) return;
    setLoading(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
        confirmParams: { return_url: window.location.href },
      });

      if (error) {
        setDialogTitle("Payment Failed");
        setDialogMessage(error.message);
        setDialogOpen(true);
      } else if (paymentIntent?.status === "succeeded") {
        setDialogTitle("Payment Successful");
        setDialogMessage("Processing your subscription...");
        setDialogOpen(true);

        try {
          const result = await postRequest("/user/buySubscription", {
            user_id: userId,
            no_of_users: noOfUsers ,
            subscription_type: subscriptionType,
            amount: amount,
            transaction_id: paymentIntent.id,
            transaction_status: paymentIntent.status,
            discount_code: response?.discount_code || null,
            ladder_id: ladderId,
          });

          const getData = await getRequest("/user/getsubsciptionDetails", { user_id: userId });

          if (getData?.data) {
            const sub = getData.data;
            console.log("subscription details : ", sub);
            setDialogTitle("Subscription Activated ");
            setDialogMessage(
              `Plan: ${sub.subscription_type}\n` +
                `Users: ${sub.no_of_users}\n` +
                `Amount: £${(sub.amount / 100).toFixed(2)}\n` +
                `Transaction_id: ${sub.transaction_id}\n` +
                `Status: ${sub.transaction_status}\n` +
                `Valid Till: ${sub.subscription_expired_date}\n\n` +
                `Please click OK to go to the Login page, then sign in with your email and password to view the ladder lists and see how many players are unlocked in your ladder.`
            );
          } else {
            setDialogTitle("Subscription Activated Failed ");
            setDialogMessage("But failed to fetch subscription details.");
          }
        } catch (apiErr) {
          console.error("Failed to call buySubscription API", apiErr);
          setDialogTitle("Subscription Error");
          setDialogMessage(
            "Failed to activate subscription. Please contact support."
          );
        }
      }
    } catch (err) {
      console.error("Payment Error:", err);
      setDialogTitle("Error");
      setDialogMessage("Something went wrong. Please try again.");
      setDialogOpen(true);
    }

    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <PaymentElement />
      <Button
        onClick={handleSubmit}
        disabled={loading || !stripe || !elements}
        className="w-full bg-green-500 hover:bg-green-600 cursor-pointer"
      >
        {loading ? "Processing..." : "Pay Now"}
      </Button>

      {/* Result Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="border-b py-2 border-gray-500 text-2xl text-center">
              {dialogTitle}
            </DialogTitle>
            <DialogDescription className="whitespace-pre-line text-blue-950 text-md font-semibold">
              {dialogMessage}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              className="cursor-pointer w-full bg-blue-600 hover:bg-blue-700 py-2 "
              onClick={() => {
                setDialogOpen(false);
                onClose?.();
                router.push(`${loginPage}`); // REDIRECT TO PLAYER LIST PAGE
              }}
            >
              Login Page
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* Main Component */
export default function SubscriptionPlan({ ladderId }) {
  const [monthlyPlayers, setMonthlyPlayers] = useState(20);
  const [yearlyPlayers, setYearlyPlayers] = useState(20);

  const [monthlyCost, setMonthlyCost] = useState(monthlyPlayers);
  const [yearlyCost, setYearlyCost] = useState(yearlyPlayers);

  // ------------------- ADD THESE STATES -------------------
  const [monthlyCoupon, setMonthlyCoupon] = useState("");
  const [yearlyCoupon, setYearlyCoupon] = useState("");
  const [monthlyCouponValid, setMonthlyCouponValid] = useState(false);
  const [yearlyCouponValid, setYearlyCouponValid] = useState(false);
  const [checkingMonthlyCoupon, setCheckingMonthlyCoupon] = useState(false);
  const [checkingYearlyCoupon, setCheckingYearlyCoupon] = useState(false);

  // NEW STATES FOR DIALOGS
  const [monthlyDialogOpen, setMonthlyDialogOpen] = useState(false);
  const [monthlyDialogMessage, setMonthlyDialogMessage] = useState("");
  const [yearlyDialogOpen, setYearlyDialogOpen] = useState(false);
  const [yearlyDialogMessage, setYearlyDialogMessage] = useState("");
  const [monthlyCouponResponse, setMonthlyCouponResponse] = useState(null);
  const [yearlyCouponResponse, setYearlyCouponResponse] = useState(null);


  // Update cost whenever players change (but don't overwrite if coupon already applied)
  useEffect(() => {
    if (!monthlyCouponValid) {
      setMonthlyCost(monthlyPlayers * 1.33);
    }
  }, [monthlyPlayers, monthlyCouponValid]);

  useEffect(() => {
    if (!yearlyCouponValid) {
      setYearlyCost(yearlyPlayers * 12);
    }
  }, [yearlyPlayers, yearlyCouponValid]);

  const [monthlyClientSecret, setMonthlyClientSecret] = useState(null);
  const [yearlyClientSecret, setYearlyClientSecret] = useState(null);

  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null); // "monthly" or "yearly"

  useEffect(() => {
    async function createMonthlyIntent() {
      const data = await postRequest("/payment/intent", { amount: Math.round(monthlyCost * 100) });
      if (data.paymentIntent) setMonthlyClientSecret(data.paymentIntent);
    }
    createMonthlyIntent();
  }, [monthlyCost]);

  useEffect(() => {
    async function createYearlyIntent() {
      const data = await postRequest("/payment/intent", { amount: Math.round(yearlyCost * 100) });
      if (data.paymentIntent) setYearlyClientSecret(data.paymentIntent);
    }
    createYearlyIntent();
  }, [yearlyCost]);

  const handleOpenPayment = (type) => {
    setSelectedPlan(type);
    setOpenPaymentDialog(true);
  };

  const handleCheckMonthlyCoupon = async () => {
    setCheckingMonthlyCoupon(true);
    try {
      const data = await getRequest("/apply/discountCode", { discount_code: monthlyCoupon, amount: monthlyCost });

      if (data.status === 200) {
        setMonthlyCouponValid(true);
        setMonthlyCouponResponse(data); 
        if (data.afterDiscount_amount) {
          setMonthlyCost(Number(data.afterDiscount_amount));
        }
        setMonthlyDialogMessage(
          `Coupon Applied!\n${data.discount_percentage}% OFF\nFinal Price: £${data.afterDiscount_amount}`
        );
      } else {
        setMonthlyCouponValid(false);
        setMonthlyCouponResponse(null); 
        setMonthlyDialogMessage("Invalid Coupon Code. Please try again.");
      }
      setMonthlyDialogOpen(true);
    } catch (error) {
      console.error("Coupon check error:", error);
      setMonthlyCouponResponse(null);
      setMonthlyDialogMessage(" Server error while checking coupon.");
      setMonthlyDialogOpen(true);
    }
    setCheckingMonthlyCoupon(false);
  };

  const handleCheckYearlyCoupon = async () => {
    setCheckingYearlyCoupon(true);
    try {
      const data = await getRequest("/apply/discountCode", { discount_code: yearlyCoupon, amount: yearlyCost });

      if (data.status === 200) {
        setYearlyCouponValid(true);
        setYearlyCouponResponse(data);
        if (data.afterDiscount_amount) {
          setYearlyCost(Number(data.afterDiscount_amount));
        }
        setYearlyDialogMessage(
          `Coupon Applied!\n${data.discount_percentage}% OFF\nFinal Price: £${data.afterDiscount_amount}`
        );
      } else {
        setYearlyCouponValid(false);
        setYearlyCouponResponse(null);
        setYearlyDialogMessage("Invalid Coupon Code. Please try again.");
      }
      setYearlyDialogOpen(true);
    } catch (error) {
      console.error("Yearly coupon check error:", error);
      setYearlyCouponResponse(data);
      setYearlyDialogMessage(" Server error while checking coupon.");
      setYearlyDialogOpen(true);
    }
    setCheckingYearlyCoupon(false);
  };

  return (
    <main
      className="px-4 py-10 sm:px-8 md:px-12 lg:px-20 xl:px-32 max-w-6xl mx-auto min-h-screen overflow-hidden"
      style={{
        backgroundImage: "url('/bgHome.png')",
        backgroundRepeat: "repeat",
        backgroundSize: "200px",
      }}
    >
      {/* ✅ Heading */}
      <motion.section
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6 relative text-center bg-yellow-100/90 border border-yellow-300 p-8 rounded-lg shadow-md "
      >
        <div className="absolute w-full flex items-center justify-center sm:justify-start sm:left-[40%] left-[2%] top-[-80]">
          <Image
            src={BgHome}
            alt="bghome"
            height={100}
            width={100}
            className="w-56 sm:w-56 md:w-56 lg:w-56"
          />
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold tracking-wide text-gray-800 uppercase py-4">
          Payment Plans & Size of Ladder
        </h1>
      </motion.section>
      {/* ✅ Subscription Cards */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-10"
      >
        {/* Monthly Plan */}
        <motion.div className="bg-gradient-to-b from-yellow-700 to-yellow-100 p-6 rounded-lg shadow-lg border text-center space-y-2">
          <h2 className="text-xl font-bold text-yellow-300">
            Monthly Subscription
          </h2>
          <p className="text-lg font-semibold text-gray-300">
            Ideal for short term ladders
          </p>

          <div className="bg-gradient-to-b from-yellow-300 to-yellow-100 border border-black border-dashed rounded-md space-y-4 px-8 py-8">
            <p className="font-semibold">£1.33 per player per month</p>
            <select
              value={monthlyPlayers}
              onChange={(e) => setMonthlyPlayers(Number(e.target.value))}
              className="border border-gray-400 rounded p-2 w-full"
            >
              {[20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200, 210, 220, 230, 240, 250].map((size) => (
                <option key={size} value={size}>
                  {size} Players
                </option>
              ))}
            </select>
            <p className="font-bold">
              Total Cost <br /> £{monthlyCost.toFixed(2)} / month
            </p>

            {/* Monthly Coupon Input */}
            <div className="flex flex-col md:flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={monthlyCoupon}
                onChange={(e) => {
                  setMonthlyCoupon(e.target.value);
                  setMonthlyCouponValid(false);
                }}
                placeholder="Coupon Code"
                className="flex-1 border-2 border-amber-50 rounded-sm px-2 text-base"
              />
              <Button
                type="button"
                onClick={handleCheckMonthlyCoupon}
                disabled={!monthlyCoupon || checkingMonthlyCoupon}
                className="px-6 py-2 rounded-sm bg-amber-500 hover:bg-amber-600 cursor-pointer w-full sm:w-auto"
              >
                {checkingMonthlyCoupon ? "Checking..." : "Apply"}
              </Button>
            </div>

            <Button
              className="bg-green-500 hover:bg-green-600 cursor-pointer px-8 rounded-sm"
              onClick={() => handleOpenPayment("monthly")}
            >
              Pay Now
            </Button>
          </div>
        </motion.div>

        {/* Yearly Plan */}
        <motion.div className="bg-gradient-to-b from-green-500 to-green-100 p-6 rounded-lg shadow-lg border text-center space-y-2">
          <h2 className="text-xl font-bold text-yellow-100">
            Yearly Subscription
          </h2>
          <p className="text-lg font-semibold text-black">
            Ideal for long term ladders
          </p>

          <div className="bg-gradient-to-b from-blue-200 to-yellow-100 border border-black border-dashed shadow-lg rounded-md space-y-2 px-8 py-8">
            <p className="font-semibold">£12 per player per year</p>
            <p className="italic text-sm">(25% discount on monthly charge)</p>
            <select
              value={yearlyPlayers}
              onChange={(e) => setYearlyPlayers(Number(e.target.value))}
              className="border border-gray-400 rounded p-2 w-full"
            >
              {[20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200, 210, 220, 230, 240, 250].map((size) => (
                <option key={size} value={size}>
                  {size} Players
                </option>
              ))}
            </select>
            <p className="font-bold">
              Total Cost <br /> £{yearlyCost.toFixed(2)} / year
            </p>

            {/* Yearly Coupon Input */}
            <div className="flex flex-col md:flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={yearlyCoupon}
                onChange={(e) => {
                  setYearlyCoupon(e.target.value);
                  setYearlyCouponValid(false);
                }}
                placeholder="Coupon Code"
                className="flex-1 border-2 border-amber-50 rounded-sm px-2 text-base"
              />
              <Button
                type="button"
                onClick={handleCheckYearlyCoupon}
                disabled={!yearlyCoupon || checkingYearlyCoupon}
                className="px-6 py-2 rounded-sm bg-amber-500 hover:bg-amber-600 cursor-pointer w-full sm:w-auto"
              >
                {checkingYearlyCoupon ? "Checking..." : "Apply"}
              </Button>
            </div>

            <Button
              className="bg-green-500 px-8 rounded-sm hover:bg-green-600 cursor-pointer"
              onClick={() => handleOpenPayment("yearly")}
            >
              Pay Now
            </Button>
          </div>
        </motion.div>
      </motion.section>
      {/* ✅ Stripe Dialog */}
      <Dialog open={openPaymentDialog} onOpenChange={setOpenPaymentDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Your Payment</DialogTitle>
          </DialogHeader>

          {selectedPlan === "monthly" && monthlyClientSecret && (
            <Elements
              stripe={stripePromise}
              options={{ clientSecret: monthlyClientSecret }}
            >
              <CheckoutForm
                amount={Math.round(monthlyCost * 100)}
                noOfUsers={monthlyPlayers}
                subscriptionType="monthly"
                response={monthlyCouponResponse} // ✅ pass here
                ladderId={ladderId}
                onClose={() => setOpenPaymentDialog(false)}
              />
            </Elements>
          )}

          {selectedPlan === "yearly" && yearlyClientSecret && (
            <Elements
              stripe={stripePromise}
              options={{ clientSecret: yearlyClientSecret }}
            >
              <CheckoutForm
                amount={Math.round(yearlyCost * 100)}
                noOfUsers={yearlyPlayers}
                subscriptionType="yearly"
                response={yearlyCouponResponse}
                ladderId={ladderId}
                onClose={() => setOpenPaymentDialog(false)}
              />
            </Elements>
          )}
        </DialogContent>
      </Dialog>
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-yellow-100/90  py-8 px-6 sm:px-12 mt-4"
        style={{
          backgroundImage: "url('/bgHome.png')",
          backgroundRepeat: "repeat",
          backgroundSize: "200px",
        }}
      >

                
          <div className="text-center pb-8">
            <h1 className="text-xl font-semibold">You will get a confirmation email immediately after payment. Thank You.</h1>
          </div>

        <div className="text-center">
          <h1 className="font-semibold text-2xl underline text-blue-600">
            <a
              href="/pricing.pdf" // apni PDF ka path yahaan dalna
              target="_blank"
              rel="noopener noreferrer"
              className="relative text-blue-600 transition-all duration-300 
     after:content-[''] after:absolute after:left-0 after:bottom-0 
     after:h-[2px] after:w-0 after:bg-gradient-to-r after:from-blue-500 after:to-purple-500  
     hover:after:w-full after:transition-all after:duration-500"
            >
              Our Guide to Pricing
            </a>
          </h1>
          <br />
          <h1 className="font-semibold text-2xl underline text-blue-600">
            Follow us on:
          </h1>
          <br />
          <div className="flex items-center justify-center gap-8">
            <Link
              href="https://www.facebook.com/profile.php?id=61580051563946 "
              target="_blank"
              className="flex items-end justify-center"
            >
              <Image src={Facebook} height={50} width={50} alt="facebook1" />
              <span className="font-semibold text-2xl text-blue-600">1</span>
            </Link>
            <Link
              href=" https://www.facebook.com/profile.php?id=61561085668817"
              target="_blank"
              className="flex items-end justify-center"
            >
              <Image src={Facebook} height={50} width={50} alt="facebook2" />
              <span className="font-semibold text-2xl text-blue-600">2</span>
            </Link>

             <Link
              href="https://www.youtube.com/@sspro-squash"
              target="_blank"
              className="flex items-end justify-center"
            >
              <Image src={Youtube} height={50} width={50} alt="facebook2" />
            </Link>
          </div>
        </div>
      </motion.section>{" "}
      <div className="w-full text-center space-y-4">
        <div className="bg-white p-6 border border-black w-full shadow rounded-md">
          <div className=" w-full gap-4">
            {/* Address */}
            <h1 className="font-semibold">
              Sports Solutions Pro – a subsidiary of NE Games Ltd
            </h1>
            <h1>
              NE Games Ltd (Company No. 12345678) Registered in England & Wales
            </h1>
            <h1>
              Registered Office: Richmond House, Lawnswood Business Park,
              Redvers Close, Leeds LS16 6QY{" "}
            </h1>
            <h1>
              An ISO 9001 : 2015 Certified. Designed and Developed by Shriv
              ComMedia Solutions Pvt. Ltd. - Software Development Company in
              India. All Rights Reserved -{" "}
              <Link
                href="https://www.commediait.com/"
                target="_blank"
                className="relative text-blue-600 transition-all duration-300
               after:content-[''] after:absolute after:left-0 after:bottom-0
               after:h-[2px] after:w-0 after:bg-gradient-to-r after:from-blue-500 after:to-purple-500
               hover:after:w-full after:transition-all after:duration-500 "
              >
                www.commediait.com
              </Link>
            </h1>
          </div>
        </div>
        {/* Policy Links */}
        <p className="text-xs sm:text-sm md:text-md text-center text-gray-600 py-4 flex flex-col sm:flex-row gap-2 sm:gap-4 justify-center">
          <Link
            href="https://ne-games.com/privacy_policy"
            target="_blank"
            className="relative text-blue-600 transition-all duration-300
               after:content-[''] after:absolute after:left-0 after:bottom-0
               after:h-[2px] after:w-0 after:bg-gradient-to-r after:from-blue-500 after:to-purple-500
               hover:after:w-full after:transition-all after:duration-500"
          >
            Data and Privacy Policy
          </Link>
          <span className="hidden sm:block">|</span>
          <a
            href="/refundPolicy.pdf" // apni PDF ka path yahaan dalna
            target="_blank"
            rel="noopener noreferrer"
            className="relative text-blue-600 transition-all duration-300
     after:content-[''] after:absolute after:left-0 after:bottom-0
     after:h-[2px] after:w-0 after:bg-gradient-to-r after:from-blue-500 after:to-purple-500
     hover:after:w-full after:transition-all after:duration-500"
          >
            Refund Policy
          </a>

          <span className="hidden sm:block">|</span>
          <Link
            href="https://ne-games.com/terms_and_conditions"
            target="_blank"
            className="relative text-blue-600 transition-all duration-300
               after:content-[''] after:absolute after:left-0 after:bottom-0
               after:h-[2px] after:w-0 after:bg-gradient-to-r after:from-blue-500 after:to-purple-500
               hover:after:w-full after:transition-all after:duration-500"
          >
            Terms and Conditions
          </Link>
        </p>
      </div>
      {/* Monthly Coupon Dialog */}
      <Dialog open={monthlyDialogOpen} onOpenChange={setMonthlyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Monthly Coupon Status</DialogTitle>
            <DialogDescription className="whitespace-pre-line text-start text-lg text-blue-950 font-semibold">
              {monthlyDialogMessage}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => setMonthlyDialogOpen(false)}
              className="cursor-pointer"
            >
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Yearly Coupon Dialog */}
      <Dialog open={yearlyDialogOpen} onOpenChange={setYearlyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yearly Coupon Status</DialogTitle>
            <DialogDescription className="whitespace-pre-line text-start text-lg text-blue-950 font-semibold">
              {yearlyDialogMessage}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => setYearlyDialogOpen(false)}
              className="cursor-pointer"
            >
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}

